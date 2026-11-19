import { Link } from "react-router-dom";
import { useWebsite } from "../../components/website-context";
import { websiteSections } from "../../data/website";

export function WebsitePage() {
  const { copy } = useWebsite();
  return (
    <div className="pages-screen">
      <div className="admin-panel">
      <p className="kicker">Website</p>
      <h1>Pages</h1>
      <p className="admin-lead">Open a page to edit its words. Nothing changes on the site until you save.</p>
      <div className="admin-choices">
        {websiteSections.map((section) => (
          <Link key={section.key} to={`/admin/website/${section.key}`}>
            <strong>{section.label}</strong>
            <span>{section.detail}</span>
          </Link>
        ))}
        {copy.notes.map((note) => (
          <Link key={note.slug} to={`/admin/website/notes/${note.slug}`}>
            <strong>{note.title}</strong>
            <span>Showroom note</span>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
