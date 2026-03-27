type Props = {
  value: boolean;
  onChange: (v: boolean) => void;
};

export function Toggle({ value, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        value ? "bg-amber-400" : "bg-zinc-600"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
          value ? "translate-x-1" : "translate-x-[-1.1rem]"
        }`}
      />
    </button>
  );
}
