import { supabase } from "./supabase";

export type AgentTestimonial = {
  name: string;
  quote: string;
  photoPath: string | null;
  photoUrl: string | null;
};

export type PublicAgent = {
  fullName: string;
  contactNumber: string;
  email: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  viberNumber: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  ratingValue: number | null;
  ratingCount: number | null;
  testimonials: AgentTestimonial[];
  salesPhotoUrls: string[];
  pageIdentifier: string;
};

export type ManagedAgent = PublicAgent & {
  id: string;
  hidden: boolean;
  photoPath: string | null;
  videoPath: string | null;
  salesPhotoPaths: string[];
};

export type AgentInput = {
  fullName: string;
  contactNumber: string;
  email: string;
  facebookUrl: string;
  whatsappNumber: string;
  viberNumber: string;
  ratingValue: string;
  ratingCount: string;
  testimonials: AgentTestimonial[];
};

type AgentRow = {
  id?: string;
  full_name: string;
  contact_number: string;
  email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp_number: string | null;
  viber_number: string | null;
  photo_path: string | null;
  video_path?: string | null;
  rating_value?: number | string | null;
  rating_count?: number | string | null;
  testimonials?: AgentTestimonial[] | null;
  sales_photos?: unknown;
  page_identifier: string;
  is_hidden?: boolean;
};

const publicSite = "https://bydglorietta.com";

export function pageAddress(identifier: string) {
  return `${publicSite}/agent/${identifier}`;
}

export function toPageIdentifier(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return base || "agent";
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isPhone(value: string) {
  const digits = digitsOnly(value);
  return digits.length >= 7 && digits.length <= 15 && /^[0-9+().\-\s]+$/.test(value.trim());
}

function hostnameOk(value: string, pattern: RegExp) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && pattern.test(url.hostname) && url.pathname.length > 1;
  } catch {
    return false;
  }
}

export function validateAgent(input: AgentInput) {
  const errors: Partial<Record<keyof AgentInput, string>> = {};
  const fullName = input.fullName.trim();
  if (fullName.length < 2 || fullName.length > 120) errors.fullName = "Enter the agent's full name.";
  if (!isPhone(input.contactNumber)) errors.contactNumber = "Enter a contact number.";
  const email = input.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (input.facebookUrl.trim() && !hostnameOk(input.facebookUrl, /^(www\.)?(facebook\.com|fb\.com)$/)) {
    errors.facebookUrl = "Use a full https://facebook.com or https://fb.com link.";
  }
  if (input.whatsappNumber.trim() && !isPhone(input.whatsappNumber)) {
    errors.whatsappNumber = "Enter a WhatsApp number.";
  }
  if (input.viberNumber.trim() && !isPhone(input.viberNumber)) errors.viberNumber = "Enter a Viber number.";
  const rating = input.ratingValue.trim();
  if (rating) {
    const value = Number(rating);
    if (!Number.isFinite(value) || value < 1 || value > 5) errors.ratingValue = "Enter a rating from 1 to 5.";
  }
  const count = input.ratingCount.trim();
  if (count && (!/^\d+$/.test(count) || Number(count) > 1000000)) errors.ratingCount = "Enter the number of reviews.";
  input.testimonials.forEach((item, index) => {
    if (item.name.trim().length < 2 || item.name.trim().length > 80) {
      errors.testimonials = "Enter each customer's name.";
    }
    if (item.quote.trim().length < 8 || item.quote.trim().length > 400) {
      errors.testimonials = "Each quote needs between 8 and 400 characters.";
    }
    if (index > 39) errors.testimonials = "Add up to 40 testimonials.";
  });
  return errors;
}

export type ContactOption = {
  label: string;
  href: string;
  external: boolean;
};

export function contactOptions(agent: PublicAgent): ContactOption[] {
  const options: ContactOption[] = [
    { label: "Call", href: `tel:${agent.contactNumber.replace(/[^\d+]/g, "")}`, external: false },
  ];
  if (agent.email) options.push({ label: "Email", href: `mailto:${agent.email}`, external: false });
  if (agent.facebookUrl) options.push({ label: "Facebook", href: agent.facebookUrl, external: true });
  if (agent.whatsappNumber) {
    options.push({ label: "WhatsApp", href: `https://wa.me/${digitsOnly(agent.whatsappNumber)}`, external: true });
  }
  if (agent.viberNumber) {
    const trimmed = agent.viberNumber.trim();
    const number = trimmed.startsWith("+") ? `+${digitsOnly(trimmed)}` : digitsOnly(trimmed);
    options.push({ label: "Viber", href: `viber://chat?number=${encodeURIComponent(number)}`, external: false });
  }
  return options;
}

