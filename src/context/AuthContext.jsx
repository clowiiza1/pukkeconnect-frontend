// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(false); // or true if you hydrate

  const login  = (u) => setUser(u);
  const logout = () => setUser(null);

  const value = useMemo(() => ({
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    initializing,
    login,
    logout,
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// IMPORTANT: keep this as a stable function export
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
