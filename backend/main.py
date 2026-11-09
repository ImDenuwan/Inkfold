import uuid

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS
from google.genai import errors

import rag

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
CORS(app, origins=["http://localhost:3000"])


@app.get("/")
def health():
    return jsonify({"status": "ok"})


@app.post("/upload")
def upload():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a PDF file."}), 400

    try:
        pages = rag.read_pdf(file.read())
    except ValueError as e:
        return jsonify({"error": str(e)}), 422

    force = request.form.get("force") == "true"

    # free keyword check first, so a CV or bill never reaches Gemini
    if not force and not rag.looks_like_paper(pages):
        return not_paper()

    summary = rag.summarize(pages, force)
    if not force and not summary.get("is_research_paper", True):
        return not_paper()

    doc_id = uuid.uuid4().hex
    rag.index_pdf(doc_id, pages)
    return jsonify({"doc_id": doc_id, "filename": file.filename, "summary": summary})

def not_paper():
    return jsonify({"error": "This doesn't look like a research paper.", "not_paper": True}), 422
    
@app.post("/ask")
def ask():
    data = request.get_json(silent=True) or {}
    doc_id = str(data.get("doc_id", ""))
    question = str(data.get("question", "")).strip()
    if not question:
        return jsonify({"error": "Please type a question."}), 400

    try:
        return jsonify(rag.ask(doc_id, question))
    except LookupError:
        return jsonify({"error": "Paper not found. Please upload it again."}), 404


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "The file is larger than 25 MB."}), 413


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Something went wrong on our side. Please try again."}), 500


@app.errorhandler(errors.APIError)
def gemini_error(e):
    if e.code == 429:
        return jsonify({"error": "Too many requests right now. Wait a minute and try again."}), 429
    return jsonify({"error": "The AI service had a problem. Please try again."}), 502


if __name__ == "__main__":
    app.run(port=8000, debug=True)
