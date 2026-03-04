import { useState } from "react";
import { EkycService, EkycError, type FaceMatchResponse } from "ermis-ekyc-sdk";
import { FileUpload } from "./FileUpload";
import { ResultPanel } from "./ResultPanel";

export function FaceMatchTest() {
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState("0.6");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FaceMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selfieFile || !documentFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ekyc = EkycService.getInstance();
      const res = await ekyc.matchFaces({ selfieImage: selfieFile, documentImage: documentFile, threshold });
      setResult(res);
    } catch (err) {
      setError(err instanceof EkycError ? `[${err.code}] ${err.message}` : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-7 shadow-lg">
      <h2 className="text-xl font-semibold mb-1">🔍 Face Match</h2>
      <p className="text-sm text-slate-400 mb-6">
        Compare a selfie with a document photo for identity verification.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <FileUpload label="Selfie Image" onChange={setSelfieFile} />
        <FileUpload label="Document Image" onChange={setDocumentFile} />
      </div>

      <div className="mb-5 max-w-[200px]">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Threshold</label>
        <input
          type="text"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="0.6"
          className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <button
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-[0_2px_12px_var(--color-accent-glow)] hover:translate-y-[-1px] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        disabled={!selfieFile || !documentFile || loading}
        onClick={handleSubmit}
      >
        {loading && <span className="spinner" />}
        {loading ? "Comparing..." : "Compare Faces"}
      </button>

      {loading && (
        <div className="flex items-center gap-2 mt-5 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm">
          <span className="spinner" /> Comparing faces...
        </div>
      )}

      {error && (
        <div className="mt-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          ❌ {error}
        </div>
      )}

      {result && (
        <>
          <div className={`mt-5 px-4 py-3 rounded-lg text-sm border ${result.match ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            {result.match ? "✅ Faces match!" : "❌ Faces do not match"}
          </div>

          <div className="mt-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <span className="font-semibold text-sm">Match Details</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.match ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {(result.similarity * 100).toFixed(1)}% similar
              </span>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[
                    ["Match", result.match ? "✅ Yes" : "❌ No"],
                    ["Similarity", `${(result.similarity * 100).toFixed(1)}%`],
                    ["Threshold", String(result.threshold)],
                    ["Selfie Face", result.selfie_face_detected ? `✅ Detected (${result.selfie_face_count})` : "❌ Not detected"],
                    ["Document Face", result.document_face_detected ? `✅ Detected (${result.document_face_count})` : "❌ Not detected"],
                    ["Processing Time", `${result.processing_time_ms}ms`],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-2.5 pr-4 text-sm text-slate-500 font-medium w-[150px]">{label}</td>
                      <td className="py-2.5 text-sm">{value}</td>
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
