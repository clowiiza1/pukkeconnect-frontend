import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerToastEmitter } from "@/services/apis.jsx";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 5000;

function ensureId(preferred) {
  if (preferred) return preferred;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ToastViewport({ toasts, dismiss }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 shadow-lg bg-white/95 backdrop-blur ${
            toast.tone === "error"
              ? "border-red-200"
              : toast.tone === "warning"
                ? "border-amber-200"
                : toast.tone === "success"
                  ? "border-emerald-200"
                  : "border-slate-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {toast.title && <p className="text-sm font-semibold text-dark">{toast.title}</p>}
              {toast.description && (
                <p className="mt-1 text-sm text-dark/80 whitespace-pre-line">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-xs font-medium text-dark/60 hover:text-mediumpur"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeoutId = timers.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timers.current.delete(id);
    }
  }, []);

  const scheduleRemoval = useCallback(
    (id, duration) => {
      if (typeof window === "undefined" || duration === 0 || duration === Infinity) return;
      const timeoutId = window.setTimeout(() => dismiss(id), duration ?? DEFAULT_DURATION);
      timers.current.set(id, timeoutId);
    },
    [dismiss]
  );

  const push = useCallback(
    ({ id, tone = "info", duration = DEFAULT_DURATION, ...rest }) => {
      const toastId = ensureId(id);
      setToasts((prev) => [...prev, { id: toastId, tone, duration, ...rest }]);
      scheduleRemoval(toastId, duration);
      return toastId;
    },
    [scheduleRemoval]
  );

  useEffect(() => {
    registerToastEmitter(push);
    return () => registerToastEmitter(null);
  }, [push]);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
