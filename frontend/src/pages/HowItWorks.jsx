import { useState } from "react";
import { Layers, ShieldCheck, Cpu, Send, CheckCircle2 } from "lucide-react";
import PageHero from "../components/PageHero.jsx";
import { API_BASE_URL } from "../context/AuthContext.jsx";
import "./About.css";
import "./HowItWorks.css";

export default function HowItWorks() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/feedback/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit feedback.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <>
      <PageHero
        eyebrow="Process Overview"
        title="How FoundIt Works"
        subtitle="A simple three-step process to connect lost items with their rightful owners across campus."
      />

      <section className="section about-page">
        <div className="section-inner">
          <div className="pillars-section">
            <div className="about-section-header">
              <h2>How FoundIt Works</h2>
              <p>Designed with features to minimize claiming friction and verify ownership securely.</p>
            </div>

            <div className="pillars-grid">
              {/* Pillar 1 */}
              <div className="pillar-card">
                <div className="pillar-icon-wrapper color-navy">
                  <Layers size={24} />
                </div>
                <h3>Unified Registry</h3>
                <p>
                  Aggregates lost and found listings from all academic blocks, hostels, and libraries into a single, searchable real-time feed.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="pillar-card">
                <div className="pillar-icon-wrapper color-gold">
                  <ShieldCheck size={24} />
                </div>
                <h3>Claim Verification</h3>
                <p>
                  Secure verification pathways requiring claimants to submit descriptive proof, preventing false claims and ensuring safe returns.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="pillar-card">
                <div className="pillar-icon-wrapper color-red">
                  <Cpu size={24} />
                </div>
                <h3>Overlap Matching</h3>
                <p>
                  Intelligent categorization systems run scans on listings to notify users if an item matching their description is reported.
                </p>
              </div>
            </div>
          </div>

          {/* DYNAMIC INTERACTIVE FEEDBACK FORM */}
          <div className="feedback-section">
            <div className="feedback-card">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="feedback-form">
                  <div className="feedback-header">
                    <h3>Send Us Feedback</h3>
                    <p>
                      Have questions or project suggestions? Submit the form below or email us directly at <span style={{ color: "var(--red-500)", fontWeight: "500" }}>support@mitwpu.edu.in</span>.
                    </p>
                  </div>

                  {error && <div className="feedback-error">{error}</div>}

                  <div className="feedback-row">
                    <input
                      type="text"
                      className="feedback-input"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      className="feedback-input"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="feedback-field">
                    <textarea
                      className="feedback-textarea"
                      placeholder="Write your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button type="submit" className="btn btn--emerald feedback-submit" disabled={submitting}>
                      {submitting ? "Sending..." : <><Send size={15} /> <span>Send Message</span></>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="feedback-success">
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3>Thank you for your feedback!</h3>
                  <p>Your suggestions have been recorded to optimize matches and user dashboards across MIT-WPU.</p>
                  <button type="button" className="btn btn--outline" onClick={() => { setSubmitted(false); setName(""); setEmail(""); setMessage(""); }}>
                    Send Another Feedback
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
