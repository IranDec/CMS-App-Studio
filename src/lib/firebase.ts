// Designed by Mohammad Babaei (adschi.com)
import { initializeApp, getApps, getApp, FirebaseError, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
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
let firebaseConfigValid = missingEnvVars.length === 0;

if (!firebaseConfigValid && typeof window !== 'undefined') {
  // Only error loudly on client-side where env vars are expected
  console.error(
      "CRITICAL: Missing Firebase environment variables:", missingEnvVars,
      "\nPlease ensure these are set in your .env file and the server is restarted."
  );
  // Optionally throw an error to halt execution, or let individual services fail
  // throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}. Please check your .env file.`);
} else if (!firebaseConfigValid) {
   // Log warning on server-side, but don't throw to avoid build issues if only client needs them
    console.warn("Missing Firebase environment variables (server-side):", missingEnvVars, "\nFirebase services might not initialize correctly.");
}


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
// let functions;
// let storage;

try {
  // Initialize Firebase only if config seems valid (basic check)
   if (firebaseConfigValid) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    // functions = getFunctions(app);
    // storage = getStorage(app);
    console.log("Firebase initialized successfully.");
   } else if (typeof window !== 'undefined') {
      // Log error on client if config is invalid after initial checks
      console.error("Firebase config is invalid. Cannot initialize Firebase services.");
      // Avoid throwing here to prevent breaking the entire app, rely on checks where auth/db are used
   } else {
      // Log warning on server if config is invalid
      console.warn("Firebase config is invalid on the server. Firebase services will not be available.");
   }

} catch (error) {
  console.error("Firebase initialization error:", error);
  // Handle specific errors like invalid API key more gracefully if possible
  if (error instanceof FirebaseError) {
      console.error(`Firebase Error Code: ${error.code}, Message: ${error.message}`);
      if (error.code === 'auth/invalid-api-key') {
        console.error("--> Likely cause: NEXT_PUBLIC_FIREBASE_API_KEY is missing or incorrect in your .env file.");
      }
  }
  // Set services to null to indicate failure
  app = null;
  auth = null;
  db = null;
}

// Export potentially null services. Components using them MUST check for null.
export { app, auth, db /*, functions, storage */ };
