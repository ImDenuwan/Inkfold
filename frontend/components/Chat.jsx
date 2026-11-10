"use client";

import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../lib/api";

// One small button per page number. Clicking opens the paper at that page.
function PageLink({ page, onCite }) {
  return (
    <button
      onClick={() => onCite(page)}
      className="mx-0.5 rounded bg-cite px-1.5 py-0.5 text-xs font-medium text-cite-ink transition hover:brightness-95"
    >
      p. {page}
    </button>
  );
}

// Turns "(p. 4, p. 6)" in the answer into page buttons
function Answer({ text, onCite }) {
  const parts = text.split(/(\(p\.\s*\d+(?:,\s*p\.\s*\d+)*\))/g);
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        /^\(p\./.test(part)
          ? part.match(/\d+/g).map((n) => <PageLink key={`${i}-${n}`} page={Number(n)} onCite={onCite} />)
          : part
      )}
    </p>
  );
}

export default function Chat({ docId, suggestions, onCite, initialMessages = [], onChange }) {
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length) onChange?.(messages.filter((m) => m.role !== "error"));
  }, [messages]);

  async function ask(text) {
    text = text.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    try {
      const reply = await askQuestion(docId, text);
      setMessages((prev) => [...prev, { role: "assistant", text: reply.answer, sources: reply.sources, quotes: reply.quotes }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "error", text: err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="flex h-[70vh] min-h-[460px] animate-rise flex-col rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-6 lg:h-[calc(100vh-10rem)]"
      style={{ animationDelay: "120ms" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">Ask the paper</h2>

      <div ref={listRef} className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div>
            <p className="text-muted">Ask anything about the paper. Answers come only from the paper, with page numbers.</p>
            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-col items-start gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-line bg-paper px-4 py-2 text-left text-sm transition hover:border-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <p key={i} className="max-w-[85%] animate-rise self-end rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-white">
              {msg.text}
            </p>
          ) : msg.role === "error" ? (
            <p key={i} className="animate-rise text-sm text-red-700">{msg.text}</p>
          ) : (
            <div key={i} className="animate-rise rounded-2xl border border-line bg-paper p-4">
              <Answer text={msg.text} onCite={(page) => onCite(page, msg.quotes)} />
              {msg.sources?.length > 0 && (
                <p className="mt-3 text-xs text-muted">
                  Sources: {msg.sources.map((n) => <PageLink key={n} page={n} onCite={(page) => onCite(page, msg.quotes)} />)}
                </p>
              )}
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" style={{ animationDelay: "300ms" }} />
            </span>
            Searching the paper
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(question); }}
        className="mt-4 flex gap-2 rounded-2xl border border-line p-1.5 focus-within:border-ink"
      >
        <label htmlFor="question" className="sr-only">Your question</label>
        <input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this paper"
          className="min-w-0 flex-1 bg-transparent px-3 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-ink transition hover:brightness-95 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </section>
  );
}
