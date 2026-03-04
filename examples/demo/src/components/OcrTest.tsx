import { useState } from "react";
import { EkycService, EkycError, type OcrResponse } from "ermis-ekyc-sdk";
import { FileUpload } from "./FileUpload";
import { ResultPanel } from "./ResultPanel";

export function OcrTest() {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!frontFile || !backFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ekyc = EkycService.getInstance();
      const res = await ekyc.performOcr({
        documentFront: frontFile,
        documentBack: backFile,
        documentType: "CCCD",
        extractFace: true,
        ocrApi: "advanced",
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof EkycError ? `[${err.code}] ${err.message}` : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-7 shadow-lg">
      <h2 className="text-xl font-semibold mb-1">📄 OCR – Document Extraction</h2>
      <p className="text-sm text-slate-400 mb-6">
        Upload front and back images of your CMND/CCCD to extract information.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <FileUpload label="Document Front" onChange={setFrontFile} />
        <FileUpload label="Document Back" onChange={setBackFile} />
      </div>

      <button
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-[0_2px_12px_var(--color-accent-glow)] hover:translate-y-[-1px] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        disabled={!frontFile || !backFile || loading}
        onClick={handleSubmit}
      >
        {loading && <span className="spinner" />}
        {loading ? "Processing..." : "Run OCR"}
      </button>

      {loading && (
        <div className="flex items-center gap-2 mt-5 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm">
          <span className="spinner" /> Extracting document information...
        </div>
      )}

      {error && (
        <div className="mt-5 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          ❌ {error}
        </div>
      )}

      {result && (
        <>
          <div className="mt-5 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm">
            ✅ OCR completed in {result.processing_time_ms}ms
          </div>

          {/* Extracted Data Table */}
          <div className="mt-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <span className="font-semibold text-sm">Extracted Information</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                {result.confidence.toFixed(2)} confidence
              </span>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[
                    ["ID Number", result.data.id_number],
                    ["Full Name", result.data.full_name],
                    ["Date of Birth", result.data.date_of_birth],
                    ["Gender", result.data.gender],
                    ["Nationality", result.data.nationality],
                    ["Place of Origin", result.data.place_of_origin],
                    ["Residence", result.data.place_of_residence],
                    ["Expiry Date", result.data.expiry_date],
                    ...(result.data.issue_date ? [["Issue Date", result.data.issue_date]] : []),
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
