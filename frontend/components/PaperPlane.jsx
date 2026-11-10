"use client";

// Flight path inside a 320 x 300 box above the Ask button:
// sweep left, one wide loop, then climb away to the top right.
const PATH =
  "M285 285 C225 282 120 272 80 222 C40 172 62 100 124 96 C188 92 196 178 136 182 C82 186 96 96 170 62 C215 42 262 30 312 8";

export default function PaperPlane({ onDone }) {
  return (
    <div aria-hidden="true" className="plane-flight pointer-events-none absolute right-4 bottom-16 z-10 h-[300px] w-[320px]">
      <svg className="absolute inset-0" width="320" height="300" viewBox="0 0 320 300" fill="none">
        <path
          d={PATH}
          pathLength="1"
          stroke="#F26A1B"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1"
          className="animate-trail"
        />
      </svg>

      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        className="absolute top-0 left-0 animate-fly drop-shadow-[0_3px_4px_rgba(17,17,16,0.25)]"
        style={{ offsetPath: `path("${PATH}")`, offsetRotate: "auto", offsetAnchor: "center" }}
        onAnimationEnd={onDone}
      >
        <path d="M2 4 L30 16 L2 28 L9 16 Z" fill="#FFFFFF" stroke="#8A8780" strokeWidth="1" strokeLinejoin="round" />
        <path d="M9 16 L30 16 L2 28 Z" fill="#FFE2CF" stroke="#8A8780" strokeWidth="1" strokeLinejoin="round" />
        <path d="M9 16 L30 16" stroke="#F26A1B" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
