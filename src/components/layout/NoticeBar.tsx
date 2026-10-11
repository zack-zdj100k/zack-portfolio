export function NoticeBar({ tone, children }: { tone: "info" | "preview"; children: React.ReactNode }) {
  return (
    <div
      role="note"
      className={
        tone === "preview"
          ? "bg-mist px-4 py-2 text-center text-sm font-medium text-ink"
          : "border-b border-line bg-ink-2 px-4 py-2 text-center text-sm text-mist/80"
      }
    >
      {children}
    </div>
  );
}
