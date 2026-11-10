// Copy text. Plain http has no clipboard API, so fall back to the old way.
export function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const box = document.createElement("textarea");
  box.value = text;
  document.body.appendChild(box);
  box.select();
  document.execCommand("copy");
  box.remove();
}
