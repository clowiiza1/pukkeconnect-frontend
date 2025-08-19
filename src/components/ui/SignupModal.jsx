import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignupModal({ open, onClose, goLogin }) {
  const { login } = useAuth(); // demo only
  const navigate = useNavigate();

  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    // Check password confirmation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // TODO: Replace with API call
    login({ id: 1, name: `${name} ${surname}`, role: "student" });
    navigate("/student", { replace: true });
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Panel with PURE white bg */}
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 space-y-6">
          <Dialog.Title className="text-2xl font-semibold text-center text-dark">
            Create Account
          </Dialog.Title>
          <p className="text-center text-muted">Join PukkeConnect today</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark">Student Number</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter student number"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                             focus:ring-2 focus:ring-mediumpur focus:outline-none"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark">Surname</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                             focus:ring-2 focus:ring-mediumpur focus:outline-none"
                  placeholder="Enter surname"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter email"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-dark">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Confirm password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav py-2 
                         text-white font-semibold shadow hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-dark">
            Already have an account?{" "}
            <button
              type="button"
              onClick={goLogin}  // ✅ this will properly switch modal
              className="font-semibold text-mediumpur hover:underline"
            >
              Login
            </button>
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
