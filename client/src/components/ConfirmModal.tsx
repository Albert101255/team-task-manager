import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-none animate-fadeIn">
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg max-w-md w-full overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isDestructive && (
                <div className="p-2 rounded-full bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-3.5 py-1.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
