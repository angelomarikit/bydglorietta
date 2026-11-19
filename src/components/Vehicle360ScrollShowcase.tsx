import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export type Vehicle360Frame = {
  src: string;
  alt: string;
  label: string;
};

type Vehicle360ScrollShowcaseProps = {
  frames: readonly Vehicle360Frame[];
  eyebrow?: string;
  title?: string;
};

export function Vehicle360ScrollShowcase({
  frames,
  eyebrow = "Delan Black",
  title = "Sealion 6 DM-i",
}: Vehicle360ScrollShowcaseProps) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);

  useEffect(() => {
    for (const frame of frames) {
      const image = new Image();
      image.decoding = "async";
      image.src = frame.src;
    }
  }, [frames]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || frames.length === 0) return;

    let request = 0;

    const show = (index: number) => {
      imagesRef.current.forEach((image, imageIndex) => {
        if (!image) return;
        const active = imageIndex === index;
        image.style.opacity = active ? "1" : "0";
        image.setAttribute("aria-hidden", active ? "false" : "true");
      });
      if (labelRef.current) labelRef.current.textContent = frames[index]?.label ?? "";
    };

    const update = () => {
      request = 0;
      if (reduce) {
        show(0);
        return;
      }
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      const progress = distance <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / distance));
      const index = Math.min(frames.length - 1, Math.round(progress * (frames.length - 1)));
      show(index);
    };

    const onScroll = () => {
      if (request) return;
      request = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (request) cancelAnimationFrame(request);
    };
  }, [frames, reduce]);

  return (
    <section
      ref={sectionRef}
      className={reduce ? "relative bg-white" : "relative h-[320vh] bg-white"}
      aria-label="Sealion 6 DM-i, scroll to turn the car"
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-6 pb-28 pt-24">
        <p className="kicker">{eyebrow}</p>
        <h2 className="mx-auto mt-3 max-w-[12ch] text-center text-[clamp(40px,5vw,72px)]">{title}</h2>
        <div className="relative mt-10 w-full max-w-[1080px]" style={{ aspectRatio: "1080 / 553" }}>
          {frames.map((frame, index) => (
            <img
              key={frame.src}
              ref={(node) => {
                imagesRef.current[index] = node;
              }}
              src={frame.src}
              alt={frame.alt}
              width={1080}
              height={553}
              decoding="async"
              draggable={false}
              aria-hidden={index === 0 ? "false" : "true"}
              className="absolute inset-0 h-full w-full object-contain"
              style={{ opacity: index === 0 ? 1 : 0 }}
            />
          ))}
        </div>
        <p ref={labelRef} className="kicker mt-8" aria-live="polite">
          {frames[0]?.label}
        </p>
      </div>
    </section>
  );
}
