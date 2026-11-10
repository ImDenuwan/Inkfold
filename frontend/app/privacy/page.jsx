import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";

export const metadata = { title: "Privacy and terms · Inkfold" };

const LINKS = [
  ["summary", "In short"],
  ["privacy", "Privacy policy"],
  ["storage", "Browser storage"],
  ["ai", "How AI uses your paper"],
  ["terms", "Terms of use"],
];

const h2 = "font-display text-3xl font-bold tracking-tight";
const h3 = "mt-6 mb-1.5 text-lg font-semibold";

function Check({ warn }) {
  return warn ? (
    <svg className="mt-1 shrink-0 text-amber-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.01" /><circle cx="12" cy="12" r="9" /></svg>
  ) : (
    <svg className="mt-1 shrink-0 text-green-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <a href="/" aria-label="Inkfold home"><Logo /></a>
        <div className="flex items-center gap-2">
          <a href="/" className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium transition hover:border-ink">Back to Inkfold</a>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-wrap gap-12 px-4 pt-8 pb-20 leading-relaxed sm:px-8">
        <nav aria-label="On this page" className="min-w-0 flex-[1_1_180px]">
          <p className="mb-2 text-xs font-semibold tracking-wider text-muted">ON THIS PAGE</p>
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block py-2 text-[15px] text-muted hover:text-ink">{label}</a>
          ))}
        </nav>

        <article className="max-w-2xl min-w-0 flex-[999_1_520px]">
          <h1 className="font-display text-5xl font-bold tracking-tight">Privacy and terms</h1>
          <p className="mt-3 text-sm text-muted">Last updated 10 November 2026</p>

          <section id="summary" className="mt-8 scroll-mt-6 rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-bold">In short</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="flex gap-2.5 text-[15px]"><Check />No account needed. Sign-in is optional</p>
              <p className="flex gap-2.5 text-[15px]"><Check />No cookies, no ads, no tracking</p>
              <p className="flex gap-2.5 text-[15px]"><Check />Guest papers are deleted after 12 hours</p>
              <p className="flex gap-2.5 text-[15px]"><Check warn />Paper text is sent to an AI service to make summaries and answers</p>
            </div>
          </section>

          <section id="privacy" className="mt-12 scroll-mt-6">
            <h2 className={h2}>Privacy policy</h2>
            <h3 className={h3}>What is stored</h3>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>On the Inkfold server: the PDFs you upload, so you can reopen them, and their text split into passages for answering questions</li>
              <li>In your browser: your recent papers, their summaries and your chats</li>
              <li>If Supabase is turned on: the same history in a Supabase database, linked to your account or to a random guest id</li>
              <li>If you sign in: your email address, kept by Supabase Auth</li>
            </ul>
            <h3 className={h3}>How long it is kept</h3>
            <p className="text-muted">
              Guest papers are deleted after 12 hours: the PDF, its passages and its history. Papers you upload or open while signed in are
              kept until you remove them. Signing in also keeps the guest papers from this browser.
            </p>
            <h3 className={h3}>What is never done</h3>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>Selling or sharing your data with advertisers</li>
              <li>Tracking you across other websites</li>
              <li>Asking for your email, unless you choose to sign in</li>
            </ul>
          </section>

          <section id="storage" className="mt-12 scroll-mt-6">
            <h2 className={h2}>Browser storage</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
              {[
                ["inkfold-history", "Your recent papers and chats"],
                ["inkfold-guest", "A random id for this browser, instead of an account"],
                ["inkfold-theme", "Light or dark mode"],
                ["inkfold-notice", "Remembers that you closed the storage note"],
                ["sb-…-auth-token", "Keeps you signed in (only if you sign in)"],
              ].map(([name, purpose]) => (
                <div key={name} className="grid gap-1 border-b border-line px-5 py-3 last:border-0 sm:grid-cols-[180px_1fr]">
                  <code className="text-sm">{name}</code>
                  <span className="text-sm text-muted">{purpose}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[15px] text-muted">These live in your browser's local storage, not cookies. Clearing your browser data removes them.</p>
          </section>

          <section id="ai" className="mt-12 scroll-mt-6">
            <h2 className={h2}>How AI uses your paper</h2>
            <p className="mt-3 text-muted">
              To write summaries, answers and quiz questions, Inkfold sends parts of your paper's text to Google's Gemini API, which processes
              it under Google's own terms. On free plans, Google may use submitted content to improve its services, so don't upload confidential
              or unpublished work.
            </p>
            <p className="mt-4 rounded-xl bg-[#fff8db] px-4 py-3 text-[15px] text-[#4a3700]">
              AI can make mistakes. Every answer shows the pages it used, so check important points against the paper.
            </p>
          </section>

          <section id="terms" className="mt-12 scroll-mt-6">
            <h2 className={h2}>Terms of use</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
              <li>Inkfold is a study tool. Summaries and answers are AI-generated and may be incomplete or wrong.</li>
              <li>Only upload papers you have the right to use. You keep all rights to what you upload.</li>
              <li>Don't use Inkfold to break the law, attack the service, or upload harmful files.</li>
              <li>Using Inkfold to help you study is fine. Submitting its output as your own work may break your university's rules.</li>
              <li>Inkfold is provided as is, without guarantees.</li>
            </ol>
          </section>
        </article>
      </main>
    </div>
  );
}
