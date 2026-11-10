"""Shared setup for the tests: a fake Gemini, a throwaway data folder, and a helper to make PDFs.
Nothing here calls the real Gemini or Supabase, so the tests need no API key and cost nothing."""
import hashlib
import io
import json
import math
import os
import sys
import tempfile
from types import SimpleNamespace

# set before the app is imported (load_dotenv never overrides values that are already set)
os.environ["GEMINI_API_KEY"] = "test-key"
os.environ["DATA_DIR"] = tempfile.mkdtemp(prefix="inkfold-test-")
os.environ["SUPABASE_URL"] = ""
os.environ["SUPABASE_KEY"] = ""
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pymupdf  # noqa: E402
import pytest  # noqa: E402

import main  # noqa: E402
import rag  # noqa: E402

# what the fake Gemini answers when a test doesn't ask for something else
PAPER_SUMMARY = {
    "is_research_paper": True,
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani", "Noam Shazeer"],
    "year": "2017",
    "venue": "Advances in Neural Information Processing Systems",
    "doi": "",
    "abstract": "A new model based only on attention.",
    "problem_statement": "Recurrent models are slow to train.",
    "methodology": "Stacked self-attention layers.",
    "key_results": "28.4 BLEU on English to German.",
    "conclusion": "Attention alone works well.",
    "suggested_questions": ["Which datasets?", "What is multi-head attention?", "How long was training?"],
}

PAPER_PAGES = [
    "Attention Is All You Need. Ashish Vaswani et al. Abstract: we propose the Transformer, based only on attention. 1 Introduction.",
    "2 Method. The model uses multi-head self-attention. Experiments on the WMT 2014 English to German dataset.",
    "3 Results. The big model reaches 28.4 BLEU. Conclusion. References: Bahdanau et al. arXiv.",
]


def fake_vector(text, size=128):
    """Bag-of-words vector: texts that share words end up close together, like real embeddings."""
    vec = [0.0] * size
    for word in text.lower().split():
        vec[int(hashlib.md5(word.encode()).hexdigest(), 16) % size] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


class FakeModels:
    """Pretends to be Gemini. Tests put the replies they want in `replies`."""

    def __init__(self):
        self.replies = []
        self.prompts = []

    def generate_content(self, model, contents, config=None):
        self.prompts.append(contents)
        reply = self.replies.pop(0) if self.replies else PAPER_SUMMARY
        return SimpleNamespace(text=reply if isinstance(reply, str) else json.dumps(reply))

    def embed_content(self, model, contents, config=None):
        return SimpleNamespace(embeddings=[SimpleNamespace(values=fake_vector(t)) for t in contents])


@pytest.fixture
def ai(monkeypatch):
    fake = FakeModels()
    monkeypatch.setattr(rag, "client", SimpleNamespace(models=fake))
    return fake


@pytest.fixture
def client(ai):
    return main.app.test_client()


def make_pdf(*pages):
    doc = pymupdf.open()
    for text in pages:
        doc.new_page().insert_textbox(pymupdf.Rect(40, 40, 560, 800), text, fontsize=9)
    return doc.tobytes()


def upload(client, pdf, name="paper.pdf", **form):
    return client.post("/upload", data={"file": (io.BytesIO(pdf), name), **form}, content_type="multipart/form-data")
