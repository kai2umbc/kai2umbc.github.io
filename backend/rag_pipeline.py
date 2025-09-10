# -------------------------
# 1) Imports & Config
# -------------------------
from hashlib import md5
import re
import os
import requests
from dotenv import load_dotenv
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
import numpy as np
import gc
import time
from typing import List, Union, Callable

load_dotenv()

# ------------------------- 
# CONFIG 
# ------------------------- 
SIMILARITY_THRESHOLD = 0.5
TOP_K = 3
FINAL_K = 4
MAX_NEW_TOKENS = 128
SEM_VERIF_THRESHOLD = 0.5
MAX_NOTES = 100
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Milvus host info
MILVUS_URI = os.getenv("MILVUS_URI")
MILVUS_TOKEN = os.getenv("MILVUS_TOKEN")

connections.connect(
    alias="default",
    uri=MILVUS_URI,
    token=MILVUS_TOKEN
)

VECTOR_DIM = 384
_collections_cache = {}
_docs_col = None
_notes_col = None

# -------------------------
# 2) HuggingFace embedder (router.huggingface.co, feature-extraction)
# -------------------------
HF_MODEL = os.getenv("HF_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
HF_API_KEY = os.getenv("HF_API_KEY")
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/pipeline/feature-extraction"

HF_TIMEOUT = 30
HF_MAX_RETRIES = 3
HF_BACKOFF_FACTOR = 0.6

def _build_hf_session() -> requests.Session:
    s = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=HF_MAX_RETRIES)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    if HF_API_KEY:
        s.headers.update({"Authorization": f"Bearer {HF_API_KEY}"})
    return s

def get_embedder() -> Callable[[Union[str, List[str]]], np.ndarray]:
    """
    Returns an embed(texts) function that calls Hugging Face router API
    with the feature-extraction pipeline.
    - Sends one text per request (avoids 400s).
    - Retries with exponential backoff on failure.
    - Mean-pools token-level embeddings into one vector.
    """
    session = _build_hf_session()

    def embed(texts: Union[str, List[str]]) -> np.ndarray:
        single_input = False
        if isinstance(texts, str):
            texts = [texts]
            single_input = True

        outputs = []
        for text in texts:
            payload = {"inputs": text}
            for attempt in range(HF_MAX_RETRIES):
                try:
                    r = session.post(HF_API_URL, json=payload, timeout=HF_TIMEOUT)
                    r.raise_for_status()
                    arr = np.array(r.json(), dtype=np.float32)

                    if arr.ndim == 2:   # token-level → mean pool
                        vec = arr.mean(axis=0)
                    elif arr.ndim == 1:
                        vec = arr
                    else:
                        vec = arr.reshape(-1).astype(np.float32)

                    outputs.append(vec)
                    break
                except Exception as e:
                    wait_time = HF_BACKOFF_FACTOR * (2 ** attempt)
                    print(f"❌ HF embed error: {e} | retrying in {wait_time:.1f}s...")
                    time.sleep(wait_time)
            else:
                outputs.append(np.zeros(384, dtype=np.float32))  # fallback vector

        result = np.stack(outputs, axis=0)
        return result[0] if single_input else result

    return embed

# convenience wrapper
_embedder_callable = None
def _ensure_embedder():
    global _embedder_callable
    if _embedder_callable is None:
        _embedder_callable = get_embedder()
def get_embedding_hf(text: Union[str, List[str]]) -> np.ndarray:
    _ensure_embedder()
    return _embedder_callable(text)

# -------------------------
# 3) Milvus helpers
# -------------------------
def get_or_create_collection(name: str, dim: int = VECTOR_DIM) -> Collection:
    global _collections_cache
    if name in _collections_cache:
        return _collections_cache[name]

    col = None
    try:
        if utility.has_collection(name):
            col = Collection(name)
            existing_fields = [f.name for f in col.schema.fields]
            if "chunk_id" not in existing_fields:
                print(f"⚠️ Dropping old collection {name} (missing chunk_id)...")
                utility.drop_collection(name)
                col = None
    except Exception as e:
        print(f"⚠️ Milvus check error for {name}: {e}")
        col = None

    if not utility.has_collection(name) or col is None:
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

    try:
        if not col.indexes:
            col.create_index(
                field_name="embedding",
                index_params={
                    "index_type": "IVF_FLAT",
                    "metric_type": "COSINE",
                    "params": {"nlist": 512}
                }
            )
    except Exception as e:
        print(f"⚠️ Milvus index creation skipped for {name}: {e}")

    _collections_cache[name] = col
    return col

def get_or_create_and_load_collection(name: str, dim: int = VECTOR_DIM):
    col = get_or_create_collection(name, dim)
    try:
        col.load()
    except Exception:
        pass
    return col

def get_docs_col():
    global _docs_col
    if _docs_col is None:
        _docs_col = get_or_create_and_load_collection("docs_col", VECTOR_DIM)
    return _docs_col

def get_notes_col():
    global _notes_col
    if _notes_col is None:
        _notes_col = get_or_create_and_load_collection("notes_col", VECTOR_DIM)
    return _notes_col

# -------------------------
# 4) LLM Helper
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
        raise NotImplementedError("Local LLM not implemented in this low-RAM pipeline.")

# -------------------------
# 5) Retrieval & rerank
# -------------------------
def retrieve_from_collection(collection: Collection, query: str, top_k=TOP_K):
    try:
        collection.load()
    except Exception:
        pass
    q_emb = get_embedding_hf(query)
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
    q_emb = get_embedding_hf(query)
    texts = [it["text"] for it in items]
    embs = np.array([get_embedding_hf(t) for t in texts])
    sims = np.dot(embs, q_emb)/(np.linalg.norm(embs, axis=1)*np.linalg.norm(q_emb))
    for it, s in zip(items, sims):
        it["score"] = float(s)
    items.sort(key=lambda x: x.get("score",0.0), reverse=True)
    del embs, sims; gc.collect()
    return items

def apply_threshold_and_topk(items, threshold=SIMILARITY_THRESHOLD, top_k=TOP_K):
    kept = [it for it in items if it.get("score",0.0) >= threshold]
    return kept[:top_k] if kept else (items[:1] if items else [])

def semantic_filter(sentences, context_texts, threshold=SEM_VERIF_THRESHOLD):
    if not sentences or not context_texts: return []
    ctx_emb = np.array([get_embedding_hf(t) for t in context_texts])
    kept = []
    for s in sentences:
        s_emb = get_embedding_hf(s)
        sims = np.dot(ctx_emb, s_emb)/(np.linalg.norm(ctx_emb, axis=1)*np.linalg.norm(s_emb))
        if max(sims) >= threshold:
            kept.append(s)
    del ctx_emb, s_emb, sims; gc.collect()
    return list(dict.fromkeys(kept))

# -------------------------
# 6) Fusion & notes
# -------------------------
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
# 7) Advanced RAG pipeline
# -------------------------
def advanced_rag_strict(query, n_candidates=TOP_K):
    docs_cands = retrieve_from_collection(get_docs_col(), query, top_k=n_candidates*2)
    notes_cands = retrieve_from_collection(get_notes_col(), query, top_k=n_candidates*2)
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

# -------------------------
# 8) Sentence tokenizer
# -------------------------
def simple_sent_tokenize(text):
    return [p.strip() for p in re.split(r'(?<=[\.\?\!])\s+', text) if p.strip()]