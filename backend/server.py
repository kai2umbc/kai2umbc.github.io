import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from threading import Lock
import logging
import gc
import requests

# -----------------------------
# Environment
# -----------------------------
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("❌ OPENROUTER_API_KEY not found in environment variables")

# -----------------------------
# Flask setup
# -----------------------------
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

# -----------------------------
# RAG pipeline / embedder
# -----------------------------
advanced_rag_strict = None
_rag_lock = Lock()

def load_pipeline_safe():
    """
    Lazy-load RAG pipeline and embedder safely.
    Returns True if loaded, False if failed.
    """
    global advanced_rag_strict
    with _rag_lock:
        if advanced_rag_strict is not None:
            return True  # already loaded
        try:
            # Import the rag pipeline module; it defines advanced_rag_strict and get_embedder/get_embedding_hf
            import rag_pipeline as rp
            # Preload embedder
            # rp.get_embedder returns a callable; calling it will create the session & warm any model access
            rp._ensure_embedder()  # create embedder (no network call yet until used)
            # Preload Milvus collections (optional safe call)
            try:
                rp.get_docs_col()
                rp.get_notes_col()
            except Exception as e:
                logging.warning("⚠️ Could not preload Milvus collections: %s", e)
            advanced_rag_strict = rp.advanced_rag_strict
            logging.info("✅ RAG pipeline and embedder loaded")
            return True
        except Exception as e:
            logging.error("❌ Failed to load RAG pipeline: %s", e, exc_info=True)
            advanced_rag_strict = None
            return False

# -----------------------------
# Flask routes
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_input = data.get("message", "").strip()
    if not user_input:
        return jsonify({"reply": "Please enter a question."})

    # Lazy-load on first request
    if advanced_rag_strict is None:
        loaded = load_pipeline_safe()
        if not loaded:
            return jsonify({"reply": "Model is loading or failed. Try again shortly.", "provenance": []})

    try:
        result = advanced_rag_strict(user_input)
        reply = result.get("natural", "I don't know.")
        provenance = result.get("provenance", [])
        del result; gc.collect()
        return jsonify({"reply": reply, "provenance": provenance})
    except requests.exceptions.RequestException as e:
        logging.error("❌ OpenRouter API error: %s", e, exc_info=True)
        return jsonify({"reply": "OpenRouter API failed. Please try again later.", "provenance": []}), 503
    except Exception as e:
        logging.error("❌ RAG pipeline error: %s", e, exc_info=True)
        return jsonify({"reply": "Oops! Something went wrong.", "provenance": []}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "pipeline_loaded": advanced_rag_strict is not None})

@app.route("/wakeup", methods=["GET"])
def wakeup():
    """
    Trigger pipeline load manually, safe for free-tier.
    """
    loaded = load_pipeline_safe()
    status = "pipeline_loaded" if loaded else "load_failed"
    return jsonify({"status": status, "pipeline_loaded": loaded})

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Service is up. Use /chat to query."})