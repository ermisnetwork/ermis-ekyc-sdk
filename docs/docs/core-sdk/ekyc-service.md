---
sidebar_position: 1
---

# EkycService

The `EkycService` provides OCR, Liveness Detection, and Face Match APIs. It uses **API key authentication** and follows the **Singleton pattern**.

## Initialization

```typescript
import { EkycService, DocumentType } from "ermis-ekyc-sdk";

const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key",
  timeout: 30000, // optional, default: 30000ms
});
```

:::tip Singleton Pattern
`EkycService.getInstance()` ensures only one instance exists. Call it anywhere in your app without re-initializing.
:::

## OCR – Document Extraction

Extract information from identity documents (CCCD, Passport).

```typescript
const result = await ekyc.performOcr({
  documentFront: frontImageFile, // Blob | File | base64 string
  documentBack: backImageFile, // optional for Passport
  documentType: DocumentType.CCCD, // CCCD | PASSPORT
  extractFace: true, // optional, default: true
});
```

### OcrRequest

| Field           | Type                     | Required | Description                   |
| --------------- | ------------------------ | -------- | ----------------------------- |
| `documentFront` | `Blob \| File \| string` | ✅       | Front side of the document    |
| `documentBack`  | `Blob \| File \| string` | ❌       | Back side (required for CCCD) |
| `documentType`  | `DocumentType \| string` | ❌       | Default: `"CCCD"`             |
| `extractFace`   | `boolean`                | ❌       | Default: `true`               |

### OcrResponse

| Field                | Type     | Description          |
| -------------------- | -------- | -------------------- |
| `id_number`          | `string` | ID card number       |
| `full_name`          | `string` | Full name            |
| `date_of_birth`      | `string` | Date of birth        |
| `gender`             | `string` | Gender               |
| `nationality`        | `string` | Nationality          |
| `place_of_origin`    | `string` | Place of origin      |
| `place_of_residence` | `string` | Place of residence   |
| `expiry_date`        | `string` | Document expiry date |
| `issue_date`         | `string` | Document issue date  |

### Document Types

```typescript
enum DocumentType {
  CCCD = "CCCD", // Citizen Identity Card (Vietnam)
  PASSPORT = "PASSPORT", // Passport
}
```

## Liveness Detection

Verify that a selfie is from a live person (anti-spoofing).

```typescript
const result = await ekyc.checkLiveness({
  images: selfieFile, // Blob | File | base64 string
  mode: "passive", // optional, default: "passive"
  challenge: "blink", // optional, default: "blink"
});

if (result.is_live) {
  console.log("Real person detected!");
  console.log("Confidence:", result.confidence);
}
```

### LivenessResponse

| Field               | Type      | Description                |
| ------------------- | --------- | -------------------------- |
| `is_live`           | `boolean` | Whether the person is live |
| `confidence`        | `number`  | Confidence score           |
| `spoofing_detected` | `boolean` | Spoofing attempt detected  |

## Face Match

Compare a selfie with a document photo.

```typescript
const result = await ekyc.matchFaces({
  selfieImage: selfieFile, // Blob | File | base64 string
  documentImage: frontImageFile, // Blob | File | base64 string
  threshold: "0.6", // optional, default: "0.6"
});

if (result.match) {
  console.log("Face matched!", result.similarity); // e.g., 0.95
}
```

### FaceMatchResponse

| Field                | Type      | Description            |
| -------------------- | --------- | ---------------------- |
| `match`              | `boolean` | Whether faces match    |
| `similarity`         | `number`  | Similarity score (0-1) |
| `threshold`          | `number`  | Threshold used         |
| `processing_time_ms` | `number`  | Processing time in ms  |

## Full eKYC Flow

Orchestrate all 3 steps in a single call: **OCR → Liveness → Face Match**.

```typescript
const result = await ekyc.startEkycFlow({
  documentFront: frontImageFile,
  documentBack: backImageFile,
  documentType: DocumentType.CCCD,
  selfieImage: selfieFile,
});

console.log(result.isVerified); // true if all steps passed
console.log(result.ocr); // OCR result
console.log(result.liveness); // Liveness result
console.log(result.faceMatch); // Face Match result
console.log(result.totalDuration); // Total time in ms
```

:::warning
The flow stops early if liveness detection fails. In that case, `faceMatch` will not be executed.
:::

## Reset Instance

Useful for testing or reconfiguration:

```typescript
EkycService.resetInstance();
```
