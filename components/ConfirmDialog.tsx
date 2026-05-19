"use client";

type ConfirmDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50" onClick={onCancel}>
      <div
        className="bg-white border border-black p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] leading-relaxed mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-black text-sm font-medium bg-black text-white hover:bg-black/80 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
