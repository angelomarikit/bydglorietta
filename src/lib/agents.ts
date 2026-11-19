import { supabase } from "./supabase";

export type PublicAgent = {
  fullName: string;
  contactNumber: string;
  email: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  viberNumber: string | null;
  photoUrl: string | null;
  pageIdentifier: string;
};

export type ManagedAgent = PublicAgent & {
  id: string;
  hidden: boolean;
  photoPath: string | null;
};

export type AgentInput = {
  fullName: string;
  contactNumber: string;
  email: string;
  facebookUrl: string;
  whatsappNumber: string;
  viberNumber: string;
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
  page_identifier: string;
  is_hidden?: boolean;
};

export function pageAddress(identifier: string) {
  const configured = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  const origin = configured || window.location.origin;
  return `${origin}/agent/${identifier}`;
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

function mapPublic(row: AgentRow): PublicAgent {
  return {
    fullName: row.full_name,
    contactNumber: row.contact_number,
    email: row.email,
    facebookUrl: row.facebook_url,
    instagramUrl: row.instagram_url,
    whatsappNumber: row.whatsapp_number,
    viberNumber: row.viber_number,
    photoUrl: photoUrl(row.photo_path),
    pageIdentifier: row.page_identifier,
  };
}

function mapManaged(row: AgentRow): ManagedAgent {
  return {
    ...mapPublic(row),
    id: row.id ?? "",
    hidden: Boolean(row.is_hidden),
    photoPath: row.photo_path,
  };
}

function requireClient() {
  if (!supabase) throw new Error("Sales agent tools are not connected yet.");
  return supabase;
}

export async function getPublicAgent(pageKey: string) {
  const client = supabase;
  if (!client) return null;
  const { data, error } = await client.rpc("get_public_agent", { page_key: pageKey });
  if (error || !data) return null;
  return mapPublic(data as AgentRow);
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

function payload(input: AgentInput, photoPath: string | null, pageIdentifier?: string) {
  const blank = (value: string) => value.trim() || null;
  return {
    p_full_name: input.fullName.trim(),
    p_contact_number: input.contactNumber.trim(),
    p_email: blank(input.email),
    p_facebook_url: blank(input.facebookUrl),
    p_instagram_url: null,
    p_whatsapp_number: blank(input.whatsappNumber),
    p_viber_number: blank(input.viberNumber),
    p_photo_path: photoPath,
    ...(pageIdentifier ? { p_page_identifier: pageIdentifier } : {}),
  };
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

export async function createAgent(input: AgentInput, photoPath: string | null) {
  const client = requireClient();
  const pageIdentifier = await nextPageIdentifier(input.fullName);
  const { data, error } = await client.rpc("create_sales_agent", payload(input, photoPath, pageIdentifier));
  if (error || !data) {
    await removeAgentPhoto(photoPath);
    throw new Error("The agent page could not be created.");
  }
  return mapManaged(data as AgentRow);
}

export async function updateAgent(pageKey: string, input: AgentInput, photoPath: string | null) {
  const client = requireClient();
  const { data, error } = await client.rpc("update_sales_agent", {
    page_key: pageKey,
    ...payload(input, photoPath),
  });
  if (error || !data) throw new Error("The agent details could not be saved.");
  return mapManaged(data as AgentRow);
}

export async function setAgentHidden(pageKey: string, hidden: boolean) {
  const client = requireClient();
  const { error } = await client.rpc("set_agent_visibility", { page_key: pageKey, hidden });
  if (error) throw new Error(hidden ? "The page could not be hidden." : "The page could not be shown.");
}
