import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./toast.css";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  detail?: string;
}

interface ToastApi {
  success: (title: string, detail?: string) => void;
  error: (title: string, detail?: string) => void;
  info: (title: string, detail?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICONS: Record<ToastTone, ReactNode> = {
  success: (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        d="M8 4.5v4.5M8 11.4v.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        d="M8 7.5v4M8 4.6v.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, detail?: string) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, tone, title, detail }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 6000 : 3800);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, d) => push("success", t, d),
      error: (t, d) => push("error", t, d),
      info: (t, d) => push("info", t, d),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="region" aria-label="Notifications">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`} role="status">
            <span className="toast__icon">{ICONS[t.tone]}</span>
            <div className="toast__body">
              <p className="toast__title">{t.title}</p>
              {t.detail && <p className="toast__detail">{t.detail}</p>}
            </div>
            <button
              className="toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
