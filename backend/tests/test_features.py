"""More API tests: languages, chat memory, saved PDFs, guest cleanup and error messages."""
from google.genai import errors

import auth
import cleanup
import prompts
import rag
from conftest import PAPER_PAGES, make_pdf, upload


def new_paper(client):
    return upload(client, make_pdf(*PAPER_PAGES)).get_json()["doc_id"]


def ask(client, doc_id, question="Which dataset?", **extra):
    return client.post("/ask", json={"doc_id": doc_id, "question": question, **extra})


# --- answer language and chat memory ---

def test_picked_language_goes_into_the_prompt(client, ai):
    doc_id = new_paper(client)
    ai.replies = [{"answer": "WMT 2014 (p. 2).", "quotes": []}]
    ask(client, doc_id, language="Sinhala")
    assert "Write the whole answer in Sinhala" in ai.prompts[-1]


def test_unknown_language_falls_back_to_the_question_language(client, ai):
    doc_id = new_paper(client)
    ai.replies = [{"answer": "Yes (p. 1).", "quotes": []}]
    ask(client, doc_id, language="Klingon")
    assert prompts.SAME_LANGUAGE in ai.prompts[-1]


def test_follow_ups_get_the_recent_chat(client, ai):
    doc_id = new_paper(client)
    history = [{"role": "user", "text": f"question {i}"} for i in range(10)]
    ai.replies = [{"answer": "Sure (p. 1).", "quotes": []}]
    ask(client, doc_id, "explain please", history=history)
    prompt = ai.prompts[-1]
    assert "Student: question 9" in prompt  # the latest messages are sent
    assert "Student: question 0" not in prompt  # only the last 6, so prompts stay small


def test_quotes_are_only_kept_for_cited_pages(client, ai):
    doc_id = new_paper(client)
    ai.replies = [{"answer": "WMT 2014 (p. 2).", "quotes": [
        {"page": 2, "text": "Experiments on the WMT 2014 English to German dataset."},
        {"page": 3, "text": "The big model reaches 28.4 BLEU."},  # page 3 isn't cited
    ]}]
    quotes = ask(client, doc_id).get_json()["quotes"]
    assert [q["page"] for q in quotes] == [2]


# --- saved PDFs and guest cleanup ---

def test_uploaded_pdf_can_be_opened_again(client):
    pdf = make_pdf(*PAPER_PAGES)
    doc_id = upload(client, pdf).get_json()["doc_id"]
    r = client.get(f"/pdf/{doc_id}")
    assert r.status_code == 200 and r.data == pdf


def test_guest_papers_expire_and_signed_in_papers_are_kept(client, monkeypatch):
    guest = upload(client, make_pdf(*PAPER_PAGES)).get_json()
    assert guest["expires_in_hours"] == 12

    monkeypatch.setattr(auth, "current_user", lambda request: "user-123")
    kept = upload(client, make_pdf(*PAPER_PAGES)).get_json()
    assert kept["expires_in_hours"] is None

    monkeypatch.setattr(cleanup, "GUEST_HOURS", 0)  # pretend 12 hours have passed
    removed = cleanup.remove_expired(cleanup.rag.DATA_DIR + "/uploads")
    assert guest["doc_id"] in removed and kept["doc_id"] not in removed
    assert client.get(f"/pdf/{guest['doc_id']}").status_code == 404
    assert client.get(f"/pdf/{kept['doc_id']}").status_code == 200


def test_signing_in_keeps_the_guest_papers(client, monkeypatch):
    doc_id = new_paper(client)
    monkeypatch.setattr(auth, "current_user", lambda request: "user-123")
    r = client.post("/claim", json={"guest": "browser-abc", "doc_ids": [doc_id, "../bad"]})
    assert r.get_json() == {"kept": 1}  # the bad id is ignored


def test_history_says_when_supabase_is_off(client):
    assert client.get("/history?guest=browser-abc").get_json() == {"enabled": False}


# --- error messages ---

def test_files_over_25_mb_are_refused(client):
    r = upload(client, b"%PDF-" + b"0" * (26 * 1024 * 1024))
    assert r.status_code == 413
    assert "25 MB" in r.get_json()["error"]


def test_gemini_rate_limit_gives_a_friendly_message(client, monkeypatch):
    def busy(prompt, as_json=False):
        raise errors.APIError(429, {"error": {"code": 429, "message": "quota", "status": "RESOURCE_EXHAUSTED"}})

    monkeypatch.setattr(rag, "generate", busy)
    r = upload(client, make_pdf(*PAPER_PAGES))
    assert r.status_code == 429
    assert "Too many requests" in r.get_json()["error"]


def test_other_gemini_errors_give_502(client, monkeypatch):
    def broken(prompt, as_json=False):
        raise errors.APIError(400, {"error": {"code": 400, "message": "bad", "status": "INVALID_ARGUMENT"}})

    monkeypatch.setattr(rag, "generate", broken)
    assert upload(client, make_pdf(*PAPER_PAGES)).status_code == 502
