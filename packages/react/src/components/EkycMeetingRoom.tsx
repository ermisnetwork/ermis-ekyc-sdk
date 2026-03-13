import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { JoinWithCodeResponse } from "../types/meeting.types";
import { ErmisService } from "ermis-ekyc-sdk";
import { useEkycMeetingConfig, useEkycLocale } from "../EkycMeetingProvider";
import "./EkycMeetingRoom.css";
import { ChannelName, ErmisClassroomProvider, useErmisClassroom, useMediaDevices } from "@ermis-network/ermis-classroom-react";
import { QualityLevel } from "@ermis-network/ermis-classroom-sdk";

// ============================================================
// EkycMeetingRoom – Meeting room UI with live video streams
// ============================================================

export interface EkycMeetingRoomProps {
  /** Local media stream from preview (camera + mic guaranteed) */
  localStream: MediaStream;
  /** Typed data returned from `joinWithCode` API */
  meetingData: JoinWithCodeResponse;
  /** Callback when user leaves the meeting */
  onLeave?: () => void;
  /** Optional custom CSS class name on root element */
  className?: string;

  // ── Visibility controls ──────────────────────────────────

  /** Show the bottom control bar (mic, camera, share, leave). @default true */
  showControls?: boolean;
}

/** Ref handle exposed by EkycMeetingRoom for external access */
export interface EkycMeetingRoomRef {
  /** Ref to the remote participant's <video> element (for eKYC capture) */
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * EkycMeetingRoom – outer wrapper that provides the ErmisClassroomProvider.
 *
 * Accepts a `ref` to expose `remoteVideoRef` for use with `EkycActionPanel`.
 *
 * @example
 * ```tsx
 * const roomRef = useRef<EkycMeetingRoomRef>(null);
 * <EkycMeetingRoom ref={roomRef} ... />
 * <EkycActionPanel remoteVideoRef={roomRef.current?.remoteVideoRef} />
 * ```
 */
export const EkycMeetingRoom = forwardRef<EkycMeetingRoomRef, EkycMeetingRoomProps>(function EkycMeetingRoom(props, ref) {
  const { meetingHostUrl, meetingNodeUrl } = useEkycMeetingConfig();
  const { className } = props;
  const rootClass = ["ekyc-room-root", className].filter(Boolean).join(" ");

  const config = {
    host: meetingHostUrl,
    hostNode: meetingNodeUrl?.replace("https://", ""),
    apiUrl: `${meetingHostUrl}/meeting`,
    webtpUrl: `${meetingNodeUrl}/meeting/wt`,
    reconnectAttempts: 3,
    reconnectDelay: 1000,
    videoResolutions: [ChannelName.VIDEO_1080P],
    subscriberInitQuality: 'video_1080p' as QualityLevel,
  };

  return (
    <div className={rootClass}>
      <ErmisClassroomProvider config={config}>
        <EkycMeetingRoomInner ref={ref} {...props} />
      </ErmisClassroomProvider>
    </div>
  );
});

// ── Inner component (inside ErmisClassroomProvider) ─────────

const EkycMeetingRoomInner = forwardRef<EkycMeetingRoomRef, EkycMeetingRoomProps>(function EkycMeetingRoomInner({
  localStream,
  meetingData,
  onLeave,
  showControls = true,
}, ref) {
  const locale = useEkycLocale();
  const leaveButtonLabel = locale.room.leaveButton;
  const hostLabel = locale.room.hostLabel;
  const guestLabel = locale.room.guestLabel;
  const {
    client,
    authenticate,
    joinRoom,
    leaveRoom,
    remoteStreams,
    localStream: sdkLocalStream,
    toggleMicrophone,
    toggleCamera,
    micEnabled,
    videoEnabled,
    participants,
  } = useErmisClassroom();

  const {
    cameras,
    microphones,
    selectCamera,
    selectMicrophone,
    selectedCamera,
    selectedMicrophone,
  } = useMediaDevices();

  const [roomStatus, setRoomStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [roomError, setRoomError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<"mic" | "cam" | null>(null);

  // Use SDK local stream when available, fall back to preview localStream
  const activeLocalStream = sdkLocalStream;

  // ── Toggle handlers ─────────────────────────────────────────
  const handleToggleMic = useCallback(async () => {
    try {
      await toggleMicrophone();
    } catch (err) {
      console.error("[EkycMeetingRoom] Toggle mic error:", err);
    }
  }, [toggleMicrophone]);

  const handleToggleCam = useCallback(async () => {
    try {
      await toggleCamera();
    } catch (err) {
      console.error("[EkycMeetingRoom] Toggle camera error:", err);
    }
  }, [toggleCamera]);

  const handleLeaveRoom = useCallback(async () => {
    try {
      await leaveRoom();
    } catch (err) {
      console.error("[EkycMeetingRoom] Leave room error:", err);
    } finally {
      onLeave?.();
    }
  }, [leaveRoom, onLeave]);

  // ── On mount: wait for client → authenticate → joinRoom ──
  useEffect(() => {
    if (!client) return; // client not ready yet, wait for re-render

    const { registrant, meeting } = meetingData;

    const joinToRoom = async () => {
      try {
        setRoomStatus("connecting");
        setRoomError(null);

        // Step 1: Authenticate with authId
        await authenticate(registrant.authId);

        // Step 2: Join room with ermisRoomCode
        await joinRoom(meeting.ermisRoomCode, localStream);

        // Step 3: Set token for SDK core from meetingData
        const ermisService = ErmisService.getInstance();
        ermisService.setToken(meetingData.meetingToken);

        // Step 4: Fetch registrants after successful join
        const registrants = await ermisService.meetings.getRegistrants(meeting._id);
        console.log("[EkycMeetingRoom] Registrants:", registrants);

        setRoomStatus("connected");
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Kết nối phòng thất bại");
        setRoomError(error.message);
        setRoomStatus("error");
        console.error("[EkycMeetingRoom] Connect error:", err);
      }
    };

    joinToRoom();
  }, [client, authenticate, joinRoom, localStream]); // eslint-disable-line react-hooks/exhaustive-deps

  // Convert remote streams Map to array for rendering
  const remoteStreamEntries = Array.from(remoteStreams.entries());

  // Ref to remote (GUEST) video element for eKYC capture
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const isHost = meetingData.registrant.role === "HOST";

  // Expose remoteVideoRef to consumer via ref
  useImperativeHandle(ref, () => ({
    remoteVideoRef,
  }), []);

  return (
    <>
      {/* ── Status indicator ──────────────────────────────── */}
      {roomStatus === "connecting" && (
        <div className="ekyc-room-status">{locale.room.connecting}</div>
      )}
      {roomStatus === "error" && roomError && (
        <div className="ekyc-room-error">⚠️ {roomError}</div>
      )}

      {/* ── Main content area ─────────────────────────────── */}
      <div className="ekyc-room-main">
        <div className="ekyc-room-grid">
          {(() => {
            // Local tile
            const localTile = (
              <div
                key="local"
                className={`ekyc-room-tile ${isHost ? "ekyc-room-tile--pip" : "ekyc-room-tile--main"}`}
              >
                <VideoTile stream={activeLocalStream} muted mirrored />
                {!videoEnabled && <CameraOffOverlay />}
                {!micEnabled && <MicStatusBadge />}
                <span className="ekyc-room-tile-label">
                  {isHost ? hostLabel : guestLabel} ({locale.room.you})
                </span>
              </div>
            );

            // Remote tile(s) or placeholder
            const remoteTile = remoteStreamEntries.length > 0
              ? remoteStreamEntries.map(([userId, stream]) => {
                const participant = participants.get(userId);
                const isRemoteMicOff = participant ? !participant.isAudioEnabled : false;
                const isRemoteCamOff = participant ? !participant.isVideoEnabled : false;
                return (
                  <div
                    key={userId}
                    className={`ekyc-room-tile ${isHost ? "ekyc-room-tile--main" : "ekyc-room-tile--pip"}`}
                  >
                    <VideoTile ref={isHost ? remoteVideoRef : undefined} stream={stream} />
                    {isRemoteCamOff && <CameraOffOverlay />}
                    {isRemoteMicOff && <MicStatusBadge />}
                    <span className="ekyc-room-tile-label">
                      {isHost ? guestLabel : hostLabel}
                    </span>
                  </div>
                );
              })
              : (
                <div
                  key="placeholder"
                  className={`ekyc-room-tile ${isHost ? "ekyc-room-tile--main" : "ekyc-room-tile--pip"}`}
                >
                  <VideoPlaceholder
                    label={isHost ? guestLabel : hostLabel}
                    color="#8b5cf6"
                  />
                </div>
              );

            // Main tile first (background on mobile), PiP on top
            return isHost ? (
              <>{remoteTile}{localTile}</>
            ) : (
              <>{localTile}{remoteTile}</>
            );
          })()}
        </div>
      </div>

      {/* ── Bottom controls bar ───────────────────────────── */}
      {showControls && (
        <div className="ekyc-room-controls">
          {/* Mic toggle + device switcher */}
          <DeviceControlGroup
            menuOpen={openMenu === "mic"}
            onToggleMenu={() => setOpenMenu(openMenu === "mic" ? null : "mic")}
            onCloseMenu={() => setOpenMenu(null)}
          >
            <ControlButton
              icon={micEnabled ? "mic" : "mic_off"}
              label={micEnabled ? "Micro" : "Micro tắt"}
              active={micEnabled}
              onClick={handleToggleMic}
            />
            {openMenu === "mic" && microphones.length > 1 && (
              <DeviceMenu
                devices={microphones}
                selectedDeviceId={selectedMicrophone}
                onSelect={async (id) => {
                  await selectMicrophone(id);
                  setOpenMenu(null);
                }}
              />
            )}
          </DeviceControlGroup>

          {/* Camera toggle + device switcher */}
          <DeviceControlGroup
            menuOpen={openMenu === "cam"}
            onToggleMenu={() => setOpenMenu(openMenu === "cam" ? null : "cam")}
            onCloseMenu={() => setOpenMenu(null)}
          >
            <ControlButton
              icon={videoEnabled ? "camera" : "camera_off"}
              label={videoEnabled ? "Camera" : "Camera tắt"}
              active={videoEnabled}
              onClick={handleToggleCam}
            />
            {openMenu === "cam" && cameras.length > 1 && (
              <DeviceMenu
                devices={cameras}
                selectedDeviceId={selectedCamera}
                onSelect={async (id) => {
                  await selectCamera(id);
                  setOpenMenu(null);
                }}
              />
            )}
          </DeviceControlGroup>

          <button onClick={handleLeaveRoom} className="ekyc-room-leave-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {leaveButtonLabel}
          </button>
        </div>
      )}
    </>
  );
});

// ── Internal sub-components ──────────────────────────────────

/**
 * CameraOffOverlay – covers the video tile when camera is disabled.
 */
function CameraOffOverlay() {
  return (
    <div className="ekyc-room-cam-off-overlay">
      <div className="ekyc-room-cam-off-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m13.5 0V7.5a2.25 2.25 0 00-2.25-2.25H5.25M3 3l18 18" />
        </svg>
      </div>
    </div>
  );
}

/**
 * MicStatusBadge – small muted-mic icon badge overlaid on the video tile.
 */
function MicStatusBadge() {
  return (
    <div className="ekyc-room-mic-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 10-6 0v8.25M3 3l18 18" />
      </svg>
    </div>
  );
}

/**
 * VideoTile – renders a MediaStream into a <video> element.
        * Supports forwardRef to expose the <video> DOM element for frame capture.
          */
const VideoTile = forwardRef<HTMLVideoElement, {
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
}>(function VideoTile({ stream, muted = false, mirrored = false }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Expose the <video> element to parent via forwardRef
  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
    } else {
      video.srcObject = null;
    }

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`ekyc-room-video${mirrored ? " ekyc-room-video--mirrored" : ""}`}
    />
  );
});

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
  active = true,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const btnClass = [
    "ekyc-room-control-btn",
    active ? "ekyc-room-control-btn--active" : "ekyc-room-control-btn--inactive",
  ].join(" ");

  return (
    <button title={label} className={btnClass} onClick={onClick}>
      {icon === "mic" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 10-6 0v8.25a3 3 0 003 3z" />
        </svg>
      )}
      {icon === "mic_off" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 10-6 0v8.25M3 3l18 18" />
        </svg>
      )}
      {icon === "camera" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )}
      {icon === "camera_off" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m13.5 0V7.5a2.25 2.25 0 00-2.25-2.25H5.25M3 3l18 18" />
        </svg>
      )}
    </button>
  );
}

