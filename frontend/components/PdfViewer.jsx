"use client";

import { useEffect, useRef, useState } from "react";

// "Dot-product," -> "dotproduct", so PDF text and the quote compare fairly
const clean = (word) => word.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// Finds each quote on the page and returns yellow boxes to draw over it
function findMarks(items, quotes, viewport) {
    // every word on the page, remembering which line (text item) it came from
    const words = [];
    items.forEach((item, i) => item.str.split(/\s+/).forEach((w) => clean(w) && words.push({ w: clean(w), i })));

    const hit = new Set();
    for (const quote of quotes) {
        const want = quote.split(/\s+/).map(clean).filter(Boolean);
        // look for any 5 words of the quote in a row, so one odd word doesn't break the match
        search: for (let from = 0; from < want.length; from += 4) {
            const piece = want.slice(from, from + 5);
            for (let s = 0; s + piece.length <= words.length; s++) {
                if (piece.every((w, j) => words[s + j].w === w)) {
                    words.slice(Math.max(0, s - from), s - from + want.length).forEach((x) => hit.add(x.i));
                    break search;
                }
            }
        }
    }

    return [...hit].map((i) => {
        const item = items[i];
        const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        const h = item.height * viewport.scale;
        return { left: x, top: y - h, width: item.width * viewport.scale, height: h * 1.2 };
    });
}

export default function PdfViewer({ file, page, quotes, onPage }) {
    const [pdf, setPdf] = useState(null);
    const [marks, setMarks] = useState([]);
    const boxRef = useRef(null);
    const canvasRef = useRef(null);

    // load the PDF once (pdf.js only runs in the browser)
    useEffect(() => {
        let doc;
        (async () => {
            const pdfjs = await import("pdfjs-dist");
            pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
            doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
            setPdf(doc);
        })();
        return () => doc?.destroy();
    }, [file]);

    // draw the page, then find the quotes on it
    useEffect(() => {
        if (!pdf) return;
        let task;
        (async () => {
            const p = await pdf.getPage(page);
            const scale = boxRef.current.clientWidth / p.getViewport({ scale: 1 }).width;
            const viewport = p.getViewport({ scale });
            const ratio = window.devicePixelRatio || 1;

            // draw at screen sharpness (retina phones need 2x pixels)
            const canvas = canvasRef.current;
            canvas.width = viewport.width * ratio;
            canvas.height = viewport.height * ratio;
            canvas.style.height = `${viewport.height}px`;
            task = p.render({ canvas, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
            await task.promise;

            const { items } = await p.getTextContent();
            const pageQuotes = quotes.filter((q) => q.page === page).map((q) => q.text);
            setMarks(findMarks(items, pageQuotes, viewport));
        })().catch(() => { });
        return () => task?.cancel();
    }, [pdf, page, quotes]);

    // after the page is drawn, scroll to the highlight (or the top of the page)
    useEffect(() => {
        const target = boxRef.current?.querySelector("[data-mark]") || boxRef.current;
        target?.scrollIntoView({ behavior: "smooth", block: marks.length ? "center" : "start" });
    }, [marks]);

    const total = pdf?.numPages || 1;

    return (
        <section className="animate-rise overflow-hidden rounded-3xl border border-line bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 text-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPage(page - 1)}
                        disabled={page <= 1}
                        aria-label="Previous page"
                        className="h-8 w-8 rounded-lg border border-line transition hover:border-ink disabled:opacity-30"
                    >
                        ‹
                    </button>
                    <span className="tabular-nums text-muted">
                        Page {page} of {total}
                    </span>
                    <button
                        onClick={() => onPage(page + 1)}
                        disabled={page >= total}
                        aria-label="Next page"
                        className="h-8 w-8 rounded-lg border border-line transition hover:border-ink disabled:opacity-30"
                    >
                        ›
                    </button>
                </div>
                {marks.length > 0 && <span className="rounded bg-cite px-2 py-0.5 text-xs font-medium text-cite-ink">Highlighted</span>}
            </div>

            <div ref={boxRef} className="relative scroll-mt-6">
                <canvas ref={canvasRef} className="block w-full" />
                {marks.map((m, i) => (
                    <span
                        key={i}
                        data-mark
                        className="absolute rounded-sm bg-yellow-300/50 mix-blend-multiply"
                        style={{ left: m.left, top: m.top, width: m.width, height: m.height }}
                    />
                ))}
            </div>
        </section>
    );
}