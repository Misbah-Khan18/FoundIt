import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function AboutIllustration() {
  const containerRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial entry animation - scale and fade in nodes
      gsap.fromTo(
        ".node-group",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "back.out(1.5)",
          stagger: 0.15,
        }
      );

      gsap.fromTo(
        ".center-core",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" }
      );

      // 2. Idle Floating animations (yoyo drift) for the 4 outer nodes
      const driftY = (targets, yValue, duration, delay) => {
        gsap.to(targets, {
          y: yValue,
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: delay,
        });
      };

      driftY(".node-id", -8, 3.2, 0);
      driftY(".node-tech", -12, 2.8, 0.4);
      driftY(".node-keys", -6, 3.5, 0.2);
      driftY(".node-books", -10, 3.0, 0.6);

      // 3. Floating animation for center core (smaller drift)
      gsap.to(".center-core", {
        y: -4,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 4. Glowing signal pulses traveling along connector lines
      gsap.to(".pulse-overlay", {
        strokeDashoffset: -60,
        duration: 3,
        repeat: -1,
        ease: "none",
      });

      // 5. Pulsing rings radiating from the center engine
      gsap.to(".pulse-ring-1", {
        r: 80,
        opacity: 0,
        duration: 3,
        repeat: -1,
        ease: "power1.out",
      });
      gsap.to(".pulse-ring-2", {
        r: 110,
        opacity: 0,
        duration: 3,
        repeat: -1,
        ease: "power1.out",
        delay: 1.5,
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Handle individual node hover triggers via GSAP
  const handleMouseEnter = (nodeId, selector) => {
    setActiveNode(nodeId);
    gsap.to(selector, {
      scale: 1.12,
      filter: "drop-shadow(0 12px 24px rgba(30, 54, 116, 0.25))",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
    // Highlight the specific line connected to it
    gsap.to(`.line-${nodeId}`, {
      stroke: "var(--gold-500)",
      strokeWidth: 3,
      opacity: 1,
      duration: 0.3,
    });
  };

  const handleMouseLeave = (nodeId, selector) => {
    setActiveNode(null);
    gsap.to(selector, {
      scale: 1,
      filter: "drop-shadow(0 4px 10px rgba(8, 14, 28, 0.08))",
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
    // Revert connector line
    gsap.to(`.line-${nodeId}`, {
      stroke: "var(--navy-700)",
      strokeWidth: 2,
      opacity: 0.6,
      duration: 0.4,
    });
  };

  return (
    <div className="about-illustration-container" ref={containerRef}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="about-illustration-svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--navy-700)" />
            <stop offset="100%" stopColor="var(--navy-950)" />
          </linearGradient>
          
          <linearGradient id="idCardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="var(--ivory-dim)" />
          </linearGradient>

          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gold-500)" />
            <stop offset="100%" stopColor="var(--gold-600)" />
          </linearGradient>

          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--navy-600)" />
            <stop offset="100%" stopColor="var(--navy-800)" />
          </linearGradient>

          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--red-500)" />
            <stop offset="100%" stopColor="#a8181f" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="shadowFilter" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* 1. Radar background scanning grid */}
        <circle cx="250" cy="250" r="200" stroke="var(--border-light)" strokeWidth="0.75" strokeDasharray="4 6" />
        <circle cx="250" cy="250" r="140" stroke="var(--border-light)" strokeWidth="0.75" strokeDasharray="4 6" />
        <line x1="250" y1="50" x2="250" y2="450" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="2 4" />
        <line x1="50" y1="250" x2="450" y2="250" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="2 4" />

        {/* 2. Concentric pulsing waves radiating from the central core */}
        <circle className="pulse-ring-1" cx="250" cy="250" r="45" stroke="var(--navy-600)" strokeWidth="1.5" fill="none" opacity="0.35" />
        <circle className="pulse-ring-2" cx="250" cy="250" r="45" stroke="var(--gold-500)" strokeWidth="1" fill="none" opacity="0.25" />

        {/* 3. Curved Connector Neural Pathways */}
        {/* ID Card to Core */}
        <path d="M 125 155 Q 187.5 170 250 250" stroke="var(--border-light)" strokeWidth="2.5" fill="none" />
        <path className="pulse-overlay line-id" d="M 125 155 Q 187.5 170 250 250" stroke="var(--navy-700)" strokeWidth="2" strokeDasharray="8 12" fill="none" opacity="0.6" />

        {/* Tech device to Core */}
        <path d="M 375 145 Q 312.5 170 250 250" stroke="var(--border-light)" strokeWidth="2.5" fill="none" />
        <path className="pulse-overlay line-tech" d="M 375 145 Q 312.5 170 250 250" stroke="var(--navy-700)" strokeWidth="2" strokeDasharray="8 12" fill="none" opacity="0.6" />

        {/* Keys to Core */}
        <path d="M 120 355 Q 185 330 250 250" stroke="var(--border-light)" strokeWidth="2.5" fill="none" />
        <path className="pulse-overlay line-keys" d="M 120 355 Q 185 330 250 250" stroke="var(--navy-700)" strokeWidth="2" strokeDasharray="8 12" fill="none" opacity="0.6" />

        {/* Notebook to Core */}
        <path d="M 375 355 Q 312.5 330 250 250" stroke="var(--border-light)" strokeWidth="2.5" fill="none" />
        <path className="pulse-overlay line-books" d="M 375 355 Q 312.5 330 250 250" stroke="var(--navy-700)" strokeWidth="2" strokeDasharray="8 12" fill="none" opacity="0.6" />

        {/* 4. Center Core: FoundIt Match Portal */}
        <g className="center-core" style={{ transformOrigin: "250px 250px" }}>
          {/* Glow backdrop */}
          <circle cx="250" cy="250" r="50" fill="var(--navy-600)" opacity="0.12" />
          <circle cx="250" cy="250" r="42" fill="url(#coreGradient)" filter="url(#shadowFilter)" />
          {/* Logo element inside core (Stack/Database representing registry) */}
          <g transform="translate(235, 234) scale(0.9)">
            {/* Top database cylinder */}
            <path d="M5 6 C5 3.8 15 2 25 2 C35 2 45 3.8 45 6 C45 8.2 35 10 25 10 C15 10 5 8.2 5 6 Z" fill="var(--gold-500)" />
            {/* Middle cylinder segment */}
            <path d="M5 6 V13 C5 15.2 15 17 25 17 C35 17 45 15.2 45 13 V6 C45 8.2 35 10 25 10 C15 10 5 8.2 5 6 Z" fill="var(--ivory)" opacity="0.85" />
            <path d="M5 6 V13" stroke="var(--navy-950)" strokeWidth="1" />
            <path d="M45 6 V13" stroke="var(--navy-950)" strokeWidth="1" />
            <path d="M5 13 C5 15.2 15 17 25 17 C35 17 45 15.2 45 13" fill="none" stroke="var(--navy-950)" strokeWidth="1" />
            {/* Bottom cylinder segment */}
            <path d="M5 13 V20 C5 22.2 15 24 25 24 C35 24 45 22.2 45 20 V13 C45 15.2 35 17 25 17 C15 17 5 15.2 5 13 Z" fill="var(--gold-500)" />
            <path d="M5 13 V20" stroke="var(--navy-950)" strokeWidth="1" />
            <path d="M45 13 V20" stroke="var(--navy-950)" strokeWidth="1" />
            <path d="M5 20 C5 22.2 15 24 25 24 C35 24 45 22.2 45 20" fill="none" stroke="var(--navy-950)" strokeWidth="1" />
            {/* Tiny green check symbol next to it */}
            <circle cx="43" cy="22" r="7" fill="#10b981" stroke="var(--navy-950)" strokeWidth="1" />
            <path d="M40 22 L42 24 L46 20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </g>

        {/* 5. Node 1: Student ID Card (Top-Left) */}
        <g
          className="node-group node-id"
          style={{ transformOrigin: "110px 130px", cursor: "pointer" }}
          onMouseEnter={() => handleMouseEnter("id", ".node-id")}
          onMouseLeave={() => handleMouseLeave("id", ".node-id")}
        >
          {/* Card body */}
          <rect x="70" y="95" width="80" height="55" rx="8" fill="url(#idCardGradient)" stroke="var(--navy-700)" strokeWidth="1.75" filter="url(#shadowFilter)" />
          {/* ID chip */}
          <rect x="80" y="105" width="12" height="10" rx="2" fill="url(#goldGradient)" />
          {/* Profile photo placeholder */}
          <rect x="80" y="121" width="18" height="20" rx="3" fill="var(--slate-300)" />
          <circle cx="89" cy="126" r="3.5" fill="var(--slate-500)" />
          <path d="M82 138 C82 134 85 132 89 132 C93 132 96 134 96 138" fill="var(--slate-500)" />
          {/* ID Text Lines */}
          <line x1="105" y1="110" x2="140" y2="110" stroke="var(--navy-900)" strokeWidth="2" strokeLinecap="round" />
          <line x1="105" y1="118" x2="132" y2="118" stroke="var(--slate-500)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="105" y1="125" x2="124" y2="125" stroke="var(--slate-500)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Interactive highlight ring */}
          <circle cx="110" cy="122" r="48" fill="transparent" />
        </g>

        {/* 6. Node 2: Smartphone/Electronics (Top-Right) */}
        <g
          className="node-group node-tech"
          style={{ transformOrigin: "390px 125px", cursor: "pointer" }}
          onMouseEnter={() => handleMouseEnter("tech", ".node-tech")}
          onMouseLeave={() => handleMouseLeave("tech", ".node-tech")}
        >
          {/* Phone body */}
          <rect x="365" y="80" width="50" height="90" rx="10" fill="var(--navy-950)" stroke="var(--border-glass)" strokeWidth="1.5" filter="url(#shadowFilter)" />
          {/* Phone screen */}
          <rect x="369" y="87" width="42" height="76" rx="6" fill="url(#blueGradient)" />
          {/* Speaker notch */}
          <rect x="385" y="83" width="10" height="2" rx="1" fill="var(--slate-300)" opacity="0.6" />
          {/* Graphic on screen: circular radar waves */}
          <circle cx="390" cy="125" r="14" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
          <circle cx="390" cy="125" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
          {/* Lost phone alert banner (red gradient) */}
          <rect x="372" y="138" width="36" height="18" rx="3" fill="url(#redGradient)" />
          <text x="390" y="149" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">LOST</text>
          {/* Interactive overlay */}
          <circle cx="390" cy="125" r="54" fill="transparent" />
        </g>

        {/* 7. Node 3: Keyring & Keys (Bottom-Left) */}
        <g
          className="node-group node-keys"
          style={{ transformOrigin: "100px 350px", cursor: "pointer" }}
          onMouseEnter={() => handleMouseEnter("keys", ".node-keys")}
          onMouseLeave={() => handleMouseLeave("keys", ".node-keys")}
        >
          {/* Keyring circle */}
          <circle cx="100" cy="335" r="16" stroke="var(--slate-500)" strokeWidth="2.5" fill="none" filter="url(#shadowFilter)" />
          {/* Key 1 (diagonal) */}
          <g transform="translate(100, 335) rotate(45)">
            <rect x="-3" y="12" width="6" height="28" fill="url(#goldGradient)" rx="1.5" />
            {/* Key teeth */}
            <rect x="3" y="24" width="4" height="3" fill="url(#goldGradient)" />
            <rect x="3" y="30" width="4" height="3" fill="url(#goldGradient)" />
            <circle cx="0" cy="12" r="6" stroke="url(#goldGradient)" strokeWidth="2.5" fill="none" />
          </g>
          {/* Key 2 (slanted other way) */}
          <g transform="translate(100, 335) rotate(-20)">
            <rect x="-2.5" y="14" width="5" height="24" fill="var(--slate-300)" rx="1" />
            <rect x="2.5" y="22" width="3.5" height="2.5" fill="var(--slate-300)" />
            <rect x="2.5" y="28" width="3.5" height="2.5" fill="var(--slate-300)" />
            <circle cx="0" cy="12" r="5.5" stroke="var(--slate-300)" strokeWidth="2.5" fill="none" />
          </g>
          {/* Red access card tag */}
          <rect x="76" y="338" width="16" height="26" rx="3" fill="url(#redGradient)" transform="rotate(-30, 84, 351)" filter="url(#shadowFilter)" />
          <circle cx="84" cy="344" r="2.5" fill="var(--ivory)" />
          {/* Interactive overlap */}
          <circle cx="100" cy="350" r="50" fill="transparent" />
        </g>

        {/* 8. Node 4: Backpack & Notebook (Bottom-Right) */}
        <g
          className="node-group node-books"
          style={{ transformOrigin: "390px 355px", cursor: "pointer" }}
          onMouseEnter={() => handleMouseEnter("books", ".node-books")}
          onMouseLeave={() => handleMouseLeave("books", ".node-books")}
        >
          {/* Book cover (Navy blue with gold emblem) */}
          <rect x="360" y="320" width="62" height="74" rx="5" fill="var(--navy-900)" stroke="var(--navy-700)" strokeWidth="1.5" filter="url(#shadowFilter)" />
          {/* Inner pages edges (white lines stacked) */}
          <path d="M421 325 L425 325 L425 391 L421 391" stroke="var(--slate-300)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Gold embossed badge on notebook cover */}
          <polygon points="391,348 396,357 386,357" fill="url(#goldGradient)" />
          <polygon points="391,362 396,353 386,353" fill="url(#goldGradient)" />
          <circle cx="391" cy="355" r="1.5" fill="var(--ivory)" />
          {/* Book ribbon */}
          <path d="M375 394 L375 408 L380 404 L385 408 L385 394 Z" fill="url(#redGradient)" />
          {/* Binding spirals */}
          <path d="M356 330 C360 330 362 333 360 335 C358 337 356 335 356 335" stroke="var(--gold-500)" strokeWidth="1.5" fill="none" />
          <path d="M356 342 C360 342 362 345 360 347 C358 349 356 347 356 347" stroke="var(--gold-500)" strokeWidth="1.5" fill="none" />
          <path d="M356 354 C360 354 362 357 360 359 C358 361 356 359 356 359" stroke="var(--gold-500)" strokeWidth="1.5" fill="none" />
          <path d="M356 366 C360 366 362 369 360 371 C358 373 356 371 356 371" stroke="var(--gold-500)" strokeWidth="1.5" fill="none" />
          <path d="M356 378 C360 378 362 381 360 383 C358 385 356 383 356 383" stroke="var(--gold-500)" strokeWidth="1.5" fill="none" />
          {/* Interactive overlay */}
          <circle cx="390" cy="355" r="52" fill="transparent" />
        </g>
      </svg>

      {/* Floating Interactive Tooltip/Label */}
      <div className={`about-illustration-tooltip ${activeNode ? "visible" : ""}`}>
        {activeNode === "id" && (
          <div className="tooltip-content color-id">
            <span className="tooltip-dot"></span>
            <strong>Student ID Cards</strong>
            <p>Direct database mapping for MIT-WPU cardholders</p>
          </div>
        )}
        {activeNode === "tech" && (
          <div className="tooltip-content color-tech">
            <span className="tooltip-dot"></span>
            <strong>Devices & Electronics</strong>
            <p>Smart verification logs for high-value tech items</p>
          </div>
        )}
        {activeNode === "keys" && (
          <div className="tooltip-content color-keys">
            <span className="tooltip-dot"></span>
            <strong>Keys & Security Badges</strong>
            <p>Direct communication route with campus security desks</p>
          </div>
        )}
        {activeNode === "books" && (
          <div className="tooltip-content color-books">
            <span className="tooltip-dot"></span>
            <strong>Books, Bags & Stationery</strong>
            <p>Coordinated return paths across library and study facilities</p>
          </div>
        )}
      </div>
    </div>
  );
}
