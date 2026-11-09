export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 4h14l7 7v17H6z" fill="#F26A1B" />
        <path d="M20 4v7h7z" fill="#FFC9A6" />
        <path d="M11 17h11M11 22h7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">Inkfold</span>
    </span>
  );
}
