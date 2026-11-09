"use client";

import { useState } from "react";
import { apa, bibtex } from "../lib/cite";

const SECTIONS = [
  { key: "problem_statement", label: "Problem Statement" },
  { key: "methodology", label: "Methodology" },
  { key: "key_results", label: "Key Results" },
  { key: "conclusion", label: "Conclusion" },
];

export default function Summary({ summary }) {
  const [copied, setCopied] = useState(false);
  const authors = Array.isArray(summary.authors) ? summary.authors.join(", ") : summary.authors;

  function copy() {
    const text = [
      summary.title,
      authors,
      `Abstract: ${summary.abstract}`,
      ...SECTIONS.map((s) => `${s.label}: ${summary[s.key]}`),
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="animate-rise rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">Summary</h2>
        <button onClick={copy} className="rounded-lg border border-line px-3 py-1.5 text-sm transition hover:bg-paper">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-5 flex gap-4 border-b border-line pb-6">
        <span className="pt-1 font-mono text-xs text-accent">01</span>
        <div>
          <h3 className="font-semibold">Title &amp; Authors and Abstract</h3>
          <p className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{summary.title}</p>
          <p className="mt-2 text-sm text-muted">{authors}</p>
          <p className="mt-4 leading-relaxed text-muted">{summary.abstract}</p>
        </div>
      </div>

      {SECTIONS.map((section, i) => (
        <div
          key={section.key}
          className="flex animate-rise gap-4 border-b border-line py-6 last:border-0 last:pb-0"
          style={{ animationDelay: `${(i + 1) * 90}ms` }}
        >
          <span className="pt-1 font-mono text-xs text-accent">0{i + 2}</span>
          <div>
            <h3 className="font-semibold">{section.label}</h3>
            <p className="mt-2 leading-relaxed text-muted">{summary[section.key]}</p>
          </div>
        </div>
      ))}

      <Cite summary={summary} />
    </section>
  );
}

// APA and BibTeX for the paper, with a copy button
function Cite({ summary }) {
  const [style, setStyle] = useState("APA");
  const [copied, setCopied] = useState(false);
  if (!summary.title) return null;
  const text = style === "APA" ? apa(summary) : bibtex(summary);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-2xl bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Cite this paper</h3>
        <div className="flex items-center gap-1 text-sm">
          {["APA", "BibTeX"].map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-lg px-3 py-1 transition ${style === s ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {s}
            </button>
          ))}
          <button onClick={copy} className="ml-1 rounded-lg border border-line bg-white px-3 py-1 transition hover:border-ink">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted">{text}</pre>
    </div>
  );
}
