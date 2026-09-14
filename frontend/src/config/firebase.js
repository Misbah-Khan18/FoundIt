import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_firebase_api_key_here" &&
  firebaseConfig.projectId
);

let appInstance = null;
let authInstance = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
  } catch (err) {
    console.warn("Firebase initialization skipped or failed:", err);
  }
}

export const app = appInstance;
export const auth = authInstance;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
try {
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
} catch {
  // Provider config fallback
}

