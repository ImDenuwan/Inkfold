import os
import re
import uuid

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from google.genai import errors

import history
import rag

UPLOADS = "uploads"
os.makedirs(UPLOADS, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
# FRONTEND_URL lets the hosted site (e.g. on Vercel) call this API
CORS(app, origins=os.getenv("FRONTEND_URL", "http://localhost:3000").split(","), methods=["GET", "POST", "PUT", "DELETE"])


@app.get("/")
def health():
    return jsonify({"status": "ok"})


@app.post("/upload")
def upload():
    file = request.files.get("file")
    if not file or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a PDF file."}), 400

    pdf_bytes = file.read()
    try:
        pages = rag.read_pdf(pdf_bytes)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422

    # "Continue anyway" sends force=true and skips both checks
    force = request.form.get("force") == "true"

    # free keyword check first, so a CV or bill never reaches Gemini
    if not force and not rag.looks_like_paper(pages):
        return not_paper()

    summary = rag.summarize(pages, force)
    if not force and not summary.get("is_research_paper", True):
        return not_paper()

    doc_id = uuid.uuid4().hex
    rag.index_pdf(doc_id, pages)

    # keep the PDF so the paper can be reopened from history
    with open(os.path.join(UPLOADS, f"{doc_id}.pdf"), "wb") as f:
        f.write(pdf_bytes)
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
        # "Answer in" picker: only these languages are allowed
        language = data.get("language") if data.get("language") in ("English", "Sinhala", "Tamil") else None
        # the last few messages, so follow-ups like "explain please" make sense
        chat = [
            {"role": m["role"], "text": str(m["text"])[:1500]}
            for m in (data.get("history") or [])[-6:]
            if isinstance(m, dict) and m.get("role") in ("user", "assistant") and m.get("text")
        ]
        return jsonify(rag.ask(doc_id, question, language, chat))
    except LookupError:
        return jsonify({"error": "Paper not found. Please upload it again."}), 404


def valid_id(doc_id):
    return re.fullmatch(r"[0-9a-f]{32}", doc_id or "") is not None


@app.get("/pdf/<doc_id>")
def pdf(doc_id):
    if not valid_id(doc_id):
        return jsonify({"error": "Paper not found."}), 404
    return send_from_directory(UPLOADS, f"{doc_id}.pdf", mimetype="application/pdf")


@app.get("/history")
def list_history():
    if not history.enabled:
        return jsonify({"enabled": False})
    return jsonify({"enabled": True, "papers": history.list_papers(request.args.get("guest", ""))})


@app.put("/history/<doc_id>")
def save_history(doc_id):
    data = request.get_json(silent=True) or {}
    if history.enabled and valid_id(doc_id) and data.get("guest"):
        history.save_paper(data["guest"], doc_id, data)
    return jsonify({"enabled": history.enabled})


@app.delete("/history/<doc_id>")
def delete_history(doc_id):
    if history.enabled and valid_id(doc_id):
        history.delete_paper(request.args.get("guest", ""), doc_id)
    return jsonify({"enabled": history.enabled})


@app.post("/quiz")
def quiz():
    data = request.get_json(silent=True) or {}
    try:
        return jsonify({"questions": rag.quiz(str(data.get("doc_id", "")))})
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
    # print the real reason in the terminal, so we can see what went wrong
    app.logger.error("Gemini error %s: %s", e.code, e.message)
    if e.code == 429:
        return jsonify({"error": "Too many requests right now. Wait a minute and try again."}), 429
    return jsonify({"error": "The AI service had a problem. Please try again."}), 502


if __name__ == "__main__":
    app.run(port=8000, debug=True)
