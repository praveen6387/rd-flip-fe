"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SESSION_EXPIRED_EVENT,
  clearAuth,
  getStoredUser,
  hasAccessToken,
  login as loginRequest,
  setStoredUser,
  signup as signupRequest,
} from "@/lib/api/client/auth";
import { ROUTES } from "@/lib/routes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  const expireSession = useCallback(() => {
    clearAuth();
    setUser(null);
    setAuthMode("login");

    if (window.location.pathname.startsWith("/dashboard")) {
      router.replace(ROUTES.home);
    }
  }, [router]);

  useEffect(() => {
    const forceLogin =
      new URLSearchParams(window.location.search).get("login") === "1";

    if (forceLogin) {
      clearAuth();
      setUser(null);
      setAuthMode("login");
      router.replace(ROUTES.home, { scroll: false });
    } else if (!hasAccessToken()) {
      clearAuth();
      setUser(null);
    } else {
      setUser(getStoredUser());
    }

    setReady(true);
  }, [router]);

  useEffect(() => {
    function onSessionExpired() {
      clearAuth();
      setUser(null);
      setAuthMode("login");

      if (window.location.pathname.startsWith("/dashboard")) {
        router.replace(ROUTES.home);
      }
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [router]);

  function applySession(result) {
    const nextUser = result.data?.user ?? null;
    if (nextUser) {
      setStoredUser(nextUser);
    }
    setUser(nextUser);
    setAuthMode(null);
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
    setAuthMode(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        ready,
        authMode,
        setAuthMode,
        expireSession,
      }}
    >
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
