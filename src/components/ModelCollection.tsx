import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { InquiryLink } from "./InquiryLink";
import { useAgent, useContactModal } from "./agent-context";
import { Reveal } from "./Reveal";
import { lineup, lineupPrice, type LineupModel, type LineupVariant } from "../data/lineup";

type ModelCollectionProps = {
  testDriveLabel: string;
};

function sameDetails(variants: LineupVariant[]) {
  const first = variants[0];
  return variants.every(
    (variant) =>
      variant.body === first.body &&
      variant.range === first.range &&
      variant.battery === first.battery &&
      variant.charging.join("|") === first.charging.join("|") &&
      variant.colours.join("|") === first.colours.join("|"),
  );
}

export function ModelCollection({ testDriveLabel }: ModelCollectionProps) {
  const [selected, setSelected] = useState<LineupModel | null>(null);

  return (
    <section className="range" aria-labelledby="range-title">
      <Reveal>
        <h2 id="range-title">The range</h2>
        <p className="range-note">
          Suggested retail prices as of 27 May 2026. Sealion 6 DM-i follows the 12 November 2026 list. Prices can
          change, and they can vary by dealer.
        </p>
      </Reveal>
      <div className="range-grid">
        {lineup.map((model) => (
          <button key={model.id} type="button" className="range-card" onClick={() => setSelected(model)}>
            <span className="range-photo">
              <img src={model.image} alt="" loading="lazy" decoding="async" />
            </span>
            <span className="range-copy">
              <strong>{model.name}</strong>
              <span>{lineupPrice(model)}</span>
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <ModelWindow model={selected} testDriveLabel={testDriveLabel} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function DetailList({ variant }: { variant: LineupVariant }) {
  return (
    <dl className="range-specs">
      <div>
        <dt>Body</dt>
        <dd>{variant.body}</dd>
      </div>
      <div>
        <dt>Range</dt>
        <dd>{variant.range}</dd>
      </div>
      <div>
        <dt>Battery</dt>
        <dd>{variant.battery}</dd>
      </div>
      <div>
        <dt>Charging</dt>
        <dd>{variant.charging.join(". ")}</dd>
      </div>
      <div>
        <dt>Colours</dt>
        <dd>{variant.colours.join(", ")}</dd>
      </div>
    </dl>
  );
}

function ModelWindow({
  model,
  testDriveLabel,
  onClose,
}: {
  model: LineupModel;
  testDriveLabel: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const agent = useAgent();
  const contact = useContactModal();
  const shared = sameDetails(model.variants);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previously = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>("button, a[href]")];
    focusable()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previously?.focus();
    };
  }, [onClose]);

  return (
    <div className="range-modal" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="range-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="range-model-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
          <X />
        </button>
        <div className="range-modal-photo">
          <img src={model.image} alt="" />
        </div>
        <div className="range-modal-body">
          <p className="kicker">BYD Glorietta</p>
          <h2 id="range-model-title">{model.name}</h2>
          {shared ? (
            <>
              <ul className="range-prices">
                {model.variants.map((variant) => (
                  <li key={variant.name}>
                    <span>{model.variants.length === 1 ? "Price" : variant.name}</span>
                    <strong>{variant.price}</strong>
                  </li>
                ))}
              </ul>
              <DetailList variant={model.variants[0]} />
            </>
          ) : (
            model.variants.map((variant) => (
              <article key={variant.name} className="range-variant">
                <header>
                  <h3>{variant.name}</h3>
                  <strong>{variant.price}</strong>
                </header>
                <DetailList variant={variant} />
              </article>
            ))
          )}
          <div className="range-modal-actions">
            {agent ? (
              <button
                type="button"
                className="btn gold"
                onClick={() => {
                  onClose();
                  contact.open();
                }}
              >
                {testDriveLabel}
              </button>
            ) : (
              <Link className="btn gold" to="/order">
                {testDriveLabel}
              </Link>
            )}
            {model.detailsHref && !agent && (
              <Link className="btn quiet" to={model.detailsHref}>
                See the car
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
