"use client";

import { useState } from "react";
import { askQuestion } from "../lib/api";

export default function Chat({ docId }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    try {
      const reply = await askQuestion(docId, text);
      setMessages((prev) => [...prev, { role: "assistant", text: reply.answer, sources: reply.sources }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[500px] flex-col rounded-3xl border border-line bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">Ask the paper</h2>

      <div className="mt-4 flex flex-1 flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-muted">Ask anything about the paper, like "Which datasets were used?"</p>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <p key={i} className="self-end rounded-2xl bg-ink px-4 py-2 text-white">{msg.text}</p>
          ) : (
            <div key={i}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.sources.map((page) => (
                    <span key={page} className="rounded bg-cite px-2 py-0.5 font-mono text-xs">
                      p. {page}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {loading && <p className="text-sm text-muted">Searching the paper...</p>}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label htmlFor="question" className="sr-only">Your question</label>
        <input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this paper"
          className="flex-1 rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-5 font-semibold text-ink disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </section>
  );
}
