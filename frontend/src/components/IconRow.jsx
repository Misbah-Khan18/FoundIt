import { UserCheck, Sparkles, Lock } from "lucide-react";
import "./IconRow.css";

const ITEMS = [
  { icon: <UserCheck size={22} strokeWidth={2} />, label: "Verified users" },
  { icon: <Sparkles size={22} strokeWidth={2} />, label: "Smart matching" },
  { icon: <Lock size={22} strokeWidth={2} />, label: "Secure claims" },
];

export default function IconRow() {
  return (
    <section className="icon-row section" id="browse">
      <div className="section-inner icon-row__grid">
        {ITEMS.map((item) => (
          <div className="icon-row__card" key={item.label}>
            <span className="icon-row__icon">{item.icon}</span>
            <span className="icon-row__label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
