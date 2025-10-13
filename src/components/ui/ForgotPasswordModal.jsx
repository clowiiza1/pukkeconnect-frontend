import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { requestPasswordReset } from "@/services/AuthAPIs.jsx";
import logo from "@/assets/logo.png";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setError("");
    setSuccess("");
    setSubmitting(false);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const identifier = email.trim();
      await requestPasswordReset(identifier);
      setSuccess(`If an account exists for ${identifier}, we'll send reset instructions shortly.`);
    } catch (err) {
      const message = err?.message ?? "We couldn't send the reset email right now. Please try again.";
      setError(message);
      setSuccess("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-2xl bg-white p-6 space-y-4 border border-white shadow-lg">
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-dark/60 hover:text-mediumpur transition text-2xl leading-none cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img src={logo} alt="PukkeConnect Logo" className="h-16 w-auto" />
          </div>

          {/* Title */}
          <Dialog.Title className="text-2xl font-semibold text-center text-dark">
            Forgot Password
          </Dialog.Title>
          <p className="text-center text-mediumpur">Enter your email to receive a reset link</p>

          {/* Inline error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <label className="block text-sm font-medium text-dark">Email</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                  {/* Mail icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full pl-8 rounded-md border border-gray-300 px-2 py-1 text-dark text-sm focus:ring-1 focus:ring-mediumpur focus:outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav py-2 text-white font-semibold shadow transition ${
                submitting ? "cursor-wait opacity-70" : "hover:opacity-90"
              }`}
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
