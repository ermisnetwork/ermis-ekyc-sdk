// ============================================================
// EkycConfig – SDK Configuration
// ============================================================

export interface EkycConfig {
  /** Base URL of the eKYC API server */
  baseUrl: string;

  /** API key for authentication */
  apiKey: string;

  /** Request timeout in milliseconds, defaults to 30000 */
  timeout?: number;
}

// ============================================================
// OCR – Extract information from ID card images
// ============================================================

/** Supported document types for OCR extraction */
export enum DocumentType {
  /** Citizen Identity Card */
  CCCD = "CCCD",
  /** Passport */
  PASSPORT = "PASSPORT",
}

export interface OcrRequest {
  /** Front side of the document (Blob, File, or base64 string) */
  documentFront: Blob | File | string;

  /** Back side of the document (Blob, File, or base64 string). Required for CCCD, not needed for PASSPORT. */
  documentBack?: Blob | File | string;

  /** Document type, defaults to DocumentType.CCCD */
  documentType?: DocumentType | string;

  /** Whether to extract face region, defaults to true */
  extractFace?: boolean;

  /** OCR API variant, defaults to 'advanced' */
  ocrApi?: string;
}

export interface OcrResponse {
  success: boolean;
  document_type: string;
  confidence: number;
  data: {
    id_number: string;
    full_name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    nationality: string;
    place_of_origin: string;
    place_of_residence: string;
    expiry_date: string;
    issue_date: string | null;
    identification_marks?: string;
  };
  face_region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  raw_text?: string;
  processing_time_ms: number;
}

// ============================================================
// Face Match – Compare selfie with document photo
// ============================================================

export interface FaceMatchRequest {
  /** Selfie image (Blob, File, or base64 string) */
  selfieImage: Blob | File | string;

  /** Document image (Blob, File, or base64 string) */
  documentImage: Blob | File | string;

  /** Match threshold (0-1), defaults to '0.6' */
  threshold?: string;
}

export interface FaceMatchResponse {
  success: boolean;
  match: boolean;
  similarity: number;
  threshold: number;
  selfie_face_detected: boolean;
  document_face_detected: boolean;
  selfie_face_count: number;
  document_face_count: number;
  processing_time_ms: number;
  face_embedding?: number[];
}

// ============================================================
// Liveness Detection – Verify live person
// ============================================================

export interface LivenessRequest {
  /** Selfie image for liveness check (Blob, File, or base64 string) */
  images: Blob | File | string;

  /** Detection mode, defaults to 'passive' */
  mode?: string;

  /** Challenge type, defaults to 'blink' */
  challenge?: string;
}

export interface LivenessResponse {
  success: boolean;
  is_live: boolean;
  confidence: number;
  spoofing_detected: boolean;
  spoofing_type: string | null;
  checks: {
    texture_analysis: {
      passed: boolean;
      score: number;
      laplacian_variance: number;
      lbp_score: number;
    };
    moire_detection: {
      passed: boolean;
      score: number;
      high_freq_ratio: number;
    };
    reflection_detection: {
      passed: boolean;
      score: number;
      bright_ratio: number;
      uniformity: number;
    };
    depth_estimation: {
      passed: boolean;
      score: number;
      gradient_std: number;
    };
    face_size_check: {
      passed: boolean;
      score: number;
      ratio: number;
      face_area: number;
      total_area: number;
    };
    clip_liveness: {
      passed: boolean;
      score: number;
      real_score: number;
      spoof_score: number;
      liveness_score: number;
    };
  };
  processing_time_ms: number;
}

// ============================================================
// EkycFlowResult – Combined result of the entire flow
// ============================================================

export interface EkycFlowResult {
  /** OCR result */
  ocr: OcrResponse;

  /** Liveness result */
  liveness: LivenessResponse;

  /** Face Match result */
  faceMatch: FaceMatchResponse;

  /** Whether the eKYC verification passed */
  isVerified: boolean;

  /** Total duration of the entire flow in milliseconds */
  totalDuration: number;
}

// ============================================================
// EkycFlowInput – Input for startEkycFlow()
// ============================================================

export interface EkycFlowInput {
  /** Front side of the document (Blob, File, or base64 string) */
  documentFront: Blob | File | string;

  /** Back side of the document (Blob, File, or base64 string) */
  documentBack: Blob | File | string;

  /** Document type, defaults to DocumentType.CCCD */
  documentType?: DocumentType | string;

  /** Whether to extract face from document, defaults to true */
  extractFace?: boolean;

  /** Selfie image for liveness + face matching (Blob, File, or base64 string) */
  selfieImage: Blob | File | string;

  /** Face match threshold, defaults to '0.6' */
  faceMatchThreshold?: string;

  /** Liveness detection mode, defaults to 'passive' */
  livenessMode?: string;

  /** Liveness challenge type, defaults to 'blink' */
  livenessChallenge?: string;
}
