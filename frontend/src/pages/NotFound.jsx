import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <section className="section">
      <div className="section-inner not-found">
        <span className="eyebrow not-found__code">404</span>
        <h1 className="not-found__heading">Page not found</h1>
        <p className="not-found__desc">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn btn--emerald">
          <Compass size={16} strokeWidth={2} />
          Back to Home
        </Link>
      </div>
    </section>
  );
}
