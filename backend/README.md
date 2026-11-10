# Inkfold backend

The Flask API. It reads PDFs, writes summaries, answers questions with RAG, makes quizzes, and handles history and sign-in.

## 🚀 Setup

Use **Python 3.10 to 3.14** (tested on 3.14). If you have 3.15, install 3.14 next to it and create the venv with `py -3.14 -m venv venv`.

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS / Linux: source venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and add your Gemini key. Only that one is required.

| Variable | Required | What it does |
|---|---|---|
| `GEMINI_API_KEY` | yes | Your key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL`, `GEMINI_EMBED_MODEL` | no | Change the models if Google renames them |
| `SUPABASE_URL`, `SUPABASE_KEY` | no | Sign-in and saved history. Use the secret `service_role` key |
| `FRONTEND_URL` | no | The hosted frontend's address, for CORS (default `http://localhost:3000`) |
| `GUEST_HOURS` | no | Hours before guest papers are deleted (default 12) |
| `DATA_DIR` | no | Where PDFs, vectors and `docs.json` are kept (default this folder) |

Using Supabase? Run [`supabase.sql`](supabase.sql) once in its SQL Editor.

## ▶️ Run


```bash
python main.py
```

The API runs at http://localhost:8000. On a public server, use a real web server instead of `python main.py`, which runs in debug mode:

```bash
waitress-serve --port=8000 main:app
```

## 🔌 API

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/upload` | form-data `file`, optional `force=true` | `doc_id`, `filename`, `summary`, `expires_in_hours` |
| POST | `/ask` | `{ doc_id, question, language?, history? }` | `answer`, `sources`, `quotes` |
| POST | `/quiz` | `{ doc_id }` | `questions` |
| GET | `/pdf/<doc_id>` | | the saved PDF |
| GET | `/history?guest=<id>` | | `enabled`, `papers` |
| PUT, DELETE | `/history/<doc_id>` | `{ guest, filename, summary, messages }` | `enabled` |
| POST | `/claim` | `{ guest, doc_ids }`, signed in | moves guest papers to the account |

If a file isn't a research paper, `/upload` returns `422` with `"not_paper": true`. Signed-in requests send `Authorization: Bearer <Supabase token>`, and the backend checks it with Supabase.

## 📁 Files

| File | Purpose |
|---|---|
| `main.py` | API routes and error messages |
| `rag.py` | PDF reading, paper check, passages, embeddings, summary, answers, quiz |
| `prompts.py` | Gemini prompts |
| `auth.py` | Checks the Supabase sign-in token |
| `history.py` | Saves history in Supabase |
| `cleanup.py` | Deletes guest papers after `GUEST_HOURS` |
| `supabase.sql` | The `papers` table |

## 💾 Where data lives

| Data | Where |
|---|---|
| PDFs | `uploads/` |
| Passages and vectors | `chroma_data/` |
| Guest expiry list | `docs.json` |
| History and accounts | the browser, or Supabase when it's set up |

These folders are created automatically and ignored by git. They need a permanent disk, such as a VPS.
