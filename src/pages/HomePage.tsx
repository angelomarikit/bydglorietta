import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { InquiryLink } from "../components/InquiryLink";
import { useAgent } from "../components/agent-context";
import { CountUp } from "../components/CountUp";
import { FrameImage } from "../components/FrameImage";
import { Reveal } from "../components/Reveal";
import { AgentDirectory } from "../components/AgentDirectory";
import { CabinMarquee } from "../components/CabinMarquee";
import { AgentReviews, AgentSales, AgentVideo } from "../components/AgentLanding";
import { ModelCollection } from "../components/ModelCollection";
import { Vehicle360ScrollShowcase } from "../components/Vehicle360ScrollShowcase";
import { cabinFrames, photos, posts, ratios, sealion360 } from "../data/content";
import { useWebsite } from "../components/website-context";
import { storedImage } from "../lib/website";

export function HomePage() {
  const { copy } = useWebsite();
  const home = copy.home;
  const agent = useAgent();
  return (
    <main>
      <section className="hero">
        <ManagedVideo
          className="hero-video"
          src="/assets/video/sealion-6-hero.mp4"
          poster={photos.hero}
          label="Sealion 6 DM-i"
        />
        <div className="hero-copy">
          <div>
            <p className="kicker">{home.heroKicker}</p>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {home.heroTitle}
            </motion.h1>
          </div>
          {agent ? (
            <InquiryLink className="btn gold" to="/order">
              {home.testDrive}
            </InquiryLink>
          ) : (
            <Link className="btn" to="/car-details">
              {home.heroButton}
            </Link>
          )}
        </div>
      </section>

      <section className="intro">
        <p className="watermark">GLORIETTA</p>
        <Reveal>
          <p className="statement">
            {home.statement}
          </p>
        </Reveal>
        <div className="stat-grid">
          <Reveal>
            <article className="card">
              <h3>
                <CountUp to={1200} /> km
              </h3>
              <p>{home.rangeText}</p>
            </article>
          </Reveal>
          <Reveal delay={0.15}>
            <article className="card">
              <h3>{home.dmiTitle}</h3>
              <p>{home.dmiText}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <AgentReviews />

      <AgentSales />

      <section className="experience">
        <Reveal>
          <h2>{home.experienceTitle}</h2>
        </Reveal>
        <div className="split">
          <Reveal y={0} x={60} delay={0.1}>
            <div className="frame side-video">
              <ManagedVideo
                src="/assets/video/sealion-6-side.mp4"
                label="Sealion 6 DM-i"
                lazy
              />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="fill">
            <div className="panel">
            <div>
              <p className="kicker">{home.nowAt}</p>
              <h3 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)", margin: "12px 0 16px" }}>
                {home.showroomName}
              </h3>
              <p>{home.priceLine}</p>
            </div>
            <InquiryLink className="btn gold" to="/order">
              {home.testDrive}
            </InquiryLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="film">
        <Reveal>
          <FrameImage
            src={storedImage(home.keyVisual, photos.kv)}
            alt="Sealion 6 DM-i key visual, with the campaign price and specification"
            ratio={ratios.kv}
            priority
          />
        </Reveal>
      </section>

      <AgentVideo />

      <Vehicle360ScrollShowcase
        frames={sealion360}
        eyebrow={home.showcaseEyebrow}
        title={home.showcaseTitle}
      />
      <CabinMarquee frames={cabinFrames} />

      <section className="tech">
        <Reveal>
          <h2>{home.techTitle}</h2>
          <p>{home.techBody}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <a className="sheet-link" href={storedImage(home.specSheet, photos.sheet)} target="_blank" rel="noreferrer">
            <FrameImage
              className="sheet-frame sharp"
              src={storedImage(home.specSheet, photos.sheet)}
              alt="Sealion 6 DM-i specification sheet. Dynamic from ₱1,548,000. Premium is DC-charging ready with DiPilot ADAS. Combined range 1,200 km, full-EV range 100 km, 18.3 kWh Blade Battery. Colours Arctic White, Harbour Grey, and Delan Black. As of 10 November 2026."
              ratio={ratios.sheet}
            />
          </a>
        </Reveal>
      </section>

      <ModelCollection testDriveLabel={home.testDrive} />

      {!agent && <AgentDirectory />}

      <section className="news">
        <Reveal>
          <h2>{home.newsTitle}</h2>
        </Reveal>
        <Reveal delay={0.1}>
        <div className="news-grid">
          {copy.notes.slice(0, 3).map((note) => {
            const post = posts.find((item) => item.slug === note.slug);
            if (!post) return null;
            return agent ? (
              <article key={note.slug} className="news-card">
                <FrameImage src={storedImage(note.image, post.image)} alt="" ratio={post.ratio} />
                <p className="kicker" style={{ marginTop: 16 }}>
                  {post.category}
                </p>
                <h3>{note.title}</h3>
                <p className="muted">{note.excerpt}</p>
              </article>
            ) : (
            <Link key={note.slug} to={`/blog/${note.slug}`} className="news-card">
              <FrameImage src={storedImage(note.image, post.image)} alt="" ratio={post.ratio} />
              <p className="kicker" style={{ marginTop: 16 }}>
                {post.category}
              </p>
              <h3>{note.title}</h3>
              <p className="muted">{note.excerpt}</p>
            </Link>
            );
          })}
        </div>
        </Reveal>
      </section>

      <section className="cta">
        <Reveal>
        <div className="cta-card">
          <h2>{home.ctaTitle}</h2>
          <InquiryLink className="btn" to="/order">
            {home.ctaButton}
          </InquiryLink>
        </div>
        </Reveal>
      </section>
    </main>
  );
}

function ManagedVideo({
  src,
  poster,
  label,
  className,
  lazy = false,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
  lazy?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={lazy ? undefined : src}
      poster={poster}
      muted
      loop
      playsInline
      preload={lazy ? "none" : "metadata"}
      disablePictureInPicture
      controls={false}
      aria-label={label}
    />
  );
}
