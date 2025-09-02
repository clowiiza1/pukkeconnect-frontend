import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "@/components/ui/LoginModal";
import SignupModal from "@/components/ui/SignupModal";
import ForgotPasswordModal from "@/components/ui/ForgotPasswordModal";
import Hero from "@/components/ui/Hero";
import About from "@/components/ui/About";
import SocietyCategories from "@/components/ui/SocietyCategories";
import FAQ from "@/components/ui/FAQ";

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
      <About goAuth={goAuth} />
      <SocietyCategories goAuth={goAuth} />
      <FAQ /> 
      
      {/* Specific modals instead of AuthModal */}
      <LoginModal 
        open={auth === "login"} 
        onClose={closeModal} 
        goSignup={() => goAuth("register")} 
        goForgot={() => goAuth("forgot")}
      />
      <SignupModal 
        open={auth === "register"} 
        onClose={closeModal} 
        goLogin={() => goAuth("login")} 
      />
      <ForgotPasswordModal 
        open={auth === "forgot"} 
        onClose={closeModal} 
      />
    </>
  );
}
