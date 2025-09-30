// src/context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { normalizeRole, roleToDashboardPath } from "./authUtils";
import { setAuthHeader } from "@/services/AuthAPIs.jsx";
import { registerAuthLogout } from "@/services/apis.jsx";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "auth:user";
const TOKEN_STORAGE_KEY = "token";

const deriveRoleFromUser = (value) => normalizeRole(
  value?.role ??
  value?.userRole ??
  value?.roleName ??
  value?.role_type ??
  value?.type ??
  value?.user_type ??
  value?.designation
);

const shapeUser = (value) => {
  if (!value || typeof value !== "object") return null;
  const normalizedRole = deriveRoleFromUser(value);
  return {
    ...value,
    ...(normalizedRole ? { role: normalizedRole } : {}),
  };
};

function readStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return shapeUser(parsed);
  } catch {
    return null;
  }
}

function persistUser(nextUser) {
  if (typeof window === "undefined") return;
  if (nextUser) {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore storage errors (quota, etc.)
    }
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setAuthHeader(null);
    persistUser(null);
  }, []);

  const login = useCallback((incomingUser, token) => {
    const shaped = shapeUser(incomingUser);
    if (!shaped) {
      logout();
      return;
    }

    setUser(shaped);
    persistUser(shaped);

    if (typeof window !== "undefined" && token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setAuthHeader(token);
    }
  }, [logout]);

  useEffect(() => {
    registerAuthLogout(logout);

    return () => registerAuthLogout(null);
  }, [logout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setInitializing(false);
      return;
    }

    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) setAuthHeader(storedToken);

    if (!user) {
      const storedUser = readStoredUser();
      if (storedUser) setUser(storedUser);
    }

    setInitializing(false);
    // we intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedRole = useMemo(() => deriveRoleFromUser(user), [user]);

  const value = useMemo(() => ({
    user,
    role: normalizedRole,
    dashboardPath: roleToDashboardPath(normalizedRole),
    isAuthenticated: !!user,
    initializing,
    login,
    logout,
  }), [user, initializing, normalizedRole, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// IMPORTANT: keep this as a stable function export
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
