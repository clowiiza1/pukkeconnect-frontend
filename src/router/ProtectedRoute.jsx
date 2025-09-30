
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/?auth=login" replace />;
  return children;
}
