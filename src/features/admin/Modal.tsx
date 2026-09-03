import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  sm?: boolean;
}

export function Modal({ open, onClose, title, sub, children, footer, wide, sm }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={`bg-pulso-panel border-pulso-line-bright rounded-[18px] p-0 gap-0 shadow-[0_34px_90px_-34px_rgba(255,64,83,.3)] max-h-[90vh] overflow-hidden grid-rows-[auto_minmax(0,1fr)_auto] [&_[data-slot='dialog-close']]:hidden ${
          wide ? 'sm:max-w-2xl' : sm ? 'sm:max-w-md' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-pulso-line-strong">
          <div>
            <DialogTitle className="text-lg font-extrabold tracking-tight">{title}</DialogTitle>
            {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 min-h-0 overflow-y-auto overflow-x-hidden">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-pulso-line-strong flex-wrap">{footer}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
