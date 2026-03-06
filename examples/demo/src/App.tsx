import { useState, useCallback, useEffect } from "react";
import { EkycService, ErmisService } from "ermis-ekyc-sdk";
import { useAuthStore } from "./stores/authStore";
import { LoginPage } from "./pages/LoginPage";
import { CustomerListPage } from "./pages/CustomerListPage";
import { AppraiserListPage } from "./pages/AppraiserListPage";
import { MeetingListPage } from "./pages/MeetingListPage";
import { OcrTest } from "./components/OcrTest";
import { LivenessTest } from "./components/LivenessTest";
import { FaceMatchTest } from "./components/FaceMatchTest";
import { FullFlowTest } from "./components/FullFlowTest";

type TopTab = "ekyc" | "management";
type EkycTab = "flow" | "ocr" | "liveness" | "facematch";
type MgmtTab = "customers" | "appraisers" | "meetings";

const EKYC_TABS: { id: EkycTab; label: string }[] = [
  { id: "flow", label: "🚀 Full Flow" },
  { id: "ocr", label: "📄 OCR" },
  { id: "liveness", label: "🧬 Liveness" },
  { id: "facematch", label: "🔍 Face Match" },
];

const EKYC_API_BASE_URL = "https://ekyc-api.ktssolution.com/api/ekyc";
const EKYC_API_KEY = "dev-key-123";
const ERMIS_API_BASE_URL = "https://api-ekyc.ermis.network";

export default function App() {
  const { isAuthenticated, user, logout, initialize } = useAuthStore();

  const [topTab, setTopTab] = useState<TopTab>("ekyc");
  const [ekycTab, setEkycTab] = useState<EkycTab>("flow");
  const [mgmtTab, setMgmtTab] = useState<MgmtTab>("customers");
  const [baseUrl, setBaseUrl] = useState(EKYC_API_BASE_URL);
  const [apiKey, setApiKey] = useState(EKYC_API_KEY);
  const [initialized, setInitialized] = useState(false);

  // Shared files between eKYC tabs
  const [sharedDocumentFile, setSharedDocumentFile] = useState<File | null>(null);
  const [sharedSelfieFile, setSharedSelfieFile] = useState<File | null>(null);

  // Initialize ErmisService and restore auth on mount
  useEffect(() => {
    ErmisService.resetInstance();
    ErmisService.getInstance({ baseUrl: ERMIS_API_BASE_URL });
    initialize();
  }, [initialize]);

  const handleInit = useCallback(() => {
    EkycService.resetInstance();
    EkycService.getInstance({ baseUrl, apiKey });
    setInitialized(true);
  }, [baseUrl, apiKey]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
            Ermis eKYC Platform
          </h1>
          {isAuthenticated ? (
            <p className="text-slate-400 text-sm mt-1">
              Xin chào, <span className="text-slate-200 font-medium">{user?.username}</span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-500/15 text-indigo-400 font-semibold uppercase">
                {user?.role}
              </span>
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">
              SDK Testing & Management Console
            </p>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            🚪 Đăng xuất
          </button>
        )}
      </header>

      {/* ── Top-level Tabs ─────────────────────────────────────── */}
      <div className="flex gap-1 bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-[var(--color-border)] mb-6">
        <button
          onClick={() => setTopTab("ekyc")}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${topTab === "ekyc"
            ? "bg-indigo-500 text-white shadow-[0_2px_8px_var(--color-accent-glow)]"
            : "text-slate-400 hover:text-slate-200 hover:bg-[var(--color-bg-card)]"
            }`}
        >
          🧪 eKYC Test
        </button>
        <button
          onClick={() => setTopTab("management")}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${topTab === "management"
            ? "bg-indigo-500 text-white shadow-[0_2px_8px_var(--color-accent-glow)]"
            : "text-slate-400 hover:text-slate-200 hover:bg-[var(--color-bg-card)]"
            }`}
        >
          🔐 Quản lý
          {!isAuthenticated && (
            <span className="ml-1.5 text-[10px] opacity-60">(cần đăng nhập)</span>
          )}
        </button>
      </div>

      {/* ── eKYC Section ───────────────────────────────────────── */}
      {topTab === "ekyc" && (
        <>
          {/* eKYC Sub-tabs */}
          <div className="flex flex-col sm:flex-row gap-1 bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border)] mb-6">
            {EKYC_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEkycTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${ekycTab === tab.id
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* eKYC Config */}
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

          {!initialized && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm">
              ⚠️ Please initialize the SDK with your API URL and key before testing.
            </div>
          )}

          {/* eKYC Content */}
          {ekycTab === "flow" && <FullFlowTest />}
          {ekycTab === "ocr" && <OcrTest onDocumentFileChange={setSharedDocumentFile} />}
          {ekycTab === "liveness" && <LivenessTest onSelfieFileChange={setSharedSelfieFile} />}
          {ekycTab === "facematch" && (
            <FaceMatchTest
              initialDocumentFile={sharedDocumentFile}
              initialSelfieFile={sharedSelfieFile}
            />
          )}
        </>
      )}

      {/* ── Management Section ─────────────────────────────────── */}
      {topTab === "management" && (
        <>
          {!isAuthenticated ? (
            /* Show inline login */
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm">
                  🔐 Đăng nhập để quản lý Khách hàng và Thẩm định viên
                </div>
              </div>
              <LoginPage />
            </div>
          ) : (
            <>
              {/* Management Sub-tabs */}
              <div className="flex gap-1 bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border)] mb-6">
                <button
                  onClick={() => setMgmtTab("customers")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mgmtTab === "customers"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  👥 Khách hàng
                </button>
                <button
                  onClick={() => setMgmtTab("appraisers")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mgmtTab === "appraisers"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  🔍 Thẩm định viên
                </button>
                <button
                  onClick={() => setMgmtTab("meetings")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${mgmtTab === "meetings"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  📋 Phiên thẩm định
                </button>
              </div>

              {/* Management Content */}
              {mgmtTab === "customers" && <CustomerListPage />}
              {mgmtTab === "appraisers" && <AppraiserListPage />}
              {mgmtTab === "meetings" && <MeetingListPage />}
            </>
          )}
        </>
      )}
    </div>
  );
}
