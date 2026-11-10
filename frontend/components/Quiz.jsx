"use client";

import { useState } from "react";
import { makeQuiz } from "../lib/api";

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz({ docId, onCite }) {
  const [questions, setQuestions] = useState(null);
  const [picked, setPicked] = useState({}); // question index -> chosen option
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    setPicked({});
    try {
      setQuestions((await makeQuiz(docId)).questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const answered = Object.keys(picked).length;
  const score = Object.entries(picked).filter(([i, o]) => questions[i].answer === o).length;

  return (
    <section className="animate-rise rounded-3xl border border-line bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">Quiz me</h2>
        {questions && (
          <span className="text-sm text-muted">
            {answered === questions.length ? `Score: ${score} / ${questions.length}` : `${answered} of ${questions.length} answered`}
          </span>
        )}
      </div>

      {!questions && (
        <div className="py-10 text-center">
          <p className="font-display text-2xl font-bold tracking-tight">Check what you understood</p>
          <p className="mt-2 text-muted">5 quick multiple-choice questions, written from this paper.</p>
          <button
            onClick={start}
            disabled={loading}
            className="mt-6 rounded-xl bg-ink px-6 py-3 font-medium text-paper transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Writing your quiz..." : "Start quiz"}
          </button>
          {error && <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}
        </div>
      )}

      {questions?.map((q, i) => {
        const choice = picked[i];
        const done = choice !== undefined;
        return (
          <div key={i} className="border-b border-line py-6 last:border-0 last:pb-0">
            <p className="font-semibold">
              <span className="mr-2 font-mono text-xs text-accent">0{i + 1}</span>
              {q.question}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((option, o) => {
                // after answering: correct option green, wrong pick red
                const look = !done
                  ? "border-line hover:border-ink"
                  : o === q.answer
                    ? "border-green-600 bg-green-50 dark:bg-green-950/40"
                    : o === choice
                      ? "border-red-600 bg-red-50 dark:bg-red-950/40"
                      : "border-line opacity-60";
                return (
                  <button
                    key={o}
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [i]: o }))}
                    className={`flex gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${look}`}
                  >
                    <span className="font-mono text-muted">{LETTERS[o]}</span>
                    {option}
                  </button>
                );
              })}
            </div>
            {done && (
              <p className="mt-3 text-sm text-muted">
                <span className={`font-semibold ${choice === q.answer ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {choice === q.answer ? "Correct. " : "Not quite. "}
                </span>
                {q.explanation}{" "}
                {q.page && (
                  <button onClick={() => onCite(q.page)} className="rounded bg-cite px-1.5 py-0.5 text-xs font-medium text-cite-ink">
                    p. {q.page}
                  </button>
                )}
              </p>
            )}
          </div>
        );
      })}

      {questions && answered === questions.length && (
        <button onClick={start} disabled={loading} className="mt-6 w-full rounded-xl border border-line py-3 font-medium transition hover:border-ink">
          {loading ? "Writing a new quiz..." : "New quiz"}
        </button>
      )}
    </section>
  );
}
