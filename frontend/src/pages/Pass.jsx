import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";
import PageHero from "../components/PageHero.jsx";
import { CreditCard, Calendar, CheckCircle2, ShieldAlert } from "lucide-react";

export default function Pass() {
  const navigate = useNavigate();
  const { passInfo, purchasePass } = useParking();

  const [selectedPlan, setSelectedPlan] = useState(30); // Default 30 days
  const [success, setSuccess] = useState(false);

  const getPrice = (days) => {
    if (days === 30) return 300;
    if (days === 90) return 800;
    return 1500;
  };

  const getExpiryDateStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };

  const handlePurchase = () => {
    purchasePass(selectedPlan);
    setSuccess(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <>
      <PageHero
        eyebrow="Digital Pass Manager"
        title="Monthly College Pass"
        subtitle="Purchase or renew your college parking pass to bypass daily checks and cash payments."
      />

      <section className="section" style={{ paddingTop: "24px", paddingBottom: "72px" }}>
        <div className="section-inner" style={{ maxWidth: "800px" }}>
          
          {success ? (
            <div className="card" style={{ padding: "40px 24px", textAlign: "center", background: "#ffffff" }}>
              <span 
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px"
                }}
              >
                <CheckCircle2 size={32} />
              </span>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 800, color: "var(--navy-950)" }}>
                Monthly Pass Activated!
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--slate-500)" }}>
                Redirecting back to your student dashboard...
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "start" }}>
              
              {/* Left Side: Choose Plan */}
              <div className="card" style={{ padding: "28px", background: "#ffffff" }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={18} color="var(--blue-500)" />
                  Select Pass Term
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Plan 1 */}
                  <label 
                    style={{
                      border: selectedPlan === 30 ? "2px solid var(--navy-900)" : "1px solid var(--border-light)",
                      background: selectedPlan === 30 ? "var(--ivory)" : "#ffffff",
                      borderRadius: "14px",
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <input 
                      type="radio" 
                      name="pass_term" 
                      checked={selectedPlan === 30} 
                      onChange={() => setSelectedPlan(30)}
                      style={{ display: "none" }}
                    />
                    <div>
                      <strong style={{ display: "block", fontSize: "1rem", color: "var(--navy-950)" }}>1 Month Pass</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--slate-500)" }}>Valid for 30 Days</span>
                    </div>
                    <strong style={{ fontSize: "1.2rem", color: "var(--navy-900)" }}>₹300</strong>
                  </label>

                  {/* Plan 2 */}
                  <label 
                    style={{
                      border: selectedPlan === 90 ? "2px solid var(--navy-900)" : "1px solid var(--border-light)",
                      background: selectedPlan === 90 ? "var(--ivory)" : "#ffffff",
                      borderRadius: "14px",
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <input 
                      type="radio" 
                      name="pass_term" 
                      checked={selectedPlan === 90} 
                      onChange={() => setSelectedPlan(90)}
                      style={{ display: "none" }}
                    />
                    <div>
                      <strong style={{ display: "block", fontSize: "1rem", color: "var(--navy-950)" }}>3 Month Term</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--slate-500)" }}>Save ₹100 • 90 Days</span>
                    </div>
                    <strong style={{ fontSize: "1.2rem", color: "var(--navy-900)" }}>₹800</strong>
                  </label>

                  {/* Plan 3 */}
                  <label 
                    style={{
                      border: selectedPlan === 180 ? "2px solid var(--navy-900)" : "1px solid var(--border-light)",
                      background: selectedPlan === 180 ? "var(--ivory)" : "#ffffff",
                      borderRadius: "14px",
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <input 
                      type="radio" 
                      name="pass_term" 
                      checked={selectedPlan === 180} 
                      onChange={() => setSelectedPlan(180)}
                      style={{ display: "none" }}
                    />
                    <div>
                      <strong style={{ display: "block", fontSize: "1rem", color: "var(--navy-950)" }}>6 Month Term</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--slate-500)" }}>Save ₹300 • 180 Days</span>
                    </div>
                    <strong style={{ fontSize: "1.2rem", color: "var(--navy-900)" }}>₹1500</strong>
                  </label>
                </div>
              </div>

              {/* Right Side: Pass Overview */}
              <div className="card" style={{ padding: "28px", background: "#ffffff", display: "flex", flexDirection: "column", gap: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--navy-950)" }}>
                  Order Summary
                </h3>

                <div 
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    fontSize: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    color: "var(--slate-600)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Selected Pass:</span>
                    <strong style={{ color: "var(--navy-950)" }}>{selectedPlan} Days Plan</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal:</span>
                    <strong style={{ color: "var(--navy-950)" }}>₹{getPrice(selectedPlan)}.00</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Valid Until:</span>
                    <strong style={{ color: "var(--navy-950)" }}>{getExpiryDateStr(selectedPlan)}</strong>
                  </div>
                </div>

                {passInfo.active && (
                  <div style={{ display: "flex", gap: "8px", background: "rgba(245, 158, 11, 0.08)", borderLeft: "4px solid var(--gold-500)", padding: "10px 14px", borderRadius: "6px", fontSize: "0.78rem", color: "var(--slate-600)" }}>
                    <ShieldAlert size={16} color="var(--gold-600)" style={{ flexShrink: 0 }} />
                    <span>You already have an active pass. Purchasing will extend your duration.</span>
                  </div>
                )}

                <button 
                  onClick={handlePurchase} 
                  className="btn btn--emerald"
                  style={{ width: "100%" }}
                >
                  {passInfo.active ? "Renew Pass Now" : "Confirm & Activate Pass"}
                </button>
              </div>

            </div>
          )}

        </div>
      </section>
    </>
  );
}
