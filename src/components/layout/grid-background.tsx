export function GridBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(181,136,247,0.14),transparent_45%),radial-gradient(circle_at_bottom,_rgba(148,46,193,0.12),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
    </div>
  );
}

export function NodeVisualization() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="h-full w-full opacity-70"
      fill="none"
    >
      <circle cx="200" cy="200" r="120" stroke="rgba(181,136,247,0.25)" strokeWidth="1" />
      <circle cx="200" cy="80" r="8" fill="#B588F7" />
      <circle cx="320" cy="160" r="8" fill="#942EC1" />
      <circle cx="280" cy="300" r="8" fill="#B588F7" />
      <circle cx="120" cy="300" r="8" fill="#942EC1" />
      <circle cx="80" cy="160" r="8" fill="#B588F7" />
      <line x1="200" y1="80" x2="320" y2="160" stroke="rgba(181,136,247,0.35)" />
      <line x1="320" y1="160" x2="280" y2="300" stroke="rgba(181,136,247,0.35)" />
      <line x1="280" y1="300" x2="120" y2="300" stroke="rgba(148,46,193,0.35)" />
      <line x1="120" y1="300" x2="80" y2="160" stroke="rgba(148,46,193,0.35)" />
      <line x1="80" y1="160" x2="200" y2="80" stroke="rgba(181,136,247,0.35)" />
      <line x1="200" y1="80" x2="200" y2="200" stroke="rgba(181,136,247,0.25)" />
      <line x1="320" y1="160" x2="200" y2="200" stroke="rgba(148,46,193,0.25)" />
    </svg>
  );
}
