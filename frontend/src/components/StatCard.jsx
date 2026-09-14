import { useCountUp } from "../hooks/useCountUp.js";
import "./StatCard.css";

export default function StatCard({ icon, value, label, tone = "active" }) {
  const display = useCountUp(value);
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon">{icon}</span>
      <span className="stat-card__value">{display.toLocaleString()}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
