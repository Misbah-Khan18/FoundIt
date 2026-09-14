import React from "react";

export default function ParkingSlot({ slot, onClick }) {
  const getStatusConfig = () => {
    switch (slot.status) {
      case "available":
        return {
          bg: "rgba(34, 197, 94, 0.1)", // Green tint
          border: "2px solid #22c55e",  // Strong green border
          color: "#166534",             // Dark green text
          label: "Available",
          dotColor: "#22c55e",
          cursor: "pointer"
        };
      case "occupied":
        return {
          bg: "rgba(239, 68, 68, 0.05)",  // Red tint
          border: "1.5px solid #ef4444",   // Red border
          color: "#991b1b",               // Dark red text
          label: "Occupied",
          dotColor: "#ef4444",
          cursor: "not-allowed"
        };
      case "reserved":
      default:
        return {
          bg: "rgba(245, 158, 11, 0.08)", // Yellow/orange tint
          border: "1.5px solid #f59e0b",   // Yellow border
          color: "#92400e",               // Dark yellow text
          label: "Reserved",
          dotColor: "#f59e0b",
          cursor: "not-allowed"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      onClick={slot.status === "available" ? onClick : undefined}
      style={{
        background: config.bg,
        border: config.border,
        borderRadius: "14px",
        padding: "16px 12px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
        cursor: config.cursor,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        position: "relative"
      }}
      className={slot.status === "available" ? "hover:scale-105 hover:shadow-md" : ""}
    >
      {/* Slot Identification */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)" }}>
        {slot.id}
      </div>
      
      {/* Status Label & Indicator */}
      <div 
        style={{ 
          fontSize: "0.72rem", 
          fontWeight: 700, 
          color: config.color, 
          marginTop: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <span 
          style={{ 
            width: "6px", 
            height: "6px", 
            borderRadius: "50%", 
            background: config.dotColor,
            display: "inline-block" 
          }} 
        />
        {config.label}
      </div>
    </div>
  );
}
