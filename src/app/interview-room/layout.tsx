export default function InterviewRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-950">
      {children}
    </div>
  );
}
