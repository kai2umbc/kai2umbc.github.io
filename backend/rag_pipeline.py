# -------------------------
# 1) Imports & Config
# -------------------------
from hashlib import md5
import torch
import re
import os
import fitz  # PyMuPDF for PDFs
from sentence_transformers import SentenceTransformer, util
import requests
from dotenv import load_dotenv
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility

load_dotenv()

# ------------------------- 
# CONFIG 
# ------------------------- 
EMBED_MODEL = "all-MiniLM-L6-v2"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
SIMILARITY_THRESHOLD = 0.5
TOP_K = 3
FINAL_K = 4
MAX_NEW_TOKENS = 128
SEM_VERIF_THRESHOLD = 0.5
MAX_NOTES = 200
PDF_FOLDER = "./uploaded_pdfs"
CHUNK_SIZE = 500
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
# 3) Initialize Sentence Transformer 
# ------------------------- 
embedder = SentenceTransformer("sentence-transformers/" + EMBED_MODEL)

# ------------------------- 
# 4) Define Milvus collections (if not exists) 
# ------------------------- 
VECTOR_DIM = 384  # all-MiniLM-L6-v2 dim

def get_or_create_and_load_collection(name: str, dim: int = VECTOR_DIM) -> Collection:
    # Drop old schema if missing chunk_id
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
        print(f"✅ Created new collection {name} with chunk_id field")
    else:
        col = Collection(name)

    # ✅ Ensure index exists (create if missing)
    try:
        index_info = col.indexes
        if not index_info:
            col.create_index(
                field_name="embedding",
                index_params={
                    "index_type": "IVF_FLAT",
                    "metric_type": "COSINE",
                    "params": {"nlist": 1024}
                }
            )
            print(f"📌 Created index for {name}")
    except Exception as e:
        print(f"⚠️ Skipped index creation for {name}: {e}")

    # ✅ Always load (safe)
    try:
        col.load()
    except Exception as e:
        print(f"⚠️ Could not load {name}: {e}")

    return col



docs_col = get_or_create_and_load_collection("docs_col", VECTOR_DIM)
notes_col = get_or_create_and_load_collection("notes_col", VECTOR_DIM)

# -------------------------
# 5) PDF loader & chunking
# -------------------------
def load_pdf_text(path):
    doc = fitz.open(path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    return full_text.strip()

def chunk_text(text, chunk_size=CHUNK_SIZE):
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

# Lazy ingest: check existing ids (safe) and insert only new docs
def ingest_pdfs():
    # try to fetch existing ids; if query fails, assume empty
    existing_ids = set()
    try:
        # query can return a list of dicts; handle gracefully
        res = docs_col.query(expr="id != ''", output_fields=["id"])
        # res is list of dicts mapping field->value depending on provider; normalize:
        if isinstance(res, list):
            for r in res:
                # r might be dict {"id": "doc_..."} or {"id": ["..."]}; normalize:
                if isinstance(r, dict) and "id" in r:
                    v = r["id"]
                    if isinstance(v, list):
                        for x in v: existing_ids.add(x)
                    else:
                        existing_ids.add(v)
    except Exception:
        existing_ids = set()

    to_insert_ids = []
    to_insert_embs = []
    to_insert_texts = []
    to_insert_titles = []
    to_insert_chunk_ids = []

    for i, fname in enumerate(sorted(os.listdir(PDF_FOLDER))):
        if not fname.lower().endswith(".pdf"):
            continue
        path = os.path.join(PDF_FOLDER, fname)
        text = load_pdf_text(path)
        if not text:
            continue
        chunks = chunk_text(text, CHUNK_SIZE)
        for j, chunk in enumerate(chunks):
            doc_id = f"doc_{i}_chunk{j}"
            if doc_id in existing_ids:
                continue
            emb = embedder.encode([chunk], convert_to_numpy=True)[0]
            to_insert_ids.append(doc_id)
            to_insert_embs.append(emb.tolist())
            to_insert_texts.append(chunk)
            to_insert_titles.append(fname)
            to_insert_chunk_ids.append(j)

    if to_insert_ids:
        docs_col.insert([to_insert_ids, to_insert_embs, to_insert_texts, to_insert_titles, to_insert_chunk_ids])
        try:
            docs_col.flush()
        except Exception:
            pass

        # ✅ Build/rebuild index after insert
        try:
            docs_col.create_index(
                field_name="embedding",
                index_params={
                    "index_type": "IVF_FLAT",
                    "metric_type": "COSINE",
                    "params": {"nlist": 1024}
                }
            )
        except Exception as e:
            print(f"⚠️ Index creation skipped: {e}")

        try:
            docs_col.load()
        except Exception:
            pass


# call once at startup (safe: it'll skip already-existing docs)
try:
    ingest_pdfs()
except Exception as e:
    # don't crash on startup ingestion failures; log and continue
    print("⚠️ ingest_pdfs() failed at startup:", e)

# -------------------------
# 6) OpenRouter / LLM helper
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
# 7) Retrieval helpers (Milvus)
# -------------------------
def retrieve_from_collection(collection: Collection, query: str, top_k=8):
    # ensure collection is loaded (safe no-op if already loaded)
    try:
        collection.load()
    except Exception:
        pass

    q_emb = embedder.encode([query], convert_to_numpy=True)[0]
    search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}
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
            # hit.entity.get may return field values depending on server; normalize carefully:
            entity = hit.entity
            text = entity.get("text") if hasattr(entity, "get") else getattr(entity, "text", None)
            title = entity.get("title") if hasattr(entity, "get") else getattr(entity, "title", None)
            chunk_id = entity.get("chunk_id") if hasattr(entity, "get") else getattr(entity, "chunk_id", None)
            id_field = entity.get("id") if hasattr(entity, "get") else getattr(entity, "id", None)
            items.append({
                "text": text or "",
                "id": id_field,
                "meta": {"title": title, "chunk_id": chunk_id},
                "score": float(hit.score) if hasattr(hit, "score") else None
            })
    return items

