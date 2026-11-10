"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../lib/useUser";
import { claimGuestPapers } from "../../lib/api";
import { guestId, readLocal } from "../../lib/history";

export default function Login() {
  const user = useUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "", "sending", "sent", or an error message
  const [guestPapers, setGuestPapers] = useState([]);
  const moved = useRef(false);

  useEffect(() => setGuestPapers(readLocal()), []);

  // once signed in (also after the email link brings you back): move guest papers, then go home
  useEffect(() => {
    // Supabase can report the same sign-in twice, so only do this once
    if (!user || moved.current) return;
    moved.current = true;
    claimGuestPapers(guestId(), readLocal().map((p) => p.doc_id))
      .catch(() => {})
      .finally(() => window.location.replace("/"));
  }, [user]);

  // where Supabase sends people back to after Google or the email link
  const back = () => `${window.location.origin}/login`;

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: back() } });
    if (error) setStatus(error.message);
  }

  async function sendLink(e) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: back() } });
    setStatus(error ? error.message : "sent");
  }

  return (
    <div className="flex min-h-screen flex-wrap">
      <section className="flex min-w-0 flex-[1_1_440px] flex-col p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <a href="/" aria-label="Inkfold home"><Logo /></a>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm animate-rise">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">Keep your papers on every device</h1>
            <p className="mt-3 text-muted">
              Guest papers are deleted after 12 hours. Sign in to keep your summaries and chats. Optional, always.
            </p>

            {!supabase ? (
              <p className="mt-8 rounded-2xl border border-line bg-card p-4 text-sm text-muted">
                Sign-in isn't set up on this server. You can keep using Inkfold as a guest.
              </p>
            ) : user ? (
              <p className="mt-8 text-muted">Signed in. Moving your papers…</p>
            ) : status === "sent" ? (
              <div className="mt-8 rounded-2xl border border-line bg-card p-5">
                <p className="font-semibold">Check your email</p>
                <p className="mt-1 text-sm text-muted">We sent a sign-in link to {email}. Open it on this device.</p>
              </div>
            ) : (
              <>
                <button
                  onClick={google}
                  className="mt-8 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[14px] border border-line bg-card font-medium transition hover:border-ink"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="my-6 flex items-center gap-3 text-[13px] text-muted">
                  <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
                </div>

                <form onSubmit={sendLink} className="flex flex-col gap-2.5">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="min-h-[50px] rounded-[14px] border border-line bg-card px-3.5 outline-none focus:border-ink"
                  />
                  <button
                    disabled={status === "sending"}
                    className="mt-1.5 min-h-[52px] rounded-[14px] bg-ink font-medium text-paper transition hover:opacity-90 disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Email me a sign-in link"}
                  </button>
                </form>
                <p className="mt-2.5 text-[13px] text-muted">No password needed. We'll send a link that signs you in.</p>
                {status && status !== "sending" && <p className="mt-3 text-sm text-red-700 dark:text-red-400">{status}</p>}
              </>
            )}

            <a href="/" className="mt-8 flex min-h-[44px] items-center justify-center gap-2 text-[15px] text-muted hover:text-ink">
              Continue as guest
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>

        <p className="text-[13px] text-muted">
          By signing in you agree to the <a href="/privacy#terms" className="underline">terms of use</a> and{" "}
          <a href="/privacy#privacy" className="underline">privacy policy</a>.
        </p>
      </section>

      {/* the dark panel: shows which guest papers will move to the account */}
      <aside className="relative m-2 flex min-w-0 flex-[1_1_420px] flex-col justify-center gap-7 overflow-hidden rounded-[28px] bg-[#111110] p-6 text-[#f4f2ee] sm:m-4 sm:p-12">
        <div aria-hidden="true" className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(242,106,27,0.35),rgba(242,106,27,0))]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#26251f] px-3 py-1.5 text-[13px] text-[#f7a06b]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" /></svg>
            Your guest work comes with you
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight">
            {guestPapers.length
              ? `${guestPapers.length} ${guestPapers.length === 1 ? "paper" : "papers"} from this browser will move to your account`
              : "Everything you upload after signing in is kept"}
          </h2>
        </div>

        {guestPapers.length > 0 && (
          <ul className="relative flex flex-col gap-2.5">
            {guestPapers.slice(0, 4).map((p, i) => {
              const asked = p.messages?.filter((m) => m.role === "user").length || 0;
              return (
                <li key={p.doc_id} className="flex items-center gap-3.5 rounded-2xl border border-[#33322c] bg-[#1d1c18] px-4 py-3.5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${i === 0 ? "bg-accent text-[#111110]" : "bg-[#33322c] text-[#f7a06b]"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.summary?.title || p.filename}</span>
                    <span className="text-[13px] text-[#a19e97]">Summary{asked ? `, ${asked} ${asked === 1 ? "question" : "questions"} asked` : " only"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <p className="relative text-sm text-[#b3afa7]">
          No ads, no tracking. Signing in only adds sync. <a href="/privacy#privacy" className="text-[#f7a06b]">What we store</a>
        </p>
      </aside>
    </div>
  );
}