function photoUrl(path: string | null) {
  if (!path || !supabase) return null;
  return supabase.storage.from("agent-photos").getPublicUrl(path).data.publicUrl;
}

function videoUrl(path: string | null | undefined) {
  if (!path || !supabase) return null;
  return supabase.storage.from("agent-videos").getPublicUrl(path).data.publicUrl;
}

function testimonials(value: unknown): AgentTestimonial[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as { name?: unknown; quote?: unknown; photo_path?: unknown };
    if (typeof record.name !== "string" || typeof record.quote !== "string") return [];
    const name = record.name.trim();
    const quote = record.quote.trim();
    const photoPath = typeof record.photo_path === "string" && record.photo_path.trim() ? record.photo_path.trim() : null;
    return name && quote ? [{ name, quote, photoPath, photoUrl: photoUrl(photoPath) }] : [];
  });
}

function ratingValue(value: AgentRow["rating_value"]) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function salesPhotoPaths(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []));
}

function mapPublic(row: AgentRow): PublicAgent {
  const paths = salesPhotoPaths(row.sales_photos);
  return {
    fullName: row.full_name,
    contactNumber: row.contact_number,
    email: row.email,
    facebookUrl: row.facebook_url,
    instagramUrl: row.instagram_url,
    whatsappNumber: row.whatsapp_number,
    viberNumber: row.viber_number,
    photoUrl: photoUrl(row.photo_path),
    videoUrl: videoUrl(row.video_path),
    ratingValue: ratingValue(row.rating_value),
    ratingCount: ratingValue(row.rating_count) === null ? null : Math.round(Number(row.rating_count)),
    testimonials: testimonials(row.testimonials),
    salesPhotoUrls: paths.flatMap((path) => {
      const url = photoUrl(path);
      return url ? [url] : [];
    }),
    pageIdentifier: row.page_identifier,
  };
}

function mapManaged(row: AgentRow): ManagedAgent {
  return {
    ...mapPublic(row),
    id: row.id ?? "",
    hidden: Boolean(row.is_hidden),
    photoPath: row.photo_path,
    videoPath: row.video_path ?? null,
    salesPhotoPaths: salesPhotoPaths(row.sales_photos),
  };
}

function requireClient() {
  if (!supabase) throw new Error("Sales agent tools are not connected yet.");
  return supabase;
}

export type DirectoryAgent = {
  fullName: string;
  photoUrl: string | null;
  pageIdentifier: string;
};

export async function listPublicAgents() {
  const client = supabase;
  if (!client) return [];
  const { data, error } = await client.rpc("list_public_agents");
  if (error || data == null) return [];
  const rows = (typeof data === "string" ? JSON.parse(data) : data) as AgentRow[];
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row): DirectoryAgent[] => {
    if (!row || typeof row.full_name !== "string" || typeof row.page_identifier !== "string") return [];
    return [{
      fullName: row.full_name,
      photoUrl: photoUrl(row.photo_path ?? null),
      pageIdentifier: row.page_identifier,
    }];
  });
}

export async function getPublicAgent(pageKey: string) {
  const client = supabase;
  if (!client) return null;
  const { data, error } = await client.rpc("get_public_agent", { page_key: pageKey });
  if (error || !data) return null;
  return mapPublic(data as AgentRow);
}

export async function addAgentTestimonial(pageKey: string, name: string, quote: string) {
  const client = requireClient();
  const { error } = await client.rpc("add_agent_testimonial", {
    page_key: pageKey,
    customer_name: name.trim(),
    customer_quote: quote.trim(),
  });
  if (error) {
    const message = error.message ?? "";
    if (message.includes("customer name")) throw new Error("Enter your name.");
    if (message.includes("between 8 and 400")) throw new Error("Write between 8 and 400 characters.");
    if (message.includes("feedback limit")) throw new Error("This page has reached the feedback limit.");
    if (message.includes("not available")) throw new Error("This agent page is not available.");
    throw new Error("The feedback could not be saved. Run the latest sales agent SQL, then try again.");
  }
}

export async function administratorSignedIn() {
  const client = requireClient();
  const { data, error } = await client.rpc("is_administrator");
  if (error) return false;
  return Boolean(data);
}

export async function listAgents() {
  const client = requireClient();
  const { data, error } = await client.rpc("list_sales_agents");
  if (error) throw new Error("The sales agent list could not be loaded.");
  return ((data as AgentRow[] | null) ?? []).map(mapManaged);
}

export async function getManagedAgent(pageKey: string) {
  const client = requireClient();
  const { data, error } = await client.rpc("get_managed_agent", { page_key: pageKey });
  if (error || !data) return null;
  return mapManaged(data as AgentRow);
}

