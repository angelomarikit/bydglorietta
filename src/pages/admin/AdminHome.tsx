import { Link } from "react-router-dom";

export function AdminHome() {
  return (
    <div className="admin-panel">
      <p className="kicker">BYD Glorietta</p>
      <h1>Choose a section</h1>
      <p className="admin-lead">The public site stays as it is until you open a section and save a change.</p>
      <div className="admin-choices">
        <Link to="/admin/website">
          <strong>Website</strong>
          <span>Edit the words on the public pages.</span>
        </Link>
        <Link to="/admin/agents">
          <strong>Sales Agents</strong>
          <span>Create a page, then copy its link.</span>
        </Link>
      </div>
    </div>
  );
}
