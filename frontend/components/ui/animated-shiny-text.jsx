// A light shine that sweeps across the text (from Magic UI)
export function AnimatedShinyText({ children, className = "", shimmerWidth = 100, style, ...props }) {
    return (
        <span
            style={{ "--shiny-width": `${shimmerWidth}px`, ...style }}
            className={[
                "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
                // the shine: a bright band moving across the text
                "animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-position-[0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
                // the band's colour
                "bg-linear-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",
                className,
            ].join(" ")}
            {...props}
        >
            {children}
        </span>
    );
}