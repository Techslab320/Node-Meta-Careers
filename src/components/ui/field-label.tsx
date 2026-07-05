export function FieldLabel({
  label,
  required,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200">
      {label}
      {required ? (
        <span className="text-cyan-400"> *</span>
      ) : (
        <span className="font-normal text-slate-500"> optional</span>
      )}
    </label>
  );
}
