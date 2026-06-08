import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "ok") => {
      const id = ++idCounter;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  const toast = {
    success: (m) => push(m, "ok"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "ok"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => dismiss(t.id)}>
            <span className="ic">{t.type === "error" ? "✕" : "✓"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op fallback so components never crash if provider is missing.
    return { success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}
