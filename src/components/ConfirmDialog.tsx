import { AnimatePresence, motion } from "framer-motion";

type Props = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[80] rounded-t-3xl bg-zinc-900 px-5 pb-safe-6 pt-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex justify-center pb-4">
              <div className="h-1 w-10 rounded-full bg-zinc-700" />
            </div>
            <p className="text-lg font-bold text-white">{title}</p>
            {description && (
              <p className="mt-1.5 text-sm text-zinc-400">{description}</p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className={`w-full rounded-2xl py-4 font-bold transition-colors ${
                  variant === "danger"
                    ? "bg-red-500 text-white active:bg-red-600"
                    : "bg-amber-400 text-zinc-900 active:bg-amber-300"
                }`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-zinc-800 py-4 font-bold text-zinc-300 active:bg-zinc-700"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
