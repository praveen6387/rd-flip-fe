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
  hasAccessToken,
  isRequestDropped,
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

      let dropped = false;

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
      } catch (error) {
        if (cancelled || isRequestDropped(error)) {
          dropped = true;
          return;
        }
        clearAuth();
        setUser(null);
        setVerified(false);
      } finally {
        if (!cancelled && !dropped) setReady(true);
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

  async function openSession(request) {
    const result = await request();
    try {
      const nextUser = await fetchMe({ force: true });
      if (!nextUser) {
        throw new Error("Could not load your profile.");
      }
      applyUser(nextUser);
      setAuthMode(null);
      return result;
    } catch (error) {
      clearAuth();
      setUser(null);
      setVerified(false);
      throw error;
    }
  }

  function login(payload) {
    return openSession(() => loginRequest(payload));
  }

  function signup(payload) {
    return openSession(() => signupRequest(payload));
  }

  function logout() {
    clearAuth();
    setUser(null);
    setVerified(false);
    setAuthMode(null);
  }

  async function refreshUser() {
    const nextUser = await fetchMe({ force: true });
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
