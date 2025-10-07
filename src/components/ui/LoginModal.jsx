import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole, roleToDashboardPath } from "@/context/authUtils";
import { useNavigate } from "react-router-dom";
import AuthAPIs from "@/services/AuthAPIs.jsx";
import logo from "@/assets/logo.png";

export default function LoginModal({ open, onClose, goSignup, goForgot }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState(""); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateStudentNumber = (value) => {
    // Only allow numbers, exactly 8 digits
    const regex = /^\d{0,8}$/;
    return regex.test(value);
  };

  const resetForm = () => {
    setStudentNumber("");
    setPassword("");
    setError("");
    setShowSuccess(false);
    setUserRole("");
    setShowPassword(false);
    setLoginStatus("");
    setLoading(false);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate student number format
    if (!validateStudentNumber(studentNumber) || studentNumber.length !== 8) {
      setLoginStatus("error");
      setError("University number must be exactly 8 digits.");
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setLoginStatus("");
        setError("");
      }, 5000);
      return;
    }

    setLoading(true);
    setError("");
    setLoginStatus("");
    setShowSuccess(false);

    try {
      const res = await AuthAPIs.login({ universityNumber: studentNumber.trim(), password });
      if (!res) throw new Error("Empty response from auth service");

      let user = null;
      if (res.user) user = res.user;
      else if (res.role || res.redirect || res.id) user = res;
      else if (res.data && res.data.user) user = res.data.user;
      else user = res;

      const roleCandidates = [
        user?.role,
        user?.userRole,
        user?.roleName,
        user?.type,
        user?.user_type,
        res?.role,
        res?.data?.role,
        res?.user?.role,
        res?.user?.userRole,
      ];
      const rawRole = roleCandidates.find((value) => value != null && value !== "");
      const normalizedRole = normalizeRole(rawRole);
      const userForContext = normalizedRole && user ? { ...user, role: normalizedRole } : user;

      const tokenValue = res?.token ?? res?.data?.token ?? user?.token ?? res?.user?.token;

      // Determine destination before login
      const resolvedRole = normalizeRole(userForContext?.role ?? rawRole);
      const defaultDestination = resolvedRole === "student"
        ? "/"
        : roleToDashboardPath(resolvedRole);
      const destination = userForContext?.redirect ?? res?.redirect ?? defaultDestination ?? "/";

      // Update login state
      try {
        flushSync(() => {
          login(userForContext, tokenValue);
        });
      } catch {
        try {
          login(userForContext, tokenValue);
        } catch {
          try { login(userForContext); } catch { /* ignore */ }
        }
      }

      setUserRole(resolvedRole ?? "");
      setLoginStatus("success");
      setShowSuccess(true);

      // Wait longer for context to propagate, especially for admin roles
      const delay = resolvedRole === "student" ? 1500 : 2000;
      setTimeout(() => {
        handleClose();
        // Use setTimeout to ensure navigation happens after modal closes
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 100);
      }, delay);
    } catch (err) {
      setLoginStatus("error");
      // err could be Error or an object from Axios with response.data.message
      const message =
        (err && err.response && (err.response.data?.message || err.response.data)) ||
        (err && err.message) ||
        "Incorrect university number or password. Please try again.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setLoginStatus("");
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const onStudentChange = (e) => {
    const value = e.target.value;
    if (validateStudentNumber(value)) {
      setStudentNumber(value);
    }
    if (error) setError("");
    if (loginStatus) setLoginStatus("");
  };
  
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
    if (loginStatus) setLoginStatus("");
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "student": return "Student";
      case "society-admin": return "Society Admin";
      case "admin": return "Platform Admin";
      default: return "User";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-2xl bg-white p-6 space-y-4 border border-white shadow-lg">
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
            <img src={logo} alt="PukkeConnect Logo" className="h-24 w-auto" />
          </div>

          {/* Title */}
          <p className="text-xl font-semibold text-center text-dark">Welcome to PukkeConnect!</p>

          {/* Status Message */}
          {showSuccess && (
            <div className={`rounded-xl border-2 px-4 py-4 text-sm animate-scale-in ${
              loginStatus === "success" 
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 shadow-lg" 
                : "border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 text-rose-800 shadow-lg"
            }`}>
              <div className="flex items-center justify-center">
                {loginStatus === "success" ? (
                  <>
                    <div className="relative mr-3">
                      <div className="w-8 h-8 border-4 border-emerald-200 rounded-full"></div>
                      <div className="w-8 h-8 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                      <div className="w-8 h-8 flex items-center justify-center absolute top-0 left-0">
                        <svg className="w-4 h-4 text-emerald-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-lg block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        Successfully Logged In!
                      </span>
                      <p className="text-emerald-700 mt-1">
                        {userRole === "student"
                          ? "Welcome back!"
                          : `Redirecting to ${getRoleDisplayName(userRole)} dashboard...`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative mr-3">
                      <div className="w-8 h-8 border-4 border-rose-200 rounded-full"></div>
                      <div className="w-8 h-8 border-4 border-rose-500 rounded-full animate-ping absolute top-0 left-0"></div>
                      <div className="w-8 h-8 flex items-center justify-center absolute top-0 left-0">
                        <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-lg block bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                        Login Failed
                      </span>
                      <p className="text-rose-700 mt-1">
                        {error}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Progress bar */}
              <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${
                loginStatus === "success" ? "bg-emerald-100" : "bg-rose-100"
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    loginStatus === "success" 
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 animate-progress" 
                      : "bg-gradient-to-r from-rose-500 to-red-500 animate-progress"
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Form */}
          {!showSuccess ? (
            <form onSubmit={handleLogin} className="space-y-3">
              {/* University Number Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-dark">
                  University Number
                  <span className="text-red-500 ml-1">*</span>
                </label>
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
                    className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none transition-all duration-200"
                    placeholder="Enter 8-digit university number"
                    required
                    autoComplete="username"
                    maxLength={8}
                    inputMode="numeric"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be exactly 8 digits (numbers only)
                </p>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-dark">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1 relative">
                  {/* Left lock icon */}
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </span>

                  {/* Input with toggle */}
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={onPasswordChange}
                    className="w-full pl-9 pr-10 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none transition-all duration-200"
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  {/* Eye toggle */}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-dark transition-colors duration-200"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    disabled={loading}
                  >
                    {showPassword ? (
                      // Eye Open
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 
                          7.51 7.36 4.5 12 4.5c4.638 
                          0 8.573 3.007 9.963 
                          7.178.07.207.07.431 0 
                          .639C20.577 16.49 16.64 19.5 
                          12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 
                          0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      // Eye Slash
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 
                          0 1.934 12C3.226 16.338 7.244 
                          19.5 12 19.5c.993 
                          0 1.953-.138 
                          2.863-.395M6.228 
                          6.228A10.45 10.45 0 0 1 
                          12 4.5c4.756 0 8.773 
                          3.162 10.065 
                          7.5a10.523 10.523 0 0 
                          1-4.293 5.774M6.228 
                          6.228 3 3m3.228 
                          3.228 12.544 12.544" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    className="text-sm text-mediumpur hover:underline transition-colors duration-200"
                    onClick={goForgot}
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          ) : (
            // Loading animation for success state
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              {loginStatus === "success" && (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                    <div className="w-16 h-16 flex items-center justify-center absolute top-0 left-0">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-emerald-600 font-medium animate-pulse">
                    Preparing your dashboard...
                  </p>
                </>
              )}
            </div>
          )}

          {!showSuccess && (
            <p className="text-center text-sm text-dark">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { resetForm(); goSignup?.(); }}
                className="font-semibold text-mediumpur hover:underline cursor-pointer transition-colors duration-200"
                disabled={loading}
              >
                Sign Up
              </button>
            </p>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
