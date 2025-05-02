// Designed by Mohammad Babaei (adschi.com)
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import your initialized Firebase auth instance

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null; // Add error state
  // Add methods for login, logout, signup if needed later
  // login: (email, password) => Promise<void>;
  // logout: () => Promise<void>;
  // signup: (email, password) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth is initialized before subscribing
    if (!auth) {
        console.error("Firebase Auth is not initialized. Cannot subscribe to auth state changes.");
        setError("Firebase Auth failed to initialize. Check console and .env configuration.");
        setLoading(false);
        return;
    }

    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null); // Clear error on successful auth state change
      console.log('Auth state changed:', currentUser?.uid);
    }, (authStateError) => {
        // Handle errors during auth state listening
        console.error("Error listening to Firebase auth state:", authStateError);
        setError(`Error fetching authentication status: ${authStateError.message}`);
        setUser(null);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
    // Implement login/logout/signup methods here later
  };

  // Render children immediately, but components should check loading/error state
  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Optionally show a global error message if needed */}
      {/* {error && <GlobalAuthError message={error} />} */}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Optional: Component to display a global error if auth fails
// const GlobalAuthError = ({ message }: { message: string }) => {
//   return (
//     <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'red', color: 'white', padding: '10px', textAlign: 'center', zIndex: 1000 }}>
//       Auth Error: {message}
//     </div>
//   );
// };
