# -------------------------
# 1) Imports & Config
# -------------------------
import torch, re, os, fitz  # PyMuPDF for PDFs
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForCausalLM
import chromadb
from chromadb.utils import embedding_functions
import requests
from dotenv import load_dotenv
load_dotenv()

# -------------------------
# CONFIG
# -------------------------
EMBED_MODEL = "all-MiniLM-L6-v2"
LLM_NAME = "meta-llama/Llama-3.2-1B-Instruct"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
SIMILARITY_THRESHOLD = 0.5
TOP_K = 3
FINAL_K = 4
MAX_NEW_TOKENS = 128
SEM_VERIF_THRESHOLD = 0.5
MAX_NOTES = 200  # cap notes collection size
PDF_FOLDER = "./uploaded_pdfs"
CHUNK_SIZE = 500  # tokens per chunk for large PDFs
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# -------------------------
# 2) Initialize embeddings & Chroma
# -------------------------
embedder = SentenceTransformer("sentence-transformers/" + EMBED_MODEL)
client = chromadb.Client()  # in-memory demo
emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBED_MODEL)

# Clear & recreate collections
for col_name in ["docs_col", "notes_col"]:
    try: client.delete_collection(col_name)
    except: pass
docs_col = client.get_or_create_collection(name="docs_col", embedding_function=emb_fn)
notes_col = client.get_or_create_collection(name="notes_col", embedding_function=emb_fn)

# -------------------------
# 3) PDF loader & chunking
# -------------------------
def load_pdf_text(path):
    doc = fitz.open(path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    return full_text.strip()

def chunk_text(text, chunk_size=500):
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

# Load PDFs and chunk
uploaded_docs = []
for i, fname in enumerate(os.listdir(PDF_FOLDER)):
    if fname.lower().endswith(".pdf"):
        path = os.path.join(PDF_FOLDER, fname)
        text = load_pdf_text(path)
        if text:
            chunks = chunk_text(text, CHUNK_SIZE)
            for j, chunk in enumerate(chunks):
                uploaded_docs.append({
                    "id": f"doc_{i}_chunk{j}",
                    "text": chunk,
                    "title": fname,
                    "chunk_id": j
                })

# Add PDFs to Chroma
for doc in uploaded_docs:
    docs_col.add(
        documents=[doc["text"]],
        ids=[doc["id"]],
        metadatas=[{"source":"docs","doc_id":doc["id"],"title":doc["title"],"chunk_id":doc["chunk_id"]}]
    )

# -------------------------
# 4) Initialize local LLM (optional, fallback)
# -------------------------
tokenizer = AutoTokenizer.from_pretrained(LLM_NAME, use_fast=True)
try:
    llm = AutoModelForCausalLM.from_pretrained(LLM_NAME).to(DEVICE)
except Exception:
    tokenizer = AutoTokenizer.from_pretrained("sshleifer/tiny-gpt2")
    llm = AutoModelForCausalLM.from_pretrained("sshleifer/tiny-gpt2").to(DEVICE)

# -------------------------
# 5) OpenRouter / LLM helper
# -------------------------
def call_llm(prompt, max_new_tokens=128, temperature=0.0, use_openrouter=True):
    """
    Returns LLaMA output. If use_openrouter=True, calls OpenRouter instead of local model.
    """
    if use_openrouter:
        headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}"}
        payload = {
            "model": "meta-llama/llama-3.3-8b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that uses retrieved context."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_new_tokens,
            "temperature": temperature
        }
        try:
            r = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers, timeout=60)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print("❌ OpenRouter error:", e)
            return "I don't know."
    else:
        # fallback local LLaMA
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True).to(DEVICE)
        out = llm.generate(**inputs, max_new_tokens=max_new_tokens, temperature=temperature, do_sample=False)
        return tokenizer.decode(out[0], skip_special_tokens=True).strip()

