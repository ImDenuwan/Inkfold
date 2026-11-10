"use client";

import { useEffect, useRef, useState } from "react";

// Everything on the home page below the upload box

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

const STEPS = [
  ["01", "Upload a paper", "Drop in one PDF. Inkfold checks it really is a research paper."],
  ["02", "Read the summary", "Title & Authors and Abstract, Problem Statement, Methodology, Key Results, Conclusion."],
  ["03", "Ask questions", "Chat in plain language. Answers come only from the paper, with page numbers."],
];

const YOUTUBE_ID = "cOjJavqO17c";
const CROP = 120;

function send(frame, func) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
}

function Demo() {
  const frame = useRef(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fallback, setFallback] = useState(false);


  useEffect(() => {
    function onMessage(e) {
      if (!String(e.origin).includes("youtube")) return;
      try {
        const state = JSON.parse(e.data)?.info?.playerState;
        if (state !== undefined) setPlaying(state === 1);
      } catch { }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setFallback((f) => f || !playing), 3000);
    return () => clearTimeout(timer);
  }, [started, playing]);

  function toggle() {
    if (!started) return setStarted(true);
    send(frame.current, playing ? "pauseVideo" : "playVideo");
  }

  return (
    <section
      id="demo"
      aria-label="Product demo"
      className="mt-12 w-full max-w-5xl min-w-0 scroll-mt-24 animate-rise overflow-hidden rounded-2xl bg-[#111110] p-1.5 shadow-[0_30px_60px_-35px_rgba(17,17,16,0.55)] sm:mt-20 sm:rounded-[26px] sm:p-3.5 sm:shadow-[0_50px_90px_-50px_rgba(17,17,16,0.55)]"
      style={{ animationDelay: "400ms" }}
    >
      <div className="hidden items-center gap-2 px-2 pt-1.5 pb-3 sm:flex">
        {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#3a3934]" />)}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl">
        {started && (
          <iframe
            ref={frame}
            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&controls=0&rel=0&playsinline=1&fs=0&disablekb=1&iv_load_policy=3&loop=1&playlist=${YOUTUBE_ID}&enablejsapi=1`}
            title="Inkfold demo video"
            allow="autoplay; encrypted-media"
            // ask YouTube to send us play/pause updates
            onLoad={() => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), "*")}
            className="absolute left-0 w-full"
            style={{ top: -CROP, height: `calc(100% + ${CROP * 2}px)` }}
          />
        )}

        {!fallback && (
          <button
            onClick={toggle}
            aria-label={playing ? "Pause the demo video" : "Play the demo video"}
            className="group absolute inset-0 z-10 h-full w-full"
          >
            {!started && <img src="/demo-poster.jpg" alt="" className="h-full w-full object-cover" />}
            {!playing && (
              <>
                <span className={`absolute inset-0 ${started ? "bg-black/45" : "bg-black/15 group-hover:bg-black/5"} transition`} />
                <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[#111110] shadow-xl transition group-hover:scale-110 sm:h-20 sm:w-20">
                  <svg className="ml-1 h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
                </span>
              </>
            )}
          </button>
        )}
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