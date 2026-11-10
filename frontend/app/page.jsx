"use client";

import { useState } from "react";
import Logo from "../components/Logo";
import Upload from "../components/Upload";
import Summary from "../components/Summary";
import Chat from "../components/Chat";
import PdfViewer from "../components/PdfViewer";
import Quiz from "../components/Quiz";
import { API_URL } from "../lib/api";
import { saveHistory } from "../lib/history";

export default function Home() {
  const [paper, setPaper] = useState(null);
  const [view, setView] = useState("summary");
  const [cite, setCite] = useState({ page: 1, quotes: [] });

  function open(next) {
    setPaper(next);
    setView("summary");
    setCite({ page: 1, quotes: [] });
    if (next.file) saveHistory(next);
  }

  function reset() {
    setPaper(null);
    setView("summary");
    setCite({ page: 1, quotes: [] });
  }

  function openPage(page, quotes = []) {
    setCite({ page, quotes });
    setView("paper");
    if (window.innerWidth < 1024) setTimeout(() => document.getElementById("viewer")?.scrollIntoView({ behavior: "smooth" }), 50);
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
                {["summary", "paper", "quiz"].map((v) => (
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
              {view === "summary" && <Summary summary={paper.summary} />}
              {view === "paper" && (
                <PdfViewer
                  file={paper.file}
                  url={`${API_URL}/pdf/${paper.doc_id}`}
                  page={cite.page}
                  quotes={cite.quotes}
                  onPage={(page) => setCite((c) => ({ ...c, page }))}
                />
              )}
              {/* hidden, not removed, so answers stay when switching tabs */}
              <div className={view === "quiz" ? "" : "hidden"}>
                <Quiz key={paper.doc_id} docId={paper.doc_id} onCite={openPage} />
              </div>
              <Chat
                key={paper.doc_id}
                docId={paper.doc_id}
                suggestions={paper.summary.suggested_questions || []}
                onCite={openPage}
                initialMessages={paper.messages}
                onChange={(messages) => saveHistory({ ...paper, messages })}
              />
            </div>
          </>
        ) : (
          <Upload onUploaded={open} />
        )}
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        Inkfold. No ads, no tracking.
      </footer>
    </div>
  );
}
