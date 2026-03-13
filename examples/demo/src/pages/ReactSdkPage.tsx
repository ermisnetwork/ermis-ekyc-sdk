import { useState, useCallback } from "react";
import "ermis-ekyc-react/styles.css";
import {
  EkycMeetingProvider,
  EkycMeetingPreview,
  EkycMeetingRoom,
  EkycActionPanel,
  type EkycPreviewJoinData,
  type EkycMeetingRoomRef,
  enLocale,
} from "ermis-ekyc-react";

const DEFAULT_ERMIS_API = "https://api-ekyc.ermis.network";
const DEFAULT_EKYC_API = "https://ekyc-api.ktssolution.com/api/ekyc";
const DEFAULT_EKYC_API_KEY = "dev-key-123";
const DEFAULT_MEETING_HOST = "https://meeting-dev.ermis.network:9900";
const DEFAULT_MEETING_NODE = "https://meeting-dev.ermis.network:8800";

type View = "input" | "preview" | "room";

/**
 * Demo page for the ermis-ekyc-react package.
 */
export function ReactSdkPage() {
  const [joinCode, setJoinCode] = useState("");
  const [view, setView] = useState<View>("input");
  const [roomData, setRoomData] = useState<EkycPreviewJoinData | null>(null);
  const [roomHandle, setRoomHandle] = useState<EkycMeetingRoomRef | null>(null);

  const handleStartPreview = useCallback(() => {
    if (joinCode.trim()) {
      setView("preview");
    }
  }, [joinCode]);

  const handleJoinMeeting = useCallback((data: EkycPreviewJoinData) => {
    setRoomData(data);
    setView("room");
  }, []);

  const handleLeave = useCallback(() => {
    setView("input");
    setRoomData(null);
  }, []);

  const handleBackToInput = useCallback(() => {
    setView("input");
  }, []);

  return (
    <>
      {/* ── Input view: enter joinCode ──────────────────────── */}
      {view === "input" && (
        <>
          <div className="flex flex-wrap items-end gap-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-7 py-5 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Join Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartPreview()}
                placeholder="e.g. ABC123"
                className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <button
              onClick={handleStartPreview}
              disabled={!joinCode.trim()}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${joinCode.trim()
                ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_2px_12px_var(--color-accent-glow)] hover:opacity-90"
                : "bg-[var(--color-bg-secondary)] text-slate-500 border border-[var(--color-border)] cursor-not-allowed"
                }`}
            >
              🚀 Tham gia
            </button>
          </div>

          {!joinCode && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm">
              ⚠️ Nhập Join Code rồi nhấn "Tham gia" để kiểm tra thiết bị và vào phiên.
            </div>
          )}
        </>
      )}

      {/* ── Preview + Room wrapped in Provider ─────────────── */}
      {view !== "input" && (
        <EkycMeetingProvider
          ermisApiUrl={DEFAULT_ERMIS_API}
          ekycApiUrl={DEFAULT_EKYC_API}
          ekycApiKey={DEFAULT_EKYC_API_KEY}
          meetingHostUrl={DEFAULT_MEETING_HOST}
          meetingNodeUrl={DEFAULT_MEETING_NODE}
          locale={enLocale}
        >
          {view === "preview" && (
            <>
              <div className="mb-4">
                <button
                  onClick={handleBackToInput}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-slate-200 transition-all"
                >
                  ← Quay lại
                </button>
                <span className="ml-3 text-sm text-slate-400">
                  Join Code: <span className="text-indigo-400 font-mono font-semibold">{joinCode}</span>
                </span>
              </div>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
                <EkycMeetingPreview
                  joinCode={joinCode}
                  onJoinMeeting={handleJoinMeeting}
                  onJoinError={(err: Error) => console.error("Join failed:", err)}
                />
              </div>
            </>
          )}

          {view === "room" && roomData && (() => {
            const isHost = roomData.meetingData.registrant.role === "HOST";
            return (
              <div style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "#0f172a",
                display: "flex",
              }}>
                <EkycMeetingRoom
                  ref={setRoomHandle}
                  localStream={roomData.localStream}
                  meetingData={roomData.meetingData}
                  onLeave={handleLeave}
                />
                {isHost && roomHandle && (
                  <EkycActionPanel
                    remoteVideoRef={roomHandle.remoteVideoRef}
                    onOcrComplete={(r) => console.log("[Demo] OCR:", r)}
                    onLivenessComplete={(r) => console.log("[Demo] Liveness:", r)}
                    onFaceMatchComplete={(r) => console.log("[Demo] FaceMatch:", r)}
                    onEkycComplete={(r) => console.log("[Demo] eKYC complete:", r)}
                  />
                )}
              </div>
            );
          })()}
        </EkycMeetingProvider>
      )}
    </>
  );
}
