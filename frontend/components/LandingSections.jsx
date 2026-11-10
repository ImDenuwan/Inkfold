"use client";

import { useRef, useState } from "react";

// Everything on the home page below the upload box

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

const STEPS = [
  ["01", "Upload a paper", "Drop in one PDF. Inkfold checks it really is a research paper."],
  ["02", "Read the summary", "Title & Authors and Abstract, Problem Statement, Methodology, Key Results, Conclusion."],
  ["03", "Ask questions", "Chat in plain language. Answers come only from the paper, with page numbers."],
];

function Demo() {
  return (
    <section
      id="demo"
      aria-label="Product demo"
      className="mt-20 w-full max-w-5xl scroll-mt-24 animate-rise rounded-[26px] bg-[#111110] p-2 text-left shadow-[0_50px_90px_-50px_rgba(17,17,16,0.55)] sm:p-3.5"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center gap-2 px-2 pt-1.5 pb-3">
        {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#3a3934]" />)}
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-black">
        <iframe
          src="https://drive.google.com/file/d/1NS4pUn7bZhbmvNXr-q6BBFwjP0dMjLLg/preview"
          title="Inkfold demo video"
          allow="autoplay; fullscreen"
          allowFullScreen
          loading="lazy"
          className="block aspect-video w-full"
        />
      </div>
    </section>
  );
}

export default function LandingSections({ onUpload }) {
  return (
    <>
      <Demo />
      <p className="mt-3.5 text-center text-[13px] text-muted">Upload a paper, read the summary, ask a question and check the highlighted answer.</p>

      <section className="mt-24 w-full max-w-5xl">
        <h2 className="text-center font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Three steps. <span className="text-muted">No setup.</span>
        </h2>
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {STEPS.map(([num, title, text]) => (
            <div key={num} className="lift rounded-[22px] border border-line bg-card p-6">
              <div className="font-display text-[44px] font-bold leading-none tracking-tighter">{num}</div>
              <h3 className="mt-4 mb-1.5 text-lg font-semibold">{title}</h3>
              <p className="text-[15px] text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Extras" className="mt-4 grid w-full max-w-5xl gap-4 text-left md:grid-cols-3">
        <div className="lift flex flex-col gap-4 rounded-[22px] bg-[#fff8db] p-7">
          <div className="flex flex-wrap gap-2">
            {["p. 2", "p. 6", "p. 7"].map((p) => (
              <span key={p} className="rounded-md bg-[#fdf0a6] px-2.5 py-1 text-xs text-[#5c4300]" style={mono}>{p}</span>
            ))}
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-[#3d2e00]">Answers you can check</h3>
          <p className="text-[15px] text-[#5c4300]">Every answer shows the pages it came from, and highlights the exact sentence in the paper.</p>
        </div>
        <div className="lift flex flex-col gap-4 rounded-[22px] border border-line bg-[#111110] p-7 text-[#f4f2ee]">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#26251f] text-xs">A</span>
              Attention layers
            </div>
            <div className="flex items-center gap-2.5 text-[#f7a06b]">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-accent text-[#111110]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
              </span>
              Recurrence and convolution
            </div>
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight">Quiz yourself</h3>
          <p className="text-[15px] text-[#b3afa7]">Five quick questions from the paper, each with the page that explains the answer.</p>
        </div>
        <div className="lift flex flex-col gap-4 rounded-[22px] border border-line bg-card p-7">
          <div className="rounded-[10px] bg-paper px-3 py-2.5 text-xs leading-relaxed text-muted" style={mono}>
            Vaswani, A., et al. (2017). Attention is all you need. NeurIPS.
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight">Cite in one click</h3>
          <p className="text-[15px] text-muted">Copy the reference in APA or BibTeX. Answers also in සිංහල and தமிழ்.</p>
        </div>
      </section>

      <section className="mt-24 flex flex-col items-center gap-5 text-center">
        <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Your next paper is waiting.</h2>
        <button
          onClick={onUpload}
          className="min-h-[52px] rounded-[14px] bg-accent px-7 font-semibold text-on-accent transition hover:brightness-95"
        >
          Upload a paper
        </button>
      </section>
    </>
  );
}