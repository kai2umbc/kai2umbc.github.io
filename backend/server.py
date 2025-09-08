import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from threading import Lock
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
# Load RAG pipeline (no background ingestion)
# -----------------------------
def load_rag_pipeline():
    global advanced_rag_strict
    with _rag_lock:
        if advanced_rag_strict is None:
            try:
                from rag_pipeline import advanced_rag_strict as pipeline
                advanced_rag_strict = pipeline
                logging.info("✅ RAG pipeline loaded")
            except Exception as e:
                logging.error("❌ Failed to load RAG pipeline: %s", e, exc_info=True)
                advanced_rag_strict = None

load_rag_pipeline()

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
        return jsonify({"reply": "Model is not ready yet, please wait..."})

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
