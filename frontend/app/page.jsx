"use client";

import { useState } from "react";
import Logo from "../components/Logo";
import Upload from "../components/Upload";
import Summary from "../components/Summary";
import Chat from "../components/Chat";

export default function Home() {
  const [paper, setPaper] = useState(null);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <button onClick={() => setPaper(null)} aria-label="Inkfold home">
          <Logo />
        </button>
        {paper && (
          <button
            onClick={() => setPaper(null)}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition hover:brightness-95"
          >
            New paper
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-8">
        {paper ? (
          <>
            <p className="mb-5 truncate text-sm text-muted">{paper.filename}</p>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <Summary summary={paper.summary} />
              <Chat docId={paper.doc_id} suggestions={paper.summary.suggested_questions || []} />
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
