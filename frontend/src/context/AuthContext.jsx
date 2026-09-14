/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase.js";
import { signInWithPopup } from "firebase/auth";

const AuthContext = createContext(null);

export const API_BASE_URL = "/foundit-backend/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me.php`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("Failed to check session.", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Standard Email & Password Login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
      throw new Error(data.message || "Invalid email or password.");
    } catch (err) {
      throw new Error(err.message || "Unable to connect to the authentication server.");
    }
  };

  // Google authentication helper using Firebase & PHP verification
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();

        // Submit the Firebase ID token to the server-side verification API
        const response = await fetch(`${API_BASE_URL}/auth/google-login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken })
        });

        const data = await response.json();
        if (response.ok && data.success && data.user) {
          setUser(data.user);
          return data.user;
        } else {
          throw new Error(data.message || "Google authentication failed on backend.");
        }
      } catch (err) {
        console.error("Google Auth error:", err);
        throw new Error(err.message || "Google Sign-In failed.");
      }
    } else {
      throw new Error("Firebase is not configured. Google Sign-In is unavailable.");
    }
  };

  // Standard Email & Password Registration
  const register = async (name, email, phone_number, password, roll_number, stream, vehicle_number, vehicle_type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone_number, password }),
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }
      return data;
    } catch (err) {
      throw new Error(err.message || "Unable to connect to the registration server.");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Logout request to server failed:", error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}