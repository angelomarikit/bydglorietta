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
  uploadSalesPhoto,
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
  const [keptSales, setKeptSales] = useState<{ path: string; url: string }[]>([]);
  const [salesFiles, setSalesFiles] = useState<File[]>([]);
  const [salesPreviews, setSalesPreviews] = useState<string[]>([]);
  const [salesInputKey, setSalesInputKey] = useState(0);
  const [reviewFiles, setReviewFiles] = useState<(File | null)[]>([]);
  const [reviewPreviews, setReviewPreviews] = useState<(string | null)[]>([]);
  const [droppedReviewPhotos, setDroppedReviewPhotos] = useState<string[]>([]);
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
        setReviewFiles(agent.testimonials.map(() => null));
        setDroppedReviewPhotos([]);
        setExistingPhoto(agent.photoUrl);
        setKeptSales(agent.salesPhotoPaths.flatMap((path, index) => {
          const url = agent.salesPhotoUrls[index];
          return url ? [{ path, url }] : [];
        }));
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

  useEffect(() => {
    const urls = salesFiles.map((file) => URL.createObjectURL(file));
    setSalesPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [salesFiles]);

  function addSalesFiles(list: FileList | null) {
    const incoming = [...(list ?? [])];
    if (incoming.length === 0) return;
    const invalid = incoming.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalid) {
      setFormError("Use JPG, PNG, or WebP photos under 2 MB. 1200 × 800 pixels keeps every card the same size.");
      setSalesInputKey((key) => key + 1);
      return;
    }
    if (keptSales.length + salesFiles.length + incoming.length > 12) {
      setFormError("Add up to 12 sales photos.");
      setSalesInputKey((key) => key + 1);
      return;
    }
    setFormError("");
    setSalesFiles((current) => [...current, ...incoming]);
    setSalesInputKey((key) => key + 1);
  }

  useEffect(() => {
    const urls = reviewFiles.map((file) => (file ? URL.createObjectURL(file) : null));
    setReviewPreviews(urls);
    return () => urls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }, [reviewFiles]);

  function setReviewFile(index: number, file: File | null) {
    if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024)) {
      setFormError("Use a JPG, PNG, or WebP photo under 2 MB. 800 × 800 pixels keeps every review photo the same size.");
      return;
    }
    setFormError("");
    setReviewFiles((current) => {
      const next = current.slice();
      while (next.length <= index) next.push(null);
      next[index] = file;
      return next;
    });
  }

  function removeTestimonial(index: number) {
    const current = input.testimonials[index];
    if (current?.photoPath) setDroppedReviewPhotos((paths) => [...paths, current.photoPath as string]);
    setInput((form) => ({
      ...form,
      testimonials: form.testimonials.filter((_, itemIndex) => itemIndex !== index),
    }));
    setReviewFiles((files) => files.filter((_, itemIndex) => itemIndex !== index));
  }

  function clearReviewPhoto(index: number) {
    const current = input.testimonials[index];
    if (current?.photoPath) setDroppedReviewPhotos((paths) => [...paths, current.photoPath as string]);
    setInput((form) => ({
      ...form,
      testimonials: form.testimonials.map((item, itemIndex) => (
        itemIndex === index ? { ...item, photoPath: null, photoUrl: null } : item
      )),
    }));
    setReviewFile(index, null);
  }

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
        .map((item) => ({ name: item.name.trim(), quote: item.quote.trim(), photoPath: item.photoPath, photoUrl: item.photoUrl }))
        .filter((item) => item.name || item.quote),
    };
    setInput(ready);
    const nextErrors = validateAgent(ready);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;
    const dropped = [...droppedReviewPhotos];
    const paired = input.testimonials.flatMap((item, index) => {
      const name = item.name.trim();
      const quote = item.quote.trim();
      if (!name && !quote) {
        if (item.photoPath) dropped.push(item.photoPath);
        return [];
      }
      return [{ item: { ...item, name, quote, photoPath: item.photoPath ?? null }, file: reviewFiles[index] ?? null }];
    });
    setPending(true);
    let uploadedPhoto: string | null = null;
    let uploadedVideo: string | null = null;
    const uploadedSales: string[] = [];
    const uploadedReviews: string[] = [];
    try {
      if (photo) uploadedPhoto = await uploadAgentPhoto(photo);
      if (video) uploadedVideo = await uploadAgentVideo(video);
      for (const file of salesFiles) uploadedSales.push(await uploadSalesPhoto(file));
      const prepared = [];
      for (const entry of paired) {
        let reviewPath = entry.item.photoPath;
        if (entry.file) {
          const next = await uploadSalesPhoto(entry.file, "Use a JPG, PNG, or WebP photo under 2 MB. 800 × 800 pixels keeps every review photo the same size.");
          uploadedReviews.push(next);
          if (reviewPath) dropped.push(reviewPath);
          reviewPath = next;
        }
        prepared.push({ name: entry.item.name, quote: entry.item.quote, photoPath: reviewPath, photoUrl: null });
      }
      const withReviews: AgentInput = { ...ready, testimonials: prepared };
      const photoPath = uploadedPhoto ?? saved?.photoPath ?? null;
      const videoPath = video && uploadedVideo
        ? uploadedVideo
        : videoRemoved
          ? null
          : saved?.videoPath ?? null;
      const salesPaths = [...keptSales.map((item) => item.path), ...uploadedSales];
      const agent = editing && pageIdentifier
        ? await updateAgent(pageIdentifier, withReviews, photoPath, videoPath, salesPaths)
        : await createAgent(withReviews, uploadedPhoto, uploadedVideo, salesPaths);
      if (uploadedPhoto && saved?.photoPath && uploadedPhoto !== saved.photoPath) await removeAgentPhoto(saved.photoPath);
      if (saved?.videoPath && saved.videoPath !== agent.videoPath) await removeAgentVideo(saved.videoPath);
      const removedSales = (saved?.salesPhotoPaths ?? []).filter((path) => !salesPaths.includes(path));
      await Promise.all(removedSales.map((path) => removeAgentPhoto(path)));
      await Promise.all(dropped.map((path) => removeAgentPhoto(path)));
      setSaved(agent);
      setExistingPhoto(agent.photoUrl);
      setKeptSales(agent.salesPhotoPaths.flatMap((path, index) => {
        const url = agent.salesPhotoUrls[index];
        return url ? [{ path, url }] : [];
      }));
      setInput((current) => ({ ...current, testimonials: agent.testimonials }));
      setReviewFiles(agent.testimonials.map(() => null));
      setDroppedReviewPhotos([]);
      setPhoto(null);
      setVideo(null);
      setSalesFiles([]);
      setVideoRemoved(false);
      setVideoInputKey((key) => key + 1);
    } catch (reason) {
      if (uploadedPhoto) await removeAgentPhoto(uploadedPhoto);
      if (uploadedVideo) await removeAgentVideo(uploadedVideo);
      await Promise.all(uploadedSales.map((path) => removeAgentPhoto(path)));
      await Promise.all(uploadedReviews.map((path) => removeAgentPhoto(path)));
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
            Proof of sales
            <input
              key={salesInputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => addSalesFiles(event.target.files)}
            />
          </label>
          <p className="page-link-note">
            Upload the photos here. They are stored in your cloud, not pasted as links.
            Use 1200 × 800 pixels (3:2), JPG, PNG, or WebP, under 2 MB each. Up to 12 photos. That size keeps every card the same.
          </p>
          {(keptSales.length > 0 || salesPreviews.length > 0) && (
            <div className="sales-editor">
              {keptSales.map((item) => (
                <figure key={item.path}>
                  <img src={item.url} alt="" />
                  <button
                    className="btn quiet"
                    type="button"
                    onClick={() => setKeptSales((current) => current.filter((photoItem) => photoItem.path !== item.path))}
                  >
                    Remove
                  </button>
                </figure>
              ))}
              {salesPreviews.map((src, index) => (
                <figure key={src}>
                  <img src={src} alt="" />
                  <button
                    className="btn quiet"
                    type="button"
                    onClick={() => setSalesFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                  >
                    Remove
                  </button>
                </figure>
              ))}
            </div>
          )}
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
                <label>
                  Customer photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setReviewFile(index, event.target.files?.[0] ?? null)}
                  />
                </label>
                {(reviewPreviews[index] || item.photoUrl) && (
                  <img className="review-photo" src={reviewPreviews[index] || item.photoUrl || ""} alt="" />
                )}
                {(reviewFiles[index] || item.photoPath) && (
                  <button className="btn quiet" type="button" onClick={() => clearReviewPhoto(index)}>
                    Remove photo
                  </button>
                )}
                <button
                  className="btn quiet"
                  type="button"
                  onClick={() => removeTestimonial(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="btn quiet"
              type="button"
              disabled={input.testimonials.length >= 40}
              onClick={() => {
                setInput((current) => ({
                  ...current,
                  testimonials: [...current.testimonials, { name: "", quote: "", photoPath: null, photoUrl: null }],
                }));
                setReviewFiles((files) => [...files, null]);
              }}
            >
              Add testimonial
            </button>
            {errors.testimonials && <span className="form-error">{errors.testimonials}</span>}
          </fieldset>
          <p className="page-link-note">
            A testimonial photo is optional. Upload it here so it is stored in your cloud, not pasted as a link.
            Use 800 × 800 pixels (1:1), JPG, PNG, or WebP, under 2 MB. That size keeps every review photo the same.
          </p>
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
