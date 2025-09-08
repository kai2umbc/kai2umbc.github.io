# -------------------------
# 1) Imports & Config
# -------------------------
from hashlib import md5
import torch
import re
import os
from sentence_transformers import SentenceTransformer, util
import requests
from dotenv import load_dotenv
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
import numpy as np
import gc

load_dotenv()

# ------------------------- 
# CONFIG 
# ------------------------- 
EMBED_MODEL = "all-MiniLM-L6-v2"
DEVICE = "cpu"  # force CPU to reduce memory
SIMILARITY_THRESHOLD = 0.5
TOP_K = 3
FINAL_K = 4
MAX_NEW_TOKENS = 128
SEM_VERIF_THRESHOLD = 0.5
MAX_NOTES = 100  # reduced from 200
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Milvus host info
MILVUS_URI = os.getenv("MILVUS_URI")
MILVUS_TOKEN = os.getenv("MILVUS_TOKEN")

connections.connect(
    alias="default",
    uri=MILVUS_URI,
    token=MILVUS_TOKEN
)

# -------------------------
# 2) Lazy Sentence Transformer
# -------------------------
_embedder = None
def get_embedder():
    global _embedder
    if _embedder is None:
        import os
        os.environ["OMP_NUM_THREADS"] = "1"
        torch.set_num_threads(1)
        _embedder = SentenceTransformer("sentence-transformers/" + EMBED_MODEL, device=DEVICE)
    return _embedder

# -------------------------
# 3) Milvus collection helpers
# -------------------------
VECTOR_DIM = 384

def get_or_create_and_load_collection(name: str, dim: int = VECTOR_DIM) -> Collection:
    if utility.has_collection(name):
        col = Collection(name)
        existing_fields = [f.name for f in col.schema.fields]
        if "chunk_id" not in existing_fields:
            print(f"⚠️ Dropping old collection {name} (missing chunk_id)...")
            utility.drop_collection(name)

    if not utility.has_collection(name):
        fields = [
            FieldSchema(name="id", dtype=DataType.VARCHAR, is_primary=True, max_length=128),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),
            FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=8192),
            FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
            FieldSchema(name="chunk_id", dtype=DataType.INT64),
        ]
        schema = CollectionSchema(fields, description=f"{name} collection")
        col = Collection(name=name, schema=schema, using="default")
        print(f"✅ Created new collection {name}")
    else:
        col = Collection(name)
    try:
        if not col.indexes:
            col.create_index(
                field_name="embedding",
                index_params={
                    "index_type": "IVF_FLAT",
                    "metric_type": "COSINE",
                    "params": {"nlist": 512}  # smaller nlist reduces RAM
                }
            )
        col.load()
    except Exception as e:
        print(f"⚠️ Milvus load/index skipped for {name}: {e}")
    return col

docs_col = get_or_create_and_load_collection("docs_col", VECTOR_DIM)
notes_col = get_or_create_and_load_collection("notes_col", VECTOR_DIM)

# -------------------------
# 4) PDF loader & chunking (commented out, using Milvus cloud only)
# -------------------------
# def load_pdf_text(path):
#     doc = fitz.open(path)
#     text = "\n".join([page.get_text() for page in doc])
#     doc.close()
#     return text.strip()

# def chunk_text(text, chunk_size=CHUNK_SIZE):
#     words = text.split()
#     return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

# def ingest_pdfs():
#     existing_ids = set()
#     try:
#         res = docs_col.query(expr="id != ''", output_fields=["id"])
#         for r in res:
#             if isinstance(r, dict) and "id" in r:
#                 v = r["id"]
#                 if isinstance(v, list): existing_ids.update(v)
#                 else: existing_ids.add(v)
#     except Exception:
#         existing_ids = set()
# 
#     # local PDF ingestion skipped
# 
# try:
#     ingest_pdfs()
# except Exception as e:
#     print("⚠️ ingest_pdfs() failed:", e)

# -------------------------
# 5) LLM Helper
# -------------------------
def call_llm(prompt, max_new_tokens=128, temperature=0.5, use_openrouter=True):
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
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True).to(DEVICE)
        out = llm.generate(**inputs, max_new_tokens=max_new_tokens, temperature=temperature)
        return tokenizer.decode(out[0], skip_special_tokens=True).strip()

# -------------------------
# 6) Retrieval helpers (query-time only embedding)
# -------------------------
def retrieve_from_collection(collection: Collection, query: str, top_k=TOP_K):
    try:
        collection.load()
    except Exception:
        pass
    q_emb = get_embedder().encode([query], convert_to_numpy=True)[0]  # only query embedding
    search_params = {"metric_type": "COSINE", "params": {"nprobe": 2}}
    results = collection.search(
        data=[q_emb.tolist()],
        anns_field="embedding",
        param=search_params,
        limit=top_k,
        output_fields=["id", "text", "title", "chunk_id"]
    )
    items = []
    for hits in results:
        for hit in hits:
            entity = hit.entity
            items.append({
                "text": getattr(entity, "text", ""),
                "id": getattr(entity, "id", None),
                "meta": {"title": getattr(entity, "title", "")},
                "score": float(hit.score)
            })
    return items

def rerank_and_score(query, items):
    if not items: return []
    q_emb = get_embedder().encode([query], convert_to_numpy=True)[0]
    texts = [it["text"] for it in items]
    embs = get_embedder().encode(texts, convert_to_numpy=True)
    # NumPy cosine similarity
    sims = np.dot(embs, q_emb) / (np.linalg.norm(embs, axis=1) * np.linalg.norm(q_emb))
    for it, s in zip(items, sims):
        it["score"] = float(s)
    items.sort(key=lambda x: x.get("score",0.0), reverse=True)
    del embs, sims; gc.collect()
    return items

