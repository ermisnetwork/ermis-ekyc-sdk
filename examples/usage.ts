/**
 * Ermis eKYC SDK – Usage Examples
 *
 * This file demonstrates how to use the eKYC SDK for:
 * 1. Full eKYC flow (OCR → Liveness → Face Match)
 * 2. Individual API calls
 * 3. Error handling
 * 4. Base64 convenience methods
 */

import {
  EkycService,
  EkycError,
  EkycErrorCode,
  base64ToBlob,
  type EkycFlowResult,
  type OcrResponse,
  type LivenessResponse,
  type FaceMatchResponse,
} from "../src";

// ============================================================
// 1. Initialize the SDK (Singleton)
// ============================================================

const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key-here",
  timeout: 30000, // optional, defaults to 30s
});

// Getting the same instance anywhere in your app:
// const sameInstance = EkycService.getInstance();

// ============================================================
// 2. Full eKYC Flow – OCR → Liveness → Face Match
// ============================================================

async function runFullEkycFlow(): Promise<void> {
  try {
    // You can pass Blob, File, or base64 strings
    const result: EkycFlowResult = await ekyc.startEkycFlow({
      documentFront: "<base64-encoded-front-image>",
      documentBack: "<base64-encoded-back-image>",
      documentType: "CCCD",
      extractFace: true,
      selfieImage: "<base64-encoded-selfie>",
      faceMatchThreshold: "0.6",
      livenessMode: "passive",
      livenessChallenge: "blink",
    });

    // Check verification result
    if (result.isVerified) {
      console.log("✅ eKYC verification PASSED");
      console.log("Name:", result.ocr.data.full_name);
      console.log("ID Number:", result.ocr.data.id_number);
      console.log("DOB:", result.ocr.data.date_of_birth);
      console.log("Face similarity:", result.faceMatch.similarity);
    } else {
      console.log("❌ eKYC verification FAILED");

      if (!result.liveness.is_live) {
        console.log("Reason: Liveness check failed");
      }
      if (!result.faceMatch.match) {
        console.log("Reason: Face does not match");
      }
    }

    console.log(`Total duration: ${result.totalDuration}ms`);
  } catch (error) {
    handleError(error);
  }
}

// ============================================================
// 3. Individual API Calls
// ============================================================

// ── OCR only ─────────────────────────────────────────────────

async function runOcrOnly(): Promise<void> {
  try {
    const result: OcrResponse = await ekyc.performOcr({
      documentFront: "<base64-front>",
      documentBack: "<base64-back>",
      documentType: "CCCD",
      extractFace: true,
      ocrApi: "advanced",
    });

    if (result.success) {
      console.log("OCR Result:");
      console.log("  ID:", result.data.id_number);
      console.log("  Name:", result.data.full_name);
      console.log("  DOB:", result.data.date_of_birth);
      console.log("  Gender:", result.data.gender);
      console.log("  Address:", result.data.place_of_residence);
      console.log("  Confidence:", result.confidence);
      console.log("  Processing time:", result.processing_time_ms, "ms");

      if (result.face_region) {
        console.log("  Face region:", result.face_region);
      }
    }
  } catch (error) {
    handleError(error);
  }
}

// ── Liveness only ────────────────────────────────────────────

async function runLivenessOnly(): Promise<void> {
  try {
    const result: LivenessResponse = await ekyc.checkLiveness({
      images: "<base64-selfie>",
      mode: "passive",
      challenge: "blink",
    });

    if (result.success) {
      console.log("Liveness Result:");
      console.log("  Is Live:", result.is_live);
      console.log("  Confidence:", result.confidence);
      console.log("  Spoofing Detected:", result.spoofing_detected);

      // Detailed checks
      console.log("  Checks:");
      console.log("    Texture:", result.checks.texture_analysis.passed);
      console.log("    Moire:", result.checks.moire_detection.passed);
      console.log("    Reflection:", result.checks.reflection_detection.passed);
      console.log("    Depth:", result.checks.depth_estimation.passed);
      console.log("    Face Size:", result.checks.face_size_check.passed);
      console.log("    CLIP Liveness:", result.checks.clip_liveness.passed);
    }
  } catch (error) {
    handleError(error);
  }
}

