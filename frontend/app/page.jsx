"use client";

import { useState } from "react";
import Logo from "../components/Logo";
import Upload from "../components/Upload";
import Workspace from "../components/Workspace";
import ThemeToggle from "../components/ThemeToggle";
import { AccountButton } from "../components/Account";
import StorageNotice from "../components/StorageNotice";
import { saveHistory } from "../lib/history";
import Footer from "../components/Footer";

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
    <div id="top" className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <a href="#demo" className="hidden rounded-xl px-3 py-2 text-muted transition hover:text-ink sm:block">See it work</a>
          <a href="#recent" className="hidden rounded-xl px-3 py-2 text-muted transition hover:text-ink sm:block">My papers</a>
          <ThemeToggle />
          <AccountButton />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-8">
        <Upload onUploaded={open} />
      </main>

      <Footer />

      <StorageNotice />
    </div>
  );
}
