import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/field-label";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-2">
      <FieldLabel label={label} required={props.required} htmlFor={inputId} />
      <select
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-brand-light/30",
          error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/30",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
