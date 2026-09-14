import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import Badge from "./Badge.jsx";
import "./ItemCard.css";

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-card__top">
        <Badge status={item.type} />
        <span className="item-card__id">{item.id}</span>
      </div>
      <h3 className="item-card__title">{item.title}</h3>
      <p className="item-card__desc">{item.description}</p>
      <div className="item-card__meta">
        <span><MapPin size={13} strokeWidth={2} /> {item.location}</span>
        <span><Calendar size={13} strokeWidth={2} /> {item.date}</span>
      </div>
    </Link>
  );
}
