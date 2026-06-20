import { AlertTriangle, X } from 'lucide-react';

export function FeedbackModal({ 
  isOpen, 
  title = "Confirmar Ação", 
  message = "Tem certeza de que deseja realizar esta operação?", 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      <div className="bg-white rounded-xl shadow-card border border-slate-100 max-w-md w-full overflow-hidden transform transition-all z-10">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-brand-dark leading-tight">
                  {title}
                </h3>
                <button 
                  onClick={onCancel}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-accent hover:opacity-90 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
