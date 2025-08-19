import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "@/components/ui/LoginModal";
import SignupModal from "@/components/ui/SignupModal";
import Hero from "@/components/ui/Hero";
import SocietyCategories from "@/components/ui/SocietyCategories";

export default function Landing() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const auth = params.get("auth"); // "login" | "register" | null

  // helpers
  const goAuth = (type) =>
    navigate({ pathname: "/", search: `?auth=${type}` }, { replace: true });

  const closeModal = () =>
    navigate({ pathname: "/", search: "" }, { replace: true });

  return (
    <>
      <Hero />
       <SocietyCategories goAuth={goAuth} />
      {/* Specific modals instead of AuthModal */}
      <LoginModal 
        open={auth === "login"} 
        onClose={closeModal} 
        goSignup={() => goAuth("register")} 
      />
      <SignupModal 
        open={auth === "register"} 
        onClose={closeModal} 
        goLogin={() => goAuth("login")} 
      />
    </>
  );
}
