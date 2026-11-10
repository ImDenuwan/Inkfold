"use client";

import { useState } from "react";
import Logo from "../components/Logo";
import Upload from "../components/Upload";
import Workspace from "../components/Workspace";
import ThemeToggle from "../components/ThemeToggle";
import StorageNotice from "../components/StorageNotice";
import { saveHistory } from "../lib/history";

export default function Home() {
  const [paper, setPaper] = useState(null);

  // a new upload, or a paper reopened from history
  function open(next) {
    setPaper(next);
    if (next.file) saveHistory(next);
    window.scrollTo({ top: 0 });
  }

  if (paper) {
    return (
      <>
        <Workspace paper={paper} onHome={() => setPaper(null)} onOpen={open} />
        <StorageNotice />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <a href="#demo" className="hidden rounded-xl px-3 py-2 text-muted transition hover:text-ink sm:block">See it work</a>
          <a href="#recent" className="hidden rounded-xl px-3 py-2 text-muted transition hover:text-ink sm:block">My papers</a>
          <ThemeToggle />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-8">
        <Upload onUploaded={open} />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:px-8">
          <span>Inkfold. No ads, no tracking.</span>
          <nav aria-label="Legal" className="flex gap-4">
            <a href="/privacy" className="hover:text-ink">Privacy</a>
            <a href="/privacy#terms" className="hover:text-ink">Terms</a>
          </nav>
        </div>
      </footer>

      <StorageNotice />
    </div>
  );
}
