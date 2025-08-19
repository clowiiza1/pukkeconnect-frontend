import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "@/features/auth/AuthModal";
import Hero from "@/components/ui/Hero";
export default function Landing() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const auth = params.get("auth"); // null | "login" | "register"
  const open = auth === "login" || auth === "register";

  // Ensure only "login" or "register" appear; anything else closes it
  const defaultTab = auth === "register" ? "register" : "login";

  const closeModal = () => {
    const p = new URLSearchParams(location.search);
    p.delete("auth");
    navigate({ pathname: "/", search: p.toString() }, { replace: true });
  };

   return (
    <>
      <Hero />

      {/* Auth modal still works on top of Hero */}
      <AuthModal open={open} onClose={closeModal} defaultTab={defaultTab} />
    </>
  );
}
