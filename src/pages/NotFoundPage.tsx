import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page">
      <h1 className="page-title">Page not found</h1>
      <Link className="btn" to="/">
        Back home
      </Link>
    </main>
  );
}
