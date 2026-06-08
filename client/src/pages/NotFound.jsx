import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container empty" style={{ paddingTop: 90 }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>
      <p>This page wandered off into the void.</p>
      <Link to="/" className="btn btn-primary">
        Back to Explore
      </Link>
    </div>
  );
}
