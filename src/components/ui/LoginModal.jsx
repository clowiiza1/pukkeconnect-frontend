import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ open, onClose, goSignup }) {
  const { login } = useAuth(); // demo only
  const navigate = useNavigate();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  //Adding mock data for now
  const mockUsers = [
  {
    id: 1,
    studentNumber: "11111111",
    password: "student12",
    name: "Demo Student",
    role: "student",
    redirect: "/",
  },
  {
    id: 2,
    studentNumber: "00000000",
    password: "society12",
    name: "Society Admin",
    role: "society-admin",
    redirect: "/society-admin",
  },
  {
    id: 3,
    studentNumber: "99999999",
    password: "admin12",
    name: "Platform Admin",
    role: "admin",
    redirect: "/admin",
  },
];

 const handleLogin = (e) => {
  e.preventDefault();

  // Find matching mock user
  const user = mockUsers.find(
    (u) => u.studentNumber === studentNumber && u.password === password
  );

  if (user) {
    login(user); 
    if (user.role === "student") {
  navigate("/", { replace: true });
 } else {
   navigate(user.redirect, { replace: true });
 }
    onClose?.();
  } else {
    alert("Invalid student number or password");
  }
};

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-2xl bg-white p-8 space-y-6 
                        border-2 border-nwupur shadow-[0_0_20px_4px_rgba(142,68,173,0.5)]">
             <button
                onClick={onClose}
                className="absolute top-3 right-3 text-dark/60 hover:text-mediumpur transition text-2xl leading-none cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
          {/* Title */}
          <Dialog.Title className="text-2xl font-semibold text-center text-dark">
            Welcome Back
          </Dialog.Title>
          <p className="text-center text-mediumpur">Sign in with your university number</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark">University Number</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter university number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="mt-1 text-sm text-mediumpur hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav py-2 
                         text-white font-semibold shadow hover:opacity-90 transition"
            >
              Log In
            </button>
          </form>

          {/* Switch to signup */}
          <p className="text-center text-sm text-dark">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={goSignup}
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
