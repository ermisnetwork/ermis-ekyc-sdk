import { useState } from "react";
import { EkycService, EkycError, type LivenessResponse } from "ermis-ekyc-sdk";
import { CameraCapture } from "./CameraCapture";
import { ResultPanel } from "./ResultPanel";

interface LivenessTestProps {
  onSelfieFileChange?: (file: File | null) => void;
}

export function LivenessTest({ onSelfieFileChange }: LivenessTestProps) {
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LivenessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelfieChange = (file: File | null) => {
    setSelfieFile(file);
    onSelfieFileChange?.(file);
  };

  const handleSubmit = async () => {
    if (!selfieFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ekyc = EkycService.getInstance();
      const res = await ekyc.checkLiveness({ images: selfieFile });
      setResult(res);
    } catch (err) {
      setError(err instanceof EkycError ? `[${err.code}] ${err.message}` : String(err));
    } finally {
      setLoading(false);
    }
  };

  const checks = result
    ? [
      { label: "Texture Analysis", check: result.checks.texture_analysis },
      { label: "Moiré Detection", check: result.checks.moire_detection },
      { label: "Reflection", check: result.checks.reflection_detection },
      { label: "Depth Estimation", check: result.checks.depth_estimation },
      { label: "Face Size", check: result.checks.face_size_check },
      { label: "CLIP Liveness", check: result.checks.clip_liveness },
    ]
    : [];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-7 shadow-lg">
      <h2 className="text-xl font-semibold mb-1">🧬 Liveness Detection</h2>
      <p className="text-sm text-slate-400 mb-6">
        Take a selfie to verify you are a live person.
      </p>

      <CameraCapture label="Selfie" onChange={handleSelfieChange} />

      <div className="mt-5">
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-[0_2px_12px_var(--color-accent-glow)] hover:translate-y-[-1px] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={!selfieFile || loading}
          onClick={handleSubmit}
        >
          {loading && <span className="spinner" />}
          {loading ? "Checking..." : "Check Liveness"}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 mt-5 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm">
          <span className="spinner" /> Analyzing liveness...
        </div>
      )}

      {error && (
        <div className="mt-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          ❌ {error}
        </div>
      )}

      {result && (
        <>
          <div className={`mt-5 px-4 py-3 rounded-lg text-sm border ${result.is_live ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            {result.is_live ? "✅ Live person detected" : "❌ Liveness check failed"}
            {result.spoofing_detected && " — Spoofing detected!"}
          </div>

          {/* Checks Table */}
          <div className="mt-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <span className="font-semibold text-sm">Liveness Checks</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.is_live ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {result.confidence.toFixed(2)} confidence
              </span>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody className="divide-y divide-[var(--color-border)]">
                  {checks.map(({ label, check }) => (
                    <tr key={label}>
                      <td className="py-2.5 pr-4 text-sm text-slate-500 font-medium w-[160px]">{label}</td>
                      <td className="py-2.5 text-sm">
                        {check.passed ? "✅" : "❌"}{" "}
                        <span className="text-slate-400">(score: {check.score.toFixed(3)})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ResultPanel title="Raw Response" success={result.success} data={result} duration={result.processing_time_ms} />
        </>
      )}
    </div>
  );
}
