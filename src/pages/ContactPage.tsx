import { FormEvent, useState } from "react";
import { FrameImage } from "../components/FrameImage";
import { useWebsite } from "../components/website-context";
import { photos, ratios } from "../data/content";
import { storedImage } from "../lib/website";

export function ContactPage() {
  const { copy } = useWebsite();
  const contact = copy.contact;
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
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
          <div className="acm" style={{ marginTop: 24 }}>
            <img src={photos.acmobility} alt="ACMobility" />
          </div>
        </div>
        {sent ? (
          <div className="success">
            <h2 className="display" style={{ fontSize: 40 }}>{contact.sentTitle}</h2>
            <p style={{ marginTop: 12 }}>{contact.sentBody}</p>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
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
            <button className="btn" type="submit">
              {contact.send}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
