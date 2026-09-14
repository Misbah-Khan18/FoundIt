import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ParkingSlot from "./ParkingSlot.jsx";
import { X, Car, ArrowRight, ArrowLeft } from "lucide-react";

export default function ParkingMap() {
  const navigate = useNavigate();
  const { slots, parkInSlot } = useParking();
  const { isAuthenticated } = useAuth();
  
  const [selectedZone, setSelectedZone] = useState("ground"); // "ground" or "lower"
  const [activeModalSlot, setActiveModalSlot] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSlotClick = (slot) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/parking-map", intendedSlot: slot } });
      return;
    }
    setErrorMessage("");
    setActiveModalSlot(slot);
  };

  const handleConfirmParking = () => {
    if (!activeModalSlot) return;
    try {
      parkInSlot(activeModalSlot.id, selectedZone);
      setActiveModalSlot(null);
      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Could not confirm slot.");
    }
  };

  return (
    <div 
      className="card" 
      style={{ 
        padding: "32px", 
        background: "#ffffff", 
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border-light)"
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "40px", alignItems: "start" }}>
        
        {/* Left Side: Header & Map Layouts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--navy-950)", margin: "0 0 6px 0" }}>
              Live Parking
            </h2>
            <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--slate-500)" }}>
              Choose a parking area to view available slots
            </p>
          </div>

          {/* Prototype Selector Segment */}
          <div style={{ display: "flex" }}>
            <div 
              style={{
                display: "inline-flex",
                background: "#ffffff",
                border: "1px solid #dcdde1",
                borderRadius: "10px",
                padding: "2px",
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => setSelectedZone("ground")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: selectedZone === "ground" ? "#1e3674" : "transparent",
                  color: selectedZone === "ground" ? "#ffffff" : "#1e3674",
                  transition: "all 0.22s ease"
                }}
              >
                <Car size={16} />
                <span>Ground Floor</span>
              </button>
              <button
                onClick={() => setSelectedZone("lower")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: selectedZone === "lower" ? "#1e3674" : "transparent",
                  color: selectedZone === "lower" ? "#ffffff" : "#1e3674",
                  transition: "all 0.22s ease"
                }}
              >
                <Car size={16} />
                <span>Lower Ground</span>
              </button>
            </div>
          </div>

          {/* TWO COMPLETELY DIFFERENT VISUAL PARKING LAYOUTS */}
          {selectedZone === "ground" ? (
            /* Ground Floor Layout - Central Driveway, Left & Right Vertical Slots */
            <div
              style={{
                background: "radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)",
                border: "2px dashed var(--border-light)",
                borderRadius: "16px",
                padding: "24px",
                minHeight: "420px",
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1fr 120px 1fr",
                gap: "16px",
                alignItems: "center"
              }}
            >
              {/* Entry & Exit Headers */}
              <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", fontSize: "0.68rem", color: "var(--slate-400)", fontWeight: 800, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}>
                ENTRY GATE ⬇
              </div>
              <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", fontSize: "0.68rem", color: "var(--slate-400)", fontWeight: 800, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}>
                EXIT GATE ⬇
              </div>

              {/* Left Column of Slots (G01 - G08) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {slots.ground.slice(0, 8).map((slot) => (
                  <ParkingSlot key={slot.id} slot={slot} onClick={() => handleSlotClick(slot)} />
                ))}
              </div>

              {/* Central Driveway Lane */}
              <div 
                style={{ 
                  height: "100%", 
                  borderLeft: "2px dashed #94a3b8", 
                  borderRight: "2px dashed #94a3b8",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-around",
                  padding: "40px 0"
                }}
              >
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", transform: "rotate(90deg)" }}>DRIVEWAY ⬇</div>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", transform: "rotate(90deg)" }}>LANE ⬇</div>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", transform: "rotate(90deg)" }}>KEEP CLEAR 🚫</div>
              </div>

              {/* Right Column of Slots (G09 - G16) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {slots.ground.slice(8, 16).map((slot) => (
                  <ParkingSlot key={slot.id} slot={slot} onClick={() => handleSlotClick(slot)} />
                ))}
              </div>
            </div>
          ) : (
            /* Lower Ground Layout - Horizontal rows with concrete pillars and UP ramp */
            <div
              style={{
                background: "radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)",
                border: "2px dashed var(--border-light)",
                borderRadius: "16px",
                padding: "24px",
                minHeight: "420px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              {/* UP Ramp and Exit Label */}
              <div style={{ position: "absolute", top: "12px", left: "16px", fontSize: "0.68rem", color: "var(--slate-400)", fontWeight: 800, letterSpacing: "0.08em" }}>
                ⬅ UP RAMP TO GROUND
              </div>
              <div style={{ position: "absolute", top: "12px", right: "16px", fontSize: "0.68rem", color: "var(--slate-400)", fontWeight: 800, letterSpacing: "0.08em" }}>
                EMERGENCY EXIT ➡
              </div>

              {/* Top Row of Slots (LG01 - LG08) with Pillars interspersed */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "8px" }}>
                  {slots.lower.slice(0, 8).map((slot, index) => (
                    <React.Fragment key={slot.id}>
                      {index === 4 && (
                        <div 
                          style={{ 
                            background: "#cbd5e1", 
                            borderRadius: "6px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: "0.6rem", 
                            fontWeight: 800, 
                            color: "#475569" 
                          }}
                        >
                          PILLAR
                        </div>
                      )}
                      <ParkingSlot slot={slot} onClick={() => handleSlotClick(slot)} />
                    </React.Fragment>
                  ))}
                </div>

                {/* Horizontal Driveway Lane */}
                <div 
                  style={{ 
                    borderTop: "2px dashed #94a3b8", 
                    borderBottom: "2px dashed #94a3b8",
                    padding: "10px 0",
                    textAlign: "center",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#94a3b8",
                    letterSpacing: "0.2em",
                    display: "flex",
                    justifyContent: "space-between",
                    paddingLeft: "20px",
                    paddingRight: "20px"
                  }}
                >
                  <span>⬅ DIRECTION LANE</span>
                  <span>SPEED LIMIT 10 KM/H 🚫</span>
                  <span>DIRECTION LANE ➡</span>
                </div>

                {/* Bottom Row of Slots (LG09 - LG16) with Pillars interspersed */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "8px" }}>
                  {slots.lower.slice(8, 16).map((slot, index) => (
                    <React.Fragment key={slot.id}>
                      {index === 4 && (
                        <div 
                          style={{ 
                            background: "#cbd5e1", 
                            borderRadius: "6px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: "0.6rem", 
                            fontWeight: 800, 
                            color: "#475569" 
                          }}
                        >
                          PILLAR
                        </div>
                      )}
                      <ParkingSlot slot={slot} onClick={() => handleSlotClick(slot)} />
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Extra spacing layout details */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--slate-400)", fontWeight: 700, marginTop: "12px" }}>
                <span>BASEMENT LEVEL 1</span>
                <span>TOTAL LG SLOTS: 16</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Visual Legend Panel exactly matching Prototype layout */}
        <div 
          className="card" 
          style={{ 
            padding: "24px", 
            border: "1px solid var(--border-light)", 
            borderRadius: "var(--radius-md)", 
            background: "#ffffff",
            marginTop: "68px"
          }}
        >
          <h4 style={{ margin: "0 0 16px 0", fontSize: "0.88rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--slate-400)" }}>
            Map Legend
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "16px", height: "16px", background: "#22c55e", borderRadius: "4px" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--slate-600)", fontWeight: 600 }}>Available</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "16px", height: "16px", background: "#ef4444", borderRadius: "4px" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--slate-600)", fontWeight: 600 }}>Occupied</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "16px", height: "16px", background: "#f59e0b", borderRadius: "4px" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--slate-600)", fontWeight: 600 }}>Reserved</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "16px", height: "16px", background: "#94a3b8", borderRadius: "4px" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--slate-600)", fontWeight: 600 }}>Not Available</span>
            </div>
          </div>

          <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-light)", paddingTop: "18px", fontSize: "0.78rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>
              🟢 Green slots are free. Tap to park.
            </p>
            <p style={{ margin: "6px 0 0" }}>
              🔴 Red slots are currently occupied.
            </p>
          </div>
        </div>

      </div>

      {/* Booking Confirmation Modal */}
      {activeModalSlot && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(30, 54, 116, 0.4)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setActiveModalSlot(null)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "var(--shadow-lg)",
              padding: "28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "18px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalSlot(null)}
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
            >
              <X size={16} />
            </button>

            <div>
              <span className="eyebrow" style={{ color: "var(--gold-600)" }}>Parking Confirmation</span>
              <h3 style={{ margin: "4px 0 0", fontSize: "1.45rem", fontWeight: 800, color: "var(--navy-950)" }}>
                Slot {activeModalSlot.id}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "var(--slate-500)" }}>
                {selectedZone === "ground" ? "Ground Floor — Girls Parking" : "Lower Ground — Boys Parking"}
              </p>
            </div>

            {errorMessage && (
              <div 
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(210, 31, 43, 0.08)",
                  color: "var(--red-500)",
                  fontSize: "0.82rem",
                  border: "1px solid rgba(210, 31, 43, 0.15)"
                }}
              >
                {errorMessage}
              </div>
            )}

            <div 
              style={{ 
                background: "var(--ivory)", 
                padding: "14px 16px", 
                borderRadius: "12px", 
                fontSize: "0.85rem",
                color: "var(--slate-600)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Status:</span>
                <strong style={{ color: "#22c55e" }}>Available</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Vehicle:</span>
                <strong>Auto-detected profile</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn btn--emerald"
                style={{ flex: 1 }}
                onClick={handleConfirmParking}
              >
                I have parked here
              </button>
              <button
                className="btn btn--outline"
                style={{ flex: 1 }}
                onClick={() => setActiveModalSlot(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
