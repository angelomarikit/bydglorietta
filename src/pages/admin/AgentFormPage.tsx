import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createAgent,
  getManagedAgent,
  pageAddress,
  removeAgentPhoto,
  removeAgentVideo,
  updateAgent,
  uploadAgentPhoto,
  uploadAgentVideo,
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
  ratingValue: "",
  ratingCount: "",
  testimonials: [],
};

export function AgentFormPage() {
  const { pageIdentifier } = useParams();
  const editing = Boolean(pageIdentifier);
  const [input, setInput] = useState<AgentInput>(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoInputKey, setVideoInputKey] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoRemoved, setVideoRemoved] = useState(false);
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
          ratingValue: agent.ratingValue === null ? "" : String(agent.ratingValue),
          ratingCount: agent.ratingCount === null ? "" : String(agent.ratingCount),
          testimonials: agent.testimonials,
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

  useEffect(() => {
    if (!video) {
      setVideoPreview(null);
      return;
    }
    const url = URL.createObjectURL(video);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  function setField(key: Exclude<keyof AgentInput, "testimonials">, value: string) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function setTestimonial(index: number, key: "name" | "quote", value: string) {
    setInput((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: value } : item
      )),
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ready: AgentInput = {
      ...input,
      testimonials: input.testimonials
        .map((item) => ({ name: item.name.trim(), quote: item.quote.trim() }))
        .filter((item) => item.name || item.quote),
    };
    setInput(ready);
    const nextErrors = validateAgent(ready);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;
    setPending(true);
    let uploadedPhoto: string | null = null;
    let uploadedVideo: string | null = null;
    try {
      if (photo) uploadedPhoto = await uploadAgentPhoto(photo);
      if (video) uploadedVideo = await uploadAgentVideo(video);
      const photoPath = uploadedPhoto ?? saved?.photoPath ?? null;
      const videoPath = video && uploadedVideo
        ? uploadedVideo
        : videoRemoved
          ? null
          : saved?.videoPath ?? null;
      const agent = editing && pageIdentifier
        ? await updateAgent(pageIdentifier, ready, photoPath, videoPath)
        : await createAgent(ready, uploadedPhoto, uploadedVideo);
      if (uploadedPhoto && saved?.photoPath && uploadedPhoto !== saved.photoPath) await removeAgentPhoto(saved.photoPath);
      if (saved?.videoPath && saved.videoPath !== agent.videoPath) await removeAgentVideo(saved.videoPath);
      setSaved(agent);
      setExistingPhoto(agent.photoUrl);
      setPhoto(null);
      setVideo(null);
      setVideoRemoved(false);
      setVideoInputKey((key) => key + 1);
    } catch (reason) {
      if (uploadedPhoto) await removeAgentPhoto(uploadedPhoto);
      if (uploadedVideo) await removeAgentVideo(uploadedVideo);
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
          <label>
            Personal video
            <input
              key={videoInputKey}
              type="file"
              accept="video/mp4"
              onChange={(event) => {
                setVideo(event.target.files?.[0] ?? null);
                setVideoRemoved(false);
              }}
            />
          </label>
          <p className="page-link-note">One MP4, up to 40 MB. It plays in the middle of this agent’s page.</p>
          {(videoPreview || (saved?.videoUrl && !videoRemoved)) && (
            <video
              className="agent-video-preview"
              src={videoPreview ?? saved?.videoUrl ?? undefined}
              controls
              playsInline
            />
          )}
          {saved?.videoUrl && !video && !videoRemoved && (
            <button className="btn quiet" type="button" onClick={() => setVideoRemoved(true)}>
              Remove video
            </button>
          )}
          <label>
            Review rating
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={input.ratingValue}
              onChange={(event) => setField("ratingValue", event.target.value)}
              placeholder="4.8"
            />
            {errors.ratingValue && <span className="form-error">{errors.ratingValue}</span>}
          </label>
          <label>
            Number of reviews
            <input
              type="number"
              min="0"
              step="1"
              value={input.ratingCount}
              onChange={(event) => setField("ratingCount", event.target.value)}
              placeholder="24"
            />
            {errors.ratingCount && <span className="form-error">{errors.ratingCount}</span>}
          </label>
          <p className="page-link-note">Leave the rating blank to hide it on the page.</p>
          <fieldset className="testimonial-editor">
            <legend>Customer testimonials</legend>
            {input.testimonials.map((item, index) => (
              <div className="testimonial-row" key={index}>
                <label>
                  Customer name
                  <input value={item.name} onChange={(event) => setTestimonial(index, "name", event.target.value)} />
                </label>
                <label>
                  Quote
                  <textarea
                    value={item.quote}
                    maxLength={400}
                    onChange={(event) => setTestimonial(index, "quote", event.target.value)}
                  />
                </label>
                <button
                  className="btn quiet"
                  type="button"
                  onClick={() => setInput((current) => ({
                    ...current,
                    testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index),
                  }))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="btn quiet"
              type="button"
              disabled={input.testimonials.length >= 8}
              onClick={() => setInput((current) => ({
                ...current,
                testimonials: [...current.testimonials, { name: "", quote: "" }],
              }))}
            >
              Add testimonial
            </button>
            {errors.testimonials && <span className="form-error">{errors.testimonials}</span>}
          </fieldset>
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
