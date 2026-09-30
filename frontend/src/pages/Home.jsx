import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API_BASE_URL } from "../context/AuthContext.jsx";
import MotionScroll from "../components/MotionScroll.jsx";
import { ArrowRight, Send, CheckCircle2 } from "lucide-react";
import "./Home.css";

/**
 * Reusable scroll reveal component that adds a subtle fade-in and upward slide
 * (opacity: 0 -> 1, translateY: 10px -> 0) when the user scrolls down to it.
 */
function ScrollRevealSection({ children, className = "", id, as = "section", style = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = as;

  return (
    <Component
      id={id}
      ref={domRef}
      className={`profico-scroll-reveal ${isVisible ? "is-revealed" : ""} ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Feedback form state (integrated from HowItWorks)
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-scroll when navigating to hash URLs like /#how-it-works or /#about
  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);

  const handleReport = (type) => {
    if (isAuthenticated) {
      navigate(`/report-${type}`);
    } else {
      navigate("/login", { state: { from: `/report-${type}` } });
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackName || !feedbackEmail || !feedbackMessage) {
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
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          message: feedbackMessage,
        }),
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
    <div className="profico-landing">
      {/* Top Ambient Aurora Background */}
      <div className="profico-aurora-glow" aria-hidden="true" />

      {/* ========================================================================= */}
      {/* SECTION 01 — HERO & MOTION CANVAS SCRUBBER                                */}
      {/* ========================================================================= */}
      <section className="profico-hero-section" id="home">
        <MotionScroll
          endCta={
            <div className="profico-hero-actions profico-end-cta-actions">
              <button
                className="profico-btn-primary"
                onClick={() => handleReport("lost")}
              >
                Report Lost Item
                <ArrowRight size={15} />
              </button>
              <button
                className="profico-btn-secondary"
                onClick={() => handleReport("found")}
              >
                Report Found Item
              </button>
            </div>
          }
        >
          <div className="profico-hero-content">
            <div className="profico-pill-eyebrow">
              <span className="sparkle-symbol">✦</span>
              <span>MIT WORLD PEACE UNIVERSITY • RECOVERY DIRECTORY</span>
            </div>

            <h1 className="profico-hero-title">
              FoundIt
            </h1>

            <p className="profico-hero-subtitle">
              Report. Verify. Recover. A centralized digital directory connecting lost and found items securely across academic blocks and student zones.
            </p>


            <div className="profico-scroll-hint">
              <span>Scroll</span>
              <div className="scroll-chevron">↓</div>
            </div>
          </div>
        </MotionScroll>
      </section>

      {/* ========================================================================= */}
      {/* METRICS STRIP (Directly inspired by Profico Reference Image)              */}
      {/* ========================================================================= */}
      <ScrollRevealSection as="div" className="profico-metrics-strip">
        <div className="profico-metric-col">
          <span className="metric-label">LOCATION</span>
          <span className="metric-value">MIT-WPU / Kothrud</span>
        </div>
        <div className="profico-metric-col">
          <span className="metric-label">CHECKPOINTS</span>
          <span className="metric-value">12 Campus Desks</span>
        </div>
        <div className="profico-metric-col">
          <span className="metric-label">RESOLUTION TIME</span>
          <span className="metric-value">&lt; 24h Average</span>
        </div>
        <div className="profico-metric-col">
          <span className="metric-label">RECOVERY RATE</span>
          <span className="metric-value">94% Reunited</span>
        </div>
      </ScrollRevealSection>

      {/* ========================================================================= */}
      {/* SECTION 02 — HOW IT WORKS                                                 */}
      {/* ========================================================================= */}
      <ScrollRevealSection className="profico-section" id="how-it-works">
        <div className="profico-container">
          <div className="profico-section-header">
            <div className="profico-center-sparkle profico-stagger-1">✦</div>
            <div className="profico-pill-badge profico-stagger-2">
              <span>How It Works</span>
            </div>
            <h2 className="profico-section-title profico-stagger-3">
              What's the recovery process?
            </h2>
            <p className="profico-section-desc profico-stagger-4">
              A streamlined 4-step campus verification framework designed to eliminate friction and ensure rightful ownership.
            </p>
          </div>

          <div className="profico-cards-grid">
            {/* Card 01 */}
            <div className="profico-card profico-card-stagger-1">
              <div className="profico-card-top">
                <h3 className="profico-card-title">Unified Registry</h3>
                <p className="profico-card-desc">
                  Aggregates lost and found listings from all academic blocks, hostels, and campus libraries into a single, searchable real-time feed.
                </p>
              </div>
              <div className="profico-card-bottom">
                <div className="profico-card-accent" />
                <span className="profico-card-number">01</span>
              </div>
            </div>

            {/* Card 02 */}
            <div className="profico-card profico-card-stagger-2">
              <div className="profico-card-top">
                <h3 className="profico-card-title">Claim Verification</h3>
                <p className="profico-card-desc">
                  Secure verification pathways requiring claimants to submit descriptive proof, locked wallpapers, or serial numbers, preventing false claims.
                </p>
              </div>
              <div className="profico-card-bottom">
                <div className="profico-card-accent" />
                <span className="profico-card-number">02</span>
              </div>
            </div>

            {/* Card 03 */}
            <div className="profico-card profico-card-stagger-3">
              <div className="profico-card-top">
                <h3 className="profico-card-title">Overlap Matching</h3>
                <p className="profico-card-desc">
                  Intelligent categorization algorithms continuously cross-reference listings to notify users when a matching item description is reported.
                </p>
              </div>
              <div className="profico-card-bottom">
                <div className="profico-card-accent" />
                <span className="profico-card-number">03</span>
              </div>
            </div>

            {/* Card 04 */}
            <div className="profico-card profico-card-stagger-4">
              <div className="profico-card-top">
                <h3 className="profico-card-title">Checkpoint Handover</h3>
                <p className="profico-card-desc">
                  Coordinated physical handovers at verified campus security desks and student council checkpoints for safe, guaranteed returns.
                </p>
              </div>
              <div className="profico-card-bottom">
                <div className="profico-card-accent" />
                <span className="profico-card-number">04</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollRevealSection>

      {/* ========================================================================= */}
      {/* SECTION 03 — ABOUT FOUNDIT                                                */}
      {/* ========================================================================= */}
      <ScrollRevealSection className="profico-section profico-about-section" id="about">
        <div className="profico-container">
          <div className="profico-section-header">
            <div className="profico-center-sparkle profico-stagger-1">✦</div>
            <div className="profico-pill-badge profico-stagger-2">
              <span>About FoundIt</span>
            </div>
            <h2 className="profico-section-title profico-stagger-3">
              Bridging the Gap on Campus
            </h2>
            <p className="profico-section-desc profico-stagger-4">
              Connecting academic blocks, hostels, and student checkpoints into a single high-trust digital network.
            </p>
          </div>

          <div className="profico-about-grid">
            {/* Left: Narrative & Values */}
            <div className="profico-about-story">
              <div className="profico-glass-panel">
                <h3 className="profico-panel-title">Centralized Registry for MIT-WPU</h3>
                <p className="profico-panel-text">
                  FoundIt is the official centralized Lost &amp; Found digital portal designed for students, faculty, and staff across the <strong>MIT World Peace University (MIT-WPU)</strong> campus. Our goal is to streamline the reporting, tracking, and recovery of misplaced belongings in a secure and collaborative environment.
                </p>
                <p className="profico-panel-text">
                  From student ID cards and notebooks to high-value electronics and keys, hundreds of items are misplaced across campus facilities each semester. FoundIt eliminates chaotic social media threads and physical lost-and-found delays by providing real-time listing updates, smart cross-referencing, and direct coordination with campus security desks.
                </p>
                <div className="profico-feature-chips">
                  <span className="profico-chip">✦ 100% Student &amp; Staff Verified</span>
                  <span className="profico-chip">✦ Real-time Block Notifications</span>
                  <span className="profico-chip">✦ Secure Desk Coordination</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Feedback Form */}
            <div className="profico-about-feedback">
              <div className="profico-glass-panel profico-feedback-card">
                {!submitted ? (
                  <form onSubmit={handleFeedbackSubmit} className="profico-form">
                    <div className="profico-form-header">
                      <h3 className="profico-panel-title">Campus Suggestions &amp; Inquiries</h3>
                      <p className="profico-panel-text" style={{ fontSize: "0.85rem" }}>
                        Have feedback or project suggestions? Submit below or contact <span style={{ color: "#38bdf8" }}>support@mitwpu.edu.in</span>.
                      </p>
                    </div>

                    {error && <div className="profico-form-error">{error}</div>}

                    <div className="profico-form-row">
                      <input
                        type="text"
                        className="profico-input"
                        placeholder="Your Name"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        required
                      />
                      <input
                        type="email"
                        className="profico-input"
                        placeholder="Your Email"
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="profico-form-field">
                      <textarea
                        className="profico-textarea"
                        placeholder="Write your suggestion or query here..."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="profico-btn-primary profico-submit-btn"
                      disabled={submitting}
                    >
                      {submitting ? "Transmitting..." : (
                        <>
                          <Send size={14} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="profico-feedback-success">
                    <CheckCircle2 size={42} color="#10b981" />
                    <h3 className="profico-panel-title">Message Received!</h3>
                    <p className="profico-panel-text">
                      Thank you for contributing to a safer, more connected MIT-WPU campus network.
                    </p>
                    <button
                      type="button"
                      className="profico-btn-secondary"
                      onClick={() => {
                        setSubmitted(false);
                        setFeedbackName("");
                        setFeedbackEmail("");
                        setFeedbackMessage("");
                      }}
                      style={{ marginTop: "16px" }}
                    >
                      Send Another Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollRevealSection>

      {/* ========================================================================= */}
      {/* SECTION 04 — FINAL CALL TO ACTION                                         */}
      {/* ========================================================================= */}
      <ScrollRevealSection className="profico-section profico-cta-section">
        <div className="profico-container">
          <div className="profico-cta-card">
            <div className="profico-pill-badge profico-stagger-1" style={{ marginBottom: "16px" }}>
              <span>Instant Recovery</span>
            </div>
            <h2 className="profico-cta-title profico-stagger-2">
              Misplaced or Found Something?
            </h2>
            <p className="profico-cta-desc profico-stagger-3">
              Join the MIT-WPU directory network. Look up active logs, report missing items, or log a found article now.
            </p>
            <div className="profico-hero-actions profico-stagger-4" style={{ justifyContent: "center" }}>
              <button
                className="profico-btn-primary"
                onClick={() => handleReport("lost")}
              >
                Report Lost Item
                <ArrowRight size={15} />
              </button>
              <button
                className="profico-btn-secondary"
                onClick={() => handleReport("found")}
              >
                Report Found Item
              </button>
            </div>
          </div>
        </div>
      </ScrollRevealSection>
    </div>
  );
}
