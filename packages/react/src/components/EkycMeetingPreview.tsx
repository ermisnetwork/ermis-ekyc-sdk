import React, { useCallback, useEffect, useRef, useState } from "react";
import { ErmisService } from "ermis-ekyc-sdk";
import { useMediaPreview } from "../hooks/useMediaPreview";
import "./EkycMeetingPreview.css";

// ============================================================
// EkycMeetingPreview – test mic/cam and join meeting with code
// ============================================================

export interface EkycMeetingPreviewProps {
  /** The join code for this registrant */
  joinCode: string;
  /** Callback when join succeeds – receives meeting data from API */
  onJoinSuccess?: (meetingData: unknown) => void;
  /** Callback when join fails */
  onJoinError?: (error: Error) => void;
  /** Optional custom CSS class name on root element */
  className?: string;

  // ── Visibility controls ──────────────────────────────────

  /** Show the header section (title + description). @default true */
  showHeader?: boolean;
  /** Show mic/camera toggle buttons. @default true */
  showToggleButtons?: boolean;
  /** Show device selectors (camera & microphone dropdowns). @default true */
  showDeviceSelectors?: boolean;
  /** Show the mic audio level meter overlay. @default true */
  showAudioLevel?: boolean;

  // ── Custom labels ────────────────────────────────────────

  /** Custom header title. @default "Kiểm tra thiết bị" */
  headerTitle?: string;
  /** Custom header description. @default "Kiểm tra camera và micro trước khi tham gia phiên thẩm định" */
  headerDescription?: string;
  /** Custom join button text. @default "Tham gia phiên thẩm định" */
  joinButtonLabel?: string;
  /** Custom text shown while joining. @default "Đang tham gia..." */
  joiningLabel?: string;
}

/**
 * Preview component for testing mic/camera before joining a meeting.
 *
 * @example
 * ```tsx
 * <EkycMeetingProvider baseUrl="https://api-ekyc.ermis.network">
 *   <EkycMeetingPreview
 *     joinCode="ABC123"
 *     showDeviceSelectors={false}
 *     joinButtonLabel="Bắt đầu"
 *     onJoinSuccess={(data) => setView('meeting')}
 *   />
 * </EkycMeetingProvider>
 * ```
 */