async function identifierTaken(candidate: string) {
  const client = requireClient();
  const { data, error } = await client.rpc("page_link_in_use", { candidate });
  if (error) throw new Error("A page link could not be prepared.");
  return Boolean(data);
}

export async function nextPageIdentifier(name: string) {
  const base = toPageIdentifier(name);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    if (!(await identifierTaken(candidate))) return candidate;
  }
  throw new Error("A page link could not be prepared. Try a slightly different name.");
}

function payload(input: AgentInput, photoPath: string | null, videoPath: string | null, salesPaths: string[], pageIdentifier?: string) {
  const blank = (value: string) => value.trim() || null;
  const rating = input.ratingValue.trim();
  const count = input.ratingCount.trim();
  return {
    p_full_name: input.fullName.trim(),
    p_contact_number: input.contactNumber.trim(),
    p_email: blank(input.email),
    p_facebook_url: blank(input.facebookUrl),
    p_instagram_url: null,
    p_whatsapp_number: blank(input.whatsappNumber),
    p_viber_number: blank(input.viberNumber),
    p_photo_path: photoPath,
    p_video_path: videoPath,
    p_rating_value: rating ? Number(rating) : null,
    p_rating_count: count ? Number(count) : null,
    p_testimonials: input.testimonials.map((item) => ({
      name: item.name.trim(),
      quote: item.quote.trim(),
      photo_path: item.photoPath,
    })),
    p_sales_photos: salesPaths,
    ...(pageIdentifier ? { p_page_identifier: pageIdentifier } : {}),
  };
}

export async function uploadSalesPhoto(file: File, message = "Use a JPG, PNG, or WebP photo under 2 MB. 1200 × 800 pixels keeps every card the same size.") {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error(message);
  }
  return uploadAgentPhoto(file);
}

export async function uploadAgentPhoto(file: File) {
  const client = requireClient();
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error("Use a JPG, PNG, or WebP photo under 5 MB.");
  }
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("agent-photos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error("The photo could not be saved.");
  return path;
}

export async function removeAgentPhoto(path: string | null) {
  if (!path || !supabase) return;
  await supabase.storage.from("agent-photos").remove([path]);
}

export async function uploadAgentVideo(file: File) {
  const client = requireClient();
  if (file.type !== "video/mp4" || file.size > 40 * 1024 * 1024) {
    throw new Error("Use an MP4 video under 40 MB.");
  }
  const path = `${crypto.randomUUID()}.mp4`;
  const { error } = await client.storage.from("agent-videos").upload(path, file, {
    contentType: "video/mp4",
    upsert: false,
  });
  if (error) throw new Error("The video could not be saved. Run the latest sales agent SQL, then try again.");
  return path;
}

export async function removeAgentVideo(path: string | null) {
  if (!path || !supabase) return;
  await supabase.storage.from("agent-videos").remove([path]);
}

export async function createAgent(input: AgentInput, photoPath: string | null, videoPath: string | null, salesPaths: string[]) {
  const client = requireClient();
  const pageIdentifier = await nextPageIdentifier(input.fullName);
  const { data, error } = await client.rpc("create_sales_agent", payload(input, photoPath, videoPath, salesPaths, pageIdentifier));
  if (error || !data) {
    await removeAgentPhoto(photoPath);
    await removeAgentVideo(videoPath);
    throw new Error("The agent page could not be created. Run the latest sales agent SQL, then try again.");
  }
  return mapManaged(data as AgentRow);
}

export async function updateAgent(pageKey: string, input: AgentInput, photoPath: string | null, videoPath: string | null, salesPaths: string[]) {
  const client = requireClient();
  const { data, error } = await client.rpc("update_sales_agent", {
    page_key: pageKey,
    ...payload(input, photoPath, videoPath, salesPaths),
  });
  if (error || !data) throw new Error("The agent details could not be saved. Run the latest sales agent SQL, then try again.");
  return mapManaged(data as AgentRow);
}

export async function setAgentHidden(pageKey: string, hidden: boolean) {
  const client = requireClient();
  const { error } = await client.rpc("set_agent_visibility", { page_key: pageKey, hidden });
  if (error) throw new Error(hidden ? "The page could not be hidden." : "The page could not be shown.");
}

export async function deleteAgent(agent: ManagedAgent) {
  const client = requireClient();
  const { error } = await client.rpc("delete_sales_agent", { page_key: agent.pageIdentifier });
  if (error) throw new Error("The sales agent could not be deleted. Run the latest sales agent SQL, then try again.");
  await removeAgentPhoto(agent.photoPath);
  await removeAgentVideo(agent.videoPath);
  await Promise.all(agent.salesPhotoPaths.map((path) => removeAgentPhoto(path)));
}
