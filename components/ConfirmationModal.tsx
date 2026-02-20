
import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const colorConfig = {
    danger: {
      btn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20',
      icon: 'text-rose-500 bg-rose-500/10',
      glow: 'shadow-rose-500/10'
    },
    warning: {
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
      icon: 'text-amber-500 bg-amber-500/10',
      glow: 'shadow-amber-500/10'
    },
    info: {
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      icon: 'text-blue-500 bg-blue-500/10',
      glow: 'shadow-blue-500/10'
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] p-4 md:p-6 flex items-center justify-center">
      {/* Heavy Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Premium Glass Modal */}
      <div className={`relative w-full modal-sm transform transition-all animate-in fade-in zoom-in duration-300 rounded-2xl bg-white border border-slate-200 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.4)] ${colorConfig[type].glow} pointer-events-auto`}>
        <div className="p-6 md:p-7">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${colorConfig[type].icon}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-3 mb-7">
            <h3 className="text-[18px] font-black text-slate-900 tracking-tight uppercase leading-[1.2]">
              {title}
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed text-[14px]">
              {message}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 bg-slate-100 text-slate-700 font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 font-bold text-white uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${colorConfig[type].btn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
