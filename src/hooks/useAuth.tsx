"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
// import { useRouter } from 'next/navigation'; // Removed as it's unused here
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword, 
  User 
} from "firebase/auth";
import { AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Removed as it's unused here

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect is handled by the component using the hook based on user state
    } catch (err) {
      console.error("Firebase Sign In Error:", err);
      // Type assertion for error object
      if (err instanceof Error) {
          setError(err.message || "Failed to sign in");
      } else {
          setError("Failed to sign in: An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // Redirect is handled where signOut is called, e.g., in the dashboard component
    } catch (err) {
      console.error("Firebase Sign Out Error:", err);
      // Type assertion for error object
      if (err instanceof Error) {
          setError(err.message || "Failed to sign out");
      } else {
          setError("Failed to sign out: An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

