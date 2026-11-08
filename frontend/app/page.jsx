"use client";

import { useState } from "react";
import Upload from "../components/Upload";
import Summary from "../components/Summary";
import Chat from "../components/Chat";

export default function Home() {
  const [paper, setPaper] = useState(null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Inkfold</h1>
        {paper && (
          <button
            onClick={() => setPaper(null)}
            className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white"
          >
            New paper
          </button>
        )}
      </header>

      {paper ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Summary summary={paper.summary} />
          <Chat docId={paper.doc_id} />
        </div>
      ) : (
        <Upload onUploaded={setPaper} />
      )}
    </main>
  );
}
