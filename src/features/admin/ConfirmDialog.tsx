import { Modal } from './Modal';
import { btnSecondary, btnPrimaryModal } from './classes';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      sm
      footer={
        <>
          <button
            onClick={onCancel}
            className={btnSecondary}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={btnPrimaryModal}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}
