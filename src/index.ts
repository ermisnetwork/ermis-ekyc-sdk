// ============================================================
// Ermis eKYC SDK – Entry Point
// ============================================================

// Main SDK class
export { EkycService } from "./EkycService";

// Types & Interfaces
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

// Errors
export { EkycError, EkycErrorCode } from "./errors/EkycError";

// Utilities
export { base64ToBlob, ensureBlob } from "./utils/base64";
