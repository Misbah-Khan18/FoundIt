export default function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">{icon}</span>
      <span className="empty-state__title">{title}</span>
      {description && <p>{description}</p>}
    </div>
  );
}