export function EkycMeetingPreview({
  joinCode,
  onJoinSuccess,
  onJoinError,
  className,
  showHeader = true,
  showToggleButtons = true,
  showDeviceSelectors = true,
  showAudioLevel = true,
  headerTitle = "Kiểm tra thiết bị",
  headerDescription = "Kiểm tra camera và micro trước khi tham gia phiên thẩm định",
  joinButtonLabel = "Tham gia phiên thẩm định",
  joiningLabel = "Đang tham gia...",
}: EkycMeetingPreviewProps) {
  const meetingService = ErmisService.getInstance().meetings;
  const {
    stream,
    videoEnabled,
    audioEnabled,
    audioLevelRef,
    videoDevices,
    audioDevices,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    error: mediaError,
    isLoading,
    toggleVideo,
    toggleAudio,
    selectVideoDevice,
    selectAudioDevice,
    cleanup,
  } = useMediaPreview();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioBarsRef = useRef<HTMLDivElement>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  console.log('---joinCode---', joinCode)

  // ── Attach stream to video element ─────────────────────────
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ── Update audio bars via RAF (no re-renders) ──────────────
  useEffect(() => {
    if (!showAudioLevel || !audioEnabled || !stream) return;
    const thresholds = [0.1, 0.2, 0.35, 0.5, 0.7];
    let rafId: number;
    const update = () => {
      const bars = audioBarsRef.current?.children;
      if (bars) {
        const level = audioLevelRef.current;
        for (let i = 0; i < bars.length; i++) {
          const bar = bars[i] as HTMLElement;
          bar.style.background =
            level >= thresholds[i] ? "#22c55e" : "rgba(148, 163, 184, 0.3)";
        }
      }
      rafId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafId);
  }, [showAudioLevel, audioEnabled, stream, audioLevelRef]);

  // ── Auto join on mount ──────────────────────────────────────
  useEffect(() => {
    if (!joinCode) return;
    setIsJoining(true);
    setJoinError(null);

    meetingService
      .joinWithCode(joinCode)
      .then((result) => {
        onJoinSuccess?.(result);
      })
      .catch((err: unknown) => {
        const error =
          err instanceof Error ? err : new Error("Tham gia phiên thất bại");
        setJoinError(error.message);
        onJoinError?.(error);
      })
      .finally(() => {
        setIsJoining(false);
      });
  }, [joinCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Join button handler (placeholder) ──────────────────────
  const handleJoin = useCallback(() => {
    // TODO: implement custom join logic if needed
  }, []);

  const rootClass = ["ekyc-preview-root", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {/* ── Header ──────────────────────────────────────────── */}
      {showHeader && (
        <div className="ekyc-preview-header">
          <h2 className="ekyc-preview-title">{headerTitle}</h2>
          <p className="ekyc-preview-desc">{headerDescription}</p>
        </div>
      )}

      {/* ── Video Preview ───────────────────────────────────── */}
      <div className="ekyc-preview-video-container">
        {isLoading ? (
          <div className="ekyc-preview-video-loading">Đang khởi tạo camera...</div>
        ) : !videoEnabled || !stream ? (
          <div className="ekyc-preview-video-off">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="ekyc-preview-video-off-text">Camera đã tắt</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="ekyc-preview-video"
          />
        )}

        {/* Mic level indicator overlay – bars updated via RAF, not React state */}
        {showAudioLevel && audioEnabled && stream && (
          <div className="ekyc-preview-audio-level" ref={audioBarsRef}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="ekyc-preview-audio-bar"
                style={{ height: `${6 + i * 4}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Error messages ──────────────────────────────────── */}
      {(mediaError || joinError) && (
        <div className="ekyc-preview-error">⚠️ {mediaError || joinError}</div>
      )}

      {/* ── Toggle buttons ──────────────────────────────────── */}
      {showToggleButtons && (
        <div className="ekyc-preview-toggles">
          <ToggleButton
            active={videoEnabled}
            onClick={toggleVideo}
            label={videoEnabled ? "Camera" : "Camera tắt"}
            icon={videoEnabled ? "videocam" : "videocam_off"}
          />
          <ToggleButton
            active={audioEnabled}
            onClick={toggleAudio}
            label={audioEnabled ? "Micro" : "Micro tắt"}
            icon={audioEnabled ? "mic" : "mic_off"}
          />
        </div>
      )}

      {/* ── Device selectors ────────────────────────────────── */}
      {showDeviceSelectors && (
        <div className="ekyc-preview-devices">
          {videoDevices.length > 1 && (
            <DeviceSelect
              label="Camera"
              devices={videoDevices}
              selectedId={selectedVideoDeviceId}
              onChange={selectVideoDevice}
            />
          )}
          {audioDevices.length > 1 && (
            <DeviceSelect
              label="Microphone"
              devices={audioDevices}
              selectedId={selectedAudioDeviceId}
              onChange={selectAudioDevice}
            />
          )}
        </div>
      )}

      {/* ── Join button ─────────────────────────────────────── */}
      <button
        onClick={handleJoin}
        disabled={isJoining || isLoading || !joinCode}
        className="ekyc-preview-join-btn"
      >
        {isJoining ? joiningLabel : joinButtonLabel}
      </button>
    </div>
  );
}

// ── Internal sub-components ──────────────────────────────────

function ToggleButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`ekyc-preview-toggle-btn ${active ? "ekyc-preview-toggle-btn-active" : "ekyc-preview-toggle-btn-inactive"
        }`}
    >
      {icon === "videocam" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )}
      {icon === "videocam_off" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m13.5 0V7.5a2.25 2.25 0 00-2.25-2.25H5.25M3 3l18 18" />
        </svg>
      )}
      {icon === "mic" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 10-6 0v8.25a3 3 0 003 3z" />
        </svg>
      )}
      {icon === "mic_off" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 10-6 0v8.25M3 3l18 18" />
        </svg>
      )}
      {label}
    </button>
  );
}

function DeviceSelect({
  label,
  devices,
  selectedId,
  onChange,
}: {
  label: string;
  devices: MediaDeviceInfo[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className="ekyc-preview-device-label">{label}</label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="ekyc-preview-device-select"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `${label} ${devices.indexOf(device) + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
