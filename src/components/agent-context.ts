import { createContext, useContext } from "react";
import type { PublicAgent } from "../lib/agents";

export const AgentContext = createContext<PublicAgent | null>(null);
export const ContactModalContext = createContext<{ open: () => void }>({ open: () => undefined });

export function useAgent() {
  return useContext(AgentContext);
}

export function useContactModal() {
  return useContext(ContactModalContext);
}
