// src/components/ui/Toast.jsx
import { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const ICONS = {
  success: <FiCheckCircle className="text-emerald-400" size={18} />,
  error:   <FiAlertCircle className="text-red-400" size={18} />,
  info:    <FiInfo className="text-blue-400" size={18} />,
};

const BG = {
  success: "border-emerald-500/30",
  error:   "border-red-500/30",
  info:    "border-blue-500/30",
};

function ToastItem({ id, message, type = "info", onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [id, onRemove]);

  return (
    <div
      className={[
        "flex items-start gap-3 px-4 py-3 rounded-xl",
        "bg-white/5 backdrop-blur-xl border",
        BG[type],
        "shadow-2xl shadow-black/40",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
      ].join(" ")}
    >
      <span className="mt-0.5 shrink-0">{ICONS[type]}</span>
      <p className="text-sm text-white/90 leading-snug flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 300); }}
        className="text-white/40 hover:text-white/80 transition mt-0.5 shrink-0"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
}
