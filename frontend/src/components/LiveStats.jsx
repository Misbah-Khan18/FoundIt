import { PackageSearch, HandHeart, CheckCircle2, Activity } from "lucide-react";
import StatCard from "./StatCard.jsx";
import "./LiveStats.css";

export default function LiveStats({ stats }) {
  return (
    <section className="live-stats section" aria-label="Live campus activity">
      <div className="section-inner">
        <div className="live-stats__header">
          <span className="live-stats__badge">
            <span className="live-stats__badge-dot" aria-hidden="true" />
            Live
          </span>
          <h2 className="live-stats__heading">Campus activity right now</h2>
        </div>

        <div className="live-stats__grid">
          <StatCard tone="lost" icon={<PackageSearch size={20} strokeWidth={2} />} value={stats.lost} label="Lost items reported" />
          <StatCard tone="found" icon={<HandHeart size={20} strokeWidth={2} />} value={stats.found} label="Found items logged" />
          <StatCard tone="reunited" icon={<CheckCircle2 size={20} strokeWidth={2} />} value={stats.reunited} label="Successfully reunited" />
          <StatCard tone="active" icon={<Activity size={20} strokeWidth={2} />} value={stats.active} label="Open reports" />
        </div>
      </div>
    </section>
  );
}
