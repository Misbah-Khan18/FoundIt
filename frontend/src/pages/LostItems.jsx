import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHero from "../components/PageHero.jsx";
import ItemCard from "../components/ItemCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { CATEGORIES, CAMPUS_LOCATIONS } from "../data/mockItems.js";
import { useReports } from "../context/ReportsContext.jsx";
import "../components/ItemsPage.css";

export default function LostItems() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const { items: allReports } = useReports();

  const items = useMemo(() => {
    return allReports
      .filter((item) => item.type === "lost")
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => location === "all" || item.location === location)
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [allReports, query, category, location]);

  return (
    <>
      <PageHero
        eyebrow="Browse reports"
        title="Lost Items"
        subtitle="Items the MIT-WPU community has reported missing across campus."
      />

      <section className="section">
        <div className="section-inner">
          <div className="items-page__filters">
            <div className="items-page__search">
              <Search size={16} strokeWidth={2} />
              <input
                className="input"
                placeholder="Search lost items..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="select" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="all">All locations</option>
              {CAMPUS_LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {items.length > 0 ? (
            <div className="items-page__grid">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search size={22} strokeWidth={2} />}
              title="No matching items"
              description="Try a different search term, category, or location."
            />
          )}
        </div>
      </section>
    </>
  );
}
