import { useReducedMotion } from "motion/react";
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

function Stars({ value }: { value: number }) {
  return (
    <span className="rating-stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => (
        <Star key={index} id={`rating-star-${index}`} fill={value - index} />
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
  if (!agent) return null;
  const hasRating = agent.ratingValue !== null;
  const hasQuotes = agent.testimonials.length > 0;
  if (!hasRating && !hasQuotes) return null;

  const score = agent.ratingValue?.toFixed(1);
  const reviews = agent.ratingCount === null
    ? null
    : agent.ratingCount === 1
      ? "1 review"
      : `${agent.ratingCount.toLocaleString("en-PH")} reviews`;

  return (
    <section className="agent-story agent-reviews">
      {hasRating && (
        <div className="agent-rating">
          <p className="kicker">Customer rating</p>
          <p className="agent-score">
            <Stars value={agent.ratingValue ?? 0} />
            <span>{score}</span>
          </p>
          {reviews && <p className="muted">{reviews}</p>}
        </div>
      )}
      {hasQuotes && (
        <div className="agent-quotes">
          <p className="kicker">Customer testimonials</p>
          <div className="quote-grid">
            {agent.testimonials.map((item) => (
              <blockquote className="quote-card" key={`${item.name}-${item.quote}`}>
                {item.photoUrl && <img src={item.photoUrl} alt="" />}
                <p>{item.quote}</p>
                <footer>{item.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
