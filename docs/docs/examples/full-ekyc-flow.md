---
sidebar_position: 2
---

# Example: Full eKYC Flow

Complete identity verification flow: OCR → Liveness → Face Match in a single call.

## All-in-One Flow

```typescript
import { EkycService, DocumentType, EkycError } from "ermis-ekyc-sdk";
import type { EkycFlowResult } from "ermis-ekyc-sdk";

const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key",
});

async function verifyIdentity(
  frontImage: File,
  backImage: File,
  selfie: File,
): Promise<EkycFlowResult> {
  try {
    const result = await ekyc.startEkycFlow({
      documentFront: frontImage,
      documentBack: backImage,
      documentType: DocumentType.CCCD,
      selfieImage: selfie,
    });

    if (result.isVerified) {
      console.log("✅ Identity verified!");
      console.log("Name:", result.ocr.full_name);
      console.log("ID:", result.ocr.id_number);
      console.log("Liveness:", result.liveness.is_live);
      console.log("Face match:", result.faceMatch.similarity);
      console.log("Total time:", result.totalDuration, "ms");
    } else {
      console.log("❌ Verification failed");

      if (!result.liveness.is_live) {
        console.log("Reason: Not a live person");
      } else if (!result.faceMatch.match) {
        console.log("Reason: Face does not match document");
      }
    }

    return result;
  } catch (error) {
    if (error instanceof EkycError) {
      console.error(`Error [${error.code}]:`, error.message);
    }
    throw error;
  }
}
```

## Step-by-Step Flow

If you need more control over each step:

```typescript
import { EkycService, DocumentType, EkycErrorCode } from "ermis-ekyc-sdk";

const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key",
});

async function verifyStepByStep(front: File, back: File, selfie: File) {
  // Step 1: OCR
  console.log("📄 Running OCR...");
  const ocr = await ekyc.performOcr({
    documentFront: front,
    documentBack: back,
    documentType: DocumentType.CCCD,
  });
  console.log("Name:", ocr.full_name);

  // Step 2: Liveness
  console.log("🧬 Checking liveness...");
  const liveness = await ekyc.checkLiveness({
    images: selfie,
  });

  if (!liveness.is_live) {
    console.log("❌ Not a live person! Aborting.");
    return { verified: false, reason: "liveness_failed" };
  }

  // Step 3: Face Match
  console.log("🔍 Matching faces...");
  const faceMatch = await ekyc.matchFaces({
    selfieImage: selfie,
    documentImage: front,
  });

  return {
    verified: faceMatch.match,
    ocr,
    liveness,
    faceMatch,
    similarity: faceMatch.similarity,
  };
}
```

## React Implementation

```tsx
import { useState } from "react";
import { EkycService, DocumentType } from "ermis-ekyc-sdk";
import type { EkycFlowResult } from "ermis-ekyc-sdk";

function FullFlowExample() {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [result, setResult] = useState<EkycFlowResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!front || !back || !selfie) return;

    setLoading(true);
    try {
      const ekyc = EkycService.getInstance();
      const flowResult = await ekyc.startEkycFlow({
        documentFront: front,
        documentBack: back,
        documentType: DocumentType.CCCD,
        selfieImage: selfie,
      });
      setResult(flowResult);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Full eKYC Verification</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFront(e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBack(e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => setSelfie(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleVerify}
        disabled={!front || !back || !selfie || loading}
      >
        {loading ? "Verifying..." : "Verify Identity"}
      </button>

      {result && (
        <div>
          <h3>{result.isVerified ? "✅ Verified" : "❌ Not Verified"}</h3>
          <p>Name: {result.ocr.full_name}</p>
          <p>Live person: {result.liveness.is_live ? "Yes" : "No"}</p>
          <p>Face match: {result.faceMatch.similarity.toFixed(2)}</p>
          <p>Total time: {result.totalDuration}ms</p>
        </div>
      )}
    </div>
  );
}
```
