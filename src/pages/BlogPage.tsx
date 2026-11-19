import { Link } from "react-router-dom";
import { FrameImage } from "../components/FrameImage";
import { useWebsite } from "../components/website-context";
import { posts } from "../data/content";
import { storedImage } from "../lib/website";

export function BlogPage() {
  const { copy } = useWebsite();
  return (
    <main className="page">
      <p className="kicker">{copy.blog.kicker}</p>
      <h1 className="page-title">{copy.blog.title}</h1>
      <div className="news-grid">
        {copy.notes.map((note) => {
          const post = posts.find((item) => item.slug === note.slug);
          if (!post) return null;
          return (
          <Link key={note.slug} to={`/blog/${note.slug}`} className="news-card">
            <FrameImage src={storedImage(note.image, post.image)} alt="" ratio={post.ratio} />
            <p className="kicker" style={{ marginTop: 16 }}>
              {post.date}
            </p>
            <h3>{note.title}</h3>
            <p className="muted">{note.excerpt}</p>
          </Link>
          );
        })}
      </div>
    </main>
  );
}
