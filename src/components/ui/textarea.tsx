import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/field-label";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-2">
      <FieldLabel label={label} required={props.required} htmlFor={inputId} />
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-brand-light/30",
          error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/30",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
