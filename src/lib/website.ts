import { websiteCopy, type WebsiteCopy, type WebsiteNote, type WebsiteSectionKey } from "../data/website";
import { supabase } from "./supabase";

const storedPath = /^[a-z0-9-]+\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function isStoredImage(value: string) {
  return storedPath.test(value);
}

export function storedImage(value: string | undefined, fallback: string) {
  if (!value || !isStoredImage(value) || !supabase) return fallback;
  return supabase.storage.from("website-images").getPublicUrl(value).data.publicUrl;
}

function mergeStrings<T extends Record<string, string>>(base: T, saved: unknown): T {
  const record = asRecord(saved);
  if (!record) return base;
  const next = { ...base };
  for (const key of Object.keys(base)) {
    const value = record[key];
    if (typeof value !== "string") continue;
    const image = /image|photo|visual|sheet/i.test(key);
    next[key as keyof T] = (image && value && !isStoredImage(value) ? "" : value) as T[keyof T];
  }
  return next;
}

export function mergeWebsite(saved: unknown): WebsiteCopy {
  const record = asRecord(saved);
  const notesRecord = asRecord(record?.notes);
  const notes = Array.isArray(notesRecord?.posts) ? notesRecord.posts : [];
  return {
    home: mergeStrings(websiteCopy.home, record?.home),
    car: mergeStrings(websiteCopy.car, record?.car),
    contact: mergeStrings(websiteCopy.contact, record?.contact),
    service: mergeStrings(websiteCopy.service, record?.service),
    registration: mergeStrings(websiteCopy.registration, record?.registration),
    about: mergeStrings(websiteCopy.about, record?.about),
    drive: mergeStrings(websiteCopy.drive, record?.drive),
    blog: mergeStrings(websiteCopy.blog, record?.blog),
    footer: mergeStrings(websiteCopy.footer, record?.footer),
    notes: websiteCopy.notes.map((note) => {
      const row = notes.find((item) => asRecord(item)?.slug === note.slug);
      const fields = asRecord(row);
      if (!fields) return { ...note };
      return {
        slug: note.slug,
        title: typeof fields.title === "string" ? fields.title : note.title,
        excerpt: typeof fields.excerpt === "string" ? fields.excerpt : note.excerpt,
        body: typeof fields.body === "string" ? fields.body : note.body,
        image: typeof fields.image === "string" && isStoredImage(fields.image) ? fields.image : note.image,
      };
    }),
  };
}

export function noteParagraphs(body: string) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [body.trim()];
}

export async function loadWebsite() {
  if (!supabase) return websiteCopy;
  const { data, error } = await supabase.rpc("get_public_website");
  if (error || !data) return websiteCopy;
  return mergeWebsite(data);
}

export async function saveWebsiteSection(section: WebsiteSectionKey, fields: Record<string, string>) {
  if (!supabase) throw new Error("The admin is not connected yet.");
  const { error } = await supabase.rpc("save_website_page", { page_key: section, fields });
  if (error) throw new Error(error.message || "This page could not be saved. Run the website content SQL, then try again.");
}

export async function saveWebsiteNotes(notes: WebsiteNote[]) {
  if (!supabase) throw new Error("The admin is not connected yet.");
  const { error } = await supabase.rpc("save_website_page", { page_key: "notes", fields: { posts: notes } });
  if (error) throw new Error("The notes could not be saved. Run the website content SQL, then try again.");
}

export async function uploadWebsiteImage(file: File, section: string) {
  if (!supabase) throw new Error("The admin is not connected yet.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
    throw new Error("Use a JPG, PNG, or WebP photograph under 8 MB.");
  }
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${section}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("website-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error("The photograph could not be saved. Run the website image SQL, then try again.");
  return path;
}

export async function removeWebsiteImage(path: string) {
  if (!supabase || !isStoredImage(path)) return;
  await supabase.storage.from("website-images").remove([path]);
}

export async function stageWebsiteImages(section: string, current: Record<string, string>, files: Record<string, File>, imageKeys: string[]) {
  const next = { ...current };
  const uploaded: string[] = [];
  try {
    for (const key of imageKeys) {
      const file = files[key];
      if (!file) {
        next[key] = isStoredImage(current[key] ?? "") ? current[key] : "";
        continue;
      }
      const path = await uploadWebsiteImage(file, section);
      uploaded.push(path);
      next[key] = path;
    }
    return { next, uploaded };
  } catch (error) {
    await Promise.all(uploaded.map((path) => removeWebsiteImage(path)));
    throw error;
  }
}
