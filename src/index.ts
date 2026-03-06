// ============================================================
// Ermis eKYC SDK – Entry Point
// ============================================================

// ── eKYC Module ──────────────────────────────────────────────

// Main eKYC class (API key authentication)
export { EkycService } from "./EkycService";

// eKYC Types & Interfaces
export { DocumentType } from "./types";
export type {
  EkycConfig,
  OcrRequest,
  OcrResponse,
  LivenessRequest,
  LivenessResponse,
  FaceMatchRequest,
  FaceMatchResponse,
  EkycFlowInput,
  EkycFlowResult,
} from "./types";

// ── Ermis Module ─────────────────────────────────────────────

// Main Ermis class (Bearer token authentication)
export { ErmisService } from "./ErmisService";

// Auth Types
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  User,
  AuthResponse,
  PaginationMeta,
  ApiResponse,
} from "./types/auth.types";

// Customer Types
export type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CurrentLocation,
} from "./types/customer.types";

// Appraiser Types
export type {
  Appraiser,
  CreateAppraiserRequest,
} from "./types/appraiser.types";

// Meeting Types
export type {
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  MeetingRegistrant,
  CreateRegistrantRequest,
  UpdateRegistrantRequest,
  SetupMeetingRequest,
  SetupMeetingResult,
} from "./types/meeting.types";

// ── Shared ───────────────────────────────────────────────────

// Errors
export { EkycError, EkycErrorCode } from "./errors/EkycError";

// Utilities
export { base64ToBlob, ensureBlob } from "./utils/base64";
