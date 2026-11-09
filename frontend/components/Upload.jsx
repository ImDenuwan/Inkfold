"use client";
import { ImageGenerationLoader } from "./ui/ImageGenerationLoader";
import { useEffect, useState } from "react";
import { uploadPaper } from "../lib/api";

const STEPS = [
  "Reading every page",
  "Checking it's a research paper",
  "Writing the five-part summary",
  "Preparing it for your questions",
];

const FEATURES = [
  { title: "Five-part summary", text: "Title and abstract, problem, method, results and conclusion." },
  { title: "Answers with pages", text: "Every answer shows the pages it came from." },
  { title: "Paper check", text: "Upload a CV or a bill by mistake? Inkfold tells you." },
];

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [rejected, setRejected] = useState(null);
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
      onUploaded(await uploadPaper(selected, force));
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
        <div className="relative mx-auto mb-10 aspect-[3/4] w-56 overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm">
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
        <p className="mt-3 text-muted">Usually under a minute.</p>

        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700"
            style={{ width: `${((step + 1) / STEPS.length) * 90}%` }}
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
            className="rounded-xl bg-ink px-6 py-3 font-medium text-white transition hover:bg-black"
          >
            Upload a different file
          </button>
          <button
            onClick={() => send(rejected, true)}
            className="rounded-xl border border-line bg-white px-6 py-3 font-medium transition hover:border-ink"
          >
            Continue anyway
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center pt-6 text-center sm:pt-12">
      <span className="animate-rise rounded-full border border-line bg-white px-4 py-1.5 text-sm text-muted">
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
        className={`mt-10 block w-full max-w-xl animate-rise cursor-pointer rounded-3xl border-2 border-dashed bg-white px-6 py-12 transition hover:-translate-y-1 hover:shadow-lg ${dragging ? "border-accent bg-accent-soft" : "border-line"
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
        <span className="mt-1 block text-sm text-muted">or click to choose. One PDF at a time, up to 25 MB.</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => { send(e.target.files[0]); e.target.value = ""; }}
          className="sr-only"
        />
      </label>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-16 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="animate-rise rounded-2xl border border-line bg-white p-5"
            style={{ animationDelay: `${320 + i * 80}ms` }}
          >
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );

  // The progress list. "failed" puts a red cross on the current step.
  function Steps({ current, failed = false }) {
    return (
      <ol className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0">
            {i < current ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white">✓</span>
            ) : i === current && failed ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white">✗</span>
            ) : i === current ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent">
                <span className="h-2 w-2 animate-blink rounded-full bg-accent" />
              </span>
            ) : (
              <span className="h-6 w-6 rounded-full border border-line" />
            )}
            <span className={i > current ? "text-muted" : i === current && failed ? "font-medium text-red-700" : "font-medium"}>
              {label}
            </span>
          </li>
        ))}
      </ol>
    );
  }
}
