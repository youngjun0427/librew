import { useState } from "react";
import { BottomSheet } from "./BottomSheet";

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  title: string;
};

export function BottomSheetSelect({ value, onChange, options, placeholder = "선택", title }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-left transition-colors active:bg-zinc-700"
      >
        <span className={selectedOption ? "text-white" : "text-zinc-500"}>{displayValue}</span>
        <span className="text-zinc-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </span>
      </button>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <div className="pb-4">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`mb-2 w-full rounded-2xl p-4 text-left transition-colors last:mb-0 ${
                  isSelected ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800 active:bg-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${isSelected ? "text-amber-400" : "text-white"}`}>
                    {option.label}
                  </span>
                  {isSelected && <span className="text-sm text-amber-400">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
