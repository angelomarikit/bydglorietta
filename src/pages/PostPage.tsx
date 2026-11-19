import { Link, useParams } from "react-router-dom";
import { FrameImage } from "../components/FrameImage";
import { useWebsite } from "../components/website-context";
import { posts } from "../data/content";
import { noteParagraphs, storedImage } from "../lib/website";

export function PostPage() {
  const { slug } = useParams();
  const { copy } = useWebsite();
  const base = posts.find((item) => item.slug === slug);
  const note = copy.notes.find((item) => item.slug === slug);

  if (!base || !note) {
    return (
      <main className="page">
        <h1 className="page-title">Note not found</h1>
        <Link className="btn" to="/blog">
          Back to notes
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="crumbs">
        <Link to="/blog">Showroom notes</Link>
        <span>/</span>
        <span>{base.category}</span>
      </p>
      <h1 className="page-title">{note.title}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        {base.date} · BYD Glorietta
      </p>
      <FrameImage src={storedImage(note.image, base.image)} alt="" ratio={base.ratio} priority />
      <div className="post-body" style={{ marginTop: 28 }}>
        {noteParagraphs(note.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
