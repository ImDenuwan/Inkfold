"use client";

import { useEffect, useState } from "react";
import { uploadPaper } from "../lib/api";
import { loadHistory, removeHistory } from "../lib/history";
import { useUser } from "../lib/useUser";
import { supabase } from "../lib/supabase";
import { ImageGenerationLoader } from "./ui/ImageGenerationLoader";
import LandingSections from "./LandingSections";

const STEPS = [
  "Reading every page",
  "Checking it's a research paper",
  "Writing the five-part summary",
  "Preparing it for your questions",
];

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [rejected, setRejected] = useState(null);
  const [recent, setRecent] = useState([]);
  const user = useUser();

  // papers this guest opened before
  useEffect(() => {
    loadHistory().then(setRecent);
  }, []);

  const asked = (p) => p.messages?.filter((m) => m.role === "user").length || 0;

  function forget(docId) {
    removeHistory(docId);
    setRecent((list) => list.filter((p) => p.doc_id !== docId));
  }
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    // move the steps along while we wait for the server
    const timers = [1500, 4000, 15000].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [file]);

  async function send(selected, force = false) {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    setError("");
    setRejected(null);
    setStep(0);
    setFile(selected);
    try {
      const data = await uploadPaper(selected, force);
      onUploaded({ ...data, file: selected });
    } catch (err) {
      if (err.notPaper) setRejected(selected);
      else setError(err.message);
    } finally {
      setFile(null);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    send(event.dataTransfer.files[0]);
  }

  if (file) {
    return (
      <section className="mx-auto max-w-xl animate-rise py-10">
        <div className="relative mx-auto mb-10 aspect-[3/4] w-56 overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-sm">
          <div className="h-3 w-3/4 rounded bg-line" />
          <div className="mt-2 h-2 w-1/2 rounded bg-line" />
          <div className="mt-6 space-y-2">
            {[100, 92, 96, 88, 94, 70, 98, 90, 84, 60].map((w, i) => (
              <div key={i} className="h-1.5 rounded bg-paper" style={{ width: `${w}%` }} />
            ))}
          </div>
          <p className="absolute right-0 bottom-3 left-0 truncate px-4 text-center text-xs text-muted">{file.name}</p>
          <ImageGenerationLoader
            effect="scale-wave"
            text="Reading"
            cellSize={3}
            gap={1}
            bandHeight={48}
            colors={["#F26A1B", "#B8430C"]}
          />
        </div>

        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Reading your paper</h2>
        <p className="mt-3 text-muted">Usually under a minute. You can start asking as soon as the summary is ready.</p>

        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${((step + 1) / STEPS.length) * 90}%`,
              // a light sweep moving across the bar while it works
              background: "linear-gradient(90deg, #F26A1B 0%, #F7A06B 50%, #F26A1B 100%)",
              backgroundSize: "200% 100%",
              animation: "sheen 2s linear infinite",
            }}
          />
        </div>

        <Steps current={step} />
      </section>
    );
  }

  if (rejected) {
    return (
      <section className="mx-auto max-w-xl animate-rise py-10">
        <h2 className="font-display text-4xl font-bold tracking-tight">This doesn't look like a research paper</h2>
        <p className="mt-3 text-muted">
          Inkfold works best with academic papers that have an abstract, methods and results. If we got it wrong, you can continue anyway.
        </p>

        <Steps current={1} failed />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setRejected(null)}
            className="rounded-xl bg-ink px-6 py-3 font-medium text-paper transition hover:opacity-90"
          >
            Upload a different file
          </button>
          <button
            onClick={() => send(rejected, true)}
            className="rounded-xl border border-line bg-card px-6 py-3 font-medium transition hover:border-ink"
          >
            Continue anyway
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center pt-6 text-center sm:pt-12">
      <span className="animate-rise rounded-full border border-line bg-card px-4 py-1.5 text-sm text-muted">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
        AI research assistant for papers
      </span>

      <h1
        className="mt-6 max-w-4xl animate-rise text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        style={{ animationDelay: "80ms" }}
      >
        Understand research papers{" "}
        <span className="relative whitespace-nowrap">
          in minutes
          <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M3 13 C 60 4, 140 4, 297 11" fill="none" stroke="#F26A1B" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </span>
        , not hours
      </h1>

      <p className="mt-6 max-w-xl animate-rise text-lg text-muted" style={{ animationDelay: "160ms" }}>
        Upload a research paper. Get a structured summary, then ask questions and see the exact pages behind every answer.
      </p>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-10 block w-full max-w-xl animate-rise cursor-pointer rounded-3xl border-2 border-dashed bg-card px-6 py-12 transition hover:-translate-y-1 hover:shadow-lg ${
          dragging ? "border-accent bg-accent-soft" : "border-line"
        }`}
        style={{ animationDelay: "240ms" }}
      >
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-paper">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M12 18v-6M9 15l3-3 3 3" stroke="#F26A1B" />
          </svg>
        </span>
        <span className="block font-display text-xl font-semibold">Drop your research paper here</span>
        <span className="mt-1 block text-sm text-muted">or click to choose. One PDF at a time, up to 25 MB. No sign-up needed.</span>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => { send(e.target.files[0]); e.target.value = ""; }}
          className="sr-only"
        />
      </label>

      {error && <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}
      <p className="mt-4 animate-rise text-sm text-muted" style={{ animationDelay: "320ms" }}>
        Not a paper? Inkfold checks first and tells you, so a CV or a bill won't get a fake summary.
      </p>

      {recent.length > 0 && (
        <div id="recent" className="mt-14 w-full max-w-5xl scroll-mt-8 text-left">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Pick up where you left off</h2>
              <p className="mt-1 text-sm text-muted">
                {user ? "Saved to your account." : `Guest papers are deleted after 12 hours.${supabase ? " Sign in to keep them." : ""}`}
              </p>
            </div>
          </div>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map((p, i) => (
              <li
                key={p.doc_id}
                className="group relative animate-rise"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <button
                  onClick={() => onUploaded(p)}
                  className="flex h-full w-full gap-4 rounded-2xl border border-line bg-card p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-lg"
                >
                  <PaperThumb />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 pr-6 font-semibold leading-snug">{p.summary?.title || p.filename}</span>
                    <span className="mt-1 truncate text-sm text-muted">{byline(p.summary?.authors)}</span>
                    <span className="mt-auto flex items-center gap-2 pt-3 text-xs text-muted">
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
                        {asked(p)} {asked(p) === 1 ? "question" : "questions"}
                      </span>
                      {timeAgo(p.updated_at)}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => forget(p.doc_id)}
                  aria-label="Remove from history"
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-paper hover:text-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* the bottom button opens the same file picker as the upload box */}
      <LandingSections onUpload={() => document.getElementById("pdf-input")?.click()} />
    </section>
  );
}

// The progress list. "failed" puts a red cross on the current step.
function Steps({ current, failed = false }) {
  return (
    <ol className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0">
          {i < current ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-paper">✓</span>
          ) : i === current && failed ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white">✗</span>
          ) : i === current ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent">
              <span className="h-2 w-2 animate-blink rounded-full bg-accent" />
            </span>
          ) : (
            <span className="h-6 w-6 rounded-full border border-line" />
          )}
          <span className={i > current ? "text-muted" : i === current && failed ? "font-medium text-red-700 dark:text-red-400" : "font-medium"}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

// A tiny paper page, used as the thumbnail in Recent papers
function PaperThumb() {
  return (
    <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-paper p-2 transition duration-300 group-hover:-rotate-3">
      <span className="absolute top-0 right-0 h-4 w-4 rounded-bl-md bg-accent" />
      <span className="mt-3 block h-1 w-4/5 rounded bg-line" />
      <span className="mt-1.5 block h-1 w-3/5 rounded bg-line" />
      <span className="mt-1.5 block h-1 w-4/5 rounded bg-line" />
      <span className="mt-1.5 block h-1 w-2/3 rounded bg-cite" />
      <span className="mt-1.5 block h-1 w-3/4 rounded bg-line" />
    </span>
  );
}

// "Ashish Vaswani, Noam Shazeer, ..." -> "Ashish Vaswani et al."
function byline(authors) {
  if (!Array.isArray(authors) || !authors.length) return "Unknown authors";
  return authors.length > 2 ? `${authors[0]} et al.` : authors.join(" and ");
}

// "just now", "5 min ago", "2 h ago", "3 days ago"
function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} h ago`;
  const days = Math.floor(mins / 1440);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
