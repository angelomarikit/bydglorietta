import { FormEvent, useState } from "react";
import { useWebsite } from "../components/website-context";
import { sendInquiry } from "../lib/inquiry";

export function RegistrationPage() {
  const { copy } = useWebsite();
  const inquiry = copy.registration;
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await sendInquiry("Vehicle Registration Inquiry", {
        [inquiry.vehicleLabel]: String(data.get("vehicle") ?? ""),
        [inquiry.csLabel]: String(data.get("cs") ?? ""),
        [inquiry.customerLabel]: String(data.get("customer") ?? ""),
        [inquiry.emailLabel]: String(data.get("email") ?? ""),
        [inquiry.consultantLabel]: String(data.get("consultant") ?? ""),
      });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This form could not be sent. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="page inquiry-page">
      <p className="kicker">{inquiry.kicker}</p>
      <h1 className="page-title">{inquiry.title}</h1>
      {inquiry.intro.trim() && <p className="inquiry-lead">{inquiry.intro}</p>}
      {sent ? (
        <div className="success">
          <h2 className="display" style={{ fontSize: 40 }}>{inquiry.sentTitle}</h2>
          <p style={{ marginTop: 12 }}>{inquiry.sentBody}</p>
        </div>
      ) : (
        <form className="inquiry-form" onSubmit={submit}>
          <label>
            {inquiry.vehicleLabel}
            <input name="vehicle" required autoComplete="off" />
          </label>
          <label>
            {inquiry.csLabel}
            <input name="cs" required autoComplete="off" />
          </label>
          <label>
            {inquiry.customerLabel}
            <input name="customer" required autoComplete="name" />
          </label>
          <label>
            {inquiry.emailLabel}
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="wide">
            {inquiry.consultantLabel}
            <input name="consultant" required autoComplete="name" />
          </label>
          {error && <span className="form-error">{error}</span>}
          <button className="btn" type="submit" disabled={pending}>{pending ? "Sending" : inquiry.send}</button>
        </form>
      )}
    </main>
  );
}
