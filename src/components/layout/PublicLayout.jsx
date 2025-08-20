// PublicLayout.jsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/context/AuthContext";

export default function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Redirect admins away from "/" if they try to land on landing
  if (isAuthenticated && location.pathname === "/") {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "society-admin") return <Navigate to="/society-admin" replace />;
    // students stay on landing
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
