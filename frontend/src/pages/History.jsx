import React from "react";
import PageHero from "../components/PageHero.jsx";
import { useParking } from "../context/ParkingContext.jsx";
import { Calendar, Clock, MapPin, ArrowRightLeft, ShieldAlert } from "lucide-react";

export default function History() {
  const { history } = useParking();

  // Helper to format duration between entry and exit
  const getDuration = (entry, exit) => {
    if (!exit) return "Currently Parked";
    
    const diff = new Date(exit) - new Date(entry);
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(mins / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins} mins`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString(undefined, { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString(undefined, { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Session Logs"
        title="Parking History"
        subtitle="Review logs of all parking activities, slot details, and digital entry timestamps."
      />

      <section className="section" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
        <div className="section-inner" style={{ maxWidth: "800px" }}>
          
          {history.length === 0 ? (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff" }}>
              <span 
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--ivory-dim)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  color: "var(--slate-400)"
                }}
              >
                <ShieldAlert size={24} />
              </span>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", fontWeight: 700 }}>No Activity Logs Found</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--slate-500)" }}>
                Start parking to keep track of your logs here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {history.map((log) => (
                <div 
                  key={log.id} 
                  className="card animate-fade-in" 
                  style={{ 
                    padding: "20px 24px", 
                    background: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span 
                        style={{ 
                          fontSize: "0.7rem", 
                          background: log.zone === "ground" ? "rgba(210, 31, 43, 0.08)" : "rgba(52, 89, 163, 0.08)",
                          color: log.zone === "ground" ? "var(--red-500)" : "var(--blue-500)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 700
                        }}
                      >
                        {log.zone === "ground" ? "Ground Floor — Girls" : "Lower Ground — Boys"}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "var(--slate-400)" }}>• Ref #{log.id}</span>
                    </div>

                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.18rem", fontWeight: 800, color: "var(--navy-950)" }}>
                      Slot {log.slotId}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.8rem", color: "var(--slate-500)", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} /> {formatDate(log.entryTime)}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> {formatTime(log.entryTime)} {log.exitTime ? ` - ${formatTime(log.exitTime)}` : ""}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                      Duration
                    </span>
                    <strong style={{ fontSize: "0.94rem", color: log.status === "active" ? "#22c55e" : "var(--navy-900)" }}>
                      {getDuration(log.entryTime, log.exitTime)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
