// Designed by Mohammad Babaei (adschi.com)
import { initializeApp, getApps, getApp, FirebaseError } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getFunctions } from "firebase/functions";
// import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && typeof window !== 'undefined') {
  // Only throw error on client-side where env vars are expected
  console.error("Missing Firebase environment variables:", missingEnvVars);
  throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}. Please check your .env file.`);
} else if (missingEnvVars.length > 0) {
   // Log warning on server-side, but don't throw to avoid build issues if only client needs them
    console.warn("Missing Firebase environment variables (server-side):", missingEnvVars);
}


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
let auth;
let db;
// let functions;
// let storage;

try {
  // Initialize Firebase only if config seems valid (basic check)
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    // functions = getFunctions(app);
    // storage = getStorage(app);
  } else if (typeof window !== 'undefined') {
      // Only error loudly on client if essential config is missing after initial checks
      console.error("Firebase config is missing essential values (apiKey, projectId). Cannot initialize Firebase.");
      // Avoid throwing here to prevent breaking the entire app, rely on checks where auth/db are used
  } else {
      console.warn("Firebase config seems incomplete on the server. Skipping initialization.");
  }

} catch (error) {
  console.error("Firebase initialization error:", error);
  // Handle specific errors like invalid API key more gracefully if possible
  if (error instanceof FirebaseError && error.code === 'auth/invalid-api-key') {
    console.error("Firebase Authentication Error: Invalid API Key. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your .env file.");
  }
  // Depending on the use case, you might want to re-throw or handle differently
  // For this app, we'll log the error but let the app continue,
  // components using Firebase should handle the uninitialized state.
}

export { app, auth, db /*, functions, storage */ };
