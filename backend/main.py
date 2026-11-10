import os
import re
import uuid

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from google.genai import errors

import auth
import cleanup
import history
import rag

UPLOADS = os.path.join(rag.DATA_DIR, "uploads")
os.makedirs(UPLOADS, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024
CORS(app, origins=(os.getenv("FRONTEND_URL") or "http://localhost:3000").split(","), methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Content-Type", "Authorization"])


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

    # signed-in papers are kept; guest papers are deleted after GUEST_HOURS
    user = auth.current_user(request)
    cleanup.add(doc_id, keep=bool(user))
    expires = None if user else cleanup.GUEST_HOURS
    return jsonify({"doc_id": doc_id, "filename": file.filename, "summary": summary, "expires_in_hours": expires})


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
        language = data.get("language") if data.get("language") in ("English", "Sinhala", "Tamil") else None
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


def owner():
    """A signed-in user owns their papers; otherwise the browser's guest id does."""
    user = auth.current_user(request)
    guest = (request.get_json(silent=True) or {}).get("guest") or request.args.get("guest", "")
    return (user, True) if user else (str(guest)[:64], False)


@app.get("/history")
def list_history():
    if not history.enabled:
        return jsonify({"enabled": False})
    who, signed_in = owner()
    return jsonify({"enabled": True, "signed_in": signed_in, "papers": history.list_papers(who) if who else []})


@app.put("/history/<doc_id>")
def save_history(doc_id):
    who, signed_in = owner()
    if history.enabled and valid_id(doc_id) and who:
        history.save_paper(who, signed_in, doc_id, request.get_json(silent=True) or {})
        if signed_in:
            cleanup.keep([doc_id])
    return jsonify({"enabled": history.enabled})


@app.delete("/history/<doc_id>")
def delete_history(doc_id):
    who, _ = owner()
    if history.enabled and valid_id(doc_id) and who:
        history.delete_paper(who, doc_id)
    return jsonify({"enabled": history.enabled})


@app.post("/claim")
def claim():
    """Right after signing in: move this browser's guest papers to the account and keep them."""
    user = auth.current_user(request)
    if not user:
        return jsonify({"error": "Please sign in first."}), 401
    data = request.get_json(silent=True) or {}
    doc_ids = [d for d in data.get("doc_ids", []) if isinstance(d, str) and valid_id(d)]
    if history.enabled and data.get("guest"):
        doc_ids += history.claim(str(data["guest"])[:64], user)
    cleanup.keep(doc_ids)
    return jsonify({"kept": len(set(doc_ids))})


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
    app.logger.error("Gemini error %s: %s", e.code, e.message)
    if e.code == 429:
        return jsonify({"error": "Too many requests right now. Wait a minute and try again."}), 429
    return jsonify({"error": "The AI service had a problem. Please try again."}), 502


cleanup.start(UPLOADS)

if __name__ == "__main__":
    app.run(port=8000, debug=True)
