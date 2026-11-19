import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { contactOptions, type PublicAgent } from "../lib/agents";

type AgentContactModalProps = {
  agent: PublicAgent;
  onClose: () => void;
};

export function AgentContactModal({ agent, onClose }: AgentContactModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const options = contactOptions(agent);

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
    <div className="agent-modal" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="agent-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-contact-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
          <X />
        </button>
        {agent.photoUrl && <img className="agent-photo" src={agent.photoUrl} alt="" />}
        <p className="kicker">BYD Glorietta</p>
        <h2 id="agent-contact-title">{agent.fullName}</h2>
        <div className="agent-options">
          {options.map((option) => (
            <a
              key={option.label}
              className={option.label === "Call" ? "btn gold" : "btn"}
              href={option.href}
              {...(option.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {option.label}
              {option.label === "Call" ? ` ${agent.contactNumber}` : ""}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