# -------------------------
# 6) Retrieval helpers
# -------------------------
def retrieve_from_collection(col, query, n=8):
    res = col.query(query_texts=[query], n_results=n)
    docs = res.get("documents", [[]])[0]
    ids = res.get("ids", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    return [{"text": t, "id": i, "meta": m} for t,i,m in zip(docs, ids, metas)]

def rerank_and_score(query, items):
    if not items: return []
    q_emb = embedder.encode([query], convert_to_tensor=True)
    texts = [it["text"] for it in items]
    embs = embedder.encode(texts, convert_to_tensor=True)
    sims = util.cos_sim(q_emb, embs).cpu().tolist()[0]
    for it, s in zip(items, sims):
        it["score"] = float(s)
    items.sort(key=lambda x: x["score"], reverse=True)
    return items

def apply_threshold_and_topk(items, threshold=SIMILARITY_THRESHOLD, top_k=TOP_K):
    kept = [it for it in items if it.get("score", 0.0) >= threshold]
    return kept[:top_k] if kept else (items[:1] if items else [])

def fuse_candidates(docs_items, notes_items, final_k=FINAL_K):
    pool = docs_items + notes_items
    best = {}
    sources_seen = set()
    for it in pool:
        key = it["text"].strip()
        source_id = it["meta"].get("doc_id")  # track unique source
        if source_id not in sources_seen:
            sources_seen.add(source_id)
            best[key] = it
        elif key not in best or it["score"] > best[key]["score"]:
            best[key] = it
    fused = sorted(best.values(), key=lambda x: x["score"], reverse=True)[:final_k]
    return fused

# -------------------------
# 7) Sentence helpers
# -------------------------
def simple_sent_tokenize(text):
    return [p.strip() for p in re.split(r'(?<=[\.\?\!])\s+', text) if p.strip()]

def semantic_filter(sentences, context_texts, threshold=SEM_VERIF_THRESHOLD):
    if not sentences: return []
    ctx_emb = embedder.encode(context_texts, convert_to_tensor=True)
    kept = []
    for s in sentences:
        s_emb = embedder.encode([s], convert_to_tensor=True)
        sims = util.cos_sim(s_emb, ctx_emb).cpu().tolist()[0]
        if max(sims) >= threshold:
            kept.append(s)
    return list(dict.fromkeys(kept))

# -------------------------
# 8) Distillation
# -------------------------
def distill_context(fused_chunks, max_new_tokens=128):
    raw_text = "\n".join([f["text"] for f in fused_chunks])
    prompt = f"""Rewrite the following retrieved content into clear, factual statements. Output ONE fact per line. Do NOT invent facts.

{raw_text}

Distilled Facts:"""
    distilled_text = call_llm(prompt, max_new_tokens=max_new_tokens, temperature=0.0, use_openrouter=True)
    if "Distilled Facts:" in distilled_text:
        distilled_clean = distilled_text.split("Distilled Facts:")[-1].strip()
    else:
        distilled_clean = distilled_text
    distilled_lines = [line.strip("-• ").strip() for line in distilled_clean.split("\n") if line.strip()]
    return "; ".join(list(dict.fromkeys(distilled_lines)))

# -------------------------
# 9) Notes generator
# -------------------------
def generate_notes(question, answer, distilled_facts, fused_chunks, max_new_tokens=128):
    raw_text = "\n".join([f["text"] for f in fused_chunks])
    prompt = f"""You are maintaining a growing notebook of key ideas. Do not answer questions that are not from retrieved content.
From the following:
- Retrieved content
- Distilled facts
- The question and answer

Write 3-6 short, self-contained notes that:
- Rephrase and combine ideas
- Make connections across items
- Capture reusable knowledge (not question-specific wording)

Retrieved:
{raw_text}

Distilled facts:
{distilled_facts}

Q: {question}
A: {answer}

New Notes:"""
    notes_text = call_llm(prompt, max_new_tokens=max_new_tokens, temperature=0.5, use_openrouter=True)
    new_notes = [n.strip("-• ").strip() for n in notes_text.split("\n") if n.strip()]
    return list(dict.fromkeys(new_notes))

# -------------------------
# 10) Advanced RAG pipeline
# -------------------------
def advanced_rag_strict(query, n_candidates=8):
    # 1️⃣ Retrieve & rank
    docs_cands = retrieve_from_collection(docs_col, query, n=n_candidates*2)
    notes_cands = retrieve_from_collection(notes_col, query, n=n_candidates*2)
    docs_scored = rerank_and_score(query, docs_cands)
    notes_scored = rerank_and_score(query, notes_cands)
    docs_kept = apply_threshold_and_topk(docs_scored, top_k=n_candidates)
    notes_kept = apply_threshold_and_topk(notes_scored, top_k=n_candidates)
    
    # 2️⃣ Fuse docs + notes
    fused = fuse_candidates(docs_kept, notes_kept)
    if not fused or all(f.get("score", 0.0) < SIMILARITY_THRESHOLD for f in fused):
        return {"extractive": "I don't know.", "natural": "I don't know.", "distilled": "", "provenance": [], "prompt": ""}

    # 3️⃣ Provenance
    provenance = []
    seen_sources = set()
    for f in fused:
        src = f["meta"].get("doc_id")
        if src not in seen_sources:
            seen_sources.add(src)
            provenance.append({
                "source": f["meta"]["source"],
                "doc_id": src,
                "title": f["meta"].get("title", ""),
                "chunk_id": f["meta"]["chunk_id"],
                "score": round(f.get("score", 0.0), 3)
            })

    # When displaying sources in answer
    sources_list = [p["title"] for p in provenance]
    sources_display = ", ".join(sources_list)

    # 4️⃣ Extractive answer (top 2 chunks)
    extractive_answer = " ".join([f["text"] for f in fused[:2]])

    # 5️⃣ Strict distillation (no invention)
    distilled_facts = distill_context(fused)

    if not distilled_facts.strip():
        natural_answer = "I don't know."
    else:
        facts_list = "\n".join([f"{f['meta'].get('title','unknown_pdf')}: {f['text']}" for f in fused])
        prompt = f"""Answer the question strictly using the facts below.
- Only use facts listed here.
- Do NOT invent, infer, or explain.
- Do NOT include anything not in the facts.
- If no facts are relevant, reply exactly: I don't know.

Facts:
{facts_list}

Question: {query}

Answer in 1-2 plain sentences strictly from the facts:"""
        natural_answer = call_llm(prompt, max_new_tokens=MAX_NEW_TOKENS, temperature=0.0, use_openrouter=True)
        natural_sents = semantic_filter(simple_sent_tokenize(natural_answer), [f["text"] for f in fused])
        natural_answer = " ".join(list(dict.fromkeys(natural_sents))).strip()
        if not natural_answer:
            natural_answer = "I don't know."

    return {"extractive": extractive_answer, "natural": natural_answer,
            "distilled": distilled_facts, "provenance": provenance, "prompt": prompt}

# -------------------------
# Demo run
# -------------------------
if __name__ == "__main__":
    q = "What are the steps to implement RAG using quantum computing?"
    out = advanced_rag_strict(q)
    print("EXTRACTIVE:", out["extractive"])
    print("NATURAL   :", out["natural"])
    print("DISTILLED :", out["distilled"])
    print("PROVENANCE:", out["provenance"])
