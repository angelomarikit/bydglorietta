import { NavLink, Outlet } from "react-router-dom";
import { photos } from "../../data/content";
import { supabase } from "../../lib/supabase";

export function AdminShell() {
  return (
    <div className="admin-app">
      <aside className="admin-nav">
        <NavLink to="/admin" end className="admin-brand">
          <img src={photos.logoGrey} alt="BYD" />
          <span>Admin</span>
        </NavLink>
        <nav>
          <NavLink to="/admin/website">Website</NavLink>
          <NavLink to="/admin/agents">Sales Agents</NavLink>
        </nav>
        <button className="btn quiet" type="button" onClick={() => supabase?.auth.signOut()}>
          Log out
        </button>
      </aside>
      <main className="admin-stage">
        <Outlet />
      </main>
    </div>
  );
}
