import { API_URL, authHeaders } from "./api";

const KEY = "inkfold-history";
const GUEST_HOURS = 12; // matches GUEST_HOURS on the backend

// localStorage can be blocked (private mode), so every use is wrapped
export function readLocal() {
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
    const response = await fetch(`${API_URL}/history?guest=${guestId()}`, { headers: await authHeaders() });
    const data = await response.json();
    if (data.enabled) return data.papers;
  } catch {}
  // guest papers are deleted on the server after a while, so hide old ones here too
  const cutoff = Date.now() - GUEST_HOURS * 3600 * 1000;
  return readLocal().filter((p) => new Date(p.created_at || p.updated_at) > cutoff);
}

export async function saveHistory({ doc_id, filename, summary, messages = [] }) {
  const old = readLocal().find((p) => p.doc_id === doc_id);
  const now = new Date().toISOString();
  const entry = { doc_id, filename, summary, messages, created_at: old?.created_at || now, updated_at: now };
  writeLocal([entry, ...readLocal().filter((p) => p.doc_id !== doc_id)]);
  fetch(`${API_URL}/history/${doc_id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ guest: guestId(), ...entry }),
  }).catch(() => {});
}

export async function removeHistory(docId) {
  writeLocal(readLocal().filter((p) => p.doc_id !== docId));
  fetch(`${API_URL}/history/${docId}?guest=${guestId()}`, { method: "DELETE", headers: await authHeaders() }).catch(() => {});
}
