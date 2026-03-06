import React from "react";
import "./EkycMeetingRoom.css";

// ============================================================
// EkycMeetingRoom – Default placeholder for the meeting room UI
// ============================================================

export interface EkycMeetingRoomProps {
  /**
   * Data returned from `joinWithCode` API.
   * This will contain room/token info needed by the meeting SDK.
   */
  meetingData: unknown;
  /** Callback when user leaves the meeting */
  onLeave?: () => void;
  /** Optional custom CSS class name on root element */
  className?: string;

  // ── Visibility controls ──────────────────────────────────

  /** Show the meeting data debug panel. @default false */
  showDebugInfo?: boolean;
  /** Show the bottom control bar (mic, camera, share, leave). @default true */
  showControls?: boolean;
  /** Show the share screen button in controls. @default true */
  showShareScreen?: boolean;

  // ── Custom labels ────────────────────────────────────────

  /** Custom leave button text. @default "Rời phòng" */
  leaveButtonLabel?: string;
  /** Custom host participant label. @default "Thẩm định viên (HOST)" */
  hostLabel?: string;
  /** Custom guest participant label. @default "Khách hàng (GUEST)" */
  guestLabel?: string;
}

/**
 * Default EkycMeetingRoom component – placeholder for the actual meeting SDK integration.
 *
 * @example
 * ```tsx
 * <EkycMeetingProvider baseUrl="https://api-ekyc.ermis.network">
 *   <EkycMeetingRoom
 *     meetingData={joinData}
 *     showDebugInfo
 *     showShareScreen={false}
 *     onLeave={() => navigate('/')}
 *   />
 * </EkycMeetingProvider>
 * ```
 */
export function EkycMeetingRoom({
  meetingData,
  onLeave,
  className,
  showDebugInfo = false,
  showControls = true,
  showShareScreen = true,
  leaveButtonLabel = "Rời phòng",
  hostLabel = "Thẩm định viên (HOST)",
  guestLabel = "Khách hàng (GUEST)",
}: EkycMeetingRoomProps) {
  const rootClass = ["ekyc-room-root", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {/* ── Main content area ─────────────────────────────── */}
      <div className="ekyc-room-main">
        {/* Placeholder video grid */}
        <div className="ekyc-room-grid">
          <VideoPlaceholder label={hostLabel} color="#6366f1" />
          <VideoPlaceholder label={guestLabel} color="#8b5cf6" />
        </div>

        {/* Meeting info */}
        <div className="ekyc-room-info">
          <p className="ekyc-room-info-text">
            Đây là component mặc định. Tích hợp meeting SDK/library tại đây.
          </p>
          {showDebugInfo && meetingData != null && (
            <details className="ekyc-room-debug">
              <summary className="ekyc-room-debug-summary">
                Meeting Data (debug)
              </summary>
              <pre className="ekyc-room-debug-pre">
                {JSON.stringify(meetingData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* ── Bottom controls bar ───────────────────────────── */}
      {showControls && (
        <div className="ekyc-room-controls">
          <ControlButton icon="mic" label="Micro" />
          <ControlButton icon="camera" label="Camera" />
          {showShareScreen && (
            <ControlButton icon="share" label="Chia sẻ MH" />
          )}
          <button onClick={onLeave} className="ekyc-room-leave-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {leaveButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Internal sub-components ──────────────────────────────────

function VideoPlaceholder({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className="ekyc-room-placeholder">
      <div
        className="ekyc-room-avatar"
        style={{
          background: `${color}20`,
          border: `2px solid ${color}40`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <span className="ekyc-room-participant-label">{label}</span>
    </div>
  );
}

function ControlButton({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <button title={label} className="ekyc-room-control-btn">
      {icon === "mic" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 10-6 0v8.25a3 3 0 003 3z" />
        </svg>
      )}
      {icon === "camera" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )}
      {icon === "share" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
        </svg>
      )}
      {label}
    </button>
  );
}
