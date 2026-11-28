import { FormEvent, useState } from "react";
import { sendInquiry } from "../lib/inquiry";

function FinancingForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await sendInquiry("In-house Financing promo", {
        "Vehicle model": String(data.get("vehicle") ?? ""),
        Downpayment: String(data.get("downpayment") ?? ""),
        Term: String(data.get("term") ?? ""),
        "Email address": String(data.get("email") ?? ""),
        "Contact number": String(data.get("phone") ?? ""),
      });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This form could not be sent. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="quote-form-card">
        <h3>In-house Financing promo</h3>
        <p>Your financing quotation request was sent.</p>
      </div>
    );
  }

  return (
    <form className="quote-form-card" onSubmit={submit}>
      <h3>In-house Financing promo</h3>
      <label>
        Vehicle model
        <input name="vehicle" required autoComplete="off" />
      </label>
      <label>
        Downpayment
        <input name="downpayment" required autoComplete="off" />
      </label>
      <label>
        Term
        <input name="term" required autoComplete="off" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Contact number
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      {error && <span className="form-error">{error}</span>}
      <button className="btn" type="submit" disabled={pending}>{pending ? "Sending" : "Send enquiry"}</button>
    </form>
  );
}

function PurchaseForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await sendInquiry("Purchase quotation", {
        "Purchase type": String(data.get("purchase") ?? ""),
        "Vehicle model": String(data.get("vehicle") ?? ""),
        "Email address": String(data.get("email") ?? ""),
        "Contact number": String(data.get("phone") ?? ""),
      });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This form could not be sent. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="quote-form-card">
        <h3>Purchase quotation</h3>
        <p>Your quotation request was sent.</p>
      </div>
    );
  }

  return (
    <form className="quote-form-card" onSubmit={submit}>
      <h3>Purchase quotation</h3>
      <label>
        Purchase type
        <select name="purchase" defaultValue="CASH" required>
          <option>CASH</option>
          <option>Bank PO</option>
          <option>COMPANY Purchase</option>
        </select>
      </label>
      <label>
        Vehicle model
        <input name="vehicle" required autoComplete="off" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Contact number
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      {error && <span className="form-error">{error}</span>}
      <button className="btn" type="submit" disabled={pending}>{pending ? "Sending" : "Send enquiry"}</button>
    </form>
  );
}

export function QuotationForms() {
  return (
    <section className="quote-forms" aria-label="Request for a vehicle quotation">
      <h2>Request for a vehicle quotation</h2>
      <div className="quote-forms-grid">
        <FinancingForm />
        <PurchaseForm />
      </div>
    </section>
  );
}
