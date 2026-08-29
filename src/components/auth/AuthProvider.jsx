"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuth,
  getStoredUser,
  login as loginRequest,
  setStoredUser,
  signup as signupRequest,
} from "@/api/client/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  function applySession(result) {
    const nextUser = result.data?.user ?? null;
    if (nextUser) {
      setStoredUser(nextUser);
    }
    setUser(nextUser);
    return result;
  }

  async function login(payload) {
    return applySession(await loginRequest(payload));
  }

  async function signup(payload) {
    return applySession(await signupRequest(payload));
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
