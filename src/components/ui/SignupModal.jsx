import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react"; // <-- add useEffect
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignupModal({ open, onClose, goLogin }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");           // <-- NEW

  const resetForm = () => {
    setStudentNumber("");
    setName("");
    setSurname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");          // <-- inline error instead of alert
      return;
    }

    // TODO: Replace with API call
    login({ id: 1, name: `${name} ${surname}`, role: "student" });
    navigate("/", { replace: true });               // students land on "/"
    handleClose();                                  // clears + closes
  };

  // Clear error as user types
  const clearOnChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-2xl bg-white p-8 space-y-6 
                        border-2 border-nwupur shadow-[0_0_20px_4px_rgba(142,68,173,0.5)]">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-dark/60 hover:text-mediumpur transition text-2xl leading-none cursor-pointer"  // <-- pointer
            aria-label="Close"
          >
            ×
          </button>

          <Dialog.Title className="text-2xl font-semibold text-center text-dark">
            Create Account
          </Dialog.Title>
          <p className="text-center text-mediumpur">Join PukkeConnect Today!</p>

          {/* Inline error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark">University Number</label>
              <input
                type="text"
                value={studentNumber}
                onChange={clearOnChange(setStudentNumber)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter university number"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={clearOnChange(setName)}
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
                  onChange={clearOnChange(setSurname)}
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
                onChange={clearOnChange(setEmail)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter email"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark">Password</label>
              <input
                type="password"
                value={password}
                onChange={clearOnChange(setPassword)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Enter password"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={clearOnChange(setConfirmPassword)}
                className="mt-1 w-full rounded-lg border border-grey px-4 py-2 text-dark 
                           focus:ring-2 focus:ring-mediumpur focus:outline-none"
                placeholder="Confirm password"
                required
                autoComplete="new-password"
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
              onClick={() => { resetForm(); goLogin?.(); }}
              className="font-semibold text-mediumpur hover:underline cursor-pointer"
            >
              Login
            </button>
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
