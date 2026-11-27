import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { addAgentTestimonial, uploadSalesPhoto, type AgentTestimonial } from "../lib/agents";
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
  const [added, setAdded] = useState<AgentTestimonial[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [slide, setSlide] = useState(0);
  const pageKey = agent?.pageIdentifier;

  useEffect(() => {
    setAdded([]);
    setOpen(null);
    setWriting(false);
    setSlide(0);
    setPhoto(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }, [pageKey]);

  function choosePhoto(file: File | null) {
    setError("");
    setPhoto(file);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  useEffect(() => {
    if (open === null && !writing) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || saving) return;
      setOpen(null);
      setWriting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, writing, saving]);

  if (!agent) return null;

  const items = [...agent.testimonials, ...added].slice(0, 10);
  const stars = agent.ratingValue;
  const index = items.length === 0 ? 0 : slide % items.length;
  const current = items[index];
  const selected = open === null ? null : items[open];

  async function submitFeedback(event: FormEvent) {
    event.preventDefault();
    const customer = name.trim();
    const words = quote.trim();
    if (customer.length < 2 || customer.length > 80) {
      setError("Enter your name.");
      return;
    }
    if (words.length < 8 || words.length > 400) {
      setError("Write between 8 and 400 characters.");
      return;
    }
    setSaving(true);
    setError("");
    let photoPath: string | null = null;
    try {
      if (!pageKey) return;
      if (photo) {
        photoPath = await uploadSalesPhoto(photo, "Use a JPG, PNG, or WebP photo under 2 MB. 800 × 800 pixels keeps every review photo the same size.");
      }
      await addAgentTestimonial(pageKey, customer, words, photoPath);
      setAdded((current) => [...current, { name: customer, quote: words, photoPath, photoUrl: preview }]);
      setName("");
      setQuote("");
      setPhoto(null);
      setPreview(null);
      setWriting(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The feedback could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="review-gallery" aria-label="Customer rating">
      <div className="review-heading">
        <h2>Customer testimonials</h2>
        <button className="btn gold review-feedback" type="button" onClick={() => { setError(""); setWriting(true); }}>
          Leave feedback
          <span aria-hidden="true">→</span>
        </button>
      </div>
      {current && (
        <div className="review-slider">
          <button
            className="review-arrow"
            type="button"
            aria-label="Previous testimonial"
            disabled={items.length < 2}
            onClick={() => setSlide((value) => (value - 1 + items.length) % items.length)}
          >
            <ChevronLeft />
          </button>
          <button
            className="review-card"
            type="button"
            onClick={() => setOpen(index)}
          >
            {stars !== null && <Stars value={stars} idPrefix={`${index}`} />}
            {current.photoUrl && (
              <figure>
                <img src={current.photoUrl} alt="" loading="lazy" decoding="async" />
              </figure>
            )}
            <p>{current.quote}</p>
            <footer>{current.name}</footer>
          </button>
          <button
            className="review-arrow"
            type="button"
            aria-label="Next testimonial"
            disabled={items.length < 2}
            onClick={() => setSlide((value) => (value + 1) % items.length)}
          >
            <ChevronRight />
          </button>
        </div>
      )}
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
      {writing && (
        <div className="review-modal" role="dialog" aria-modal="true" aria-label="Leave feedback" onClick={() => { if (!saving) setWriting(false); }}>
          <article className="review-modal-card feedback-card" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" type="button" aria-label="Close" disabled={saving} onClick={() => setWriting(false)}>
              <X />
            </button>
            <p className="kicker">Share your experience</p>
            <h3>Leave feedback</h3>
            <p className="feedback-lead">Your name and words are saved on this agent’s page.</p>
            <form className="form" onSubmit={submitFeedback}>
              <label className="feedback-photo">
                {preview ? <img src={preview} alt="" /> : (
                  <span>
                    <ImagePlus />
                    <strong>Add a photo</strong>
                    <small>Optional · 800 × 800 · JPG, PNG, or WebP · under 2 MB</small>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
                />
              </label>
              {preview && (
                <button className="feedback-clear" type="button" onClick={() => choosePhoto(null)}>
                  Remove photo
                </button>
              )}
              <label>
                Your name
                <input value={name} maxLength={80} placeholder="Javier Martín Gil" onChange={(event) => setName(event.target.value)} />
              </label>
              <label>
                Your feedback
                <textarea value={quote} maxLength={400} placeholder="Tell us about the cars and the person who helped you." onChange={(event) => setQuote(event.target.value)} />
              </label>
              <span className="feedback-count">{quote.trim().length}/400</span>
              {error && <span className="form-error">{error}</span>}
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Saving" : "Save feedback"}
              </button>
            </form>
          </article>
        </div>
      )}
    </section>
  );
}
