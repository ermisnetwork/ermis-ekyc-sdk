interface ResultPanelProps {
  title: string;
  success: boolean | null;
  data: unknown;
  duration?: number;
}

export function ResultPanel({ title, success, data, duration }: ResultPanelProps) {
  if (data === null) return null;

  return (
    <div className="mt-6 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <span className="font-semibold text-sm">{title}</span>
        <div className="flex items-center gap-2">
          {duration !== undefined && (
            <span className="text-xs text-slate-500">{duration}ms</span>
          )}
          {success !== null && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${success
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
                }`}
            >
              {success ? "PASS" : "FAIL"}
            </span>
          )}
        </div>
      </div>
      {/* Body */}
      <div className="p-4">
        <pre className="text-xs leading-relaxed text-slate-400 whitespace-pre-wrap break-words font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
