import { useState } from "react";
import { X, Compass, MapPin, ArrowRightLeft } from "lucide-react";

export default function ParkingMapModal({ isOpen, onClose }) {
  const [selectedZone, setSelectedZone] = useState("ground"); // "ground" or "lower"

  if (!isOpen) return null;

  const groundSlots = [
    { id: "G-01", status: "occupied" },
    { id: "G-02", status: "available" },
    { id: "G-03", status: "item-reported", item: "Set of Keys" },
    { id: "G-04", status: "occupied" },
    { id: "G-05", status: "available" },
    { id: "G-06", status: "available" },
    { id: "G-07", status: "occupied" },
    { id: "G-08", status: "available" },
    { id: "G-09", status: "item-reported", item: "Student ID Card" },
    { id: "G-10", status: "occupied" },
    { id: "G-11", status: "available" },
    { id: "G-12", status: "available" },
  ];

  const lowerSlots = [
    { id: "LG-01", status: "available" },
    { id: "LG-02", status: "occupied" },
    { id: "LG-03", status: "occupied" },
    { id: "LG-04", status: "available" },
    { id: "LG-05", status: "item-reported", item: "Wired Earphones" },
    { id: "LG-06", status: "available" },
    { id: "LG-07", status: "occupied" },
    { id: "LG-08", status: "occupied" },
    { id: "LG-09", status: "available" },
    { id: "LG-10", status: "available" },
    { id: "LG-11", status: "occupied" },
    { id: "LG-12", status: "available" },
    { id: "LG-13", status: "item-reported", item: "Blue Backpack" },
    { id: "LG-14", status: "occupied" },
    { id: "LG-15", status: "available" },
  ];

  const currentSlots = selectedZone === "ground" ? groundSlots : lowerSlots;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(30, 54, 116, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#ffffff",
          borderRadius: "14px",
          boxShadow: "var(--shadow-xl)",
          padding: "24px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "var(--ivory)",
            border: "1px solid var(--border-light)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--slate-500)"
          }}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 700, color: "var(--navy-950)" }}>
            Campus Parking Floor Plan
          </h3>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--slate-500)" }}>
            Choose a level to locate zones and reported items in the girls or boys parking lots.
          </p>
        </div>

        {/* Level Switch Selector */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div 
            style={{
              display: "inline-flex",
              background: "var(--ivory)",
              padding: "4px",
              borderRadius: "999px",
              border: "1px solid var(--border-light)"
            }}
          >
            <button
              onClick={() => setSelectedZone("ground")}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                background: selectedZone === "ground" ? "var(--red-500)" : "transparent",
                color: selectedZone === "ground" ? "#ffffff" : "var(--slate-600)",
                transition: "all 0.2s ease"
              }}
            >
              Ground Floor (Girls)
            </button>
            <button
              onClick={() => setSelectedZone("lower")}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                background: selectedZone === "lower" ? "var(--blue-500)" : "transparent",
                color: selectedZone === "lower" ? "#ffffff" : "var(--slate-600)",
                transition: "all 0.2s ease"
              }}
            >
              Lower Ground (Boys)
            </button>
          </div>
        </div>

        {/* Map Grid */}
        <div 
          style={{
            background: "radial-gradient(circle at center, #fbfbfb 0%, #f5f6f8 100%)",
            borderRadius: "10px",
            border: "1.5px dashed var(--border-light)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: "260px"
          }}
        >
          <div style={{ position: "absolute", top: "10px", left: "12px", display: "flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700 }}>
            <MapPin size={10} /> Entry
          </div>
          <div style={{ position: "absolute", bottom: "10px", right: "12px", display: "flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700 }}>
            <ArrowRightLeft size={10} /> Ramp
          </div>

          <div 
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px 14px",
              width: "100%",
              maxWidth: "400px",
              margin: "12px 0"
            }}
          >
            {currentSlots.map((slot) => {
              let bg = "#ffffff";
              let border = "1px solid var(--border-light)";
              let color = "var(--ink)";

              if (slot.status === "occupied") {
                bg = selectedZone === "ground" ? "rgba(210, 31, 43, 0.05)" : "rgba(30, 54, 116, 0.04)";
                border = selectedZone === "ground" ? "1px solid rgba(210, 31, 43, 0.12)" : "1px solid rgba(30, 54, 116, 0.12)";
                color = "var(--slate-400)";
              } else if (slot.status === "item-reported") {
                bg = "rgba(201, 165, 72, 0.14)";
                border = "1.5px solid var(--gold-600)";
                color = "var(--gold-700)";
              }

              return (
                <div
                  key={slot.id}
                  style={{
                    background: bg,
                    border: border,
                    borderRadius: "6px",
                    padding: "10px 6px",
                    textAlign: "center",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: color }}>
                    {slot.id}
                  </div>
                  <div style={{ fontSize: "0.55rem", color: slot.status === "item-reported" ? "var(--gold-700)" : "var(--slate-400)", marginTop: "2px" }}>
                    {slot.status === "item-reported" ? "⚠️ Item" : slot.status.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--slate-500)", borderTop: "1px solid var(--border-light)", paddingTop: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "12px", background: "#ffffff", border: "1px solid var(--border-light)", borderRadius: "3px" }} />
            <span>Available</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "12px", background: "rgba(30, 54, 116, 0.04)", border: "1px solid rgba(30, 54, 116, 0.12)", borderRadius: "3px" }} />
            <span>Occupied</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "12px", height: "12px", background: "rgba(201, 165, 72, 0.14)", border: "1.5px solid var(--gold-600)", borderRadius: "3px" }} />
            <span style={{ fontWeight: 600 }}>Active Item ⚠️</span>
          </div>
        </div>

      </div>
    </div>
  );
}
