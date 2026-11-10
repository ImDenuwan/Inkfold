import { API_URL } from "./api";

const KEY = "inkfold-history";

// localStorage can be blocked (private mode), so every use is wrapped
function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

// A random id for this browser, instead of a login
export function guestId() {
  try {
    let id = localStorage.getItem("inkfold-guest");
    if (!id) {
      // randomUUID only works on https, so fall back to a random string
      id = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("inkfold-guest", id);
    }
    return id;
  } catch {
    return "guest";
  }
}

// Supabase if the backend has it set up, otherwise this browser
export async function loadHistory() {
  try {
    const data = await (await fetch(`${API_URL}/history?guest=${guestId()}`)).json();
    if (data.enabled) return data.papers;
  } catch {}
  return readLocal();
}

export function saveHistory({ doc_id, filename, summary, messages = [] }) {
  const entry = { doc_id, filename, summary, messages, updated_at: new Date().toISOString() };
  writeLocal([entry, ...readLocal().filter((p) => p.doc_id !== doc_id)]);
  fetch(`${API_URL}/history/${doc_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guest: guestId(), ...entry }),
  }).catch(() => {});
}

export function removeHistory(docId) {
  writeLocal(readLocal().filter((p) => p.doc_id !== docId));
  fetch(`${API_URL}/history/${docId}?guest=${guestId()}`, { method: "DELETE" }).catch(() => {});
}
