import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "@/features/auth/AuthModal";

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
    <section className="mx-auto max-w-6xl p-8">
      <h1 className="text-4xl font-alt text-mediumpur mb-2">Welcome to PukkeConnect</h1>
      <p className="text-muted mb-6">Find and join the right society for you.</p>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/?auth=login")}
          className="rounded bg-mediumpur px-4 py-2 text-white"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/?auth=register")}
          className="rounded border border-mediumpur px-4 py-2 text-mediumpur"
        >
          Register
        </button>
      </div>

      <AuthModal open={open} onClose={closeModal} defaultTab={defaultTab} />
    </section>
  );
}
