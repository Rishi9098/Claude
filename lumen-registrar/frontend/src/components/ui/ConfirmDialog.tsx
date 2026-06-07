import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width={420}>
      <p style={{ margin: 0, color: "var(--color-ink-secondary)", lineHeight: 1.55 }}>
        {message}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--space-2)",
          marginTop: "var(--space-5)",
        }}
      >
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
