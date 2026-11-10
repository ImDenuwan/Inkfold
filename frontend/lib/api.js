import { accessToken } from "./supabase";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// adds the login token when someone is signed in
export async function authHeaders(headers = {}) {
  const token = await accessToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

async function handle(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong. Please try again.");
    error.notPaper = data.not_paper;
    throw error;
  }
  return data;
}

export async function uploadPaper(file, force = false) {
  const form = new FormData();
  form.append("file", file);
  if (force) form.append("force", "true");
  const response = await fetch(`${API_URL}/upload`, { method: "POST", body: form, headers: await authHeaders() });
  return handle(response);
}

export async function askQuestion(docId, question, language, history = []) {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id: docId, question, language, history }),
  });
  return handle(response);
}

export async function makeQuiz(docId) {
  const response = await fetch(`${API_URL}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id: docId }),
  });
  return handle(response);
}

// right after signing in: move this browser's guest papers to the account
export async function claimGuestPapers(guest, docIds) {
  const response = await fetch(`${API_URL}/claim`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ guest, doc_ids: docIds }),
  });
  return handle(response);
}
