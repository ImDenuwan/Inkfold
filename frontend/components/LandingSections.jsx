// Everything on the home page below the upload box, from the Inkfold design

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
const loop = (name) => ({ animation: `${name} 10s linear infinite` });

const SUMMARY = [
  ["02", "Problem Statement", "RNNs read word by word, so training is slow.", "d2"],
  ["03", "Methodology", "Stacked self-attention in an encoder and decoder.", "d3"],
  ["04", "Key Results", "28.4 BLEU on English to German translation.", "d4"],
  ["05", "Conclusion", "Attention alone is enough for fast, strong translation.", "d5"],
];

const STEPS = [
  ["01", "Upload a paper", "Drop in one PDF. Inkfold checks it really is a research paper."],
  ["02", "Read the summary", "Title & Authors and Abstract, Problem Statement, Methodology, Key Results, Conclusion."],
  ["03", "Ask questions", "Chat in plain language. Answers come only from the paper, with page numbers."],
];

// A looping, fake preview of the app: reading -> summary -> question -> cited answer
function Demo() {
  return (
    <section
      id="demo"
      aria-label="Product demo"
      className="demo mt-20 w-full max-w-5xl scroll-mt-8 animate-rise rounded-[26px] bg-[#111110] p-2 text-left shadow-[0_50px_90px_-50px_rgba(17,17,16,0.55)] sm:p-3.5"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center gap-2 px-2 pt-1.5 pb-3">
        {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#3a3934]" />)}
        <span className="ml-2.5 min-w-0 flex-1 truncate text-xs text-[#a19e97]" style={mono}>Attention_Is_All_You_Need.pdf</span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#26251f] px-2.5 py-0.5 text-xs text-[#d9d5cd]">
          <span className="h-2 w-2 animate-blink rounded-full bg-accent" />
          Live demo
        </span>
      </div>

      <div className="flex min-h-[380px] flex-wrap overflow-hidden rounded-2xl bg-white text-[#111110]">
        <div className="relative min-w-0 flex-[999_1_420px] border-r border-[#f1eee8] p-5 sm:p-8">
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3.5" style={loop("d0")}>
            <span className="text-sm text-[#55534d]">Reading 15 pages…</span>
            <span className="h-1.5 w-56 overflow-hidden rounded bg-[#efebe3]">
              <span className="block h-full rounded bg-accent" style={loop("dbar")} />
            </span>
          </div>
          <div className="text-xs font-semibold tracking-wider text-[#8a3409]" style={loop("d1")}>SUMMARY</div>
          <div className="mt-2" style={loop("d1")}>
            <div className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">Attention is all you need</div>
            <div className="mt-1 text-sm text-[#6b6862]">Vaswani, Shazeer, Parmar and others, 2017</div>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {SUMMARY.map(([num, title, text, anim]) => (
              <div key={num} className="flex gap-3" style={loop(anim)}>
                <span className="pt-0.5 text-xs text-[#8a3409]" style={mono}>{num}</span>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-[15px] text-[#55534d]">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 bg-[#fbfaf7] p-5 sm:p-8">
          <div className="text-xs font-semibold tracking-wider text-[#8a3409]">ASK THE PAPER</div>
          <div className="self-end rounded-2xl rounded-br-sm bg-[#111110] px-3.5 py-2.5 text-[15px] text-white" style={loop("d6")}>
            Which datasets were used?
          </div>
          <div className="grid">
            <div className="col-start-1 row-start-1 flex items-center gap-2 text-sm text-[#55534d]" style={loop("d7")}>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#f7a06b]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffc9a6]" />
              </span>
              Searching 48 passages
            </div>
            <div className="col-start-1 row-start-1 rounded-2xl border border-[#efebe3] bg-white p-3.5 text-[15px]" style={loop("d8")}>
              WMT 2014 English to German and English to French{" "}
              <span className="rounded px-1.5 py-px text-xs text-[#5c4300]" style={{ ...mono, ...loop("dcite") }}>p. 7</span>
              <span aria-hidden="true" className="ml-1 inline-block h-[1em] w-0.5 bg-accent align-[-2px]" style={{ animation: "caret 1s steps(1) infinite" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingSections({ onUpload }) {
  return (
    <>
      <Demo />
      <p className="mt-3.5 text-center text-[13px] text-muted">Hover to pause. Upload to summary to cited answer, in about ten seconds.</p>

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
