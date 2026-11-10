"use client";

import { supabase } from "../lib/supabase";
import { useUser } from "../lib/useUser";

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}

// Header version: "Sign in", or your initial and "Sign out"
export function AccountButton() {
  const user = useUser();
  if (!supabase) return null;
  if (!user) {
    return (
      <a href="/login" className="rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium transition hover:border-ink">
        Sign in
      </a>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span title={user.email} className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-semibold text-on-accent uppercase">
        {(user.email || "?")[0]}
      </span>
      <button onClick={signOut} className="rounded-xl px-3 py-2 text-sm text-muted transition hover:text-ink">
        Sign out
      </button>
    </div>
  );
}

// Sidebar card: guest mode with the 12-hour note, or who is signed in
export function AccountCard() {
  const user = useUser();
  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );

  if (user) {
    return (
      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">{icon}Signed in</p>
        <p className="mt-1 truncate text-xs text-muted" title={user.email}>{user.email}</p>
        <p className="mt-1 text-xs text-muted">Your papers are kept until you remove them.</p>
        <button onClick={signOut} className="mt-2 text-xs underline underline-offset-2">Sign out</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">{icon}Guest mode</p>
      <p className="mt-1 text-xs text-muted">No account needed. Guest papers are deleted after 12 hours.</p>
      {supabase ? (
        <a href="/login" className="mt-3 block rounded-lg bg-ink py-2 text-center text-xs font-medium text-paper transition hover:opacity-90">
          Sign in to keep them
        </a>
      ) : (
        <a href="/privacy" className="mt-2 inline-block text-xs underline underline-offset-2">What we store</a>
      )}
    </div>
  );
}