// ── Face Match only ──────────────────────────────────────────

async function runFaceMatchOnly(): Promise<void> {
  try {
    const result: FaceMatchResponse = await ekyc.matchFaces({
      selfieImage: "<base64-selfie>",
      documentImage: "<base64-document-face>",
      threshold: "0.6",
    });

    if (result.success) {
      console.log("Face Match Result:");
      console.log("  Match:", result.match);
      console.log("  Similarity:", result.similarity);
      console.log("  Threshold:", result.threshold);
      console.log("  Selfie faces detected:", result.selfie_face_count);
      console.log("  Document faces detected:", result.document_face_count);
    }
  } catch (error) {
    handleError(error);
  }
}

// ============================================================
// 4. Using with File inputs (e.g., from <input type="file">)
// ============================================================

async function runWithFileInputs(): Promise<void> {
  // Simulating file inputs from a browser form
  const frontInput = document.getElementById("front-input") as HTMLInputElement;
  const backInput = document.getElementById("back-input") as HTMLInputElement;
  const selfieInput = document.getElementById(
    "selfie-input",
  ) as HTMLInputElement;

  const frontFile = frontInput.files?.[0];
  const backFile = backInput.files?.[0];
  const selfieFile = selfieInput.files?.[0];

  if (!frontFile || !backFile || !selfieFile) {
    console.error("Please select all required files");
    return;
  }

  try {
    // Pass File objects directly – no base64 conversion needed!
    const result = await ekyc.startEkycFlow({
      documentFront: frontFile,
      documentBack: backFile,
      selfieImage: selfieFile,
    });

    console.log("Verified:", result.isVerified);
  } catch (error) {
    handleError(error);
  }
}

// ============================================================
// 5. Using base64ToBlob utility
// ============================================================

function convertBase64Example(): void {
  // Convert a base64 string to Blob (useful for canvas captures)
  const canvas = document.createElement("canvas");
  const base64 = canvas.toDataURL("image/jpeg");

  const blob = base64ToBlob(base64, "image/jpeg");
  console.log("Blob size:", blob.size, "bytes");
}

// ============================================================
// 6. Error Handling
// ============================================================

function handleError(error: unknown): void {
  if (error instanceof EkycError) {
    console.error("eKYC Error:");
    console.error("  Code:", error.code);
    console.error("  Message:", error.message);
    console.error("  Status:", error.statusCode);
    console.error("  Timestamp:", error.timestamp);

    // Handle specific error codes
    switch (error.code) {
      case EkycErrorCode.NETWORK_ERROR:
        console.error("→ Please check your internet connection");
        break;
      case EkycErrorCode.TIMEOUT_ERROR:
        console.error("→ Request timed out, please try again");
        break;
      case EkycErrorCode.AUTHENTICATION_FAILED:
        console.error("→ Invalid API key");
        break;
      case EkycErrorCode.OCR_FAILED:
        console.error("→ Could not extract info from document");
        break;
      case EkycErrorCode.LIVENESS_FAILED:
        console.error("→ Liveness check failed");
        break;
      case EkycErrorCode.FACE_MATCH_FAILED:
        console.error("→ Face comparison failed");
        break;
      default:
        console.error("→ Unexpected error");
    }

    // Serialize for logging/reporting
    console.error("  JSON:", JSON.stringify(error.toJSON(), null, 2));
  } else {
    console.error("Unexpected error:", error);
  }
}

// ============================================================
// 7. Reset instance (for testing or reconfiguration)
// ============================================================

function reconfigure(): void {
  EkycService.resetInstance();

  // Create new instance with different config
  const newEkyc = EkycService.getInstance({
    baseUrl: "https://staging-api.example.com/api/ekyc",
    apiKey: "staging-api-key",
    timeout: 60000,
  });

  console.log("SDK reconfigured for staging environment");
}

// ============================================================
// Run examples
// ============================================================

(async () => {
  console.log("=== Full eKYC Flow ===");
  await runFullEkycFlow();

  console.log("\n=== OCR Only ===");
  await runOcrOnly();

  console.log("\n=== Liveness Only ===");
  await runLivenessOnly();

  console.log("\n=== Face Match Only ===");
  await runFaceMatchOnly();
})();
