import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react"; // <-- add useEffect
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ open, onClose, goSignup,goForgot }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");           // <-- NEW

  const mockUsers = [
    { id: 1, studentNumber: "11111111", password: "student12", name: "Demo Student", role: "student", redirect: "/" },
    { id: 2, studentNumber: "00000000", password: "society12", name: "Society Admin", role: "society-admin", redirect: "/society-admin" },
    { id: 3, studentNumber: "99999999", password: "admin12",   name: "Platform Admin", role: "admin",          redirect: "/admin" },
  ];

  const resetForm = () => {
    setStudentNumber("");
    setPassword("");
    setError("");
  };

  // Clear fields whenever the modal closes
  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const user = mockUsers.find(
      (u) => u.studentNumber === studentNumber.trim() && u.password === password
    );

    if (user) {
      login(user);
      if (user.role === "student") {
        navigate("/", { replace: true });
      } else {
        navigate(user.redirect, { replace: true });
      }
      handleClose(); // clears + closes
    } else {
      // Inline error instead of alert/console
      setError("Invalid university number or password.");
    }
  };

  // Clear error as user types
  const onStudentChange = (e) => {
    setStudentNumber(e.target.value);
    if (error) setError("");
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
  {/* Overlay */}
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

  {/* Dialog */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="relative w-full max-w-md rounded-2xl bg-white p-6 space-y-4">
      
      {/* Close */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-dark/60 hover:text-mediumpur transition text-2xl leading-none cursor-pointer"
        aria-label="Close"
      >
        ×
      </button>

      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src="/src/assets/logo.png" alt="PukkeConnect Logo" className="h-24 w-auto" />
      </div>

      {/* Title */}
      <p className="text-xl font-semibold text-center text-dark">Welcome to PukkeConnect!</p>

      {/* Inline error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-3">
        
        {/* University Number Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-dark">University Number</label>
          <div className="mt-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>
            </span>
            <input
              type="text"
              value={studentNumber}
              onChange={onStudentChange}
              className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none"
              placeholder="Enter university number"
              required
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-dark">Password</label>
          <div className="mt-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>
            <input
              type="password"
              value={password}
              onChange={onPasswordChange}
              className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none"
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex justify-end mt-1">
            <button
              type="button"
              className="text-sm text-mediumpur hover:underline"
              onClick={goForgot} // <-- trigger forgot password modal
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav py-2 text-white font-semibold hover:opacity-90 transition"
        >
          Log In
        </button>
      </form>

      {/* Switch to signup */}
      <p className="text-center text-sm text-dark">
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={() => { resetForm(); goSignup?.(); }}
          className="font-semibold text-mediumpur hover:underline cursor-pointer"
        >
          Sign Up
        </button>
      </p>
    </Dialog.Panel>
  </div>
</Dialog>


  );
}
