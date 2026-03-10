// ============================================================
// ermis-ekyc-react – Entry Point
// ============================================================

// ── Provider & Config ───────────────────────────────────────
export {
  EkycMeetingProvider,
  type EkycMeetingProviderProps,
  type EkycMeetingConfig,
  useEkycMeetingConfig,
  useEkycLocale,
} from "./EkycMeetingProvider";

// ── Locale / i18n ───────────────────────────────────────────
export type {
  EkycLocale,
  EkycPreviewLocale,
  EkycRoomLocale,
  EkycPanelLocale,
} from "./locale/types";
export { viLocale } from "./locale/vi";
export { enLocale } from "./locale/en";

// ── Components ──────────────────────────────────────────────
export {
  EkycMeetingPreview,
  type EkycMeetingPreviewProps,
  type EkycPreviewJoinData,
} from "./components/EkycMeetingPreview";
export {
  EkycMeetingRoom,
  type EkycMeetingRoomProps,
  type EkycMeetingRoomRef,
} from "./components/EkycMeetingRoom";
export {
  EkycActionPanel,
  type EkycActionPanelProps,
} from "./components/EkycActionPanel";

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
