import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createAgent,
  getManagedAgent,
  pageAddress,
  removeAgentPhoto,
  updateAgent,
  uploadAgentPhoto,
  validateAgent,
  type AgentInput,
  type ManagedAgent,
} from "../../lib/agents";

const empty: AgentInput = {
  fullName: "",
  contactNumber: "",
  email: "",
  facebookUrl: "",
  whatsappNumber: "",
  viberNumber: "",
};

export function AgentFormPage() {
  const { pageIdentifier } = useParams();
  const editing = Boolean(pageIdentifier);
  const [input, setInput] = useState<AgentInput>(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AgentInput, string>>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<ManagedAgent | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!pageIdentifier) return;
    let cancel = false;
    getManagedAgent(pageIdentifier).then((agent) => {
      if (cancel) return;
      if (!agent) {
        setFormError("That sales agent could not be found.");
      } else {
        setInput({
          fullName: agent.fullName,
          contactNumber: agent.contactNumber,
          email: agent.email ?? "",
          facebookUrl: agent.facebookUrl ?? "",
          whatsappNumber: agent.whatsappNumber ?? "",
          viberNumber: agent.viberNumber ?? "",
        });
        setExistingPhoto(agent.photoUrl);
        setSaved(agent);
      }
      setLoading(false);
    });
    return () => {
      cancel = true;
    };
  }, [pageIdentifier]);

  function setField(key: keyof AgentInput, value: string) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateAgent(input);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;
    setPending(true);
    let uploaded: string | null = null;
    try {
      if (photo) uploaded = await uploadAgentPhoto(photo);
      const photoPath = uploaded ?? saved?.photoPath ?? null;
      const agent = editing && pageIdentifier
        ? await updateAgent(pageIdentifier, input, photoPath)
        : await createAgent(input, uploaded);
      if (uploaded && saved?.photoPath) await removeAgentPhoto(saved.photoPath);
      setSaved(agent);
      setExistingPhoto(agent.photoUrl);
      setPhoto(null);
    } catch (reason) {
      if (uploaded) await removeAgentPhoto(uploaded);
      setFormError(reason instanceof Error ? reason.message : "The agent page could not be saved.");
    } finally {
      setPending(false);
    }
  }

  async function copy() {
    if (!saved) return;
    await navigator.clipboard.writeText(pageAddress(saved.pageIdentifier));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const address = saved ? pageAddress(saved.pageIdentifier) : "";

  return (
    <div className="admin-panel">
      <p className="kicker">Sales Agents</p>
      <h1>{editing ? "Edit Details" : "Add Sales Agent"}</h1>
      <Link to="/admin/agents">Back to Sales Agents</Link>
      {loading ? (
        <p aria-busy="true">Loading agent details.</p>
      ) : (
        <form className="form" onSubmit={submit} style={{ marginTop: 28 }}>
          <label>
            Full Name
            <input value={input.fullName} onChange={(event) => setField("fullName", event.target.value)} required />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </label>
          <label>
            Contact Number
            <input value={input.contactNumber} onChange={(event) => setField("contactNumber", event.target.value)} required />
            {errors.contactNumber && <span className="form-error">{errors.contactNumber}</span>}
          </label>
          <label>
            Email Address
            <input type="email" value={input.email} onChange={(event) => setField("email", event.target.value)} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </label>
          <label>
            Facebook Page Link
            <input value={input.facebookUrl} onChange={(event) => setField("facebookUrl", event.target.value)} />
            {errors.facebookUrl && <span className="form-error">{errors.facebookUrl}</span>}
          </label>
          <label>
            WhatsApp Number
            <input value={input.whatsappNumber} onChange={(event) => setField("whatsappNumber", event.target.value)} />
            {errors.whatsappNumber && <span className="form-error">{errors.whatsappNumber}</span>}
          </label>
          <label>
            Viber Number
            <input value={input.viberNumber} onChange={(event) => setField("viberNumber", event.target.value)} />
            {errors.viberNumber && <span className="form-error">{errors.viberNumber}</span>}
          </label>
          <label>
            Agent Profile Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
          </label>
          {existingPhoto && !photo && <img className="agent-photo" src={existingPhoto} alt="" />}
          {address ? (
            <p className="page-link-note">
              Page link
              <span>{address}</span>
            </p>
          ) : (
            <p className="page-link-note">
              The page link is generated when you click Create Agent Page.
              <span>Example: {pageAddress("agent-name")}</span>
            </p>
          )}
          {formError && <p className="form-error">{formError}</p>}
          {saved && !pending && (
            <div className="admin-actions">
              <button className="btn quiet" type="button" onClick={copy}>
                {copied ? "Copied" : "Copy Link"}
              </button>
              <a className="btn quiet" href={address} target="_blank" rel="noreferrer">
                View Page
              </a>
              {pageIdentifier !== saved.pageIdentifier && (
                <Link className="btn" to={`/admin/agents/${saved.pageIdentifier}`}>
                  Edit Agent
                </Link>
              )}
            </div>
          )}
          <button className="btn gold" type="submit" disabled={pending || (editing && !saved) || (!editing && saved !== null)}>
            {pending ? "Saving" : editing ? "Save Details" : "Create Agent Page"}
          </button>
        </form>
      )}
    </div>
  );
}
