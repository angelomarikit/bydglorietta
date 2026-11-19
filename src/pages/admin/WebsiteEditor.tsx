import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { posts } from "../../data/content";
import { websiteCopy, websiteSections, type WebsiteSectionKey } from "../../data/website";
import { useWebsite } from "../../components/website-context";
import { isStoredImage, removeWebsiteImage, saveWebsiteNotes, saveWebsiteSection, stageWebsiteImages, storedImage } from "../../lib/website";

export function WebsiteEditor() {
  const { ready } = useWebsite();
  const { section, slug } = useParams();
  const page = websiteSections.find((item) => item.key === section);

  if (!ready) {
    return (
      <div className="editor" aria-busy="true">
        <p>Loading page.</p>
      </div>
    );
  }
  if (slug) return <NoteEditor slug={slug} />;
  if (!page) {
    return (
      <div className="editor">
        <h1>Page not found</h1>
        <Link className="btn editor-back" to="/admin/website">
          <ArrowLeft size={16} />
          Back to pages
        </Link>
      </div>
    );
  }
  return <SectionEditor section={page.key} />;
}

function SectionEditor({ section }: { section: WebsiteSectionKey }) {
  const page = websiteSections.find((item) => item.key === section)!;
  const { copy, refresh } = useWebsite();
  const [fields, setFields] = useState<Record<string, string>>({ ...copy[section] });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  function setField(key: string, value: string) {
    setSaved(false);
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved(false);
    const imageKeys = page.fields.filter((field) => field.image).map((field) => field.key);
    try {
      const staged = await stageWebsiteImages(section, fields, files, imageKeys);
      try {
        await saveWebsiteSection(section, staged.next);
      } catch (reason) {
        await Promise.all(staged.uploaded.map((path) => removeWebsiteImage(path)));
        throw reason;
      }
      await Promise.all(
        imageKeys
          .filter((key) => files[key] && isStoredImage(fields[key] ?? "") && fields[key] !== staged.next[key])
          .map((key) => removeWebsiteImage(fields[key])),
      );
      setFields(staged.next);
      setFiles({});
      await refresh();
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This page could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="editor" onSubmit={submit}>
      <header className="editor-head">
        <Link className="btn editor-back" to="/admin/website">
          <ArrowLeft size={16} />
          Back to pages
        </Link>
        <p className="kicker">Website</p>
        <h1>{page.label}</h1>
        <p className="admin-lead">{page.detail}</p>
      </header>
      {page.fields.map((field, index) =>
        field.image ? (
          <PhotoField
            key={field.key}
            index={index + 1}
            label={field.label}
            ratio={field.ratio ?? "1080 / 553"}
            src={storedImage(fields[field.key], field.fallback ?? "")}
            file={files[field.key]}
            onFile={(file) => {
              setSaved(false);
              setFiles((current) => {
                const next = { ...current };
                if (file) next[field.key] = file;
                else delete next[field.key];
                return next;
              });
            }}
          />
        ) : (
          <article className="editor-card" key={field.key}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <label>
              {field.label}
              {field.long ? (
                <textarea value={fields[field.key] ?? ""} onChange={(event) => setField(field.key, event.target.value)} />
              ) : (
                <input value={fields[field.key] ?? ""} onChange={(event) => setField(field.key, event.target.value)} />
              )}
            </label>
          </article>
        ),
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="editor-save">
        <p>{saved ? "Saved. The public page is using this now." : "Photographs are stored with the website."}</p>
        <button className="btn gold" type="submit" disabled={pending}>
          {pending ? "Saving" : "Save page"}
        </button>
      </div>
    </form>
  );
}

function NoteEditor({ slug }: { slug: string }) {
  const base = posts.find((post) => post.slug === slug);
  const { copy, refresh } = useWebsite();
  const current = copy.notes.find((note) => note.slug === slug) ?? websiteCopy.notes.find((note) => note.slug === slug);
  const [title, setTitle] = useState(current?.title ?? "");
  const [excerpt, setExcerpt] = useState(current?.excerpt ?? "");
  const [body, setBody] = useState(current?.body ?? "");
  const [image, setImage] = useState(current?.image ?? "");
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  if (!base || !current) {
    return (
      <div className="editor">
        <h1>Note not found</h1>
        <Link className="btn editor-back" to="/admin/website">
          <ArrowLeft size={16} />
          Back to pages
        </Link>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const staged = await stageWebsiteImages("notes", { image }, file ? { image: file } : {}, ["image"]);
      const notes = copy.notes.map((note) =>
        note.slug === slug ? { ...note, title, excerpt, body, image: staged.next.image } : note,
      );
      try {
        await saveWebsiteNotes(notes);
      } catch (reason) {
        await Promise.all(staged.uploaded.map((path) => removeWebsiteImage(path)));
        throw reason;
      }
      if (file && isStoredImage(image) && image !== staged.next.image) await removeWebsiteImage(image);
      setImage(staged.next.image);
      setFile(undefined);
      await refresh();
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This note could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="editor" onSubmit={submit}>
      <header className="editor-head">
        <Link className="btn editor-back" to="/admin/website">
          <ArrowLeft size={16} />
          Back to pages
        </Link>
        <p className="kicker">Showroom note</p>
        <h1>{title || base.title}</h1>
      </header>
      <article className="editor-card">
        <span>01</span>
        <label>
          Title
          <input value={title} onChange={(event) => { setSaved(false); setTitle(event.target.value); }} />
        </label>
      </article>
      <article className="editor-card">
        <span>02</span>
        <label>
          Summary
          <textarea value={excerpt} onChange={(event) => { setSaved(false); setExcerpt(event.target.value); }} />
        </label>
      </article>
      <PhotoField
        index={3}
        label="Photograph"
        ratio={base.ratio}
        src={storedImage(image, base.image)}
        file={file}
        onFile={(next) => {
          setSaved(false);
          setFile(next);
        }}
      />
      <article className="editor-card">
        <span>04</span>
        <label>
          Note
          <textarea value={body} onChange={(event) => { setSaved(false); setBody(event.target.value); }} />
          <small>Leave a blank line between paragraphs.</small>
        </label>
      </article>
      {error && <p className="form-error">{error}</p>}
      <div className="editor-save">
        <p>{saved ? "Saved. The public note is using this now." : "The photograph is stored with the website."}</p>
        <button className="btn gold" type="submit" disabled={pending}>
          {pending ? "Saving" : "Save note"}
        </button>
      </div>
    </form>
  );
}

function PhotoField({
  index,
  label,
  ratio,
  src,
  file,
  onFile,
}: {
  index: number;
  label: string;
  ratio: string;
  src: string;
  file?: File;
  onFile: (file: File | undefined) => void;
}) {
  const preview = useObjectUrl(file);
  return (
    <article className="editor-card">
      <span>{String(index).padStart(2, "0")}</span>
      <div className="editor-photo-field">
        <p>{label}</p>
        <div className="editor-photo" style={{ aspectRatio: ratio }}>
          <img src={preview || src} alt="" />
        </div>
        <label className="btn quiet editor-replace">
          {file ? "Photograph chosen" : "Replace photograph"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onFile(event.target.files?.[0])}
          />
        </label>
      </div>
    </article>
  );
}

function useObjectUrl(file?: File) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
