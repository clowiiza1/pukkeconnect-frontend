import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { register as registerApi, login as loginApi } from "@/services/AuthAPIs";

export default function SignupModal({ open, onClose, goLogin }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [major, setMajor] = useState("");
  const [campus, setCampus] = useState("Potchefstroom");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");           
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStudentNumber("");
    setName("");
    setSurname("");
    setEmail("");
    setPhoneNumber("");
    setMajor("");
    setCampus("Potchefstroom");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // client-side checks
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const phoneDigits = (phoneNumber || "").replace(/\D+/g, "");
    if (phoneDigits.length !== 10) {
      setError("Phone number must be 10 digits (e.g. 0823456789).");
      return;
    }

    if (!/^\d{8}$/.test(studentNumber)) {
      setError("University number must be 8 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Build canonical NWU email from the student number and ALWAYS send that
      // (backend expects email derived this way)
      const uniEmail = `${studentNumber.trim().toLowerCase()}@mynwu.ac.za`;

      // call register endpoint (we include email explicitly as the derived NWU email)
      const regResp = await registerApi({
        firstName: name.trim(),
        lastName: surname.trim(),
        universityNumber: studentNumber.trim(),
        email: uniEmail,               // <-- send derived NWU email here
        password,
        phoneNumber: phoneDigits,
        campus: campus || undefined,
        major: major?.trim() || undefined,
      });

      // After successful register, login to get token and populate auth state
      const loginResp = await loginApi({ universityNumber: studentNumber.trim(), password });

      // If your AuthContext expects a user object, try to populate it
      if (loginResp?.user) {
        try {
          login(loginResp.user);
        } catch {
          // ignore if shape differs; loginApi should have saved token already
        }
      }

      navigate("/", { replace: true });
      handleClose();
    } catch (err) {
      console.error("Signup error:", err);
      // common error shapes from your authService.formatAxiosError
      if (err?.data?.message) setError(err.data.message);
      else if (err?.message) setError(err.message);
      else setError("Signup failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear error as user types
  const clearOnChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
    if (signupStatus) setSignupStatus("");
  };

  // Toggle password visibility functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password strength indicator
  const getPasswordStrengthColor = (condition) => {
    return condition ? "text-emerald-600" : "text-gray-400";
  };

  const getPasswordStrengthIcon = (condition) => {
    return condition ? "✓" : "○";
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
            disabled={loading}
          >
            ×
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img src="/src/assets/logo.png" alt="PukkeConnect Logo" className="h-30 w-auto" />
          </div>

          {/* Title */}
          
          <p className="text-1xl font-semibold text-center text-dark">Join PukkeConnect today and find your perferct society match!</p>

          {/* Status Message */}
          {showStatus && (
            <div className={`rounded-xl border-2 px-4 py-4 text-sm animate-scale-in ${
              signupStatus === "success" 
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 shadow-lg" 
                : "border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 text-rose-800 shadow-lg"
            }`}>
              <div className="flex items-center justify-center">
                {signupStatus === "success" ? (
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
                        Welcome to PukkeConnect!
                      </span>
                      <p className="text-emerald-700 mt-1">
                        Creating your account...
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
                        Signup Failed
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
                signupStatus === "success" ? "bg-emerald-100" : "bg-rose-100"
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    signupStatus === "success" 
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 animate-progress" 
                      : "bg-gradient-to-r from-rose-500 to-red-500 animate-progress"
                  }`}
                ></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            {/* University Number */}
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
                  onChange={clearOnChange(setStudentNumber)}
                  className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none"
                  placeholder="Enter university number"
                  required
                  inputMode="numeric"
                  pattern="\d{8}"
                />
              </div>
            </div>

              {/* Name & Surname */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <label className="block text-sm font-medium text-dark">
                    Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange(setName)}
                      className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none transition-all duration-200"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-dark">
                    Surname
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={surname}
                      onChange={handleNameChange(setSurname)}
                      className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none transition-all duration-200"
                      placeholder="Enter surname"
                      required
                    />
                  </div>
                </div>
              </div>

            {/* Phone (required by backend) */}
            <div className="relative">
              <label className="block text-sm font-medium text-dark">Phone number</label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l3.6 7.59-1.35 2.44a1 1 0 00.95 1.41H19v-2H8.42l1.1-2h7.45a1 1 0 00.92-.63l3.24-7.27A1 1 0 0020 2H6.21l-.94-2H1v2h2z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={clearOnChange(setPhoneNumber)}
                  className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none"
                  placeholder="0823456789"
                  required
                  inputMode="tel"
                />
              </div>
            </div>

            {/* Campus & Major */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <label className="block text-sm font-medium text-dark">Campus</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4" />
                    </svg>
                  </span>
                  <select
                    value={campus}
                    onChange={(e) => { setCampus(e.target.value); if (error) setError(""); }}
                    className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none"
                  >
                    <option>Potchefstroom</option>
                    <option>Mafikeng</option>
                    <option>Vanderbijlpark</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-dark">Major (optional)</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={major}
                    onChange={clearOnChange(setMajor)}
                    className="w-full pl-9 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none"
                    placeholder="Computer Science"
                  />
                </div>
              </div>
            </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-dark">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full pl-9 pr-10 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none transition-all duration-200"
                    placeholder="Enter password"
                    required
                    autoComplete="new-password"
                  />
                  {/* Eye Icon for Password */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-dark transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center ${getPasswordStrengthColor(passwordStrength.hasMinLength)}`}>
                        <span className="w-4 mr-2">{getPasswordStrengthIcon(passwordStrength.hasMinLength)}</span>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center ${getPasswordStrengthColor(passwordStrength.hasUpperCase)}`}>
                        <span className="w-4 mr-2">{getPasswordStrengthIcon(passwordStrength.hasUpperCase)}</span>
                        1 uppercase letter (A-Z)
                      </div>
                      <div className={`flex items-center ${getPasswordStrengthColor(passwordStrength.hasLowerCase)}`}>
                        <span className="w-4 mr-2">{getPasswordStrengthIcon(passwordStrength.hasLowerCase)}</span>
                        1 lowercase letter (a-z)
                      </div>
                      <div className={`flex items-center ${getPasswordStrengthColor(passwordStrength.hasNumber)}`}>
                        <span className="w-4 mr-2">{getPasswordStrengthIcon(passwordStrength.hasNumber)}</span>
                        1 number (0-9)
                      </div>
                      <div className={`flex items-center ${getPasswordStrengthColor(passwordStrength.hasSpecialChar)}`}>
                        <span className="w-4 mr-2">{getPasswordStrengthIcon(passwordStrength.hasSpecialChar)}</span>
                        1 special character (!@#$%^&* etc.)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-dark">
                  Confirm Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="w-full pl-9 pr-10 rounded-lg border border-gray-300 px-3 py-2 text-dark text-sm focus:ring-2 focus:ring-mediumpur focus:outline-none transition-all duration-200"
                    placeholder="Confirm password"
                    required
                    autoComplete="new-password"
                  />
                  {/* Eye Icon for Confirm Password */}
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-dark transition-colors duration-200"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav py-2 text-white font-semibold shadow hover:opacity-90 transition"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-dark">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { resetForm(); goLogin?.(); }}
              className="font-semibold text-mediumpur hover:underline cursor-pointer"
              disabled={loading}
            >
              Login
            </button>
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}