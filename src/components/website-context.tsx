import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { websiteCopy, type WebsiteCopy } from "../data/website";
import { loadWebsite } from "../lib/website";

const WebsiteContext = createContext<{ copy: WebsiteCopy; ready: boolean; refresh: () => Promise<void> }>({
  copy: websiteCopy,
  ready: false,
  refresh: async () => {},
});

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [copy, setCopy] = useState<WebsiteCopy>(websiteCopy);
  const [ready, setReady] = useState(false);

  async function refresh() {
    setCopy(await loadWebsite());
    setReady(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  return <WebsiteContext.Provider value={{ copy, ready, refresh }}>{children}</WebsiteContext.Provider>;
}

export function useWebsite() {
  return useContext(WebsiteContext);
}
