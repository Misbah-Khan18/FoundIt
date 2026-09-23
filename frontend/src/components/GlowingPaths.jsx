import "./GlowingPaths.css";

export default function GlowingPaths() {
  return (
    <div className="glowing-paths-container" aria-hidden="true">
      {/* 1. HERO MAIN DYNAMIC LIGHT TRAILS (ONLY LEFT & RIGHT EDGES AS IN REFERENCE IMAGE) */}
      <div className="glowing-paths__hero">
        <svg
          className="glowing-paths-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="hero-glow-thick" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="hero-glow-medium" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="hero-particle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients */}
            <linearGradient id="hero-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#D946EF" />
              <animate attributeName="x1" values="0%;100%;0%" dur="18s" repeatCount="indefinite" />
              <animate attributeName="y1" values="0%;100%;0%" dur="18s" repeatCount="indefinite" />
              <animate attributeName="x2" values="100%;0%;100%" dur="18s" repeatCount="indefinite" />
              <animate attributeName="y2" values="100%;0%;100%" dur="18s" repeatCount="indefinite" />
            </linearGradient>

            <linearGradient id="hero-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3155E7" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#00CFFF" />
              <animate attributeName="x1" values="100%;0%;100%" dur="20s" repeatCount="indefinite" />
              <animate attributeName="y1" values="0%;100%;0%" dur="20s" repeatCount="indefinite" />
              <animate attributeName="x2" values="0%;100%;0%" dur="20s" repeatCount="indefinite" />
              <animate attributeName="y2" values="100%;0%;100%" dur="20s" repeatCount="indefinite" />
            </linearGradient>

            <radialGradient id="hero-particle-cyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#00CFFF" />
              <stop offset="100%" stopColor="#00CFFF" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="hero-particle-pink" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#D946EF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* LEFT SIDE TRAILS (Purple/Pink) */}
          <g className="glowing-paths__group glowing-paths__group--left">
            {/* Thick Outer Glow */}
            <path
              d="M -100,-20 C 180,100 80,320 220,480 C 320,600 40,760 -80,950"
              stroke="url(#hero-grad-left)"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.15"
              filter="url(#hero-glow-thick)"
            />
            {/* Medium Soft Glow */}
            <path
              d="M -100,-20 C 180,100 80,320 220,480 C 320,600 40,760 -80,950"
              stroke="url(#hero-grad-left)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.30"
              filter="url(#hero-glow-medium)"
            />
            {/* Sharp Path */}
            <path
              d="M -100,-20 C 180,100 80,320 220,480 C 320,600 40,760 -80,950"
              stroke="url(#hero-grad-left)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.60"
            />
            {/* Energy Pulse */}
            <path
              d="M -100,-20 C 180,100 80,320 220,480 C 320,600 40,760 -80,950"
              stroke="url(#hero-grad-left)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.75"
              className="glowing-paths__pulse-fast"
            />
          </g>

          {/* RIGHT SIDE TRAILS (Blue/Cyan) */}
          <g className="glowing-paths__group glowing-paths__group--right">
            {/* Thick Outer Glow */}
            <path
              d="M 1540,-50 C 1220,120 1380,360 1120,520 C 920,640 1280,780 1520,950"
              stroke="url(#hero-grad-right)"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.15"
              filter="url(#hero-glow-thick)"
            />
            {/* Medium Soft Glow */}
            <path
              d="M 1540,-50 C 1220,120 1380,360 1120,520 C 920,640 1280,780 1520,950"
              stroke="url(#hero-grad-right)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.30"
              filter="url(#hero-glow-medium)"
            />
            {/* Sharp Path */}
            <path
              d="M 1540,-50 C 1220,120 1380,360 1120,520 C 920,640 1280,780 1520,950"
              stroke="url(#hero-grad-right)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.60"
            />
            {/* Energy Pulse */}
            <path
              d="M 1540,-50 C 1220,120 1380,360 1120,520 C 920,640 1280,780 1520,950"
              stroke="url(#hero-grad-right)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.75"
              className="glowing-paths__pulse-fast"
            />
          </g>

          {/* LIGHT PARTICLES */}
          <g className="glowing-paths__particle">
            <circle r="6" fill="url(#hero-particle-pink)" filter="url(#hero-particle-glow)">
              <animateMotion
                dur="16s"
                repeatCount="indefinite"
                path="M -100,-20 C 180,100 80,320 220,480 C 320,600 40,760 -80,950"
              />
            </circle>
          </g>
          <g className="glowing-paths__particle">
            <circle r="6" fill="url(#hero-particle-cyan)" filter="url(#hero-particle-glow)">
              <animateMotion
                dur="20s"
                repeatCount="indefinite"
                path="M 1540,-50 C 1220,120 1380,360 1120,520 C 920,640 1280,780 1520,950"
              />
            </circle>
          </g>
        </svg>
      </div>

      {/* 2. MIDDLE SECTION SUBTLE TRAILS */}
      <div className="glowing-paths__middle">
        <svg
          className="glowing-paths-svg"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mid-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#3155E7" />
            </linearGradient>
            <linearGradient id="mid-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00CFFF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          <g className="glowing-paths__group glowing-paths__group--mid-left">
            <path
              d="M -30,100 C 80,180 50,320 120,400 C 140,420 40,500 -40,550"
              stroke="url(#mid-grad-left)"
              strokeWidth="5"
              opacity="0.10"
              filter="url(#hero-glow-medium)"
            />
            <path
              d="M -30,100 C 80,180 50,320 120,400 C 140,420 40,500 -40,550"
              stroke="url(#mid-grad-left)"
              strokeWidth="1.2"
              opacity="0.35"
            />
          </g>

          <g className="glowing-paths__group glowing-paths__group--mid-right">
            <path
              d="M 1470,80 C 1380,160 1410,260 1320,340 C 1290,370 1350,440 1470,490"
              stroke="url(#mid-grad-right)"
              strokeWidth="5"
              opacity="0.10"
              filter="url(#hero-glow-medium)"
            />
            <path
              d="M 1470,80 C 1380,160 1410,260 1320,340 C 1290,370 1350,440 1470,490"
              stroke="url(#mid-grad-right)"
              strokeWidth="1.2"
              opacity="0.35"
            />
          </g>
        </svg>
      </div>

      {/* 3. BOTTOM SUBTLE TRANSITION TRAIL */}
      <div className="glowing-paths__bottom">
        <svg
          className="glowing-paths-svg"
          viewBox="0 0 1440 300"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3155E7" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#00CFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M -50,150 C 300,80 600,220 850,120 C 1050,50 1250,180 1490,100"
            stroke="url(#bottom-grad)"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
