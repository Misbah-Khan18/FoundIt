import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLiveStats } from "../hooks/useLiveStats.js";
import { useReports } from "../context/ReportsContext.jsx";
import { useAnimation } from "../context/AnimationContext.jsx";
import { useCountUp } from "../hooks/useCountUp.js";

// Lucide icons
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  MapPin, 
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
  PackageSearch,
  HandHeart,
  CheckCircle2
} from "lucide-react";

// GSAP
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Badge from "../components/Badge.jsx";
import "./Home.css";
import Iridescence from "../components/Iridescence.jsx";
import MagicBento from "../components/MagicBento.jsx";
import FadeInSection from "../components/FadeInSection.jsx";

import laptopImg from "../assets/laptop.jpg";
import watchImg from "../assets/watch.jpg";
import documentImg from "../assets/document.jpg";
import phoneImg from "../assets/phone.jpg";

const bentoCards = [
  {
    color: '#120F17',
    title: 'Phone',
    description: 'Lost or found a smartphone?',
    label: 'Mobile',
    image: phoneImg
  },
  {
    color: '#120F17',
    title: 'Laptop',
    description: 'Misplaced your work or personal laptop?',
    label: 'Computer',
    image: laptopImg
  },
  {
    color: '#120F17',
    title: 'Watch',
    description: 'Smartwatches, analog watches, or fitness trackers.',
    label: 'Accessories',
    image: watchImg
  },
  {
    color: '#120F17',
    title: 'Document',
    description: 'IDs, notes, and folders.',
    label: 'Essentials',
    image: documentImg
  },
  {
    color: '#120F17',
    title: 'Keys',
    description: 'House keys, car keys, or office keys.',
    label: 'Hardware'
  },
  {
    color: '#120F17',
    title: 'Wallet',
    description: 'Wallets, purses, or cardholders.',
    label: 'Valuables'
  }
];

