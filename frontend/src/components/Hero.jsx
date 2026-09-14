import { Search, ShieldCheck } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp.js";
import DotGrid from "./DotGrid.jsx";
import "./Hero.css";

function ActionCard({ icon, title, description, ctaLabel, onClick }) {
  return (
    <div className="action-card">
      <div className="action-card__icon">{icon}</div>
      <h3 className="action-card__title">{title}</h3>
      <p className="action-card__desc">{description}</p>
      <button className="btn btn--emerald action-card__cta" onClick={onClick}>
        {ctaLabel}
      </button>
    </div>
  );
}

export default function Hero({ onReport, activeReports }) {
  const displayActive = useCountUp(activeReports);

  return (
    <section className="hero" id="home">
      <div className="hero__dotgrid" aria-hidden="true">
        <DotGrid
          dotSize={4}
          gap={22}
          baseColor="#d6e0ec"
          activeColor="#1e3674"
          proximity={120}
          shockRadius={240}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="hero__content">
        <span className="eyebrow hero__eyebrow">MIT-WPU Digital Portal</span>
        <h1 className="hero__heading">
          MIT-WPU Lost
          <br />
          <span className="hero__heading-accent">&amp; Found</span>
        </h1>
        <p className="hero__subtitle">Report. Search. Recover.</p>

        <div className="hero__live" role="status" aria-live="polite">
          <span className="hero__live-dot" aria-hidden="true" />
          <span className="hero__live-text">
            <strong>{displayActive}</strong> active campus reports
          </span>
        </div>

        <div className="hero__cards">
          <ActionCard
            icon={<Search size={22} strokeWidth={2.2} />}
            title="Lost Something?"
            description="Report your lost item and check if someone's already found it."
            ctaLabel="Report Lost"
            onClick={() => onReport("lost")}
          />
          <ActionCard
            icon={<ShieldCheck size={22} strokeWidth={2.2} />}
            title="Found Something?"
            description="Log the item you found so the owner can be matched and notified."
            ctaLabel="Report Found"
            onClick={() => onReport("found")}
          />
        </div>
      </div>
    </section>
  );
}
