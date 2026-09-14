
export default function PageHero({ eyebrow, title, subtitle, actions }) {
  return (
    <section className="page-hero">
      <div className="page-hero__inner">
        {eyebrow && <span className="eyebrow page-hero__eyebrow">{eyebrow}</span>}
        <h1 className="page-hero__heading">{title}</h1>
        {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
        {actions && <div className="page-hero__actions">{actions}</div>}
      </div>
    </section>
  );
}
