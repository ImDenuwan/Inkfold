"use client";

import { useState } from "react";
import Logo from "../components/Logo";
import Upload from "../components/Upload";
import Summary from "../components/Summary";
import Chat from "../components/Chat";
import PdfViewer from "../components/PdfViewer";

export default function Home() {
  const [paper, setPaper] = useState(null);
  const [view, setView] = useState("summary");
  // which page the preview shows, and the sentences to highlight
  const [cite, setCite] = useState({ page: 1, quotes: [] });

  function reset() {
    setPaper(null);
    setView("summary");
    setCite({ page: 1, quotes: [] });
  }

  // clicking a citation like "p. 4" opens the paper at that page
  function openPage(page, quotes = []) {
    setCite({ page, quotes });
    setView("paper");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <button onClick={reset} aria-label="Inkfold home">
          <Logo />
        </button>
        {paper && (
          <button
            onClick={reset}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition hover:brightness-95"
          >
            New paper
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-8">
        {paper ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="truncate text-sm text-muted">{paper.filename}</p>
              <div className="flex shrink-0 rounded-xl border border-line bg-white p-1 text-sm">
                {["summary", "paper"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`rounded-lg px-4 py-1.5 font-medium capitalize transition ${view === v ? "bg-ink text-white" : "text-muted hover:text-ink"
                      }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              {view === "summary" ? <Summary summary={paper.summary} /> : (
                <PdfViewer
                  file={paper.file}
                  page={cite.page}
                  quotes={cite.quotes}
                  onPage={(page) => setCite((c) => ({ ...c, page }))}
                />
              )}
              <Chat docId={paper.doc_id} suggestions={paper.summary.suggested_questions || []} onCite={openPage} />
            </div>
          </>
        ) : (
          <Upload onUploaded={setPaper} />
        )}
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        Inkfold. No ads, no tracking.
      </footer>
    </div>
  );
}