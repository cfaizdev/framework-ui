import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast({ message: msg, type: 'success' }),
    error: (msg) => addToast({ message: msg, type: 'error', duration: 6000 }),
    info: (msg) => addToast({ message: msg, type: 'info' }),
  };

  return { toasts, toast, removeToast };
}
