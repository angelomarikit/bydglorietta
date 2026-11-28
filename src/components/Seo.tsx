import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { posts } from "../data/content";
import type { WebsiteCopy } from "../data/website";

const SITE = "https://bydglorietta.com";

function clip(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).trim()}...`;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

function upsertCanonical(href: string) {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.rel = "canonical";
    document.head.appendChild(node);
  }
  node.href = href;
}

export function Seo({ copy, agentPage }: { copy: WebsiteCopy; agentPage: boolean }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const post = path.startsWith("/blog/") ? posts.find((item) => item.slug === path.slice("/blog/".length)) : undefined;
    let title = "BYD Glorietta | Sealion 6 DM-i Showroom in Makati";
    let description = "BYD Glorietta is the Makati showroom at Glorietta. See the Sealion 6 DM-i, suggested retail prices, a test drive, and the sales team.";
    let index = !agentPage;

    if (agentPage) {
      title = "BYD Glorietta";
      description = "A sales page for BYD Glorietta in Makati.";
      index = false;
    } else if (path === "/") {
      description = `${copy.home.statement} Dynamic from ?1,548,000. Premium ?1,798,000.`;
    } else if (path === "/car-details") {
      title = `${copy.car.title} Price and Specifications | BYD Glorietta`;
      description = `${copy.car.priceNote} ${copy.car.note}`;
    } else if (path === "/order") {
      title = `${copy.drive.title} | BYD Glorietta Makati`;
      description = copy.drive.note;
    } else if (path === "/blog") {
      title = `${copy.blog.title} | BYD Glorietta`;
      description = "Showroom notes from BYD Glorietta on the Sealion 6 DM-i, prices, and the Delan Black car.";
    } else if (post) {
      title = `${post.title} | BYD Glorietta`;
      description = post.excerpt;
    } else if (path === "/contact") {
      title = `Contact Us | BYD Glorietta Makati`;
      description = `${copy.contact.showroom}. Reach the BYD Glorietta showroom in Makati City.`;
    } else if (path === "/about") {
      title = `${copy.about.title} | BYD Glorietta Makati`;
      description = copy.about.description || "About the BYD Glorietta showroom in Makati City.";
    } else if (path === "/service-center") {
      title = `${copy.service.title} | BYD Glorietta`;
      description = copy.service.intro;
    } else if (path === "/vehicle-registration") {
      title = `${copy.registration.title} | BYD Glorietta`;
      description = copy.registration.intro;
    } else {
      title = "Page not found | BYD Glorietta";
      description = "This page is not on the BYD Glorietta site.";
      index = false;
    }

    const summary = clip(description);
    const url = `${SITE}${path === "/" ? "/" : path}`;
    document.title = title;
    upsertCanonical(url);
    upsertMeta("name", "description", summary);
    upsertMeta("name", "robots", index ? "index, follow" : "noindex, nofollow");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", summary);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", summary);
  }, [agentPage, copy, pathname]);

  return null;
}
