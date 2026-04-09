/**
 * Reusable dark-theme toggle switch.
 * Usage: <Toggle checked={value} onChange={setValue} />
 */
export default function Toggle({ checked, onChange, disabled = false }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
        relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full
        transition-colors duration-200 focus:outline-none
        ${checked ? "bg-emerald-500" : "bg-slate-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
        >
            <span
                className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
            />
        </button>
    );
}