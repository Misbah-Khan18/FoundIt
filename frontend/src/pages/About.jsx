import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
import PageHero from "../components/PageHero.jsx";
import AboutIllustration from "../components/graphics/AboutIllustration.jsx";
import "./About.css";

// A lightweight, performant count-up component using requestAnimationFrame
function CountUp({ value, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing function outQuad for smoother deceleration at the end
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        animId = window.requestAnimationFrame(step);
      } else {
        setCount(value); // guarantee precise target value at completion
      }
    };

    animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
}

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Campus Initiative"
        title="About FoundIt"
        subtitle="Bridging the gap between lost belongings and their rightful owners at MIT-WPU."
      />

      <section className="section about-page">
        <div className="section-inner">

          {/* Section 1: Narrative & SVG Illustration */}
          <div className="about-grid">
            <div className="about-text-content">
              <h2>Centralized Registry for MIT-WPU</h2>
              <p>
                FoundIt is the official centralized Lost &amp; Found digital portal designed for students, faculty, and staff across the <strong>MIT World Peace University (MIT-WPU)</strong> campus. Our goal is to streamline the reporting, tracking, and recovery of misplaced belongings in a secure and collaborative environment.
              </p>
              <p>
                From student ID cards and notebooks to high-value electronics and keys, hundreds of items are misplaced across campus facilities each semester. FoundIt eliminates chaotic social media threads and physical lost-and-found delays by providing real-time listing updates, smart cross-referencing, and direct coordination with campus security desks.
              </p>
              <p>
                By promoting a culture of integrity and mutual support, FoundIt ensures that every recovered item has the best possible chance of finding its way back to its owner swiftly and securely.
              </p>
            </div>

            <div className="about-graphic-side">
              <AboutIllustration />
            </div>
          </div>

          {/* Section 2: Key Service Pillars */}
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



          {/* Section 5: Call to Action */}
          <div className="about-cta-section">
            <div className="about-cta-card">
              <h2>Misplaced or Found Something?</h2>
              <p>
                Join the MIT-WPU network in keeping our campus safe and collaborative. Look up active logs, report missing items, or log a found article now.
              </p>
              <div className="about-cta-buttons">

                <Link to="/report-lost" className="btn btn--glass">
                  Report Lost Belonging
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
