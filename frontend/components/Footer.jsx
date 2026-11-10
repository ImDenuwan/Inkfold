import Logo from "./Logo";

const REPO = "https://github.com/ImDenuwan/Inkfold";

const COLUMNS = [
    ["Product", [["Upload a paper", "#top"], ["See it work", "#demo"], ["My papers", "#recent"], ["Sign in", "/login"]]],
    ["Legal", [["Privacy", "/privacy"], ["Terms", "/privacy#terms"], ["Browser storage", "/privacy#storage"]]],
    ["Built with", [["Next.js and Tailwind", null], ["Flask and ChromaDB", null], ["Google Gemini", null], ["Supabase", null]]],
];

export default function Footer() {
    return (
        <footer className="relative mt-24 overflow-hidden border-t border-line bg-card">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
                <div>
                    <Logo />
                    <p className="mt-4 max-w-xs text-[15px] text-muted">
                        A research assistant for PDFs. Clear summaries, answers with page citations, and quizzes in English, සිංහල and தமிழ்.
                    </p>
                    <a
                        href={REPO}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm font-medium transition hover:border-ink"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg>
                        Source code on GitHub
                    </a>
                </div>

                {COLUMNS.map(([title, links]) => (
                    <nav key={title} aria-label={title}>
                        <h2 className="text-xs font-semibold tracking-widest text-muted">{title.toUpperCase()}</h2>
                        <ul className="mt-4 space-y-2.5 text-[15px]">
                            {links.map(([label, href]) => (
                                <li key={label}>
                                    {href ? (
                                        <a href={href} className="transition hover:text-accent">{label}</a>
                                    ) : (
                                        <span className="text-muted">{label}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>

            <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-6 text-sm text-muted sm:px-8">
                <span>© 2026 Inkfold. Open source under the MIT License.</span>
                <span>No ads. No tracking.</span>
            </div>

            {/* big faded wordmark along the bottom edge */}
            <p
                aria-hidden="true"
                className="pointer-events-none -mb-[0.22em] select-none bg-gradient-to-b from-line to-transparent bg-clip-text text-center font-display text-[24vw] leading-none font-bold tracking-tighter text-transparent lg:text-[15rem]"
            >
                Inkfold
            </p>
        </footer>
    );
}