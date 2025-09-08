import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from threading import Lock, Thread
import logging
import gc
import requests

# -----------------------------
# Load environment
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
# RAG pipeline variables
# -----------------------------
advanced_rag_strict = None
_rag_lock = Lock()

# -----------------------------
# Load RAG pipeline and embedder
# -----------------------------
def load_rag_pipeline():
    global advanced_rag_strict
    with _rag_lock:
        if advanced_rag_strict is None:
            try:
                from rag_pipeline import advanced_rag_strict as pipeline
                from rag_pipeline import get_embedder  # force embedder load
                get_embedder()  # preload embeddings at startup
                advanced_rag_strict = pipeline
                logging.info("✅ RAG pipeline and embedder loaded")
            except Exception as e:
                logging.error("❌ Failed to load RAG pipeline: %s", e, exc_info=True)
                advanced_rag_strict = None

# Preload in background thread so startup isn't blocked too long
Thread(target=load_rag_pipeline, daemon=True).start()

# -----------------------------
# Flask routes
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_input = data.get("message", "").strip()
    if not user_input:
        return jsonify({"reply": "Please enter a question."})

    with _rag_lock:
        pipeline = advanced_rag_strict

    if pipeline is None:
        return jsonify({"reply": "Model is still loading, please wait..."})

    try:
        result = pipeline(user_input)
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

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "Service is up. Use /chat to query."})

# -----------------------------
# Flask wakeup route
# -----------------------------
@app.route("/wakeup", methods=["GET"])
def wakeup():
    """
    Call this endpoint to preload RAG pipeline + embedder
    so first /chat requests don’t fail or cause memory spikes.
    """
    global advanced_rag_strict
    with _rag_lock:
        if advanced_rag_strict is None:
            try:
                from rag_pipeline import advanced_rag_strict as pipeline
                from rag_pipeline import get_embedder
                get_embedder()  # preload embedder
                advanced_rag_strict = pipeline
                logging.info("✅ RAG pipeline and embedder loaded via /wakeup")
                return jsonify({"status": "wakeup completed", "pipeline_loaded": True})
            except Exception as e:
                logging.error("❌ Failed to load RAG pipeline in /wakeup: %s", e, exc_info=True)
                return jsonify({"status": "failed to wakeup", "pipeline_loaded": False}), 500
        else:
            return jsonify({"status": "pipeline already loaded", "pipeline_loaded": True})
