import { createContext, useContext, useState, useEffect } from "react";
import { GROUND_FLOOR_SLOTS, LOWER_GROUND_SLOTS } from "../data/initialSlots.js";

const ParkingContext = createContext(null);

export function ParkingProvider({ children }) {
  const [slots, setSlots] = useState(() => {
    const saved = localStorage.getItem("allana_parking_slots");
    if (saved) return JSON.parse(saved);
    return { ground: GROUND_FLOOR_SLOTS, lower: LOWER_GROUND_SLOTS };
  });

  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem("allana_active_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [passInfo, setPassInfo] = useState(() => {
    const saved = localStorage.getItem("allana_pass_info");
    return saved ? JSON.parse(saved) : { active: false, daysRemaining: 0, expiryDate: null };
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("allana_parking_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("allana_parking_slots", JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem("allana_active_session", JSON.stringify(activeSession));
    } else {
      localStorage.removeItem("allana_active_session");
    }
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem("allana_pass_info", JSON.stringify(passInfo));
  }, [passInfo]);

  useEffect(() => {
    localStorage.setItem("allana_parking_history", JSON.stringify(history));
  }, [history]);

  // Update pass info daily countdown simulation
  useEffect(() => {
    if (passInfo.active && passInfo.expiryDate) {
      const today = new Date();
      const expiry = new Date(passInfo.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        setPassInfo({ active: false, daysRemaining: 0, expiryDate: null });
      } else if (diffDays !== passInfo.daysRemaining) {
        setPassInfo(prev => ({ ...prev, daysRemaining: diffDays }));
      }
    }
  }, [passInfo]);

  // Park vehicle
  const parkInSlot = (slotId, zone) => {
    // Check if user already has an active session
    if (activeSession) {
      throw new Error("You already have an active parking session. Release your current slot first.");
    }

    const zoneKey = zone === "ground" ? "ground" : "lower";
    const slotIndex = slots[zoneKey].findIndex(s => s.id === slotId);

    if (slotIndex === -1) {
      throw new Error("Parking slot not found.");
    }

    const slot = slots[zoneKey][slotIndex];
    if (slot.status !== "available") {
      throw new Error("Slot is no longer available. Please select another slot.");
    }

    // Mark occupied
    const updatedSlots = { ...slots };
    updatedSlots[zoneKey] = [...slots[zoneKey]];
    updatedSlots[zoneKey][slotIndex] = { ...slot, status: "occupied" };
    setSlots(updatedSlots);

    // Create session
    const newSession = {
      slotId,
      zone,
      entryTime: new Date().toISOString(),
      status: "Currently Parked"
    };
    setActiveSession(newSession);

    // Add initial log to history
    setHistory(prev => [
      {
        id: "PK-" + Date.now(),
        slotId,
        zone,
        entryTime: newSession.entryTime,
        exitTime: null,
        status: "active"
      },
      ...prev
    ]);
  };

  // Leave slot
  const leaveSlot = () => {
    if (!activeSession) return;

    const { slotId, zone, entryTime } = activeSession;
    const zoneKey = zone === "ground" ? "ground" : "lower";
    const slotIndex = slots[zoneKey].findIndex(s => s.id === slotId);

    // Mark available
    if (slotIndex !== -1) {
      const updatedSlots = { ...slots };
      updatedSlots[zoneKey] = [...slots[zoneKey]];
      updatedSlots[zoneKey][slotIndex] = { ...slots[zoneKey][slotIndex], status: "available" };
      setSlots(updatedSlots);
    }

    const exitTime = new Date().toISOString();

    // Update active history item
    setHistory(prev => 
      prev.map(log => 
        log.slotId === slotId && log.entryTime === entryTime && log.exitTime === null
          ? { ...log, exitTime, status: "completed" }
          : log
      )
    );

    setActiveSession(null);
  };

  // Purchase Monthly Pass
  const purchasePass = (durationDays = 30) => {
    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + durationDays);

    setPassInfo({
      active: true,
      daysRemaining: durationDays,
      expiryDate: expiry.toISOString().split("T")[0]
    });
  };

  return (
    <ParkingContext.Provider
      value={{
        slots,
        activeSession,
        passInfo,
        history,
        parkInSlot,
        leaveSlot,
        purchasePass
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error("useParking must be used within a ParkingProvider");
  }
  return context;
}
