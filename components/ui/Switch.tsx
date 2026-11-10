"use client";

type SwitchProps = { checked: boolean; onChange: (value: boolean) => void; label: string };

export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex cursor-pointer items-center gap-2.5 text-[14px] text-body"
    >
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors ${checked ? "glow-accent border-transparent bg-accent" : "border-line-strong bg-deep"}`}
      >
        <span
          className={`size-[18px] rounded-full transition-transform ${checked ? "translate-x-5 bg-on-accent" : "bg-muted"}`}
        />
      </span>
      {label}
    </button>
  );
}