def apply_threshold_and_topk(items, threshold=SIMILARITY_THRESHOLD, top_k=TOP_K):
    kept = [it for it in items if it.get("score",0.0) >= threshold]
    return kept[:top_k] if kept else (items[:1] if items else [])

def fuse_candidates(docs_items, notes_items, final_k=FINAL_K):
    pool = docs_items + notes_items
    best = {}
    sources_seen = set()
    for it in pool:
        key = it["text"].strip()
        source_id = it["meta"].get("doc_id", it["meta"].get("title"))
        if source_id not in sources_seen:
            sources_seen.add(source_id)
            best[key] = it
        elif key not in best or it.get("score",0.0) > best[key].get("score",0.0):
            best[key] = it
    fused = sorted(best.values(), key=lambda x: x.get("score",0.0), reverse=True)[:final_k]
    del pool, best; gc.collect()
    return fused

# -------------------------
# 7) Sentence helpers
# -------------------------
def simple_sent_tokenize(text):
    return [p.strip() for p in re.split(r'(?<=[\.\?\!])\s+', text) if p.strip()]

def semantic_filter(sentences, context_texts, threshold=SEM_VERIF_THRESHOLD):
    if not sentences or not context_texts: return []
    ctx_emb = get_embedder().encode(context_texts, convert_to_numpy=True)
    kept = []
    for s in sentences:
        s_emb = get_embedder().encode([s], convert_to_numpy=True)[0]
        sims = np.dot(ctx_emb, s_emb)/(np.linalg.norm(ctx_emb, axis=1)*np.linalg.norm(s_emb))
        if max(sims) >= threshold:
            kept.append(s)
    del ctx_emb, s_emb, sims; gc.collect()
    return list(dict.fromkeys(kept))

# -------------------------
# 8) Notes & distillation
# -------------------------
def distill_context(fused_chunks, max_new_tokens=MAX_NEW_TOKENS):
    raw_text = "\n".join([f["text"] for f in fused_chunks])
    prompt = f"""Rewrite the following retrieved content into clear, factual statements. Output ONE fact per line. Do NOT invent facts. {raw_text} Distilled Facts:"""
    distilled_text = call_llm(prompt, max_new_tokens=max_new_tokens)
    distilled_clean = distilled_text.split("Distilled Facts:")[-1].strip() if "Distilled Facts:" in distilled_text else distilled_text
    distilled_lines = [line.strip("-• ").strip() for line in distilled_clean.split("\n") if line.strip()]
    return "; ".join(list(dict.fromkeys(distilled_lines)))

def generate_notes(question, answer, distilled_facts, fused_chunks, max_new_tokens=MAX_NEW_TOKENS):
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
Retrieved: {raw_text}
Distilled facts: {distilled_facts}
Q: {question}
A: {answer}
New Notes:"""
    notes_text = call_llm(prompt, max_new_tokens=max_new_tokens)
    new_notes = [n.strip("-• ").strip() for n in notes_text.split("\n") if n.strip()]
    return list(dict.fromkeys(new_notes))

# -------------------------
# 9) Advanced RAG pipeline
# -------------------------
def advanced_rag_strict(query, n_candidates=TOP_K):
    docs_cands = retrieve_from_collection(docs_col, query, top_k=n_candidates*2)
    notes_cands = retrieve_from_collection(notes_col, query, top_k=n_candidates*2)
    docs_scored = rerank_and_score(query, docs_cands)
    notes_scored = rerank_and_score(query, notes_cands)
    docs_kept = apply_threshold_and_topk(docs_scored, top_k=n_candidates)
    notes_kept = apply_threshold_and_topk(notes_scored, top_k=n_candidates)
    fused = fuse_candidates(docs_kept, notes_kept)

    if not fused:
        return {"extractive":"I don't know.","natural":"I don't know.","distilled":"","provenance":[],"prompt":""}

    temp_notes = generate_notes(query, "", "", fused)
    temp_note_items = [{"text":n,"score":1.0,"meta":{"title":fused[i % len(fused)]["meta"].get("title","unknown_pdf")}} for i,n in enumerate(temp_notes)]
    fused = fuse_candidates(fused, temp_note_items)

    extractive_answer = " ".join([f["text"] for f in fused[:2]])
    distilled_facts = distill_context(fused)
    facts_list = "\n".join([f"{f['meta'].get('title','unknown_pdf')}: {f['text']}" for f in fused])
    prompt = f"""Answer the question strictly using the facts below.
- Only use facts listed here.
- Do NOT invent, infer, or explain.
Facts: {facts_list}
Question: {query}
Answer in 1-2 plain sentences strictly from the facts:"""
    natural_answer = call_llm(prompt, max_new_tokens=MAX_NEW_TOKENS, temperature=0.0)
    natural_sents = semantic_filter(simple_sent_tokenize(natural_answer), [f["text"] for f in fused])
    natural_answer = " ".join(list(dict.fromkeys(natural_sents))).strip() or "I don't know."
    del docs_cands, notes_cands, docs_scored, notes_scored, docs_kept, notes_kept, fused, temp_notes, temp_note_items; gc.collect()

    return {"extractive":extractive_answer,"natural":natural_answer,"distilled":distilled_facts,"provenance":[],"prompt":prompt}
