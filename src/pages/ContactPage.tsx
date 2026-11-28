import { FormEvent, useState } from "react";
import { FrameImage } from "../components/FrameImage";
import { useWebsite } from "../components/website-context";
import { photos, ratios } from "../data/content";
import { sendInquiry } from "../lib/inquiry";
import { storedImage } from "../lib/website";

export function ContactPage() {
  const { copy } = useWebsite();
  const contact = copy.contact;
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await sendInquiry("Contact Us", {
        Name: String(data.get("name") ?? ""),
        Email: String(data.get("email") ?? ""),
        Message: String(data.get("message") ?? ""),
      });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This form could not be sent. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="page">
      <p className="kicker">{contact.kicker}</p>
      <h1 className="page-title">{contact.title}</h1>
      <div className="contact-grid">
        <div>
          <FrameImage src={storedImage(contact.photo, photos.exterior[3])} alt="Sealion 6 DM-i in Delan Black" ratio={ratios.gallery} />
          <div className="spec-row" style={{ marginTop: 24 }}>
            <article>
              <span className="muted">{contact.showroomLabel}</span>
              <strong style={{ fontSize: 22 }}>{contact.showroom}</strong>
            </article>
            <article>
              <span className="muted">{contact.websiteLabel}</span>
              <strong style={{ fontSize: 22 }}>{contact.website}</strong>
            </article>
          </div>
          <p className="muted">{contact.note}</p>
          <div className="contact-people">
            <article>
              <span className="muted">Sales manager</span>
              <strong>{contact.salesManager}</strong>
              <span className="muted">Contact number</span>
              {contact.salesManagerPhone ? (
                <a href={`tel:${contact.salesManagerPhone.replace(/[^\d+]/g, "")}`}>{contact.salesManagerPhone}</a>
              ) : (
                <strong />
              )}
            </article>
            <article>
              <span className="muted">{contact.experienceTitle}</span>
              <strong>{contact.experienceName}</strong>
              <span className="muted">Contact number</span>
              {contact.experiencePhone ? (
                <a href={`tel:${contact.experiencePhone.replace(/[^\d+]/g, "")}`}>{contact.experiencePhone}</a>
              ) : (
                <strong />
              )}
            </article>
          </div>
          <div className="contact-brand">
            <div className="acm">
              <img src={photos.acmobility} alt="ACMobility" />
            </div>
            <a className="contact-word" href="#contact-form">Contact Us</a>
          </div>
        </div>
        {sent ? (
          <div className="success">
            <h2 className="display" style={{ fontSize: 40 }}>{contact.sentTitle}</h2>
            <p style={{ marginTop: 12 }}>{contact.sentBody}</p>
          </div>
        ) : (
          <form className="form" id="contact-form" onSubmit={submit}>
            <label>
              Name
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Message
              <textarea name="message" required />
            </label>
            {error && <span className="form-error">{error}</span>}
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Sending" : contact.send}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
