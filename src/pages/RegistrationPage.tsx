import { FormEvent, useState } from "react";

export function RegistrationPage() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="page">
      <p className="kicker">BYD Glorietta</p>
      <h1 className="page-title">Vehicle Registration Inquiry</h1>
      <p className="inquiry-lead">
        Share the vehicle and the customer so the showroom can follow up on the registration.
      </p>
      {sent ? (
        <div className="success">
          <h2 className="display" style={{ fontSize: 40 }}>Inquiry received</h2>
          <p style={{ marginTop: 12 }}>Your details are kept on this page only.</p>
        </div>
      ) : (
        <form className="inquiry-form" onSubmit={submit}>
          <label>
            Vehicle model
            <input name="vehicle" required autoComplete="off" />
          </label>
          <label>
            CS no.
            <input name="cs" required autoComplete="off" />
          </label>
          <label>
            Customer name
            <input name="customer" required autoComplete="name" />
          </label>
          <label>
            Email address
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="wide">
            Sales Consultant
            <input name="consultant" required autoComplete="name" />
          </label>
          <button className="btn" type="submit">Send</button>
        </form>
      )}
    </main>
  );
}
