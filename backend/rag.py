import json
import os
import re
import time

import chromadb
import pymupdf
from google import genai
from google.genai import errors

from prompts import ANSWER_PROMPT, FORCE_NOTE, PICKED_LANGUAGE, QUIZ_PROMPT, SAME_LANGUAGE, SUMMARY_PROMPT

if not os.getenv("GEMINI_API_KEY"):
    raise RuntimeError("Add GEMINI_API_KEY to backend/.env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
db = chromadb.PersistentClient(path="chroma_data")

CHAT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")
CHUNK_WORDS = 400
OVERLAP = 50
TOP_K = 5


def embed(texts):
    result = client.models.embed_content(model=EMBED_MODEL, contents=texts)
    return [e.values for e in result.embeddings]


def generate(prompt, as_json=False):
    config = {"response_mime_type": "application/json"} if as_json else None
    for attempt in range(3):
        try:
            return client.models.generate_content(model=CHAT_MODEL, contents=prompt, config=config).text
        except errors.APIError as e:
            # Gemini sometimes says it's overloaded (503): wait a moment and try again
            if e.code != 503 or attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))


def read_pdf(pdf_bytes):
    try:
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    except Exception:
        raise ValueError("This file couldn't be opened as a PDF.")

    pages = [(i + 1, page.get_text()) for i, page in enumerate(doc)]
    pages = [(num, text) for num, text in pages if text.strip()]
    if not pages:
        raise ValueError("No text found. It may be a scanned PDF.")
    return pages


PAPER_SIGNS = ["abstract", "introduction", "references", "bibliography", "related work",
               "methodology", "experiment", "conclusion", "doi", "arxiv", "et al"]


def looks_like_paper(pages):
    """Free check before calling Gemini: real papers use most of these words."""
    text = " ".join(t for _, t in pages).lower()
    return sum(sign in text for sign in PAPER_SIGNS) >= 3


def chunk(pages):
    chunks = []
    for page_num, text in pages:
        words = text.split()
        for start in range(0, len(words), CHUNK_WORDS - OVERLAP):
            chunks.append({"text": " ".join(words[start:start + CHUNK_WORDS]), "page": page_num})
    return chunks


def summarize(pages, force=False):
    text = "\n\n".join(f"[Page {num}]\n{t}" for num, t in pages)
    prompt = SUMMARY_PROMPT.format(text=text[:120_000], force_note=FORCE_NOTE if force else "")
    return json.loads(generate(prompt, as_json=True))


def index_pdf(doc_id, pages):
    chunks = chunk(pages)
    collection = db.get_or_create_collection(doc_id)

    # Gemini embeds up to 100 texts per call
    for i in range(0, len(chunks), 100):
        batch = chunks[i:i + 100]
        collection.add(
            ids=[f"{doc_id}-{i + j}" for j in range(len(batch))],
            documents=[c["text"] for c in batch],
            embeddings=embed([c["text"] for c in batch]),
            metadatas=[{"page": c["page"]} for c in batch],
        )


def get_collection(doc_id):
    try:
        return db.get_collection(doc_id)
    except Exception:
        raise LookupError("Paper not found")


def quiz(doc_id):
    # rebuild the paper text from the stored passages, in order
    stored = get_collection(doc_id).get(include=["documents", "metadatas"])
    rows = sorted(zip(stored["ids"], stored["documents"], stored["metadatas"]), key=lambda r: int(r[0].rsplit("-", 1)[1]))
    text = "\n\n".join(f"[Page {m['page']}] {t}" for _, t, m in rows)

    questions = json.loads(generate(QUIZ_PROMPT.format(text=text[:100_000]), as_json=True)).get("questions", [])
    # keep only well-formed questions
    return [q for q in questions if len(q.get("options", [])) == 4 and q.get("answer") in range(4)]


def ask(doc_id, question, language=None, history=()):
    collection = get_collection(doc_id)

    # a follow-up like "explain please" means little alone, so search with the last question too
    last_question = next((m["text"] for m in reversed(history) if m["role"] == "user"), "")
    search = f"{last_question}\n{question}".strip()
    hits = collection.query(query_embeddings=embed([search]), n_results=min(TOP_K, collection.count()))

    # always include the opening of the paper (title and abstract) for general questions
    opening = collection.get(ids=[f"{doc_id}-0", f"{doc_id}-1"], include=["documents", "metadatas"])
    found = list(zip(hits["ids"][0], hits["documents"][0], hits["metadatas"][0]))
    found += [row for row in zip(opening["ids"], opening["documents"], opening["metadatas"]) if row[0] not in hits["ids"][0]]
    pages = [m["page"] for _, _, m in found]

    context = "\n\n".join(f"[Page {m['page']}] {t}" for _, t, m in found)
    chat = "\n".join(f"{'Student' if m['role'] == 'user' else 'Inkfold'}: {m['text']}" for m in history) or "(this is the first question)"
    rule = PICKED_LANGUAGE.format(language=language) if language else SAME_LANGUAGE
    prompt = ANSWER_PROMPT.format(context=context, question=question, language_rule=rule, history=chat)
    reply = json.loads(generate(prompt, as_json=True))
    answer = reply.get("answer", "")

    # only return the pages the answer actually cites
    cited = {int(n) for n in re.findall(r"p\.\s*(\d+)", answer)} & set(pages)
    # the sentences to highlight in the preview, for cited pages only
    quotes = [q for q in reply.get("quotes", []) if q.get("page") in cited and q.get("text")]
    return {"answer": answer, "sources": sorted(cited), "quotes": quotes}
