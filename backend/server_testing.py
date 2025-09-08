import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from threading import Thread
import time

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("❌ OPENROUTER_API_KEY not found in .env")

# -----------------------------
# RAG pipeline will be lazy-loaded
# -----------------------------
advanced_rag_strict = None

def load_rag_pipeline():
    global advanced_rag_strict
    from rag_pipeline import advanced_rag_strict as pipeline
    advanced_rag_strict = pipeline
    print("✅ RAG pipeline loaded")

# -----------------------------
# Flask setup
# -----------------------------
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    if not user_input.strip():
        return jsonify({"reply": "Please enter a question."})

    if advanced_rag_strict is None:
        return jsonify({"reply": "Model is still loading, please wait..."})

    try:
        result = advanced_rag_strict(user_input)
        reply = result.get("natural", "I don't know.")
        provenance = result.get("provenance", [])
        return jsonify({"reply": reply, "provenance": provenance})
    except Exception as e:
        print("❌ Error in RAG pipeline:", e)
        return jsonify({"reply": "Oops! Something went wrong.", "provenance": []}), 500

# -----------------------------
# Run Flask immediately
# -----------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"🚀 Starting Flask server on port {port}...")

    # Start loading the model in background
    Thread(target=load_rag_pipeline, daemon=True).start()

    # Start Flask
    app.run(host="0.0.0.0", port=port, debug=False)
