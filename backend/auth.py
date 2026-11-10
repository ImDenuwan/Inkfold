"""Who is calling: a signed-in Supabase user, or a guest."""
import os

import requests

URL = os.getenv("SUPABASE_URL", "").rstrip("/")
KEY = os.getenv("SUPABASE_KEY", "")


def current_user(request):
    """The signed-in user's id, or None for guests.
    The browser sends its Supabase login token; Supabase tells us whose it is."""
    header = request.headers.get("Authorization", "")
    if not (URL and KEY and header.startswith("Bearer ")):
        return None
    response = requests.get(f"{URL}/auth/v1/user", headers={"apikey": KEY, "Authorization": header}, timeout=10)
    return response.json().get("id") if response.ok else None
