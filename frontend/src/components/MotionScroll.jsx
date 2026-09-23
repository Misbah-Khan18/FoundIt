import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./MotionScroll.css";

// Eagerly resolve all frames from the motion asset directory
const frameModules = import.meta.glob("../assets/motion/ezgif-frame-*.jpg", {
  eager: true,
  import: "default"
});

// Sort frames in strictly numerical order (frame-001 -> frame-300)
const frameKeys = Object.keys(frameModules).sort((a, b) => {
  const matchA = a.match(/ezgif-frame-(\d+)\.jpg$/);
  const matchB = b.match(/ezgif-frame-(\d+)\.jpg$/);
  const numA = matchA ? parseInt(matchA[1], 10) : 0;
  const numB = matchB ? parseInt(matchB[1], 10) : 0;
  return numA - numB;
});

const FRAME_URLS = frameKeys.map((k) => frameModules[k]);
const TOTAL_FRAMES = FRAME_URLS.length;

export default function MotionScroll({ children, endCta }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const blurRef = useRef(null);
  const overlayRef = useRef(null);
  const ctaRef = useRef(null);
  const imagesRef = useRef([]);
  const lastDrawnIndexRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true
    });

    const images = new Array(TOTAL_FRAMES);
    imagesRef.current = images;

    const drawFrame = (index) => {
      if (!canvas || !ctx) return;

      const img = images[index];
      const targetImg =
        img && img.complete && img.naturalWidth > 0
          ? img
          : images[lastDrawnIndexRef.current] &&
            images[lastDrawnIndexRef.current].complete &&
            images[lastDrawnIndexRef.current].naturalWidth > 0
          ? images[lastDrawnIndexRef.current]
          : null;

      if (!targetImg) return;
      lastDrawnIndexRef.current = index;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = targetImg.naturalWidth;
      const ih = targetImg.naturalHeight;

      const scale = Math.max(cw / iw, ch / ih);
      const nw = Math.ceil(iw * scale);
      const nh = Math.ceil(ih * scale);
      const nx = Math.floor((cw - nw) / 2);
      const ny = Math.floor((ch - nh) / 2);

      ctx.drawImage(targetImg, nx, ny, nw, nh);
    };

    const updateSize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }

      drawFrame(lastDrawnIndexRef.current);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    // 1. Immediately load frame 0 and display it
    const firstImg = new Image();
    firstImg.decoding = "async";
    firstImg.src = FRAME_URLS[0];
    firstImg.onload = () => {
      if (!isMounted) return;
      images[0] = firstImg;
      drawFrame(0);
    };
    images[0] = firstImg;

    // 2. Preload remaining frames
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = FRAME_URLS[i];
      img.onload = () => {
        if (!isMounted) return;
        images[i] = img;
      };
      images[i] = img;
    }

    // 3. Official GSAP context for React 18/19 safe scoping and clean unmounting
    const gsapCtx = gsap.context(() => {
      const playhead = { frame: 0 };

      gsap.to(playhead, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3200",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const frameIdx = Math.min(
              TOTAL_FRAMES - 1,
              Math.max(0, Math.round(playhead.frame))
            );
            drawFrame(frameIdx);

            // Reveal end-CTA when scrub reaches ~75% complete
            if (ctaRef.current) {
              const p = self.progress; // 0 → 1
              const ctaStart = 0.72;
              const ctaEnd = 0.92;
              if (p < ctaStart) {
                ctaRef.current.style.opacity = "0";
                ctaRef.current.style.transform = "translateY(28px)";
                ctaRef.current.style.pointerEvents = "none";
              } else if (p >= ctaEnd) {
                ctaRef.current.style.opacity = "1";
                ctaRef.current.style.transform = "translateY(0)";
                ctaRef.current.style.pointerEvents = "auto";
              } else {
                const t = (p - ctaStart) / (ctaEnd - ctaStart);
                ctaRef.current.style.opacity = String(t);
                ctaRef.current.style.transform = `translateY(${28 * (1 - t)}px)`;
                ctaRef.current.style.pointerEvents = t > 0.5 ? "auto" : "none";
              }
            }
          }
        }
      });

      // Remove blur permanently once user scrolls once
      let unblurred = false;
      const removeBlur = () => {
        if (unblurred || !blurRef.current) return;
        unblurred = true;
        gsap.to(blurRef.current, {
          opacity: 0,
          backdropFilter: "blur(0px)",
          duration: 0.75,
          ease: "power2.out",
          onComplete: () => {
            if (blurRef.current) {
              blurRef.current.style.display = "none";
            }
          }
        });
        window.removeEventListener("scroll", onScrollCheck);
        window.removeEventListener("wheel", onWheelCheck);
        window.removeEventListener("touchmove", onTouchCheck);
      };

      const onScrollCheck = () => {
        if (window.scrollY > 4) removeBlur();
      };
      const onWheelCheck = (e) => {
        if (e.deltaY > 0) removeBlur();
      };
      const onTouchCheck = () => {
        removeBlur();
      };

      window.addEventListener("scroll", onScrollCheck, { passive: true });
      window.addEventListener("wheel", onWheelCheck, { passive: true });
      window.addEventListener("touchmove", onTouchCheck, { passive: true });

      if (window.scrollY > 10) {
        removeBlur();
      }

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          y: -60,
          scale: 0.96,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=600",
            scrub: 0.5
          }
        });
      }

      return () => {
        window.removeEventListener("scroll", onScrollCheck);
        window.removeEventListener("wheel", onWheelCheck);
        window.removeEventListener("touchmove", onTouchCheck);
      };
    }, containerRef);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", updateSize);
      gsapCtx.revert();
    };
  }, []);

  return (
    <div className="motion-scroll-wrapper" ref={containerRef}>
      <canvas className="motion-scroll-canvas" ref={canvasRef} />
      <div className="motion-scroll-blur-layer" ref={blurRef} />
      {children && (
        <div className="motion-scroll-overlay" ref={overlayRef}>
          {children}
        </div>
      )}
      {endCta && (
        <div className="motion-scroll-end-cta" ref={ctaRef}>
          {endCta}
        </div>
      )}
    </div>
  );
}
