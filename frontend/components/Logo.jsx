export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="" width="30" height="30" className="rounded-lg" />
      <span className="font-display text-xl font-bold tracking-tight">Inkfold</span>
    </span>
  );
}