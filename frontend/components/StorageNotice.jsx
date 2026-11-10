"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// A one-time note that papers are saved in this browser
export default function StorageNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(!localStorage.getItem("inkfold-notice"));
    } catch {}
  }, []);

  function close() {
    setShow(false);
    try {
      localStorage.setItem("inkfold-notice", "ok");
    } catch {}
  }

  if (!show) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-20 animate-rise rounded-2xl border border-line bg-card p-4 shadow-lg sm:left-auto sm:max-w-sm">
      <p className="text-sm text-muted">
        Inkfold saves your recent papers and chats in this browser. Guest papers are deleted after 12 hours
        {supabase ? ", or sign in to keep them" : ""}. No ads, no tracking cookies.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={close} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">
          Got it
        </button>
        <a href="/privacy#storage" className="text-sm text-muted underline underline-offset-2 hover:text-ink">Learn more</a>
      </div>
    </div>
  );
}
