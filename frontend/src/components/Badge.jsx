const STATUS_MAP = {
  lost: { label: "Lost", tone: "lost" },
  found: { label: "Found", tone: "found" },
  open: { label: "Open", tone: "found" },
  matched: { label: "Matched", tone: "matched" },
  resolved: { label: "Resolved", tone: "resolved" },
  pending: { label: "Pending", tone: "pending" },
  active: { label: "Active", tone: "active" },
  suspended: { label: "Suspended", tone: "suspended" },
};

export default function Badge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, tone: "resolved" };
  return <span className={`badge badge--${cfg.tone}`}>{cfg.label}</span>;
}
