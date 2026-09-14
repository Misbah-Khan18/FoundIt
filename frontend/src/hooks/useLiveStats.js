import { useEffect, useRef, useState } from "react";

// Seed values chosen so lost + found - reunited = 24 active reports at start.
const SEED = { lost: 138, found: 110, reunited: 212 };

/**
 * Simulates a real-time campus activity feed. In a real deployment this
 * would come from a WebSocket / polling endpoint; here it ticks locally
 * on a randomized interval so the dashboard feels alive during a demo.
 */
export function useLiveStats() {
  const [stats, setStats] = useState(SEED);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3200 + Math.random() * 4200; // 3.2s - 7.4s
      timeoutRef.current = setTimeout(() => {
        setStats((prev) => {
          const openCases = prev.lost + prev.found - prev.reunited;
          const roll = Math.random();

          if (roll < 0.45) {
            return { ...prev, lost: prev.lost + 1 };
          }
          if (roll < 0.8) {
            return { ...prev, found: prev.found + 1 };
          }
          if (openCases > 0) {
            return { ...prev, reunited: prev.reunited + 1 };
          }
          return { ...prev, lost: prev.lost + 1 };
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const active = Math.max(0, stats.lost + stats.found - stats.reunited);

  return { ...stats, active };
}
