import { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import { Info, MapPin, Compass, ShieldAlert, ArrowRightLeft } from "lucide-react";

export default function ParkingMap() {
  const [selectedZone, setSelectedZone] = useState("ground"); // "ground" or "lower"

  // Mock slot status/data for Ground Floor (Girls Parking)
  const groundSlots = [
    { id: "G-01", status: "occupied", type: "Two-wheeler" },
    { id: "G-02", status: "available", type: "Two-wheeler" },
    { id: "G-03", status: "item-reported", type: "Two-wheeler", item: "Set of Keys" },
    { id: "G-04", status: "occupied", type: "Two-wheeler" },
    { id: "G-05", status: "available", type: "Two-wheeler" },
    { id: "G-06", status: "available", type: "Two-wheeler" },
    { id: "G-07", status: "occupied", type: "Two-wheeler" },
    { id: "G-08", status: "available", type: "Two-wheeler" },
    { id: "G-09", status: "item-reported", type: "Two-wheeler", item: "Student ID Card" },
    { id: "G-10", status: "occupied", type: "Two-wheeler" },
    { id: "G-11", status: "available", type: "Two-wheeler" },
    { id: "G-12", status: "available", type: "Two-wheeler" },
  ];

  // Mock slot status/data for Lower Ground (Boys Parking)
  const lowerSlots = [
    { id: "LG-01", status: "available", type: "Two-wheeler" },
    { id: "LG-02", status: "occupied", type: "Two-wheeler" },
    { id: "LG-03", status: "occupied", type: "Two-wheeler" },
    { id: "LG-04", status: "available", type: "Two-wheeler" },
    { id: "LG-05", status: "item-reported", type: "Two-wheeler", item: "Wired Earphones" },
    { id: "LG-06", status: "available", type: "Two-wheeler" },
    { id: "LG-07", status: "occupied", type: "Two-wheeler" },
    { id: "LG-08", status: "occupied", type: "Two-wheeler" },
    { id: "LG-09", status: "available", type: "Two-wheeler" },
    { id: "LG-10", status: "available", type: "Two-wheeler" },
    { id: "LG-11", status: "occupied", type: "Two-wheeler" },
    { id: "LG-12", status: "available", type: "Two-wheeler" },
    { id: "LG-13", status: "item-reported", type: "Two-wheeler", item: "Blue Backpack" },
    { id: "LG-14", status: "occupied", type: "Two-wheeler" },
    { id: "LG-15", status: "available", type: "Two-wheeler" },
  ];

  const currentSlots = selectedZone === "ground" ? groundSlots : lowerSlots;

  return (
    <>
      <PageHero
        eyebrow="Interactive Floor Plans"
        title="Campus Parking Zones"
        subtitle="Select a level to view the digital layout and identify reported items in the parking areas."
      />

      <section className="section" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
        <div className="section-inner" style={{ maxWidth: "1000px" }}>
          
          {/* Level Switch Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div 
              style={{
                display: "inline-flex",
                background: "var(--ivory)",
                padding: "6px",
                borderRadius: "999px",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <button
                onClick={() => setSelectedZone("ground")}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: selectedZone === "ground" ? "var(--red-500)" : "transparent",
                  color: selectedZone === "ground" ? "#ffffff" : "var(--slate-600)",
                  transition: "all 0.22s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>Ground Floor</span>
                <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>(Girls Parking)</span>
              </button>
              <button
                onClick={() => setSelectedZone("lower")}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: selectedZone === "lower" ? "var(--blue-500)" : "transparent",
                  color: selectedZone === "lower" ? "#ffffff" : "var(--slate-600)",
                  transition: "all 0.22s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>Lower Ground</span>
                <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>(Boys Parking)</span>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "32px", alignItems: "start" }}>
            
            {/* Visual Floor Map Card */}
            <div className="card" style={{ padding: "28px", minHeight: "360px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--navy-950)", fontSize: "1.15rem", fontWeight: 700 }}>
                  <Compass size={18} color="var(--gold-600)" />
                  {selectedZone === "ground" ? "Ground Floor (Girls Parking)" : "Lower Ground (Boys Parking)"} Map Layout
                </h3>
                <span style={{ fontSize: "0.75rem", background: "var(--ivory)", padding: "4px 10px", borderRadius: "6px", color: "var(--slate-500)", border: "1px solid var(--border-light)" }}>
                  2 Wheeler Slots
                </span>
              </div>

              {/* Map Layout Illustration (SVG Grid) */}
              <div 
                style={{
                  flex: 1,
                  background: "radial-gradient(circle at center, #fbfbfb 0%, #f5f6f8 100%)",
                  borderRadius: "12px",
                  border: "1.5px dashed var(--border-light)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Visual lanes and zones indicators */}
                <div style={{ position: "absolute", top: "12px", left: "16px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                  <MapPin size={12} /> Entry Gate
                </div>
                <div style={{ position: "absolute", bottom: "12px", right: "16px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                  <ArrowRightLeft size={12} /> Main Ramp
                </div>

                {/* Grid of Slots */}
                <div 
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px 24px",
                    width: "100%",
                    maxWidth: "500px",
                    zIndex: 1,
                    margin: "24px 0"
                  }}
                >
                  {currentSlots.map((slot) => {
                    let bg = "#ffffff";
                    let border = "1px solid var(--border-light)";
                    let color = "var(--ink)";
                    let title = "Available Slot";

                    if (slot.status === "occupied") {
                      bg = selectedZone === "ground" ? "rgba(210, 31, 43, 0.05)" : "rgba(30, 54, 116, 0.04)";
                      border = selectedZone === "ground" ? "1px solid rgba(210, 31, 43, 0.15)" : "1px solid rgba(30, 54, 116, 0.15)";
                      color = "var(--slate-400)";
                      title = "Occupied Spot";
                    } else if (slot.status === "item-reported") {
                      bg = "rgba(201, 165, 72, 0.14)";
                      border = "2px solid var(--gold-600)";
                      color = "var(--gold-700)";
                      title = `Lost Item: ${slot.item}`;
                    }

                    return (
                      <div
                        key={slot.id}
                        title={title}
                        style={{
                          background: bg,
                          border: border,
                          borderRadius: "8px",
                          padding: "14px 10px",
                          textAlign: "center",
                          boxShadow: "var(--shadow-sm)",
                          position: "relative",
                          transition: "all 0.2s ease",
                          cursor: slot.status === "item-reported" ? "pointer" : "default"
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: color }}>
                          {slot.id}
                        </div>
                        <div style={{ fontSize: "0.6rem", color: slot.status === "item-reported" ? "var(--gold-700)" : "var(--slate-400)", marginTop: "2px", fontWeight: 600 }}>
                          {slot.status === "item-reported" ? "⚠️ Item" : slot.status.toUpperCase()}
                        </div>
                        {slot.status === "item-reported" && (
                          <span 
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: "var(--gold-500)",
                              border: "2px solid #ffffff",
                              boxShadow: "0 0 0 3px rgba(201, 165, 72, 0.3)"
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Details and Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card" style={{ padding: "24px" }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  Status Legend
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#ffffff", border: "1px solid var(--border-light)" }} />
                    <span style={{ fontSize: "0.86rem", color: "var(--slate-600)" }}>Available Parking Slot</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(30, 54, 116, 0.04)", border: "1px solid rgba(30, 54, 116, 0.15)" }} />
                    <span style={{ fontSize: "0.86rem", color: "var(--slate-600)" }}>Occupied Space</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(201, 165, 72, 0.14)", border: "2px solid var(--gold-600)" }} />
                    <span style={{ fontSize: "0.86rem", color: "var(--slate-600)", fontWeight: 600 }}>Active Lost/Found Reported Item</span>
                  </div>
                </div>
              </div>

              {/* Floor Information Card */}
              <div className="card" style={{ padding: "24px", background: "var(--ivory)", borderLeft: "4px solid var(--gold-500)" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Info size={20} color="var(--gold-600)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "0.9rem", fontWeight: 700, color: "var(--navy-950)" }}>
                      Parking Regulations
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                      Ground Floor is designated exclusively for <strong>Girls Two-Wheeler Parking</strong>. Lower Ground level is designated for <strong>Boys Two-Wheeler Parking</strong>.
                    </p>
                    <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                      If you find any misplaced items on either level, please report them immediately or submit them to the Security Booth located at the Entry Gate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Reported list */}
              <div className="card" style={{ padding: "24px" }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldAlert size={16} color="var(--red-500)" />
                  Reported in this Zone
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentSlots.filter(s => s.status === "item-reported").map((slot) => (
                    <div 
                      key={slot.id}
                      style={{
                        padding: "10px 12px",
                        background: "var(--ivory)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, color: "var(--navy-900)", marginRight: "6px" }}>{slot.id}:</span>
                        <span style={{ color: "var(--slate-700)" }}>{slot.item}</span>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--gold-600)", fontWeight: 700, textTransform: "uppercase" }}>
                        Active Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
}
