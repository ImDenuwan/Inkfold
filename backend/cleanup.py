"""Guest papers are deleted after a few hours. Papers saved by a signed-in user are kept.
docs.json remembers when each paper was uploaded and whether to keep it."""
import json
import os
import threading
import time

import history
import rag

GUEST_HOURS = float(os.getenv("GUEST_HOURS") or 12)
REGISTRY = os.path.join(rag.DATA_DIR, "docs.json")
lock = threading.Lock()


def _read():
    try:
        with open(REGISTRY) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def _write(docs):
    with open(REGISTRY, "w") as f:
        json.dump(docs, f)


def add(doc_id, keep):
    with lock:
        docs = _read()
        docs[doc_id] = {"uploaded": time.time(), "keep": keep}
        _write(docs)


def keep(doc_ids):
    with lock:
        docs = _read()
        for doc_id in doc_ids:
            if doc_id in docs:
                docs[doc_id]["keep"] = True
        _write(docs)


def remove_expired(uploads):
    """Delete guest papers older than GUEST_HOURS: the PDF, its passages and its history rows."""
    with lock:
        docs = _read()
        cutoff = time.time() - GUEST_HOURS * 3600
        expired = [d for d, info in docs.items() if not info["keep"] and info["uploaded"] < cutoff]
        for doc_id in expired:
            try:
                os.remove(os.path.join(uploads, f"{doc_id}.pdf"))
            except OSError:
                pass
            try:
                rag.db.delete_collection(doc_id)
            except Exception:
                pass
            docs.pop(doc_id)
        _write(docs)

    if expired and history.enabled:
        history.delete_guest_papers(expired)
    return expired


def start(uploads, every_minutes=15):
    """Check for expired guest papers in the background."""
    def loop():
        while True:
            try:
                remove_expired(uploads)
            except Exception as e:
                print("cleanup failed:", e)
            time.sleep(every_minutes * 60)

    threading.Thread(target=loop, daemon=True).start()
