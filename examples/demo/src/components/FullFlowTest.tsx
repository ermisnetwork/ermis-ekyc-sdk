import { useState } from "react";
import { EkycService, EkycError, DocumentType, type EkycFlowResult } from "ermis-ekyc-sdk";
import { FileUpload } from "./FileUpload";
import { ResultPanel } from "./ResultPanel";

type StepStatus = "idle" | "active" | "done" | "failed";

const STEP_LABELS = ["OCR Extraction", "Liveness Check", "Face Match"] as const;

const stepStyles: Record<StepStatus, string> = {
  idle: "border-[var(--color-border)] text-slate-500",
  active: "border-indigo-500 text-indigo-300 bg-indigo-500/[0.08]",
  done: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
  failed: "border-red-500 text-red-400 bg-red-500/10",
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.CCCD]: "CCCD – Citizen Identity Card",
  [DocumentType.PASSPORT]: "Passport",
  [DocumentType.GPLX]: "GPLX – Driver's License",
};

export function FullFlowTest() {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.CCCD);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EkycFlowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<[StepStatus, StepStatus, StepStatus]>(["idle", "idle", "idle"]);

  const needsBackSide = docType !== DocumentType.PASSPORT;

  const handleDocTypeChange = (type: DocumentType) => {
    setDocType(type);
    if (type === DocumentType.PASSPORT) setBackFile(null);
  };

  const handleSubmit = async () => {
    if (!frontFile || (needsBackSide && !backFile) || !selfieFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSteps(["active", "idle", "idle"]);

    try {
      const ekyc = EkycService.getInstance();

      const ocrResult = await ekyc.performOcr({
        documentFront: frontFile,
        ...(backFile ? { documentBack: backFile } : {}),
        documentType: docType,
        extractFace: true,
      });
      setSteps(["done", "active", "idle"]);

      const livenessResult = await ekyc.checkLiveness({
        images: selfieFile,
        mode: "passive",
        challenge: "blink",
      });

      if (!livenessResult.is_live) {
        setSteps(["done", "failed", "idle"]);
        setResult({
          ocr: ocrResult,
          liveness: livenessResult,
          faceMatch: { success: false, match: false, similarity: 0, threshold: 0, selfie_face_detected: false, document_face_detected: false, selfie_face_count: 0, document_face_count: 0, processing_time_ms: 0 },
          isVerified: false,
          totalDuration: ocrResult.processing_time_ms + livenessResult.processing_time_ms,
        });
        setLoading(false);
        return;
      }
      setSteps(["done", "done", "active"]);

      const faceMatchResult = await ekyc.matchFaces({
        selfieImage: selfieFile,
        documentImage: frontFile,
        threshold: "0.6",
      });

      const isVerified = ocrResult.success && livenessResult.is_live && !livenessResult.spoofing_detected && faceMatchResult.match;
      setSteps(["done", "done", isVerified ? "done" : "failed"]);

      setResult({
        ocr: ocrResult,
        liveness: livenessResult,
        faceMatch: faceMatchResult,
        isVerified,
        totalDuration: ocrResult.processing_time_ms + livenessResult.processing_time_ms + faceMatchResult.processing_time_ms,
      });
    } catch (err) {
      setSteps((prev) => prev.map((s) => (s === "active" ? "failed" : s)) as [StepStatus, StepStatus, StepStatus]);
      setError(err instanceof EkycError ? `[${err.code}] ${err.message}` : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-7 shadow-lg">
      <h2 className="text-xl font-semibold mb-1">🚀 Full eKYC Flow</h2>
      <p className="text-sm text-slate-400 mb-6">
        Run the complete verification: OCR → Liveness → Face Match
      </p>

      {/* Step Indicators */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 flex items-center gap-2.5 px-4 py-3.5 border rounded-lg text-[0.8rem] font-medium transition-all ${stepStyles[steps[i]]}`}
          >
            <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--color-bg-card)] border border-current shrink-0">
              {steps[i] === "done" ? "✓" : steps[i] === "failed" ? "✗" : i + 1}
            </span>
            {label}
          </div>
        ))}
      </div>

      {/* Document Type Selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-300 mb-2">Document Type</label>
        <select
          value={docType}
          onChange={(e) => handleDocTypeChange(e.target.value as DocumentType)}
          className="w-full sm:w-64 px-4 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
        >
          {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* File Uploads */}
      <div className={`grid grid-cols-1 ${needsBackSide ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 mb-5`}>
        <FileUpload label="Document Front" onChange={setFrontFile} />
        {needsBackSide && <FileUpload label="Document Back" onChange={setBackFile} />}
        <FileUpload label="Selfie" onChange={setSelfieFile} />
      </div>

      <button
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-[0_2px_12px_var(--color-accent-glow)] hover:translate-y-[-1px] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        disabled={!frontFile || (needsBackSide && !backFile) || !selfieFile || loading}
        onClick={handleSubmit}
      >
        {loading && <span className="spinner" />}
        {loading ? "Running eKYC Flow..." : "Start eKYC Flow"}
      </button>

      {loading && (
        <div className="flex items-center gap-2 mt-5 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm">
          <span className="spinner" /> Processing eKYC verification...
        </div>
      )}

      {error && (
        <div className="mt-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          ❌ {error}
        </div>
      )}

      {result && (
        <>
          {/* Verification Banner */}
          <div className={`mt-5 px-4 py-4 rounded-lg text-base font-semibold border ${result.isVerified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            {result.isVerified ? "✅ Identity Verified Successfully!" : "❌ Identity Verification Failed"}
            <span className="ml-3 text-sm font-normal opacity-80">({result.totalDuration}ms)</span>
          </div>

          {/* OCR Summary */}
          {result.ocr.success && (
            <div className="mt-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <span className="font-semibold text-sm">📄 OCR Result</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">{result.ocr.confidence.toFixed(2)}</span>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {[
                      ["ID Number", result.ocr.data.id_number],
                      ["Full Name", result.ocr.data.full_name],
                      ["Date of Birth", result.ocr.data.date_of_birth],
                      ["Gender", result.ocr.data.gender],
                    ].map(([l, v]) => (
                      <tr key={l}><td className="py-2 pr-4 text-sm text-slate-500 font-medium w-[140px]">{l}</td><td className="py-2 text-sm">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Liveness Summary */}
          <div className="mt-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <span className="font-semibold text-sm">🧬 Liveness Result</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.liveness.is_live ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {result.liveness.is_live ? "LIVE" : "SPOOF"}
              </span>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr><td className="py-2 pr-4 text-sm text-slate-500 font-medium w-[140px]">Is Live</td><td className="py-2 text-sm">{result.liveness.is_live ? "✅ Yes" : "❌ No"}</td></tr>
                  <tr><td className="py-2 pr-4 text-sm text-slate-500 font-medium">Confidence</td><td className="py-2 text-sm">{result.liveness.confidence.toFixed(3)}</td></tr>
                  <tr><td className="py-2 pr-4 text-sm text-slate-500 font-medium">Spoofing</td><td className="py-2 text-sm">{result.liveness.spoofing_detected ? "⚠️ Detected" : "✅ Not detected"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Face Match Summary */}
          {result.faceMatch.processing_time_ms > 0 && (
            <div className="mt-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <span className="font-semibold text-sm">🔍 Face Match Result</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.faceMatch.match ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {(result.faceMatch.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody className="divide-y divide-[var(--color-border)]">
                    <tr><td className="py-2 pr-4 text-sm text-slate-500 font-medium w-[140px]">Match</td><td className="py-2 text-sm">{result.faceMatch.match ? "✅ Yes" : "❌ No"}</td></tr>
                    <tr><td className="py-2 pr-4 text-sm text-slate-500 font-medium">Similarity</td><td className="py-2 text-sm">{(result.faceMatch.similarity * 100).toFixed(1)}%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <ResultPanel title="Full Raw Response" success={result.isVerified} data={result} duration={result.totalDuration} />
        </>
      )}
    </div>
  );
}
