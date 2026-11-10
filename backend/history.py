"""Optional: saves each guest's papers and chats in Supabase.
Without SUPABASE_URL and SUPABASE_KEY in .env, history stays in the browser only."""
import os
from datetime import datetime, timezone

import requests

URL = os.getenv("SUPABASE_URL", "").rstrip("/")
KEY = os.getenv("SUPABASE_KEY", "")
enabled = bool(URL and KEY)

TABLE = f"{URL}/rest/v1/papers"
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}


def list_papers(guest):
    params = {"guest_id": f"eq.{guest}", "order": "updated_at.desc", "limit": 20}
    response = requests.get(TABLE, headers=HEADERS, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def save_paper(guest, doc_id, data):
    row = {
        "guest_id": guest,
        "doc_id": doc_id,
        "filename": data.get("filename", ""),
        "summary": data.get("summary", {}),
        "messages": data.get("messages", []),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    # insert, or update the row if this guest already saved this paper
    headers = {**HEADERS, "Prefer": "resolution=merge-duplicates"}
    response = requests.post(TABLE, headers=headers, params={"on_conflict": "guest_id,doc_id"}, json=row, timeout=10)
    response.raise_for_status()


def delete_paper(guest, doc_id):
    params = {"guest_id": f"eq.{guest}", "doc_id": f"eq.{doc_id}"}
    requests.delete(TABLE, headers=HEADERS, params=params, timeout=10).raise_for_status()