def rerank_and_score(query, items):
    if not items:
        return []
    q_emb = embedder.encode([query], convert_to_tensor=True)
    texts = [it["text"] for it in items]
    embs = embedder.encode(texts, convert_to_tensor=True)
    sims = util.cos_sim(q_emb, embs).cpu().tolist()[0]
    for it, s in zip(items, sims):
        it["score"] = float(s)
    items.sort(key=lambda x: x.get("score", 0.0), reverse=True)
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
        source_id = it["meta"].get("doc_id", it["meta"].get("title"))
        if source_id not in sources_seen:
            sources_seen.add(source_id)
            best[key] = it
        elif key not in best or it.get("score", 0.0) > best[key].get("score", 0.0):
            best[key] = it
    fused = sorted(best.values(), key=lambda x: x.get("score", 0.0), reverse=True)[:final_k]
    return fused

# -------------------------
# 8) Sentence helpers (unchanged)
# -------------------------
def simple_sent_tokenize(text):
    return [p.strip() for p in re.split(r'(?<=[\.\?\!])\s+', text) if p.strip()]

def semantic_filter(sentences, context_texts, threshold=SEM_VERIF_THRESHOLD):
    if not sentences:
        return []
    ctx_emb = embedder.encode(context_texts, convert_to_tensor=True)
    kept = []
    for s in sentences:
        s_emb = embedder.encode([s], convert_to_tensor=True)
        sims = util.cos_sim(s_emb, ctx_emb).cpu().tolist()[0]
        if max(sims) >= threshold:
            kept.append(s)
    return list(dict.fromkeys(kept))

