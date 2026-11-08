import json
import os

import chromadb
import pymupdf
from google import genai

from prompts import ANSWER_PROMPT, SUMMARY_PROMPT

if not os.getenv("GEMINI_API_KEY"):
    raise RuntimeError("Add GEMINI_API_KEY to backend/.env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
db = chromadb.PersistentClient(path="chroma_data")

CHAT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")
CHUNK_WORDS = 400
OVERLAP = 50
TOP_K = 5


def embed(texts):
    result = client.models.embed_content(model=EMBED_MODEL, contents=texts)
    return [e.values for e in result.embeddings]


def generate(prompt, as_json=False):
    config = {"response_mime_type": "application/json"} if as_json else None
    return client.models.generate_content(model=CHAT_MODEL, contents=prompt, config=config).text


def extract_pages(pdf_bytes):
    try:
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    except Exception:
        raise ValueError("This file couldn't be opened as a PDF.")

    pages = [(i + 1, page.get_text()) for i, page in enumerate(doc)]
    pages = [(num, text) for num, text in pages if text.strip()]
    if not pages:
        raise ValueError("No text found. It may be a scanned PDF.")
    return pages


def chunk(pages):
    chunks = []
    for page_num, text in pages:
        words = text.split()
        for start in range(0, len(words), CHUNK_WORDS - OVERLAP):
            chunks.append({"text": " ".join(words[start:start + CHUNK_WORDS]), "page": page_num})
    return chunks


def index_pdf(doc_id, pdf_bytes):
    pages = extract_pages(pdf_bytes)
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
    return "\n\n".join(f"[Page {num}]\n{text}" for num, text in pages)


def summarize(full_text):
    reply = generate(SUMMARY_PROMPT.format(text=full_text[:120_000]), as_json=True)
    return json.loads(reply)


def ask(doc_id, question):
    try:
        collection = db.get_collection(doc_id)
    except Exception:
        raise LookupError("Paper not found")

    hits = collection.query(query_embeddings=embed([question]), n_results=min(TOP_K, collection.count()))
    passages = hits["documents"][0]
    pages = [m["page"] for m in hits["metadatas"][0]]

    context = "\n\n".join(f"[Page {p}] {t}" for p, t in zip(pages, passages))
    answer = generate(ANSWER_PROMPT.format(context=context, question=question))
    return {"answer": answer, "sources": sorted(set(pages))}
