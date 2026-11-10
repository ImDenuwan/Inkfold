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

const btn = "h-8 min-w-8 rounded-lg border border-line px-2 transition hover:border-ink disabled:opacity-30";

// file: the uploaded File, or url: a saved PDF from the backend
export default function PdfViewer({ file, url, page, quotes, onPage }) {
  const [pdf, setPdf] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [marks, setMarks] = useState([]);
  const scrollRef = useRef(null);
  const canvasRef = useRef(null);
  const drag = useRef(null);

  // load the PDF (pdf.js only runs in the browser)
  useEffect(() => {
    let cancelled = false;
    let task;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const source = file ? { data: await file.arrayBuffer() } : { url };
      if (cancelled) return;
      task = pdfjs.getDocument(source);
      const doc = await task.promise;
      if (!cancelled) setPdf(doc);
    })().catch(() => {});

    // stop loading if the viewer closes early
    return () => {
      cancelled = true;
      task?.destroy().catch(() => {});
    };
  }, [file, url]);

  // draw the page, then find the quotes on it
  useEffect(() => {
    if (!pdf) return;
    let task;
    (async () => {
      const p = await pdf.getPage(page);
      // zoom 1 = page fits the box width
      const fit = (scrollRef.current.clientWidth - 32) / p.getViewport({ scale: 1 }).width;
      const viewport = p.getViewport({ scale: fit * zoom });
      const ratio = window.devicePixelRatio || 1;

      // draw at screen sharpness (retina phones need 2x pixels)
      const canvas = canvasRef.current;
      canvas.width = viewport.width * ratio;
      canvas.height = viewport.height * ratio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      task = p.render({ canvas, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await task.promise;

      const { items } = await p.getTextContent();
      const pageQuotes = quotes.filter((q) => q.page === page).map((q) => q.text);
      setMarks(findMarks(items, pageQuotes, viewport));
    })().catch(() => {});
    return () => task?.cancel();
  }, [pdf, page, zoom, quotes]);

  // new page: scroll inside the box to the highlight, or to the top
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [page]);
  useEffect(() => {
    if (marks.length) scrollRef.current?.scrollTo({ top: marks[0].top - 80, behavior: "smooth" });
  }, [marks]);

  // ctrl (or cmd) + mouse wheel zooms, like a normal PDF reader
  useEffect(() => {
    const box = scrollRef.current;
    function onWheel(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(3, Math.max(0.5, z + (e.deltaY < 0 ? 0.25 : -0.25))));
    }
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);

  // hand tool: hold the mouse and drag to move the page (touch scrolls by itself)
  function startDrag(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const box = scrollRef.current;
    drag.current = { x: e.clientX, y: e.clientY, left: box.scrollLeft, top: box.scrollTop };
    box.setPointerCapture(e.pointerId);
  }

  function moveDrag(e) {
    if (!drag.current) return;
    const box = scrollRef.current;
    box.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    box.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  }

  const total = pdf?.numPages || 1;

  return (
    <section
      id="viewer"
      className="flex h-[75vh] animate-rise scroll-mt-4 flex-col overflow-hidden rounded-3xl border border-line bg-card lg:sticky lg:top-4 lg:h-[calc(100vh-6.5rem)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-sm sm:px-5">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className={btn}>‹</button>
          <span className="px-1 tabular-nums text-muted">{page} / {total}</span>
          <button onClick={() => onPage(page + 1)} disabled={page >= total} aria-label="Next page" className={btn}>›</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom((z) => z - 0.25)} disabled={zoom <= 0.5} aria-label="Zoom out" className={btn}>−</button>
          <button onClick={() => setZoom(1)} className="w-14 tabular-nums text-muted hover:text-ink" title="Fit to width">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => setZoom((z) => z + 0.25)} disabled={zoom >= 3} aria-label="Zoom in" className={btn}>+</button>
        </div>
      </div>

      {/* the page scrolls inside this box, so the toolbar never moves */}
      <div
        ref={scrollRef}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        className="flex-1 cursor-grab select-none overflow-auto bg-paper p-4 active:cursor-grabbing"
      >
        <div className="relative mx-auto w-fit shadow-sm">
          <canvas ref={canvasRef} className="block bg-white" />
          {marks.map((m, i) => (
            <span
              key={i}
              className="absolute rounded-sm bg-yellow-300/50 mix-blend-multiply"
              style={{ left: m.left, top: m.top, width: m.width, height: m.height }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
