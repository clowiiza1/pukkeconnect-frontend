// src/routes/PostLogin.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PostLogin() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.debug("[PostLogin] role =", role);
    if (!role) return; // wait until role exists
    if (role === "student")          navigate("/", { replace: true });
    else if (role === "society-admin") navigate("/society-admin", { replace: true });
    else if (role === "admin")         navigate("/admin", { replace: true });
    else                               navigate("/", { replace: true });
  }, [role, navigate]);

  return null;
}
