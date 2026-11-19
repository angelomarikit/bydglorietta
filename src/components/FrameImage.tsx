type FrameImageProps = {
  src: string;
  alt: string;
  ratio: string;
  className?: string;
  priority?: boolean;
};

export function FrameImage({ src, alt, ratio, className, priority = false }: FrameImageProps) {
  return (
    <figure className={className ? `frame ${className}` : "frame"} style={{ aspectRatio: ratio }}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}
