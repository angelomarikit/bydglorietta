const inbox = "delossantos.msb@idi.acmobility.ph";

const forms = new Set([
  "Contact Us",
  "Test drive",
  "Vehicle Registration Inquiry",
  "In-house Financing promo",
  "Purchase quotation",
]);

type InquiryBody = {
  form?: unknown;
  fields?: unknown;
};

function textFields(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value).slice(0, 20);
  const fields: Record<string, string> = {};
  for (const [key, item] of entries) {
    if (typeof item !== "string") return null;
    const name = key.trim().slice(0, 80);
    const words = item.trim().slice(0, 2000);
    if (!name || !words) continue;
    fields[name] = words;
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

export default async function handler(request: { method?: string; body?: InquiryBody }, response: { status: (code: number) => { json: (body: unknown) => void } }) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "This form could not be sent." });
    return;
  }
  const form = typeof request.body?.form === "string" ? request.body.form.trim() : "";
  const fields = textFields(request.body?.fields);
  if (!forms.has(form) || !fields) {
    response.status(400).json({ error: "This form could not be sent." });
    return;
  }
  const reply = fields.Email ?? fields["Email address"] ?? "";
  const sent = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: `BYD Glorietta — ${form}`,
      _template: "table",
      _captcha: "false",
      ...(reply.includes("@") ? { _replyto: reply } : {}),
      Form: form,
      ...fields,
    }),
  });
  if (!sent.ok) {
    response.status(502).json({ error: "This form could not be sent. Try again." });
    return;
  }
  response.status(200).json({ ok: true });
}
