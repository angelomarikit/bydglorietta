import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { photos } from "../../data/content";
import { administratorSignedIn } from "../../lib/agents";
import { supabase } from "../../lib/supabase";

export function AdminGate() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAllowed(false);
      return;
    }
    let cancel = false;
    administratorSignedIn().then((value) => {
      if (!cancel) setAllowed(value);
    });
    return () => {
      cancel = true;
    };
  }, [session]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setPending(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (signInError) setError("Those sign-in details were not accepted.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
  }

  if (!ready) return <main className="sign-in" aria-busy="true" />;
  if (!supabase) {
    return (
      <SignInShell title="Not connected">
        <p>The admin is not connected yet.</p>
      </SignInShell>
    );
  }
  if (!session) {
    return (
      <SignInShell title="Sign in">
        <form className="form" onSubmit={signIn}>
          <label>
            Email Address
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Signing in" : "Sign in"}
          </button>
        </form>
      </SignInShell>
    );
  }
  if (!allowed) {
    return (
      <SignInShell title="Sign in">
        <p>This account cannot open the admin.</p>
        <button className="btn" type="button" onClick={signOut}>
          Use a different account
        </button>
      </SignInShell>
    );
  }
  return <Outlet />;
}

function SignInShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="sign-in">
      <p className="sign-in-mark" aria-hidden="true">
        GLORIETTA
      </p>
      <section className="sign-in-card">
        <img src={photos.logoGrey} alt="BYD" />
        <p className="kicker">Admin</p>
        <h1>{title}</h1>
        <p className="sign-in-note">Manage the BYD Glorietta website.</p>
        {children}
      </section>
    </main>
  );
}
