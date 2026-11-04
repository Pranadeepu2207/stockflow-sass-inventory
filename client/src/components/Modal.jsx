import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// reusable modal wrapper with escape key handling and backdrop click
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  // close dialog when user hits Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* darkened backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* modal box centered on screen */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${maxWidth} transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl border border-slate-200 transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* modal header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-md p-1 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* modal body */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
