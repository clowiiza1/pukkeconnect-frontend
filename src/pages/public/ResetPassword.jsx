import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/services/AuthAPIs.jsx";
import { useToast } from "@/context/ToastContext";

const MIN_PASSWORD_LENGTH = 8;

function validatePassword(password) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [searchParams] = useSearchParams();

  const uid = useMemo(() => searchParams.get("uid")?.trim() ?? "", [searchParams]);
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  const tokenMissing = !uid || !token;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tokenMissing) return;

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ userId: uid, token, newPassword: password });
      setCompleted(true);
      push({
        title: "Password updated",
        description: "You can now sign in with your new password.",
        tone: "success",
      });
    } catch (err) {
      const message = err?.message ?? "Could not reset password. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoSignIn = () => {
    navigate({ pathname: "/", search: "?auth=login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-purple-50 to-purple-100 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-dark">Reset your password</h1>
          <p className="mt-2 text-sm text-dark/70">
            Choose a new password to regain access to your account.
          </p>
        </div>

        {tokenMissing ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            This reset link is missing information. Please use the link from your email, or request a new password reset.
          </div>
        ) : completed ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Your password has been updated successfully.
            </div>
            <button
              type="button"
              onClick={handleGoSignIn}
              className="w-full rounded-2xl bg-gradient-to-r from-mediumpur via-lilac to-softlav py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 outline-none transition focus:border-lilac focus:ring-2 focus:ring-lilac/40"
                placeholder="Enter a new password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 outline-none transition focus:border-lilac focus:ring-2 focus:ring-lilac/40"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-2xl bg-gradient-to-r from-mediumpur via-lilac to-softlav py-2 text-sm font-semibold text-white shadow-sm transition-opacity ${
                submitting ? "cursor-wait opacity-70" : "hover:opacity-90"
              }`}
            >
              {submitting ? "Updating password…" : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-2xl border border-slate-200 py-2 text-sm font-semibold text-dark transition hover:border-lilac hover:text-lilac"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
