import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

export function InputDialog({
  isOpen,
  title,
  description,
  defaultValue = "",
  placeholder,
  confirmLabel = "확인",
  onConfirm,
  onClose,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  // 다이얼로그가 열릴 때마다 defaultValue로 초기화
  useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

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
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && onConfirm(value)}
              className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-400"
            />
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={() => onConfirm(value)}
                className="w-full rounded-2xl bg-amber-400 py-4 font-bold text-zinc-900 active:bg-amber-300"
              >
                {confirmLabel}
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-zinc-800 py-4 font-bold text-zinc-300 active:bg-zinc-700"
              >
                취소
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
