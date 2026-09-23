/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase.js";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const AuthContext = createContext(null);

export const API_BASE_URL = "/foundit-backend/api";

let currentCsrfToken = "";

export function getStoredCsrfToken() {
  return currentCsrfToken;
}

export function setStoredCsrfToken(token) {
  if (token) {
    currentCsrfToken = token;
  }
}

export async function fetchWithCsrf(url, options = {}) {
  const opts = { ...options };
  opts.credentials = opts.credentials || "include";
  opts.headers = { ...(opts.headers || {}) };

  const method = (opts.method || "GET").toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    if (!currentCsrfToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/csrf-token.php`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.csrf_token) {
            currentCsrfToken = data.csrf_token;
          }
        }
      } catch {
        // Fallback
      }
    }
    if (currentCsrfToken) {
      opts.headers["X-CSRF-Token"] = currentCsrfToken;
      if (opts.body instanceof FormData && !opts.body.has("csrf_token")) {
        opts.body.append("csrf_token", currentCsrfToken);
      }
    }
  }

  return fetch(url, opts);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfTokenState] = useState("");

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
            if (data.csrf_token) {
              setStoredCsrfToken(data.csrf_token);
              setCsrfTokenState(data.csrf_token);
            }
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
        if (data.csrf_token) {
          setStoredCsrfToken(data.csrf_token);
          setCsrfTokenState(data.csrf_token);
        }
        return data.user;
      }
      throw new Error(data.message || "Invalid email or password.");
    } catch (err) {
      throw new Error(err.message || "Unable to connect to the authentication server.", { cause: err });
    }
  };

  // Google authentication helper using Firebase & PHP verification
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const googleIdToken = credential?.idToken || null;

        // Submit the Firebase ID token and Google credential to server-side verification API
        const response = await fetch(`${API_BASE_URL}/auth/google-login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            idToken,
            googleIdToken,
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            }
          })
        });

        const data = await response.json();
        if (response.ok && data.success && data.user) {
          setUser(data.user);
          if (data.csrf_token) {
            setStoredCsrfToken(data.csrf_token);
            setCsrfTokenState(data.csrf_token);
          }
          return data.user;
        } else {
          throw new Error(data.message || "Google authentication failed on backend.");
        }
      } catch (err) {
        console.error("Google Auth error:", err);
        throw new Error(err.message || "Google Sign-In failed.", { cause: err });
      }
    } else {
      throw new Error("Firebase is not configured. Google Sign-In is unavailable.");
    }
  };

  // Standard Email & Password Registration
  const register = async (name, email, phone_number, password, roll_number, stream) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone_number: phone_number.trim(),
          password,
          roll_number: roll_number ? roll_number.trim() : "",
          stream: stream ? stream.trim() : ""
        }),
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }
      return data;
    } catch (err) {
      throw new Error(err.message || "Unable to connect to the registration server.", { cause: err });
    }
  };

  // Password Recovery Flow
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to process password reset request.");
      }
      return data;
    } catch (err) {
      throw new Error(err.message || "Unable to connect to the password reset service.", { cause: err });
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password.");
      }
      return data;
    } catch (err) {
      throw new Error(err.message || "Unable to connect to the password reset service.", { cause: err });
    }
  };

  const logout = async () => {
    try {
      await fetchWithCsrf(`${API_BASE_URL}/auth/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Logout request to server failed:", error);
    }
    currentCsrfToken = "";
    setCsrfTokenState("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        csrfToken,
        fetchWithCsrf,
        login,
        loginWithGoogle,
        register,
        forgotPassword,
        resetPassword,
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