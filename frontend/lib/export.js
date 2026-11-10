import { apa } from "./cite";

const SECTIONS = [
  ["Problem Statement", "problem_statement"],
  ["Methodology", "methodology"],
  ["Key Results", "key_results"],
  ["Conclusion", "conclusion"],
];

// Downloads the summary as a Markdown file, e.g. "attention.md"
export function exportSummary(filename, summary) {
  const authors = Array.isArray(summary.authors) ? summary.authors.join(", ") : summary.authors || "";
  const text = [
    `# ${summary.title || filename}`,
    authors && `*${authors}*`,
    `## Abstract\n\n${summary.abstract || ""}`,
    ...SECTIONS.map(([label, key]) => `## ${label}\n\n${summary[key] || ""}`),
    summary.title && `## Citation (APA)\n\n${apa(summary)}`,
    "---\nMade with Inkfold",
  ]
    .filter(Boolean)
    .join("\n\n");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  link.download = filename.replace(/\.pdf$/i, "") + "-summary.md";
  link.click();
  URL.revokeObjectURL(link.href);
}
