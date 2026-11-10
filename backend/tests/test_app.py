"""Tests for the Inkfold API. Run them from the backend folder with: pytest"""
from conftest import PAPER_PAGES, make_pdf, upload


def test_server_is_up(client):
    assert client.get("/").get_json() == {"status": "ok"}


# --- upload and summary ---

def test_paper_gets_a_five_part_summary(client):
    r = upload(client, make_pdf(*PAPER_PAGES))
    assert r.status_code == 200
    summary = r.get_json()["summary"]
    for section in ["title", "abstract", "problem_statement", "methodology", "key_results", "conclusion"]:
        assert summary[section]


def test_cv_is_rejected_without_calling_the_ai(client, ai):
    cv = make_pdf("Curriculum Vitae. Work experience: intern at ABC. Skills: Python. Languages: English.")
    r = upload(client, cv)
    assert r.status_code == 422
    assert r.get_json()["not_paper"] is True
    assert ai.prompts == []  # stopped by the free keyword check


def test_continue_anyway_summarises_any_document(client):
    cv = make_pdf("Curriculum Vitae. Work experience: intern at ABC. Skills: Python.")
    assert upload(client, cv, force="true").status_code == 200


def test_bad_files_get_clear_errors(client):
    assert upload(client, b"%PDF", name="notes.txt").status_code == 400  # not a PDF name
    assert upload(client, b"this is not a pdf").status_code == 422  # can't be opened
    assert upload(client, make_pdf("")).status_code == 422  # no text, like a scanned PDF


# --- questions ---

def test_answer_only_lists_pages_that_were_retrieved(client, ai):
    doc_id = upload(client, make_pdf(*PAPER_PAGES)).get_json()["doc_id"]
    ai.replies = [{"answer": "They used WMT 2014 (p. 2). Also something (p. 99).", "quotes": []}]
    r = client.post("/ask", json={"doc_id": doc_id, "question": "Which dataset was used?"}).get_json()
    assert 2 in r["sources"]
    assert 99 not in r["sources"]  # page 99 doesn't exist, so it's not listed as a source


def test_empty_question_and_unknown_paper(client):
    assert client.post("/ask", json={"doc_id": "x", "question": "  "}).status_code == 400
    assert client.post("/ask", json={"doc_id": "0" * 32, "question": "Hi"}).status_code == 404


# --- quiz ---

def test_quiz_keeps_only_well_formed_questions(client, ai):
    doc_id = upload(client, make_pdf(*PAPER_PAGES)).get_json()["doc_id"]
    good = {"question": "Which dataset?", "options": ["A", "B", "C", "D"], "answer": 1, "explanation": "See p. 2", "page": 2}
    ai.replies = [{"questions": [good, {**good, "options": ["only", "two"]}, {**good, "answer": 7}]}]
    r = client.post("/quiz", json={"doc_id": doc_id}).get_json()
    assert len(r["questions"]) == 1


# --- safety ---

def test_pdf_route_rejects_odd_ids(client):
    assert client.get("/pdf/..%2Fmain.py").status_code == 404
    assert client.get("/pdf/" + "0" * 32).status_code == 404


def test_claiming_papers_needs_a_login(client):
    assert client.post("/claim", json={"guest": "some-guest-id"}).status_code == 401
