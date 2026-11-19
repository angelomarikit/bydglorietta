import { FormEvent, useState } from "react";
import { FrameImage } from "../components/FrameImage";
import { useWebsite } from "../components/website-context";
import { photos, ratios } from "../data/content";
import { storedImage } from "../lib/website";

export function EnquirePage() {
  const { copy } = useWebsite();
  const drive = copy.drive;
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="page">
      <p className="kicker">{drive.kicker}</p>
      <h1 className="page-title">{drive.title}</h1>
      <div className="contact-grid">
        <div>
          <FrameImage src={storedImage(drive.photo, photos.exterior[1])} alt="Sealion 6 DM-i in Delan Black" ratio={ratios.gallery} />
          <p className="muted" style={{ marginTop: 16 }}>
            {drive.note}
          </p>
        </div>
        {sent ? (
          <div className="success">
            <h2 className="display" style={{ fontSize: 40 }}>{drive.sentTitle}</h2>
            <p style={{ marginTop: 12 }}>{drive.sentBody}</p>
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
              Mobile
              <input name="phone" type="tel" required autoComplete="tel" />
            </label>
            <label>
              Variant
              <input name="variant" defaultValue="Sealion 6 DM-i" />
            </label>
            <label>
              Note
              <textarea name="note" placeholder="Preferred day at Glorietta" />
            </label>
            <button className="btn" type="submit">
              {drive.send}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
