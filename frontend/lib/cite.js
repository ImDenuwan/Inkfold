// "Ashish Vaswani" -> { last: "Vaswani", first: "Ashish" }
function splitName(name) {
  const parts = name.trim().split(/\s+/);
  return { last: parts.pop(), first: parts.join(" ") };
}

// APA 7: Vaswani, A., Shazeer, N., & Parmar, N. (2017). Title. Venue. https://doi.org/...
export function apa({ title, authors = [], year, venue, doi }) {
  const names = authors.map((a) => {
    const { last, first } = splitName(a);
    const initials = first.split(/[\s-]+/).filter(Boolean).map((n) => `${n[0]}.`).join(" ");
    return initials ? `${last}, ${initials}` : last;
  });
  const people = names.length > 1 ? `${names.slice(0, -1).join(", ")}, & ${names.at(-1)}` : names[0] || "";
  return [people && !people.endsWith(".") ? `${people}.` : people, `(${year || "n.d."}).`, `${title}.`, venue && `${venue}.`, doi && `https://doi.org/${doi}`]
    .filter(Boolean)
    .join(" ");
}

// @article{vaswani2017attention, ...}
export function bibtex({ title, authors = [], year, venue, doi }) {
  const first = authors[0] ? splitName(authors[0]).last.toLowerCase().replace(/[^a-z]/g, "") : "paper";
  const word = (title.toLowerCase().match(/[a-z]{4,}/) || ["paper"])[0];
  const fields = [
    ["title", title],
    ["author", authors.map((a) => { const { last, first } = splitName(a); return first ? `${last}, ${first}` : last; }).join(" and ")],
    ["journal", venue],
    ["year", year],
    ["doi", doi],
  ].filter(([, value]) => value);
  return `@article{${first}${year || ""}${word},\n${fields.map(([k, v]) => `  ${k} = {${v}}`).join(",\n")}\n}`;
}
