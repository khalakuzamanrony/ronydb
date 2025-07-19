import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-8 right-8 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-base font-medium transition-all duration-300
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast; 