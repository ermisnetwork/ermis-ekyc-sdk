import {
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
import { EkycError, EkycErrorCode } from "./errors/EkycError";
import { handleApiError } from "./errors/errorHandler";
import { createHttpClient } from "./http/httpClient";
import { OcrService } from "./services/ocrService";
import { LivenessService } from "./services/livenessService";
import { FaceMatchService } from "./services/faceMatchService";

/**
 * EkycService – Main class of the eKYC SDK.
 *
 * Uses the **Singleton pattern** to ensure only one instance
 * exists throughout the entire application.
 *
 * @example
 * ```typescript
 * // Initialize the SDK
 * const ekyc = EkycService.getInstance({
 *   baseUrl: 'https://ekyc-api.example.com/api/ekyc',
 *   apiKey: 'your-api-key',
 *   timeout: 30000,
 * });
 *
 * // Run the full eKYC flow
 * const result = await ekyc.startEkycFlow({
 *   documentFront: frontImageBlob,
 *   documentBack: backImageBlob,
 *   selfieImage: selfieBlob,
 * });
 *
 * console.log(result.isVerified); // true/false
 * ```
 */
export class EkycService {
  // ── Singleton ──────────────────────────────────────────────
  private static instance: EkycService | null = null;

  private readonly config: EkycConfig;
  private readonly ocrService: OcrService;
  private readonly livenessService: LivenessService;
  private readonly faceMatchService: FaceMatchService;

  // ── Private Constructor ────────────────────────────────────
  private constructor(config: EkycConfig) {
    this.validateConfig(config);
    this.config = config;

    const httpClient = createHttpClient(config);
    this.ocrService = new OcrService(httpClient);
    this.livenessService = new LivenessService(httpClient);
    this.faceMatchService = new FaceMatchService(httpClient);
  }

  // ── Singleton Access ───────────────────────────────────────

  /**
   * Get the singleton instance of EkycService.
   * If no instance exists, a new one will be created with the provided config.
   *
   * @param config - SDK configuration (required on first call)
   * @returns The singleton instance of EkycService
   * @throws {EkycError} When called for the first time without config
   */
  public static getInstance(config?: EkycConfig): EkycService {
    if (!EkycService.instance) {
      if (!config) {
        throw new EkycError(
          "EkycService has not been initialized. Please provide a config on the first call.",
          EkycErrorCode.INVALID_CONFIG,
        );
      }
      EkycService.instance = new EkycService(config);
    }

    return EkycService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing or reconfiguration).
   */
  public static resetInstance(): void {
    EkycService.instance = null;
  }

  // ── Validation ─────────────────────────────────────────────

  private validateConfig(config: EkycConfig): void {
    if (!config.baseUrl || typeof config.baseUrl !== "string") {
      throw new EkycError(
        "baseUrl is required and must be a valid string.",
        EkycErrorCode.INVALID_CONFIG,
      );
    }

    if (!config.apiKey || typeof config.apiKey !== "string") {
      throw new EkycError(
        "apiKey is required and must be a valid string.",
        EkycErrorCode.INVALID_CONFIG,
      );
    }

    if (
      config.timeout !== undefined &&
      (typeof config.timeout !== "number" || config.timeout <= 0)
    ) {
      throw new EkycError(
        "timeout must be a positive number (in ms).",
        EkycErrorCode.INVALID_CONFIG,
      );
    }
  }

  // ── Individual API Methods ─────────────────────────────────

  /**
   * Extract information from ID card images (CMND/CCCD).
   * Accepts Blob, File, or base64 string inputs.
   */
  public async performOcr(request: OcrRequest): Promise<OcrResponse> {
    return this.ocrService.performOcr(request);
  }

  /**
   * Verify liveness from a selfie image.
   * Accepts Blob, File, or base64 string input.
   */
  public async checkLiveness(
    request: LivenessRequest,
  ): Promise<LivenessResponse> {
    return this.livenessService.checkLiveness(request);
  }

  /**
   * Compare a selfie with a document photo for identity verification.
   * Accepts Blob, File, or base64 string inputs.
   */
  public async matchFaces(
    request: FaceMatchRequest,
  ): Promise<FaceMatchResponse> {
    return this.faceMatchService.matchFaces(request);
  }

  // ── Flow Orchestration ─────────────────────────────────────

  /**
   * Orchestrate the full eKYC flow: OCR → Liveness → Face Match.
   *
   * Flow:
   * 1. **OCR**: Extract document information from front/back images
   * 2. **Liveness**: Verify the selfie is from a live person
   * 3. **Face Match**: Compare the selfie with the document photo
   *
   * The flow will stop early if liveness check fails (not a live person).
   *
   * @param input - Input data for the entire flow
   * @returns Combined result including all steps + verification status
   * @throws {EkycError} When any step fails
   */
  public async startEkycFlow(input: EkycFlowInput): Promise<EkycFlowResult> {
    const startTime = Date.now();

    try {
      // ── Step 1: OCR ────────────────────────────────────────
      console.log(
        "[EkycSDK] Step 1/3: Extracting information from document...",
      );

      const ocrResult = await this.performOcr({
        documentFront: input.documentFront,
        documentBack: input.documentBack,
        documentType: input.documentType,
        extractFace: input.extractFace,
      });

      console.log(
        "[EkycSDK] ✅ OCR completed. ID number:",
        ocrResult.data.id_number,
      );

      // ── Step 2: Liveness Detection ─────────────────────────
      console.log("[EkycSDK] Step 2/3: Verifying liveness...");

      const livenessResult = await this.checkLiveness({
        images: input.selfieImage,
        mode: input.livenessMode,
        challenge: input.livenessChallenge,
      });

      console.log(
        "[EkycSDK] ✅ Liveness completed. is_live:",
        livenessResult.is_live,
      );

      // If not a live person → stop the flow early
      if (!livenessResult.is_live) {
        const duration = Date.now() - startTime;

        return {
          ocr: ocrResult,
          liveness: livenessResult,
          faceMatch: {
            success: false,
            match: false,
            similarity: 0,
            threshold: 0,
            selfie_face_detected: false,
            document_face_detected: false,
            selfie_face_count: 0,
            document_face_count: 0,
            processing_time_ms: 0,
          },
          isVerified: false,
          totalDuration: duration,
        };
      }

      // ── Step 3: Face Match ─────────────────────────────────
      console.log("[EkycSDK] Step 3/3: Comparing faces...");

      const faceMatchResult = await this.matchFaces({
        selfieImage: input.selfieImage,
        documentImage: input.documentFront,
        threshold: input.faceMatchThreshold,
      });

      console.log(
        "[EkycSDK] ✅ Face Match completed. match:",
        faceMatchResult.match,
      );

      // ── Combined Result ────────────────────────────────────
      const duration = Date.now() - startTime;
      const isVerified =
        ocrResult.success &&
        livenessResult.is_live &&
        !livenessResult.spoofing_detected &&
        faceMatchResult.match;

      console.log(
        `[EkycSDK] 🏁 eKYC completed in ${duration}ms. Result: ${isVerified ? "✅ PASSED" : "❌ FAILED"}`,
      );

      return {
        ocr: ocrResult,
        liveness: livenessResult,
        faceMatch: faceMatchResult,
        isVerified,
        totalDuration: duration,
      };
    } catch (error: unknown) {
      // Re-throw if already an EkycError
      if (error instanceof EkycError) {
        throw error;
      }
      throw handleApiError(error, "EKYC_FLOW");
    }
  }
}
