export default function AssessmentCompleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
