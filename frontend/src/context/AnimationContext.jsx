/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef } from "react";

const AnimationContext = createContext(null);

export const TIMINGS = {
  PRE_FALL: 300,   // stage: 'idle' (0.0s - 0.3s)
  FALL: 1000,      // stage: 'falling' (0.3s - 1.3s)
  IMPACT: 400,     // stage: 'impact' (1.3s - 1.7s)
  TRAVEL: 1000,    // stage: 'travelling' (1.7s - 2.7s)
  SETTLE: 500,     // stage: 'settling' (2.7s - 3.2s)
};

export function AnimationProvider({ children }) {
  const [stage, setStage] = useState("settled"); // Default to settled so other pages show settled logo immediately
  const [logoRect, setLogoRect] = useState(null);
  const logoElRef = useRef(null);

  const setLogoRef = useCallback((node) => {
    if (node !== null) {
      logoElRef.current = node;
      // Get position
      setLogoRect(node.getBoundingClientRect());
    }
  }, []);

  const updateLogoRect = useCallback(() => {
    if (logoElRef.current) {
      setLogoRect(logoElRef.current.getBoundingClientRect());
    }
  }, []);

  const startAnimation = useCallback(() => {
    // Reset logo rect coordinates just in case layout shifted
    updateLogoRect();
    setStage("idle");

    // Phase 1: Falling (at 0.3s)
    setTimeout(() => {
      setStage("falling");
    }, TIMINGS.PRE_FALL);

    // Phase 2: Impact & Splash (at 1.3s)
    setTimeout(() => {
      setStage("impact");
    }, TIMINGS.PRE_FALL + TIMINGS.FALL);

    // Phase 3: Travel (at 1.7s)
    setTimeout(() => {
      // Re-read logo rect coordinates right before flying to account for any layout changes
      updateLogoRect();
      setStage("travelling");
    }, TIMINGS.PRE_FALL + TIMINGS.FALL + TIMINGS.IMPACT);

    // Phase 4: Settle (at 2.7s)
    setTimeout(() => {
      setStage("settling");
    }, TIMINGS.PRE_FALL + TIMINGS.FALL + TIMINGS.IMPACT + TIMINGS.TRAVEL);

    // Phase 5: Complete & Clean (at 3.2s)
    setTimeout(() => {
      setStage("settled");
    }, TIMINGS.PRE_FALL + TIMINGS.FALL + TIMINGS.IMPACT + TIMINGS.TRAVEL + TIMINGS.SETTLE);

  }, [updateLogoRect]);

  return (
    <AnimationContext.Provider
      value={{
        stage,
        logoRect,
        setLogoRef,
        updateLogoRect,
        startAnimation,
        timings: TIMINGS
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}
