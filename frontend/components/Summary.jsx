const SECTIONS = [
  { key: "problem_statement", label: "Problem Statement" },
  { key: "methodology", label: "Methodology" },
  { key: "key_results", label: "Key Results" },
  { key: "conclusion", label: "Conclusion" },
];

export default function Summary({ summary }) {
  const authors = Array.isArray(summary.authors) ? summary.authors.join(", ") : summary.authors;

  return (
    <section className="rounded-3xl border border-line bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">Summary</h2>

      <div className="mt-4 border-b border-line pb-5">
        <h3 className="font-semibold">Title &amp; Authors and Abstract</h3>
        <p className="mt-2 text-xl font-bold">{summary.title}</p>
        <p className="text-sm text-muted">{authors}</p>
        <p className="mt-3 text-muted">{summary.abstract}</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.key} className="border-b border-line py-5 last:border-0">
          <h3 className="font-semibold">{section.label}</h3>
          <p className="mt-2 text-muted">{summary[section.key]}</p>
        </div>
      ))}
    </section>
  );
}
