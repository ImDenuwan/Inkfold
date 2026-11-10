"""Optional: saves papers and chats in Supabase.
Signed-in users own their rows; guests are linked by a random id from their browser.
Without SUPABASE_URL and SUPABASE_KEY in .env, history stays in the browser only."""
import os
from datetime import datetime, timezone

import requests

URL = os.getenv("SUPABASE_URL", "").rstrip("/")
KEY = os.getenv("SUPABASE_KEY", "")
enabled = bool(URL and KEY)

TABLE = f"{URL}/rest/v1/papers"
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}


def list_papers(owner):
    params = {"owner_id": f"eq.{owner}", "order": "updated_at.desc", "limit": 50}
    response = requests.get(TABLE, headers=HEADERS, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def save_paper(owner, signed_in, doc_id, data):
    row = {
        "owner_id": owner,
        "doc_id": doc_id,
        "signed_in": signed_in,
        "filename": data.get("filename", ""),
        "summary": data.get("summary", {}),
        "messages": data.get("messages", []),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    # insert, or update the row if this owner already saved this paper
    headers = {**HEADERS, "Prefer": "resolution=merge-duplicates"}
    response = requests.post(TABLE, headers=headers, params={"on_conflict": "owner_id,doc_id"}, json=row, timeout=10)
    response.raise_for_status()


def delete_paper(owner, doc_id):
    params = {"owner_id": f"eq.{owner}", "doc_id": f"eq.{doc_id}"}
    requests.delete(TABLE, headers=HEADERS, params=params, timeout=10).raise_for_status()


def claim(guest, user):
    """After signing in, move this browser's guest papers to the user's account."""
    rows = list_papers(guest)
    params = {"owner_id": f"eq.{guest}"}
    body = {"owner_id": user, "signed_in": True}
    requests.patch(TABLE, headers=HEADERS, params=params, json=body, timeout=10).raise_for_status()
    return [row["doc_id"] for row in rows]


def delete_guest_papers(doc_ids):
    """Remove expired guest papers from the table."""
    if not doc_ids:
        return
    params = {"doc_id": f"in.({','.join(doc_ids)})", "signed_in": "eq.false"}
    requests.delete(TABLE, headers=HEADERS, params=params, timeout=10).raise_for_status()
