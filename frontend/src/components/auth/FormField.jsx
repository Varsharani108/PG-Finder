export default function FormField({ label, error, children, htmlFor }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-primary mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const inputClass = (hasError) =>
  `w-full rounded-lg border ${
    hasError ? "border-red-400 focus:ring-red-200" : "border-primary/15 focus:ring-accent/30"
  } bg-background/60 px-3.5 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none focus:ring-4 focus:border-accent transition-all`;
