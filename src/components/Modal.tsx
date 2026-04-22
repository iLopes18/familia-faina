import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}: ModalProps) {
  if (!isOpen) return null;

  const variantColors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    info: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  const iconColors = {
    danger: "text-red-600 bg-red-100",
    warning: "text-amber-600 bg-amber-100",
    info: "text-emerald-600 bg-emerald-100",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl ${iconColors[variant]}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{message}</p>
          </div>
          <div className="bg-slate-50 p-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl text-slate-700 font-semibold hover:bg-white transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-2xl font-semibold shadow-lg shadow-slate-200 transition-all disabled:opacity-50 ${variantColors[variant]}`}
            >
              {loading ? "A processar..." : confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
