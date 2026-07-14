"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`toast toast-${toast.type}`}
      onClick={() => onRemove(toast.id)}
      style={{ cursor: "pointer" }}
    >
      {toast.type === "success" ? (
        <CheckCircle size={16} style={{ color: "#10b981", flexShrink: 0 }} />
      ) : (
        <XCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
      )}
      {toast.message}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
