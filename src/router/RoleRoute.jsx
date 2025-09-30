import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ allowed, children }) {
  const { role, initializing } = useAuth();

  if (initializing) return null;
  if (!role || !allowed.includes(role)) return <Navigate to="/" replace />;
  return children;
}