// Dynamic count-up sub-component for the stats section
function StatCounter({ toValue, duration = 1200, trigger }) {
  const [val, setVal] = useState(0);
  
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.floor(eased * toValue));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [toValue, duration, trigger]);
  
  return <span>{val}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const stats = useLiveStats();
  const { items: allItems } = useReports();
  const { startAnimation } = useAnimation();

  // Redesign state managers
  const [activeStep, setActiveStep] = useState(0);
  const [statsTriggered, setStatsTriggered] = useState(false);

  const displayActive = useCountUp(stats.active);

  // Trigger animations on mount
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Play logo magnifier landing animation
    startAnimation();

    // 1. Hero entrance animations
    const heroTl = gsap.timeline();
    heroTl.to(".refined-hero__heading", { y: 0, duration: 1.1, ease: "power4.out" })
      .to(".refined-hero__subtitle", { opacity: 1, duration: 0.9, ease: "power2.out" }, "-=0.75")
      .to(".refined-hero__badge", { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.65")
      .to(".refined-hero__actions", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .to(".refined-hero__cards", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.55");

    // 2. Section 02: Giant LOST -> FOUND transition
    ScrollTrigger.create({
      trigger: ".lost-found-transition",
      start: "top top",
      end: "+=130%",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        // Slide out and shrink LOST
        gsap.set(".giant-text--lost", {
          opacity: Math.max(0, 1 - progress * 2.2),
          scale: 1 + progress * 0.25,
        });
        // Reveal and expand FOUND
        gsap.set(".giant-text--found", {
          opacity: Math.min(1, Math.max(0, (progress - 0.35) * 2.2)),
          scale: 0.6 + Math.min(0.4, (progress - 0.35) * 0.8),
        });
      }
    });

    // 3. Section 03: Pinned How-It-Works storytelling scroll observer
    const stepItems = gsap.utils.toArray(".works-step-item");
    stepItems.forEach((step, idx) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 65%",
        end: "bottom 35%",
        onToggle: (self) => {
          if (self.isActive) {
            setActiveStep(idx);
          }
        }
      });
    });

    // 4. Section 04: Visual Wall Asymmetric Parallax
    gsap.to(".wall-card-wrapper--left-tall", {
      y: -80,
      scrollTrigger: {
        trigger: ".visual-wall",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
    gsap.to(".wall-card-wrapper--right-short", {
      y: 90,
      scrollTrigger: {
        trigger: ".visual-wall",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
    gsap.to(".wall-card-wrapper--center-offset", {
      y: -110,
      scrollTrigger: {
        trigger: ".visual-wall",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
    gsap.to(".wall-card-wrapper--far-right", {
      y: 50,
      scrollTrigger: {
        trigger: ".visual-wall",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // 5. Section 05: Statistics viewport trigger & staggered 3D shuffle card deal
    ScrollTrigger.create({
      trigger: ".editorial-stats",
      start: "top 75%",
      onEnter: () => {
        setStatsTriggered(true);
        gsap.fromTo(".editorial-stat-item", 
          { opacity: 0, y: 70, rotationX: -18, scale: 0.88 },
          { 
            opacity: 1, 
            y: 0, 
            rotationX: 0,
            scale: 1,
            duration: 0.9, 
            stagger: 0.22, 
            ease: "back.out(1.1)",
            force3D: true
          }
        );
      }
    });

    return () => {
      // Clean up all scroll triggers
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [startAnimation]);

  const handleReport = (type) => {
    if (isAuthenticated) {
      navigate(`/report-${type}`);
    } else {
      navigate("/login", { state: { from: `/report-${type}` } });
    }
  };

  const wallItems = allItems.slice(0, 4);

  return (
    <div className="home-container">

      {/* ========================================================================= */}
      {/* SECTION 01 — HERO                                                         */}
      {/* ========================================================================= */}
      <section className="refined-hero" id="home">
        <Iridescence
          color={[1, 0.996078431372549, 0.9764705882352941]}
          mouseReact={true}
          amplitude={0.25}
          speed={0.8}
        />
        
        <div className="refined-hero__content">
          {/* Left Column: Copy & Actions */}
          <div className="refined-hero__text-col">
            <div className="refined-hero__badge" role="status">
              <span className="hero__live" style={{ marginBottom: 0 }}>
                <span className="hero__live-dot" />
                <span className="hero__live-text">
                  <strong>{displayActive}</strong> active reports logs
                </span>
              </span>
            </div>
            
            <div className="hero-title-wrap">
              <h1 className="refined-hero__heading">
                MIT-WPU Lost<br/><span className="accent">&amp; Found</span>
              </h1>
            </div>
            
            <p className="refined-hero__subtitle">
              Report. Search. Recover. A centralized digital directory connecting lost and found items securely across academic blocks and student zones.
            </p>

            <div className="refined-hero__actions">
              <button className="btn btn--emerald" onClick={() => handleReport("lost")} style={{ padding: "14px 28px", fontSize: "1rem" }}>
                Report Lost Item
              </button>
              <button className="btn btn--outline" onClick={() => handleReport("found")} style={{ padding: "14px 28px", fontSize: "1rem" }}>
                Log Found Item
              </button>
            </div>
          </div>

          {/* Right Column: Visual Mockup / Cards */}
          <div className="refined-hero__visual-col" style={{ position: "relative" }}>
            <div className="glass-glow-blob glass-glow-blob--emerald" />
            <div className="glass-glow-blob glass-glow-blob--blue" />
            
            <div className="refined-hero__cards">
              <div className="glass-flow-diagram">
                <div className="glass-flow-column">
                  <div className="glass-flow-card">
                    <div className="glass-flow-content">
                      <span className="glass-flow-title">Unified Registry</span>
                      <span className="glass-flow-desc">Aggregate all items</span>
                    </div>
                  </div>
                </div>

                <div className="glass-flow-connector"></div>

                <div className="glass-flow-column">
                  <div className="glass-flow-card glass-flow-card--active">
                    <div className="glass-flow-content">
                      <span className="glass-flow-title">Intelligent Match</span>
                      <span className="glass-flow-desc">Cross-reference logs</span>
                    </div>
                  </div>
                  
                  <div className="glass-flow-card">
                    <div className="glass-flow-content">
                      <span className="glass-flow-title">Verify Claim</span>
                      <span className="glass-flow-desc">Secure proof paths</span>
                    </div>
                  </div>
                  
                  <div className="glass-flow-card">
                    <div className="glass-flow-content">
                      <span className="glass-flow-title">Safe Handover</span>
                      <span className="glass-flow-desc">Prevent false claims</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02 — LOST -> FOUND TRANSITION                                     */}
      {/* ========================================================================= */}
      <section className="lost-found-transition" aria-hidden="true">
        <div className="transition-text-container">
          <h2 className="giant-text giant-text--lost">LOST?</h2>
          <h2 className="giant-text giant-text--found">FOUND!</h2>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03 — PINNED HOW-IT-WORKS EXPERIENCE                               */}
      {/* ========================================================================= */}
      <section className="pinned-works" id="how-it-works">
        <FadeInSection className="pinned-works__container">
        {/* Left Side steps navigation checklist */}
        <div className="pinned-works__sidebar">
          <span className="section-eyebrow">Interactive Process</span>
          
          <div className="pinned-works__steps-list">
            <div className={`works-step-item ${activeStep === 0 ? "active" : ""}`} onClick={() => setActiveStep(0)}>
              <span className="works-step-num">Step 01</span>
              <h3 className="works-step-title">Unified Registry</h3>
              <p className="works-step-desc">
                Aggregates lost and found listings from all academic blocks, hostels, and campus libraries into a single feed.
              </p>
            </div>

            <div className={`works-step-item ${activeStep === 1 ? "active" : ""}`} onClick={() => setActiveStep(1)}>
              <span className="works-step-num">Step 02</span>
              <h3 className="works-step-title">Claim Verification</h3>
              <p className="works-step-desc">
                Secure verification pathways requiring claimants to submit descriptive proof, preventing false handovers.
              </p>
            </div>

            <div className={`works-step-item ${activeStep === 2 ? "active" : ""}`} onClick={() => setActiveStep(2)}>
              <span className="works-step-num">Step 03</span>
              <h3 className="works-step-title">Overlap Matching</h3>
              <p className="works-step-desc">
                Intelligent categorization systems run scans on listings to notify users if matching items are logged.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side visual storytelling mockup card block (Pinned) */}
        <div className="pinned-works__visual-area">
          <div className="visual-mockup-wrapper">
            <div className="mockup-header">
              <span className="mockup-dot mockup-dot--red" />
              <span className="mockup-dot mockup-dot--yellow" />
              <span className="mockup-dot mockup-dot--green" />
              <span style={{ fontSize: "0.68rem", color: "var(--slate-500)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>MATCH_ENGINE_V1</span>
            </div>
            
            <div className="mockup-body">
              {/* Slide 1 Visuals */}
              <div className={`mockup-slide ${activeStep === 0 ? "active" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <Layers size={16} color="var(--navy-900)" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>Campus Real-Time Feed</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem" }}>
                  <div style={{ padding: "8px 12px", background: "var(--ivory)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><strong style={{ color: "var(--red-500)" }}>LOST</strong><span style={{ fontSize: "0.65rem", color: "var(--slate-500)" }}>Just Now</span></div>
                    <span>Silver Apple iPad - Canteen Area</span>
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--ivory)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><strong style={{ color: "var(--navy-900)" }}>FOUND</strong><span style={{ fontSize: "0.65rem", color: "var(--slate-500)" }}>10m ago</span></div>
                    <span>Wireless Keys - Block C Entry</span>
                  </div>
                  <div style={{ padding: "8px 12px", background: "var(--ivory)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><strong style={{ color: "var(--red-500)" }}>LOST</strong><span style={{ fontSize: "0.65rem", color: "var(--slate-500)" }}>1h ago</span></div>
                    <span>Student Leather Wallet - Ground Floor</span>
                  </div>
                </div>
              </div>

              {/* Slide 2 Visuals */}
              <div className={`mockup-slide ${activeStep === 1 ? "active" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <ShieldCheck size={16} color="var(--gold-600)" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>Claim Verification Pathway</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.78rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>✓</span>
                    <span>Submit receipt/invoice / serial number</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>✓</span>
                    <span>Confirm specific locked screen wallpaper</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>✓</span>
                    <span>Verify student identity card details</span>
                  </div>
                  <div style={{ padding: "8px 12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "6px", color: "#065f46", fontSize: "0.72rem", textAlign: "center", fontWeight: 700 }}>
                    Gate Verification Clearance Approved
                  </div>
                </div>
              </div>

              {/* Slide 3 Visuals */}
              <div className={`mockup-slide ${activeStep === 2 ? "active" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                  <Cpu size={16} color="var(--red-500)" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>Overlap Smart Scanner</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.76rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "var(--ivory)", padding: "10px", borderRadius: "6px", border: "1.5px dashed var(--gold-500)" }}>
                    <div>
                      <strong style={{ color: "var(--navy-900)", display: "block" }}>Lost Submission #1042</strong>
                      <span>Dell Latitude, blue sticker</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--gold-600)" }}>
                      <Sparkles size={12} />
                      <strong>88%</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", color: "var(--slate-500)", fontSize: "0.68rem" }}>Scanning directory matches...</div>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "var(--ivory)", padding: "10px", borderRadius: "6px", border: "1.5px dashed var(--gold-500)" }}>
                    <div>
                      <strong style={{ color: "var(--red-500)", display: "block" }}>Found Submission #0391</strong>
                      <span>Silver Laptop, blue casing</span>
                    </div>
                    <span style={{ alignSelf: "center", fontSize: "0.65rem", padding: "2px 6px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: "4px", fontWeight: 700 }}>Match Alert Sent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </FadeInSection>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 04 — CAMPUS ITEM VISUAL WALL                                      */}
      {/* ========================================================================= */}
      <section className="visual-wall home-section">
        <FadeInSection className="visual-wall__inner">
          <span className="section-eyebrow">Editorial Wall</span>
          <h2 className="wall-heading">
            YOU NAME IT <span style={{ color: "var(--gold-500)" }}>WE FIND IT!</span>
          </h2>

          <div style={{ position: "relative", zIndex: 10 }}>
            <MagicBento cardData={bentoCards} />
          </div>
        </FadeInSection>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 05 — STATISTICS / LIVE CAMPUS ACTIVITY                            */}
      {/* ========================================================================= */}
      <section className="editorial-stats home-section">
        <div className="section-inner">
          <FadeInSection>
            <span className="section-eyebrow" style={{ color: "var(--gold-600)" }}>Metrics Dashboard</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontFamily: "var(--font-display)", fontWeight: 800, margin: "0 0 12px", color: "var(--navy-900)" }}>
              Campus Activity Logs
            </h2>
            <p style={{ margin: 0, color: "var(--slate-600)", fontSize: "1.02rem", maxWidth: "50ch" }}>
              Dynamic portal counts verify real-time matches across hostel blocks and digital security stations.
            </p>
          </FadeInSection>

          <div className="editorial-stats__grid">
            <div className="editorial-stat-item">
              <div className="editorial-stat-num">
                <StatCounter toValue={stats.lost} trigger={statsTriggered} />
              </div>
              <span className="editorial-stat-label">Lost Reports</span>
              <p className="editorial-stat-desc">Belongings logged by students as missing across block levels.</p>
            </div>

            <div className="editorial-stat-item">
              <div className="editorial-stat-num">
                <StatCounter toValue={stats.found} trigger={statsTriggered} />
              </div>
              <span className="editorial-stat-label">Found Logs</span>
              <p className="editorial-stat-desc">Discovered assets returned and held at desk checkpoints.</p>
            </div>

            <div className="editorial-stat-item">
              <div className="editorial-stat-num">
                <StatCounter toValue={stats.reunited} trigger={statsTriggered} />
              </div>
              <span className="editorial-stat-label">Reunited Cases</span>
              <p className="editorial-stat-desc">Claim handovers completed successfully after proof matching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 07 — FINAL ACTION AREA                                            */}
      {/* ========================================================================= */}
      <section className="editorial-conclusion">
        <Iridescence
          color={[1, 0.996078431372549, 0.9764705882352941]}
          mouseReact={true}
          amplitude={0.25}
          speed={0.8}
        />
        <FadeInSection className="editorial-conclusion__inner" style={{ position: "relative", zIndex: 10 }}>
          <span className="section-eyebrow" style={{ color: "var(--gold-500)" }}>Secure Return Portal</span>
          <h2 className="editorial-conclusion__title">
            <span className="highlight">FoundIt</span>
          </h2>
          <p style={{ margin: 0, color: "var(--slate-600)", fontSize: "1.1rem", maxWidth: "50ch", lineHeight: 1.5, fontWeight: 500 }}>
            Help build a secure, collaborative campus. Register matching logs with checkpoints or front-desk moderation now.
          </p>

          <div className="editorial-conclusion__cta-wrap">
            <button className="btn btn--emerald" style={{ boxShadow: "0 8px 24px rgba(201, 165, 72, 0.25)" }} onClick={() => handleReport("lost")}>
              Report Missing Item <ArrowRight size={15} />
            </button>
            <button className="btn btn--outline" style={{ background: "rgba(0,0,0,0.04)", color: "var(--ink)", borderColor: "var(--border-light)" }} onClick={() => handleReport("found")}>
              Log Found Item
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
