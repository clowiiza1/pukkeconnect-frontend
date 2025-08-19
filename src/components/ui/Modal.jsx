import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {title && <h3 className="mb-4 text-xl font-alt text-mediumpur">{title}</h3>}
        {children}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded px-2 py-1 text-sm text-muted hover:text-dark"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
