import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

export type CabinFrame = {
  src: string;
  alt: string;
};

type CabinMarqueeProps = {
  frames: readonly CabinFrame[];
};

export function CabinMarquee({ frames }: CabinMarqueeProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const copies = reduce ? [0] : [0, 1];

  useEffect(() => {
    if (open === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((index) => (index === null ? index : (index + 1) % frames.length));
      if (event.key === "ArrowLeft") {
        setOpen((index) => (index === null ? index : (index - 1 + frames.length) % frames.length));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, frames.length]);

  const current = open === null ? null : frames[open];

  return (
    <section className={reduce ? "cabin cabin-static" : "cabin"} aria-label="Sealion 6 photographs">
      <div className="cabin-viewport">
        <div className="cabin-track">
          {copies.map((copy) => (
            <div className="cabin-set" key={copy} aria-hidden={copy === 1}>
              {frames.map((frame, index) => (
                <button
                  key={`${copy}-${frame.src}`}
                  type="button"
                  className="cabin-card"
                  tabIndex={copy === 1 ? -1 : 0}
                  onClick={() => setOpen(index)}
                >
                  <img src={frame.src} alt={copy === 1 ? "" : frame.alt} draggable={false} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {current && open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photograph gallery" onClick={() => setOpen(null)}>
          <button type="button" className="lightbox-close" aria-label="Close gallery" onClick={() => setOpen(null)}>
            <X />
          </button>
          <button
            type="button"
            className="lightbox-nav prev"
            aria-label="Previous photograph"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((open - 1 + frames.length) % frames.length);
            }}
          >
            <ChevronLeft />
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={current.src} alt={current.alt} />
            <figcaption>
              {open + 1} / {frames.length}
            </figcaption>
          </figure>
          <button
            type="button"
            className="lightbox-nav next"
            aria-label="Next photograph"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((open + 1) % frames.length);
            }}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </section>
  );
}
