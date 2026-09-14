/* eslint-disable react-refresh/only-export-components */
import { CheckCircle2, Clock, Search, ShieldCheck, Check } from "lucide-react";

const STAGES = [
  { key: "reported", label: "Reported", icon: Clock },
  { key: "under_review", label: "Under Review", icon: Search },
  { key: "matched", label: "Potential Match", icon: CheckCircle2 },
  { key: "claimed", label: "Claim / Verify", icon: ShieldCheck },
  { key: "resolved", label: "Resolved", icon: Check },
];

export function getStageIndex(status = "active") {
  const norm = (status || "").toLowerCase();
  if (norm === "resolved") return 4;
  if (norm === "claimed") return 3;
  if (norm === "matched") return 2;
  if (norm === "under_review") return 1;
  return 0; // "active" or "reported" or "open"
}

export default function StatusTimeline({ status = "active", itemType = "lost", compact = false }) {
  const currentIndex = getStageIndex(status);

  return (
    <div style={{ margin: compact ? "12px 0 6px" : "20px 0 12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {/* Background track line */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            right: "14px",
            height: "3px",
            background: "var(--border-light)",
            zIndex: 0,
          }}
        />

        {/* Active progress line */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            width: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
            maxWidth: "calc(100% - 28px)",
            height: "3px",
            background: itemType === "lost" ? "var(--navy-900)" : "var(--blue-500)",
            transition: "width 0.4s ease",
            zIndex: 1,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                position: "relative",
                zIndex: 2,
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isCurrent
                    ? (itemType === "lost" ? "var(--navy-900)" : "var(--blue-500)")
                    : isDone
                    ? "var(--navy-900)"
                    : "#ffffff",
                  color: isDone ? "#ffffff" : "var(--slate-500)",
                  border: isDone ? "none" : "2px solid var(--border-light)",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(30, 54, 116, 0.15)" : "none",
                  transition: "all 0.25s ease",
                }}
                title={stage.label}
              >
                <Icon size={13} strokeWidth={2.5} />
              </div>

              {!compact && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "var(--navy-900)" : isDone ? "var(--ink)" : "var(--slate-500)",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {stage.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
