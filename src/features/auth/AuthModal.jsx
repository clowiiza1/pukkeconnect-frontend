import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ open, onClose, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab); // 'login' | 'register'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoAuth = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const role = form.get("role") || "student"; // demo only

    // TODO: replace with real auth service
    login({ id: 1, name: "Chloe", role });

    // redirect by role
    const dest = role === "admin" ? "/admin" : role === "society-admin" ? "/society-admin" : "/";
    navigate(dest, { replace: true });
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title={tab === "login" ? "Login" : "Register"}>
      {/* Tabs */}
      <div className="mb-4 grid grid-cols-2 rounded-lg border">
        <button
          className={`py-2 ${tab === "login" ? "bg-mediumpur text-white" : "text-dark"}`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={`py-2 ${tab === "register" ? "bg-mediumpur text-white" : "text-dark"}`}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>

      {tab === "login" ? (
        <form className="space-y-3" onSubmit={handleDemoAuth}>
          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <input className="mt-1 w-full rounded border p-2" type="email" required />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Password</span>
            <input className="mt-1 w-full rounded border p-2" type="password" required />
          </label>

          {/* Demo role select – remove when wired to backend */}
          <label className="block">
            <span className="text-sm text-muted">Role (demo)</span>
            <select name="role" className="mt-1 w-full rounded border p-2">
              <option value="student">Student</option>
              <option value="society-admin">Society Admin</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button className="w-full rounded bg-mediumpur py-2 text-white">Sign In</button>
          <button type="button" onClick={() => setTab("register")} className="w-full text-sm text-mediumpur">
            Need an account? Register
          </button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={handleDemoAuth}>
          <label className="block">
            <span className="text-sm text-muted">Full Name</span>
            <input className="mt-1 w-full rounded border p-2" required />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Email</span>
            <input className="mt-1 w-full rounded border p-2" type="email" required />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Password</span>
            <input className="mt-1 w-full rounded border p-2" type="password" required />
          </label>

          {/* Demo role select */}
          <label className="block">
            <span className="text-sm text-muted">Register as (demo)</span>
            <select name="role" className="mt-1 w-full rounded border p-2">
              <option value="student">Student</option>
              <option value="society-admin">Society Admin</option>
            </select>
          </label>

          <button className="w-full rounded bg-mediumpur py-2 text-white">Create Account</button>
          <button type="button" onClick={() => setTab("login")} className="w-full text-sm text-mediumpur">
            Already have an account? Login
          </button>
        </form>
      )}
    </Modal>
  );
}
