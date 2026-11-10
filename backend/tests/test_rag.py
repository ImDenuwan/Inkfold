"""Unit tests: single functions from rag.py, checked directly (no web requests)."""
import pytest
from google.genai import errors

import rag
from conftest import make_pdf


# --- splitting the paper into passages ---

def test_long_page_is_split_into_overlapping_passages():
    words = [f"w{i}" for i in range(900)]
    chunks = rag.chunk([(1, " ".join(words))])
    # passages start every 350 words (400 long, 50 shared with the next one)
    assert [c["text"].split()[0] for c in chunks] == ["w0", "w350", "w700"]
    assert chunks[0]["text"].split()[-50:] == chunks[1]["text"].split()[:50]


def test_every_passage_remembers_its_page():
    chunks = rag.chunk([(1, "first page text"), (4, "fourth page text")])
    assert [c["page"] for c in chunks] == [1, 4]


# --- the free "is it a paper?" check ---

def test_keyword_check_needs_at_least_three_signs():
    assert rag.looks_like_paper([(1, "Abstract. Introduction. References.")])
    assert not rag.looks_like_paper([(1, "Abstract. Introduction.")])
    assert not rag.looks_like_paper([(1, "Invoice. Total due: Rs 2,400. Payment due 15 Nov.")])


# --- reading PDFs ---

def test_empty_pages_are_skipped_but_page_numbers_stay_right():
    pages = rag.read_pdf(make_pdf("Page one text.", "", "Page three text."))
    assert [num for num, _ in pages] == [1, 3]


def test_broken_and_empty_pdfs_raise_clear_errors():
    with pytest.raises(ValueError, match="couldn't be opened"):
        rag.read_pdf(b"not a pdf")
    with pytest.raises(ValueError, match="No text found"):
        rag.read_pdf(make_pdf(""))


# --- talking to Gemini ---

class Flaky:
    """A fake Gemini that fails with the given error codes first, then answers."""

    def __init__(self, *codes):
        self.codes = list(codes)
        self.calls = 0

    def generate_content(self, **kwargs):
        self.calls += 1
        if self.codes:
            code = self.codes.pop(0)
            raise errors.APIError(code, {"error": {"code": code, "message": "fake", "status": "FAKE"}})
        return type("Reply", (), {"text": "ok"})()


def use(monkeypatch, fake):
    monkeypatch.setattr(rag, "client", type("Client", (), {"models": fake})())
    monkeypatch.setattr(rag.time, "sleep", lambda seconds: None)  # don't really wait in tests


def test_overloaded_gemini_is_retried(monkeypatch):
    fake = Flaky(503, 503)
    use(monkeypatch, fake)
    assert rag.generate("hi") == "ok"
    assert fake.calls == 3


def test_other_gemini_errors_are_not_retried(monkeypatch):
    fake = Flaky(400)
    use(monkeypatch, fake)
    with pytest.raises(errors.APIError):
        rag.generate("hi")
    assert fake.calls == 1


def test_retrying_gives_up_after_three_tries(monkeypatch):
    fake = Flaky(503, 503, 503, 503)
    use(monkeypatch, fake)
    with pytest.raises(errors.APIError):
        rag.generate("hi")
    assert fake.calls == 3


# --- prompts ---

def test_continue_anyway_note_is_only_added_when_forced(ai):
    pages = [(1, "Some document text.")]
    rag.summarize(pages)
    rag.summarize(pages, force=True)
    assert rag.FORCE_NOTE not in ai.prompts[0]
    assert rag.FORCE_NOTE in ai.prompts[1]
