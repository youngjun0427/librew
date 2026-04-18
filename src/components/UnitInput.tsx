import { forwardRef } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type: "text" | "numeric";
  unit?: string;
};

export const UnitInput = forwardRef<HTMLInputElement, Props>(({ type, unit, ...props }, ref) => (
  <div className="relative flex items-center">
    <input
      ref={ref}
      type="text"
      inputMode={type === "numeric" ? "numeric" : undefined}
      className={`w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-400 ${unit ? "pl-4 pr-10" : "px-4"}`}
      {...props}
    />
    {unit && (
      <span className="pointer-events-none absolute right-4 text-sm text-zinc-500">{unit}</span>
    )}
  </div>
));

UnitInput.displayName = "UnitInput";
