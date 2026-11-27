import { FormEvent, useState } from "react";

function FinancingForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="quote-form-card">
        <h3>In-house Financing promo</h3>
        <p>Your financing quotation request is kept on this page.</p>
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
      <button className="btn" type="submit">Send</button>
    </form>
  );
}

function PurchaseForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="quote-form-card">
        <h3>Purchase quotation</h3>
        <p>Your quotation request is kept on this page.</p>
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
      <button className="btn" type="submit">Send</button>
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
