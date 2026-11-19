import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { contactOptions, type PublicAgent } from "../lib/agents";

function givenName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const given = parts.find((part) => part.replace(/\./g, "").length > 2) ?? parts[0] ?? "";
  const word = given.replace(/\./g, "");
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : fullName;
}

type AgentContactModalProps = {
  agent: PublicAgent;
  onClose: () => void;
};

export function AgentContactModal({ agent, onClose }: AgentContactModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [emailShown, setEmailShown] = useState(false);
  const options = contactOptions(agent);
  const firstName = givenName(agent.fullName);
  const initials = agent.fullName
    .split(/\s+/)
    .filter((part) => /[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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
        <div className="agent-portrait">
          {agent.photoUrl ? (
            <img src={agent.photoUrl} alt="" />
          ) : (
            <div className="agent-portrait-fallback" aria-hidden="true">
              {initials || "BYD"}
            </div>
          )}
          <div className="agent-portrait-copy">
            <p className="kicker">BYD Glorietta</p>
            <h2 id="agent-contact-title">{agent.fullName}</h2>
          </div>
          <button type="button" className="lightbox-close" aria-label="Close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="agent-modal-body">
          <p className="agent-modal-note">Choose how to reach {firstName}.</p>
          <div className="agent-options">
            {options.map((option) =>
              option.label === "Email" ? (
                <button
                  key={option.label}
                  type="button"
                  className={emailShown ? "btn email-shown" : "btn"}
                  onClick={() => setEmailShown(true)}
                >
                  {emailShown ? agent.email : "Email"}
                </button>
              ) : (
                <a
                  key={option.label}
                  className={option.label === "Call" ? "btn gold" : "btn"}
                  href={option.href}
                  {...(option.external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {option.label}
                  {option.label === "Call" ? ` ${agent.contactNumber}` : ""}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