/**
 * DeviceControlGroup – wraps a ControlButton with a dropdown arrow and device menu.
 */
function DeviceControlGroup({
  children,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  children: React.ReactNode;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, onCloseMenu]);

  return (
    <div className="ekyc-room-device-group" ref={groupRef}>
      {children}
      <button
        className="ekyc-room-device-arrow"
        onClick={onToggleMenu}
        title="Chọn thiết bị"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 7l3-4 3 4H2z" />
        </svg>
      </button>
    </div>
  );
}

/**
 * DeviceMenu – popover list of available devices.
 */
function DeviceMenu({
  devices,
  selectedDeviceId,
  onSelect,
}: {
  devices: { deviceId: string; label: string }[];
  selectedDeviceId: string | null;
  onSelect: (deviceId: string) => void;
}) {
  return (
    <div className="ekyc-room-device-menu">
      {devices.map((device, idx) => (
        <button
          key={device.deviceId}
          className={`ekyc-room-device-menu-item${device.deviceId === selectedDeviceId ? " ekyc-room-device-menu-item--selected" : ""
            }`}
          onClick={() => onSelect(device.deviceId)}
        >
          <span className="ekyc-room-device-menu-check">
            {device.deviceId === selectedDeviceId ? "✓" : ""}
          </span>
          {device.label || `Thiết bị ${idx + 1}`}
        </button>
      ))}
    </div>
  );
}
