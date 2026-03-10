import React, { useEffect, useRef, useState } from "react";
import type { JoinWithCodeResponse } from "../types/meeting.types";
import { ErmisService } from "ermis-ekyc-sdk";
import { useEkycMeetingConfig } from "../EkycMeetingProvider";
import "./EkycMeetingRoom.css";
import { ChannelName, ErmisClassroomProvider, useErmisClassroom } from "@ermisnetwork/ermis-classroom-react";
import { QualityLevel } from "@ermisnetwork/ermis-classroom-sdk";

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

  // ── Custom labels ────────────────────────────────────────

  /** Custom leave button text. @default "Rời phòng" */
  leaveButtonLabel?: string;
  /** Custom host participant label. @default "Thẩm định viên (HOST)" */
  hostLabel?: string;
  /** Custom guest participant label. @default "Khách hàng (GUEST)" */
  guestLabel?: string;
}

/**
 * EkycMeetingRoom – outer wrapper that provides the ErmisClassroomProvider.
 *
 * On mount: authenticate(authId) → joinRoom(ermisRoomCode)
 */
export function EkycMeetingRoom(props: EkycMeetingRoomProps) {
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
        <EkycMeetingRoomInner {...props} />
      </ErmisClassroomProvider>
    </div>
  );
}

// ── Inner component (inside ErmisClassroomProvider) ─────────

function EkycMeetingRoomInner({
  localStream,
  meetingData,
  onLeave,
  showControls = true,
  leaveButtonLabel = "Rời phòng",
  hostLabel = "Thẩm định viên (HOST)",
  guestLabel = "Khách hàng (GUEST)",
}: EkycMeetingRoomProps) {
  const {
    client,
    authenticate,
    joinRoom,
    remoteStreams,
    localStream: sdkLocalStream,
  } = useErmisClassroom();

  const [roomStatus, setRoomStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [roomError, setRoomError] = useState<string | null>(null);

  // Use SDK local stream when available, fall back to preview localStream
  const activeLocalStream = sdkLocalStream;

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

  return (
    <>
      {/* ── Status indicator ──────────────────────────────── */}
      {roomStatus === "connecting" && (
        <div className="ekyc-room-status">Đang kết nối phòng họp...</div>
      )}
      {roomStatus === "error" && roomError && (
        <div className="ekyc-room-error">⚠️ {roomError}</div>
      )}

      {/* ── Main content area ─────────────────────────────── */}
      <div className="ekyc-room-main">
        <div className="ekyc-room-grid">
          {/* ── Local video ──────────────────────────────── */}
          <div className="ekyc-room-tile">
            <VideoTile
              stream={activeLocalStream}
              muted
              mirrored
            />
            <span className="ekyc-room-tile-label">
              {meetingData.registrant.role === "HOST" ? hostLabel : guestLabel} (Bạn)
            </span>
          </div>

          {/* ── Remote videos ────────────────────────────── */}
          {remoteStreamEntries.map(([userId, stream]) => (
            <div key={userId} className="ekyc-room-tile">
              <VideoTile stream={stream} />
              <span className="ekyc-room-tile-label">
                {meetingData.registrant.role === "HOST" ? guestLabel : hostLabel}
              </span>
            </div>
          ))}

          {/* ── Placeholder when no remote streams yet ──── */}
          {remoteStreamEntries.length === 0 && (
            <div className="ekyc-room-tile">
              <VideoPlaceholder
                label={meetingData.registrant.role === "HOST" ? guestLabel : hostLabel}
                color="#8b5cf6"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom controls bar ───────────────────────────── */}
      {showControls && (
        <div className="ekyc-room-controls">
          <ControlButton icon="mic" label="Micro" />
          <ControlButton icon="camera" label="Camera" />
          <button onClick={onLeave} className="ekyc-room-leave-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {leaveButtonLabel}
          </button>
        </div>
      )}
    </>
  );
}

// ── Internal sub-components ──────────────────────────────────

/**
 * VideoTile – renders a MediaStream into a <video> element.
 */
function VideoTile({
  stream,
  muted = false,
  mirrored = false,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
}

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
      {label}
    </button>
  );
}
