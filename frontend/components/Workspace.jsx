"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Summary, { Cite } from "./Summary";
import Chat from "./Chat";
import Quiz from "./Quiz";
import PdfViewer from "./PdfViewer";
import { API_URL } from "../lib/api";
import { loadHistory, saveHistory } from "../lib/history";
import { exportSummary } from "../lib/export";

const TABS = [
  ["summary", "Summary"],
  ["chat", "Chat"],
  ["quiz", "Quiz me"],
  ["cite", "Cite"],
];

const LANGUAGES = [
  ["", "Same as question"],
  ["English", "English"],
  ["Sinhala", "සිංහල"],
  ["Tamil", "தமிழ்"],
];

// true on wide screens, where the paper stays visible next to the panel
function useDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    setDesktop(media.matches);
    const update = () => setDesktop(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return desktop;
}

export default function Workspace({ paper, onHome, onOpen }) {
  const desktop = useDesktop();
  const [tab, setTab] = useState("summary");
  const [language, setLanguage] = useState("");
  const [showPaper, setShowPaper] = useState(false); // phones only
  const [cite, setCite] = useState({ page: 1, quotes: [] });
  const [recent, setRecent] = useState([]);

  // fresh state for each paper, and an up-to-date recent list
  useEffect(() => {
    setTab("summary");
    setCite({ page: 1, quotes: [] });
    setShowPaper(false);
    loadHistory().then(setRecent);
  }, [paper.doc_id]);

  // clicking a citation like "p. 4" shows the paper at that page
  function openPage(page, quotes = []) {
    setCite({ page, quotes });
    if (!desktop) {
      setShowPaper(true);
      setTimeout(() => document.getElementById("viewer")?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  const languageName = LANGUAGES.find(([value]) => value === language)?.[1];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* sidebar on desktop, a top bar on phones */}
      <aside className="flex items-center gap-2 border-b border-line px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:items-stretch lg:gap-6 lg:border-r lg:border-b-0 lg:p-5">
        <button onClick={onHome} aria-label="Inkfold home" className="mr-auto lg:mr-0">
          <Logo />
        </button>
        <button
          onClick={onHome}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition hover:brightness-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          New paper
        </button>

        <nav aria-label="Recent papers" className="hidden min-h-0 flex-1 overflow-y-auto lg:block">
          <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted">RECENT IN THIS BROWSER</h2>
          {recent.slice(0, 8).map((p) => (
            <button
              key={p.doc_id}
              onClick={() => onOpen(p)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                p.doc_id === paper.doc_id ? "bg-card font-medium shadow-sm" : "text-muted hover:bg-card hover:text-ink"
              }`}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.doc_id === paper.doc_id ? "bg-accent" : "bg-line"}`} />
              <span className="truncate">{p.summary?.title || p.filename}</span>
            </button>
          ))}
        </nav>

        <div className="hidden rounded-2xl border border-line bg-card p-4 lg:block">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            Guest mode
          </p>
          <p className="mt-1 text-xs text-muted">No account needed. Your papers are saved in this browser.</p>
          <a href="/privacy" className="mt-2 inline-block text-xs underline underline-offset-2">What we store</a>
        </div>
        <ThemeToggle />
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-10 sm:px-6">
        {/* top bar: file name, answer language, export */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <svg className="shrink-0 text-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
            <span className="truncate">{paper.filename}</span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="lang" className="text-muted">Answer in</label>
            <select
              id="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-10 rounded-xl border border-line bg-card px-3 transition hover:border-ink"
            >
              {LANGUAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button
              onClick={() => exportSummary(paper.filename, paper.summary)}
              aria-label="Export summary"
              className="flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-3 transition hover:border-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* the paper: always on the left on desktop, behind a button on phones */}
          {!desktop && (
            <button
              onClick={() => setShowPaper((s) => !s)}
              className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">PDF</span>
                <span className="text-sm font-medium">{showPaper ? "Hide paper" : "View paper"}</span>
              </span>
              <span className="text-muted">{showPaper ? "▲" : "▼"}</span>
            </button>
          )}
          {(desktop || showPaper) && (
            <PdfViewer
              file={paper.file}
              url={`${API_URL}/pdf/${paper.doc_id}`}
              page={cite.page}
              quotes={cite.quotes}
              onPage={(page) => setCite((c) => ({ ...c, page }))}
            />
          )}

          <section aria-label="Assistant" className="min-w-0">
            {/* tabs with a pill that slides to the active one */}
            <div role="tablist" aria-label="Views" className="relative mb-4 flex w-fit rounded-xl border border-line bg-card p-1 text-sm">
              <span
                className="absolute inset-y-1 left-1 w-[4.75rem] rounded-lg bg-ink transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${TABS.findIndex(([id]) => id === tab) * 100}%)` }}
              />
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`relative w-[4.75rem] rounded-lg py-1.5 font-medium transition-colors duration-300 ${
                    tab === id ? "text-paper" : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {language && tab === "chat" && (
              <p className="mb-3 rounded-xl bg-accent-soft px-4 py-2.5 text-sm">
                Answers will be written in {languageName}. Page citations stay the same.
              </p>
            )}

            {tab === "summary" && <Summary summary={paper.summary} />}
            {tab === "cite" && <Cite summary={paper.summary} />}
            {/* hidden, not removed, so the chat and quiz keep their state */}
            <div className={tab === "chat" ? "" : "hidden"}>
              <Chat
                key={paper.doc_id}
                docId={paper.doc_id}
                language={language}
                suggestions={paper.summary.suggested_questions || []}
                onCite={openPage}
                initialMessages={paper.messages}
                onChange={(messages) => saveHistory({ ...paper, messages })}
              />
            </div>
            <div className={tab === "quiz" ? "" : "hidden"}>
              <Quiz key={paper.doc_id} docId={paper.doc_id} onCite={openPage} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
