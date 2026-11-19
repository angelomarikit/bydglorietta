import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAgent, useContactModal } from "./agent-context";

type InquiryLinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
};

export function InquiryLink({ to, className, children }: InquiryLinkProps) {
  const agent = useAgent();
  const contact = useContactModal();
  if (!agent) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={contact.open}>
      {children}
    </button>
  );
}