# -------------------------
# 9) Distillation & Notes generator (unchanged logic)
# -------------------------
def distill_context(fused_chunks, max_new_tokens=128):
    raw_text = "\n".join([f["text"] for f in fused_chunks])
    prompt = f"""Rewrite the following retrieved content into clear, factual statements. Output ONE fact per line. Do NOT invent facts. {raw_text} Distilled Facts:"""
    distilled_text = call_llm(prompt, max_new_tokens=max_new_tokens, temperature=0.5, use_openrouter=True)
    if "Distilled Facts:" in distilled_text:
        distilled_clean = distilled_text.split("Distilled Facts:")[-1].strip()
    else:
        distilled_clean = distilled_text
    distilled_lines = [line.strip("-• ").strip() for line in distilled_clean.split("\n") if line.strip()]
    return "; ".join(list(dict.fromkeys(distilled_lines)))

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
Retrieved: {raw_text}
Distilled facts: {distilled_facts}
Q: {question}
A: {answer}
New Notes:"""
    notes_text = call_llm(prompt, max_new_tokens=max_new_tokens, temperature=0.5, use_openrouter=True)
    new_notes = [n.strip("-• ").strip() for n in notes_text.split("\n") if n.strip()]
    return list(dict.fromkeys(new_notes))

# -------------------------
# 10) Helper functions for notes (Milvus-based) 
# -------------------------
def insert_notes(notes_list, query, parent_meta_list=None):
    """
    notes_list: list of note strings
    query: original query (for metadata)
    parent_meta_list: list of parent meta dicts to inherit origin info
    """
    if not notes_list:
        return []

    # get current count / ids
    existing_ids = []
    try:
        q = notes_col.query(expr="id != ''", output_fields=["id"])
        if isinstance(q, list):
            for r in q:
                if isinstance(r, dict) and "id" in r:
                    v = r["id"]
                    if isinstance(v, list):
                        existing_ids.extend(v)
                    else:
                        existing_ids.append(v)
    except Exception:
        existing_ids = []

    to_insert_ids = []
    to_insert_embs = []
    to_insert_texts = []
    to_insert_titles = []
    to_insert_chunk_ids = []

    # Optional: store origin info
    origin_titles = []
    origin_doc_ids = []

    base_idx = len(existing_ids)
    for idx, note in enumerate(notes_list):
        note_id = f"note_{base_idx + idx}"
        emb = embedder.encode([note], convert_to_numpy=True)[0]
        to_insert_ids.append(note_id)
        to_insert_embs.append(emb.tolist())
        to_insert_texts.append(note)

        # ✅ Use origin title instead of note_x
        if parent_meta_list and idx < len(parent_meta_list):
            parent_meta = parent_meta_list[idx]
            origin_title = parent_meta.get("origin_title", parent_meta.get("title", "unknown_pdf"))
        else:
            origin_title = "unknown_pdf"
        to_insert_titles.append(origin_title)

        to_insert_chunk_ids.append(idx)

    # Insert notes into Milvus (keep schema as before)
    notes_col.insert([to_insert_ids, to_insert_embs, to_insert_texts, to_insert_titles, to_insert_chunk_ids])
    try:
        notes_col.flush()
        notes_col.load()
    except Exception:
        pass

    # return inserted note ids
    return to_insert_ids


def enforce_note_cap(max_notes=MAX_NOTES):
    # get all note ids in insertion order if possible, otherwise just get IDs and delete oldest by lexicographic order
    try:
        q = notes_col.query(expr="id != ''", output_fields=["id"])
        ids = []
        if isinstance(q, list):
            for r in q:
                if isinstance(r, dict) and "id" in r:
                    v = r["id"]
                    if isinstance(v, list):
                        ids.extend(v)
                    else:
                        ids.append(v)
        # if more than max_notes, delete the oldest ones (first in list)
        if len(ids) > max_notes:
            extra = len(ids) - max_notes
            to_delete = ids[:extra]
            # build expression like: "id in ['id1','id2']"
            expr_ids = ",".join([f"'{i}'" for i in to_delete])
            expr = f"id in [{expr_ids}]"
            notes_col.delete(expr=expr)
            try:
                notes_col.flush()
            except Exception:
                pass
    except Exception:
        pass

# -------------------------
# 11) Advanced RAG pipeline (updated to use Milvus-based retrieval & notes insertion)
# -------------------------
def advanced_rag_strict(query, n_candidates=8):
    # ensure collections are loaded before retrieval
    try:
        docs_col.load()
    except Exception:
        pass
    try:
        notes_col.load()
    except Exception:
        pass

    # 1️⃣ Retrieve & rank
    docs_cands = retrieve_from_collection(docs_col, query, top_k=n_candidates*2)
    notes_cands = retrieve_from_collection(notes_col, query, top_k=n_candidates*2)
    docs_scored = rerank_and_score(query, docs_cands)
    notes_scored = rerank_and_score(query, notes_cands)
    docs_kept = apply_threshold_and_topk(docs_scored, top_k=n_candidates)
    notes_kept = apply_threshold_and_topk(notes_scored, top_k=n_candidates)

    # 2️⃣ Fuse docs + notes
    fused = fuse_candidates(docs_kept, notes_kept)
    if not fused or all(f.get("score", 0.0) < SIMILARITY_THRESHOLD for f in fused):
        return {"extractive": "I don't know.", "natural": "I don't know.", "distilled": "", "provenance": [], "prompt": ""}

    # 2.5️⃣ Generate temporary notes from fused chunks
    temp_notes = generate_notes(query, "", "", fused)
    temp_notes = list(dict.fromkeys(temp_notes))  # remove duplicates

    # Convert temp_notes into candidate items for fusion
    query_hash = md5(query.encode()).hexdigest()[:6]
    temp_note_items = []
    for i, n in enumerate(temp_notes):
        parent_meta = fused[i % len(fused)]["meta"]
        temp_note_items.append({
            "text": n,
            "score": 1.0,
            "meta": {
                "doc_id": f"temp_note_{query_hash}_{i}",
                "title": parent_meta.get("origin_title") or parent_meta.get("title") or "unknown_pdf",
                "is_note": True,
                "origin_doc_id": parent_meta.get("origin_doc_id") or parent_meta.get("doc_id"),
                "origin_title": parent_meta.get("origin_title") or parent_meta.get("title"),
                "chunk_id": i
            }
        })

    # Fuse ephemeral notes into existing chunks
    fused = fuse_candidates(fused, temp_note_items)

    # 3️⃣ Provenance (only real PDFs, ignore ephemeral notes)
    provenance = []
    seen_titles = set()
    for f in fused:
        meta = f["meta"]
        origin_title = meta.get("origin_title")
        origin_doc_id = meta.get("origin_doc_id")

        if not origin_title or origin_title.startswith("note_") or origin_title == "unknown_pdf":
            continue

        if origin_title not in seen_titles:
            seen_titles.add(origin_title)
            provenance.append({
                "source": "pdf",
                "doc_id": origin_doc_id,
                "title": origin_title,
                "chunk_id": meta.get("chunk_id"),
                "score": round(f.get("score", 0.0), 3)
            })

    # 4️⃣ Extractive answer (top 2 chunks)
    extractive_answer = " ".join([f["text"] for f in fused[:2]])

    # 5️⃣ Strict distillation (no invention)
    distilled_facts = distill_context(fused)
    if not distilled_facts.strip():
        natural_answer = "I don't know."
        prompt = ""
    else:
        facts_list = "\n".join([f"{f['meta'].get('title','unknown_pdf')}: {f['text']}" for f in fused])
        prompt = f"""Answer the question strictly using the facts below.
