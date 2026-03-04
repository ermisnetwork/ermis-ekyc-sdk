import { useState, useCallback } from "react";
import { EkycService } from "ermis-ekyc-sdk";
import { OcrTest } from "./components/OcrTest";
import { LivenessTest } from "./components/LivenessTest";
import { FaceMatchTest } from "./components/FaceMatchTest";
import { FullFlowTest } from "./components/FullFlowTest";

type Tab = "flow" | "ocr" | "liveness" | "facematch";

const TABS: { id: Tab; label: string }[] = [
  { id: "flow", label: "🚀 Full Flow" },
  { id: "ocr", label: "📄 OCR" },
  { id: "liveness", label: "🧬 Liveness" },
  { id: "facematch", label: "🔍 Face Match" },
];

const DEFAULT_BASE_URL = "https://ekyc-api.ktssolution.com/api/ekyc";
const DEFAULT_API_KEY = "dev-key-123";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("flow");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [initialized, setInitialized] = useState(false);

  const handleInit = useCallback(() => {
    EkycService.resetInstance();
    EkycService.getInstance({ baseUrl, apiKey });
    setInitialized(true);
  }, [baseUrl, apiKey]);

  return (
    <div className="max-w-[960px] mx-auto px-6 py-10">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
          eKYC SDK Demo
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Test OCR, Liveness Detection, and Face Match APIs
        </p>
      </header>

      {/* Config Bar */}
      <div className="flex flex-wrap items-end gap-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-7 py-5 mb-6">
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            API Base URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => { setBaseUrl(e.target.value); setInitialized(false); }}
            placeholder="https://ekyc-api.example.com/api/ekyc"
            className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setInitialized(false); }}
            placeholder="your-api-key"
            className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <button
          onClick={handleInit}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${initialized
              ? "bg-[var(--color-bg-secondary)] text-slate-400 border border-[var(--color-border)] hover:text-slate-200"
              : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_2px_12px_var(--color-accent-glow)]"
            }`}
        >
          {initialized ? "✓ Connected" : "Initialize SDK"}
        </button>
      </div>

      {/* Warning */}
      {!initialized && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm">
          ⚠️ Please initialize the SDK with your API URL and key before testing.
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-1 bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-[var(--color-border)] mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-indigo-500 text-white shadow-[0_2px_8px_var(--color-accent-glow)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[var(--color-bg-card)]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "flow" && <FullFlowTest />}
      {activeTab === "ocr" && <OcrTest />}
      {activeTab === "liveness" && <LivenessTest />}
      {activeTab === "facematch" && <FaceMatchTest />}
    </div>
  );
}
