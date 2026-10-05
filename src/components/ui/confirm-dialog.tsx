// ConfirmDialog dùng chung (P0-05): hộp thoại xác nhận thay cho hàm native của trình duyệt.
// Dựng trên ui/modal.tsx. Có variant nguy hiểm (đỏ) + loading khi đang xóa.
// P1 tái dùng cho xóa invoice / buổi điểm danh.

"use client";

import Modal from "./modal";
import Button from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xóa",
  cancelLabel = "Hủy",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {message}
      </p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "rose" : "primary"} onClick={onConfirm} disabled={loading}>
          {loading ? "Đang xóa..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
