import React, { useState, useEffect, useRef } from "react";
import { useAnimation } from "../context/AnimationContext.jsx";
import "./FallingMagnifier.css";

export default function FallingMagnifier() {
  const { stage, logoRect } = useAnimation();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [heroHtml, setHeroHtml] = useState("");
  const magnifierRef = useRef(null);
  const cloneRef = useRef(null);

  // Sync window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch hero section HTML to mirror it in the zoom lens
  useEffect(() => {
    const heroEl = document.querySelector(".hero__content");
    if (heroEl) {
      setHeroHtml(heroEl.innerHTML);
    }
  }, [stage]);

  // requestAnimationFrame loop to align zoomed hero content in the lens at 60fps
  useEffect(() => {
    let animId;
    const updateLens = () => {
      const heroEl = document.querySelector(".hero__content");
      const magEl = magnifierRef.current;
      const cloneEl = cloneRef.current;

      if (heroEl && magEl && cloneEl && (stage === "falling" || stage === "impact")) {
        const heroRect = heroEl.getBoundingClientRect();
        const magRect = magEl.getBoundingClientRect();

        // Magnifier is scaled by 2.0 during falling and impact stages
        const scale = 2.0;
        
        // Center of the lens inside our 220px SVG is at (85, 85)
        const lensX = magRect.left + 85 * scale;
        const lensY = magRect.top + 85 * scale;

        const offsetX = lensX - heroRect.left;
        const offsetY = lensY - heroRect.top;

        // Local scale: 1.15x effective viewport zoom / 2.0x parent scale = 0.575
        cloneEl.style.left = `${48 - offsetX * 0.575}px`;
        cloneEl.style.top = `${48 - offsetY * 0.575}px`;
        cloneEl.style.transform = "scale(0.575)";
        cloneEl.style.width = `${heroRect.width}px`;
        cloneEl.style.height = `${heroRect.height}px`;
      }
      animId = requestAnimationFrame(updateLens);
    };

    if (stage === "falling" || stage === "impact") {
      animId = requestAnimationFrame(updateLens);
    }

    return () => cancelAnimationFrame(animId);
  }, [stage]);

  if (stage === "settled") return null;

  const centerX = dimensions.width / 2;
  const impactY = dimensions.height * 0.60; // 55-65% height
  
  // Destination logo coordinates
  const destX = logoRect ? logoRect.left + logoRect.width / 2 : 100;
  const destY = logoRect ? logoRect.top + logoRect.height / 2 : 35;

  const getStyle = () => {
    const scale = stage === "travelling" || stage === "settling" ? 0.22 : 2.0;
    switch (stage) {
      case "idle":
        return {
          transform: `translate(${centerX}px, -150px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0,
          transition: "none",
        };
      case "falling":
        return {
          transform: `translate(${centerX}px, ${impactY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 1,
          transition: `transform 1000ms cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 200ms ease-out`,
        };
      case "impact":
        return {
          transform: `translate(${centerX}px, ${impactY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 1,
          transition: "none",
        };
      case "travelling":
        return {
          transform: `translate(${destX}px, ${destY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 1,
          transition: `transform 1000ms cubic-bezier(0.25, 1, 0.5, 1.25)`, // Springy flight to O position
        };
      case "settling":
        return {
          transform: `translate(${destX}px, ${destY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0,
          transition: "opacity 500ms ease-out",
        };
      default:
        return { display: "none" };
    }
  };

  const getShadowStyle = () => {
    const scale = stage === "travelling" || stage === "settling" ? 0.22 : 2.0;
    switch (stage) {
      case "idle":
        return {
          transform: `translate(${centerX}px, -150px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0,
          filter: "blur(24px)",
          top: "32px",
          left: "16px",
          transition: "none",
        };
      case "falling":
        return {
          transform: `translate(${centerX}px, ${impactY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0.35,
          filter: "blur(6px)",
          top: "6px",
          left: "3px",
          transition: `transform 1000ms cubic-bezier(0.55, 0.055, 0.675, 0.19), filter 1000ms ease-in, opacity 1000ms ease-in, top 1000ms ease-in, left 1000ms ease-in`,
        };
      case "impact":
        return {
          transform: `translate(${centerX}px, ${impactY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0.35,
          filter: "blur(6px)",
          top: "6px",
          left: "3px",
          transition: "none",
        };
      case "travelling":
        return {
          transform: `translate(${destX}px, ${destY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0.15,
          filter: "blur(2px)",
          top: "2px",
          left: "1px",
          transition: `transform 1000ms cubic-bezier(0.25, 1, 0.5, 1.25), filter 1000ms ease-out, opacity 1000ms ease-out, top 1000ms ease-out, left 1000ms ease-out`,
        };
      case "settling":
        return {
          transform: `translate(${destX}px, ${destY}px) translate(-50%, -50%) scale(${scale})`,
          opacity: 0,
          filter: "blur(2px)",
          top: "2px",
          left: "1px",
          transition: "opacity 500ms ease-out",
        };
      default:
        return { display: "none" };
    }
  };

  const showZoom = stage === "falling" || stage === "impact";

  return (
    <div className="magnifier-overlay">
      {/* Dynamic photorealistic drop shadow layer */}
      <div className="magnifier-shadow-layer" style={getShadowStyle()}>
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Handle shape shadow */}
          <rect x="135" y="135" width="14" height="65" rx="7" transform="rotate(-45 135 135)" fill="black" opacity="0.3" />
          {/* Lens shape shadow */}
          <circle cx="85" cy="85" r="54" fill="black" opacity="0.45" />
        </svg>
      </div>

      {/* Main Flying Magnifying Glass */}
      <div className="flying-magnifier" ref={magnifierRef} style={getStyle()}>
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", top: 0, left: 0, zIndex: 5 }}>
          <defs>
            {/* Metallic Frame Gradient (Chrome/Gold Mix) */}
            <linearGradient id="metal-grad-bevel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fffbdf" />
              <stop offset="15%" stopColor="#d4af37" />
              <stop offset="30%" stopColor="#aa7c11" />
              <stop offset="45%" stopColor="#fffbdf" />
              <stop offset="55%" stopColor="#ffdf7a" />
              <stop offset="70%" stopColor="#805d04" />
              <stop offset="85%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#5a4101" />
            </linearGradient>
            
            <linearGradient id="metal-grad-rim" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a4101" />
              <stop offset="25%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#fffbdf" />
              <stop offset="75%" stopColor="#aa7c11" />
              <stop offset="100%" stopColor="#fffbdf" />
            </linearGradient>

            {/* Handle Wood Gradient (Polished Mahogany) */}
            <linearGradient id="handle-wood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a140a" />
              <stop offset="25%" stopColor="#4d2715" />
              <stop offset="50%" stopColor="#733d20" />
              <stop offset="75%" stopColor="#4d2715" />
              <stop offset="100%" stopColor="#1f0e06" />
            </linearGradient>
            
            {/* Handle Specular Polished Sheen */}
            <linearGradient id="handle-sheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            
            {/* Glass Lens Radial Tint */}
            <radialGradient id="glass-lens-radial" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
              <stop offset="40%" stopColor="rgba(255, 255, 255, 0.05)" />
              <stop offset="85%" stopColor="rgba(52, 89, 163, 0.05)" />
              <stop offset="100%" stopColor="rgba(30, 54, 116, 0.25)" />
            </radialGradient>
          </defs>

          {/* Handle connection collar */}
          <path d="M124 124 L138 138" stroke="url(#metal-grad-bevel)" strokeWidth="12" strokeLinecap="square" />
          <path d="M126 126 L136 136" stroke="#3d2314" strokeWidth="14" strokeLinecap="round" opacity="0.25" />

          {/* Walnut wood handle */}
          <rect x="135" y="135" width="14" height="65" rx="7" transform="rotate(-45 135 135)" fill="url(#handle-wood)" stroke="url(#metal-grad-rim)" strokeWidth="1" />
          {/* Specular sheen on handle */}
          <rect x="136" y="136" width="4" height="63" rx="2" transform="rotate(-45 135 135)" fill="url(#handle-sheen)" opacity="0.6" />

          {/* Gold Handle End Cap */}
          <circle cx="181" cy="181" r="7" fill="url(#metal-grad-bevel)" stroke="url(#metal-grad-rim)" strokeWidth="1" />

          {/* Outer Beveled Metallic Frame */}
          <circle cx="85" cy="85" r="54" fill="none" stroke="url(#metal-grad-bevel)" strokeWidth="10" />
          
          {/* Inner Dark metal rim */}
          <circle cx="85" cy="85" r="49.5" fill="none" stroke="#1c1605" strokeWidth="1" />
          <circle cx="85" cy="85" r="48.5" fill="none" stroke="url(#metal-grad-rim)" strokeWidth="1" />

          {/* Radial glass lens sheen */}
          <circle cx="85" cy="85" r="48" fill="url(#glass-lens-radial)" />
          
          {/* Fresnel ring highlight */}
          <circle cx="85" cy="85" r="47.2" fill="none" stroke="white" strokeWidth="0.8" opacity="0.4" />

          {/* Specular window reflections */}
          <path d="M52 56 C62 44, 82 40, 102 48" stroke="white" strokeWidth="4.5" strokeLinecap="round" opacity="0.55" />
          <path d="M56 59 C64 49, 80 46, 96 52" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

          {/* Specular light spot */}
          <circle cx="60" cy="60" r="3.5" fill="white" opacity="0.75" />
        </svg>

        {/* Dynamic Zoom Lens Mirroring Layer */}
        <div className={`zoom-lens-container ${showZoom ? "active" : ""}`} style={{ zIndex: 4 }}>
          <div
            ref={cloneRef}
            className="zoomed-content-wrapper"
            dangerouslySetInnerHTML={heroHtml ? { __html: heroHtml } : undefined}
          />
        </div>
      </div>

      {/* Premium Impact Splash */}
      {stage === "impact" && (
        <div className="impact-splash" style={{ left: centerX, top: impactY }}>
          <div className="splash-ripple" />
          <div className="splash-glow" />
          {/* Refracting droplets */}
          <div className="splash-particle" />
          <div className="splash-particle" />
          <div className="splash-particle" />
          <div className="splash-particle" />
          <div className="splash-particle" />
          <div className="splash-particle" />
          <div className="splash-particle" />
          <div className="splash-particle" />
        </div>
      )}
    </div>
  );
}