- Only use facts listed here.
- Do NOT invent, infer, or explain.
- Do NOT include anything not in the facts.
- If no facts are relevant, reply exactly: I don't know.
Facts: {facts_list}
Question: {query}
Answer in 1-2 plain sentences strictly from the facts:"""
        natural_answer = call_llm(prompt, max_new_tokens=MAX_NEW_TOKENS, temperature=0.0, use_openrouter=True)
        natural_sents = semantic_filter(simple_sent_tokenize(natural_answer), [f["text"] for f in fused])
        natural_answer = " ".join(list(dict.fromkeys(natural_sents))).strip()
        if not natural_answer:
            natural_answer = "I don't know."

    # 6️⃣ Save new notes permanently (Milvus-backed), pass parent meta
    if temp_notes:
        inserted_note_ids = insert_notes(temp_notes, query, parent_meta_list=[f["meta"] for f in fused[:len(temp_notes)]])
        enforce_note_cap(MAX_NOTES)

    return {
        "extractive": extractive_answer,
        "natural": natural_answer,
        "distilled": distilled_facts,
        "provenance": provenance,
        "prompt": prompt
    }

# -------------------------
# Demo run (kept for local testing)
# -------------------------
if __name__ == "__main__":
    q = "What are the steps to implement RAG using quantum computing?"
    out = advanced_rag_strict(q)
    print("EXTRACTIVE:", out["extractive"])
    print("NATURAL :", out["natural"])
    print("DISTILLED :", out["distilled"])
    print("PROVENANCE:", out["provenance"])