const STATUS_MAP = {
  lost: { label: "Lost", tone: "lost" },
  found: { label: "Found", tone: "found" },
  open: { label: "Open", tone: "found" },
  matched: { label: "Matched", tone: "matched" },
  resolved: { label: "Resolved", tone: "resolved" },
  pending: { label: "Pending", tone: "pending" },
  under_review: { label: "Under Review", tone: "under_review" },
  claimed: { label: "Claimed", tone: "claimed" },
  active: { label: "Active", tone: "active" },
  rejected: { label: "Rejected", tone: "rejected" },
  suspended: { label: "Suspended", tone: "suspended" },
};

export default function Badge({ status }) {
  const norm = (status || "active").toLowerCase();
  const cfg = STATUS_MAP[norm] || { label: status, tone: "active" };
  return <span className={`badge badge--${cfg.tone}`}>{cfg.label}</span>;
}
