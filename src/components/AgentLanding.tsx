import { useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAgent } from "./agent-context";

const STAR = "M12 2.4 14.9 8.5l6.7.9-4.9 4.6 1.2 6.6L12 17.4 6.1 20.6l1.2-6.6L2.4 9.4l6.7-.9L12 2.4Z";

function Star({ fill, id }: { fill: number; id: string }) {
  const amount = Math.max(0, Math.min(1, fill));
  return (
    <svg className="rating-star" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * amount} height="24" />
        </clipPath>
      </defs>
      <path d={STAR} fill="#d7d7d2" />
      <path d={STAR} fill="#FAB868" clipPath={`url(#${id})`} />
    </svg>
  );
}

function Stars({ value, idPrefix }: { value: number; idPrefix: string }) {
  return (
    <span className="rating-stars" aria-label={`${value.toFixed(1)} stars`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star key={index} id={`review-star-${idPrefix}-${index}`} fill={value - index} />
      ))}
    </span>
  );
}

function useAgentStory() {
  const agent = useAgent();
  if (!agent) return null;
  return agent;
}

export function AgentSales() {
  const agent = useAgentStory();
  const reduce = useReducedMotion();
  const photos = agent?.salesPhotoUrls ?? [];
  if (!agent || photos.length === 0) return null;

  const single = photos.length === 1;
  const copies = reduce || single ? [0] : [0, 1];
  const seconds = Math.max(photos.length, 3) * 7;

  return (
    <section className={single ? "sales-gallery sales-single" : "sales-gallery"} aria-label="Proof of sales">
      <p className="kicker">Proof of sales</p>
      <div className={reduce || single ? "sales-viewport sales-static" : "sales-viewport"}>
        <div className="sales-track" style={reduce || single ? undefined : { animationDuration: `${seconds}s` }}>
          {copies.map((copy) => (
            <div className="sales-set" key={copy} aria-hidden={copy === 1}>
              {photos.map((src, index) => (
                <figure className="sales-card" key={`${copy}-${src}`}>
                  <img
                    src={src}
                    alt={copy === 1 ? "" : `${agent.fullName} sale ${index + 1}`}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AgentVideo() {
  const agent = useAgentStory();
  if (!agent?.videoUrl) return null;
  return (
    <section className="agent-story">
      <div className="agent-video-frame">
        <p className="kicker">Release</p>
        <video
          className="agent-video"
          src={agent.videoUrl}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    </section>
  );
}

export function AgentReviews() {
  const agent = useAgentStory();
  const items = agent?.testimonials ?? [];
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!agent || items.length === 0) return null;

  const stars = agent.ratingValue;
  const selected = open === null ? null : items[open];

  return (
    <section className="review-gallery" aria-label="Customer rating">
      <p className="kicker">Customer testimonials</p>
      <div className="review-viewport review-static">
        <div className="review-track">
          <div className="review-set">
            {items.map((item, index) => (
              <button
                className="review-card"
                type="button"
                key={`${item.name}-${index}`}
                onClick={() => setOpen(index)}
              >
                {stars !== null && <Stars value={stars} idPrefix={`${index}`} />}
                <figure>
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="review-fallback">{item.quote}</span>
                  )}
                </figure>
              </button>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className="review-modal" role="dialog" aria-modal="true" aria-label={`${selected.name} testimonial`} onClick={() => setOpen(null)}>
          <article className="review-modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" type="button" aria-label="Close" onClick={() => setOpen(null)}>
              <X />
            </button>
            {stars !== null && <Stars value={stars} idPrefix="modal" />}
            {selected.photoUrl && <img src={selected.photoUrl} alt="" />}
            <p>{selected.quote}</p>
            <footer>{selected.name}</footer>
          </article>
        </div>
      )}
    </section>
  );
}
