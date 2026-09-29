"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  SESSION_EXPIRED_EVENT,
  clearAuth,
  fetchMe,
  getCachedUser,
  hasAccessToken,
  login as loginRequest,
  setCachedUser,
  signup as signupRequest,
} from "@/lib/api/client/auth";
import { ROUTES } from "@/lib/routes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  const expireSession = useCallback(() => {
    clearAuth();
    setUser(null);
    setVerified(false);
    setAuthMode("login");

    if (window.location.pathname.startsWith("/dashboard")) {
      router.replace(ROUTES.home);
    }
  }, [router]);

  useLayoutEffect(() => {
    let cancelled = false;

    async function boot() {
      const forceLogin =
        new URLSearchParams(window.location.search).get("login") === "1";

      if (forceLogin) {
        clearAuth();
        setUser(null);
        setVerified(false);
        setAuthMode("login");
        router.replace(ROUTES.home, { scroll: false });
        if (!cancelled) setReady(true);
        return;
      }

      if (!hasAccessToken()) {
        clearAuth();
        setUser(null);
        setVerified(false);
        if (!cancelled) setReady(true);
        return;
      }

      const cached = getCachedUser();
      if (cached) setUser(cached);
      if (!cancelled) setReady(true);

      try {
        const nextUser = await fetchMe();
        if (cancelled) return;
        if (nextUser) {
          setCachedUser(nextUser);
          setUser(nextUser);
          setVerified(true);
        } else {
          clearAuth();
          setUser(null);
          setVerified(false);
        }
      } catch {
        if (cancelled) return;
        clearAuth();
        setUser(null);
        setVerified(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    function onSessionExpired() {
      clearAuth();
      setUser(null);
      setVerified(false);
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

  const applyUser = useCallback((nextUser) => {
    setCachedUser(nextUser);
    setUser(nextUser);
    setVerified(Boolean(nextUser));
  }, []);

  function applySession(result) {
    applyUser(result.data?.user ?? null);
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
    setVerified(false);
    setAuthMode(null);
  }

  async function refreshUser() {
    const nextUser = await fetchMe();
    if (nextUser) applyUser(nextUser);
    return nextUser;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        verified,
        login,
        signup,
        logout,
        refreshUser,
        applyUser,
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
