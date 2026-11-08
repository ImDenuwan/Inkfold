const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handle(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export async function uploadPaper(file) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
  return handle(response);
}

export async function askQuestion(docId, question) {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id: docId, question }),
  });
  return handle(response);
}
