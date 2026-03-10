import React, { useCallback, useEffect, useRef, useState } from "react";
import { ErmisService } from "ermis-ekyc-sdk";
import { useMediaPreview } from "../hooks/useMediaPreview";
import { useEkycMeetingConfig } from "../EkycMeetingProvider";
import type { JoinWithCodeResponse } from "../types/meeting.types";
import "./EkycMeetingPreview.css";

// ============================================================
// EkycMeetingPreview – test mic/cam and join meeting with code
// ============================================================

/** Data passed from Preview to Room when user clicks "Join". */
export interface EkycPreviewJoinData {
  /** Local stream – guaranteed non-null (camera + mic required to join) */
  localStream: MediaStream;
  meetingData: JoinWithCodeResponse;
}

export interface EkycMeetingPreviewProps {
  /** The join code for this registrant */
  joinCode: string;
  /** Callback when user clicks Join – receives all data needed by EkycMeetingRoom */
  onJoinMeeting?: (data: EkycPreviewJoinData) => void;
  /** Callback when joinWithCode fails */
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
  /** Custom text shown while joining. @default "Đang kết nối..." */
  joiningLabel?: string;
}

/**
 * Preview component for testing mic/camera before joining a meeting.
 *
 * Flow:
 * 1. Mount → auto-calls `joinWithCode` to get meeting data.
 * 2. User tests camera/mic.
 * 3. User clicks **Join** → `onJoinMeeting` fires with `EkycPreviewJoinData`.
 *
 * @example
 * ```tsx
 * <EkycMeetingProvider
 *   ekycApiUrl="https://api-ekyc.ermis.network"
 *   meetingServerUrl="https://meet.ermis.network"
 *   meetingNodeUrl="https://node.ermis.network"
 * >
 *   <EkycMeetingPreview
 *     joinCode="ABC123"
 *     onJoinMeeting={(data) => setRoomData(data)}
 *   />
 * </EkycMeetingProvider>
 * ```
 */
export function EkycMeetingPreview({
  joinCode,
  onJoinMeeting,
  onJoinError,
  className,
  showHeader = true,
  showToggleButtons = true,
  showDeviceSelectors = true,
  showAudioLevel = true,
  headerTitle = "Kiểm tra thiết bị",
  headerDescription = "Kiểm tra camera và micro trước khi tham gia phiên thẩm định",
  joinButtonLabel = "Tham gia phiên thẩm định",
  joiningLabel = "Đang kết nối...",
}: EkycMeetingPreviewProps) {
  const meetingService = ErmisService.getInstance().meetings;
  const { meetingHostUrl, meetingNodeUrl } = useEkycMeetingConfig();

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

  const audioBarsRef = useRef<HTMLDivElement>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState<JoinWithCodeResponse | null>(null);
  const [isReady, setIsReady] = useState(false);

  // ── Callback ref: attach stream as soon as <video> mounts ──
  const videoRefCallback = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node && stream) {
        node.srcObject = stream;
      }
    },
    [stream],
  );

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

  // ── Auto-call joinWithCode on mount ─────────────────────────
  useEffect(() => {
    if (!joinCode) return;
    setIsJoining(true);
    setJoinError(null);

    meetingService
      .joinWithCode(joinCode)
      .then((result: unknown) => {
        const response = result as { success: boolean; data: JoinWithCodeResponse };
        setMeetingData(response.data);
        setIsReady(true);
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

  // ── Derived: can the user join? ─────────────────────────────
  const canJoin = isReady && !!stream && videoEnabled && audioEnabled && !isJoining && !isLoading;

  // ── Join button handler ────────────────────────────────────
  const handleJoin = useCallback(() => {
    if (!meetingData || !stream) return;
    onJoinMeeting?.({
      localStream: stream,
      meetingData,
    });
  }, [onJoinMeeting, stream, meetingData]);

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
            ref={videoRefCallback}
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
        disabled={!canJoin}
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
