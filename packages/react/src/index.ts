// ============================================================
// ermis-ekyc-react – Entry Point
// ============================================================

// ── Provider & Config ───────────────────────────────────────
export {
  EkycMeetingProvider,
  type EkycMeetingProviderProps,
  type EkycMeetingConfig,
  useEkycMeetingConfig,
} from "./EkycMeetingProvider";

// ── Components ──────────────────────────────────────────────
export {
  EkycMeetingPreview,
  type EkycMeetingPreviewProps,
  type EkycPreviewJoinData,
} from "./components/EkycMeetingPreview";
export {
  EkycMeetingRoom,
  type EkycMeetingRoomProps,
} from "./components/EkycMeetingRoom";

// ── Hooks ───────────────────────────────────────────────────
export {
  useMediaPreview,
  type UseMediaPreviewReturn,
  type MediaPreviewState,
  type MediaPreviewActions,
} from "./hooks/useMediaPreview";

// ── Types ───────────────────────────────────────────────────
export type {
  JoinWithCodeResponse,
  MeetingRoomInfo,
  MeetingRegistrantInfo,
  MeetingInfo,
} from "./types/meeting.types";
