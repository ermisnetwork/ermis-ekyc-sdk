# Ermis eKYC SDK

A TypeScript SDK for identity verification (eKYC) with OCR, Liveness Detection, and Face Match capabilities.

## Installation

```bash
npm install ermis-ekyc-sdk
```

## Quick Start

```typescript
import { EkycService } from "ermis-ekyc-sdk";

// Initialize the SDK (Singleton)
const ekyc = EkycService.getInstance({
  baseUrl: "https://api.ekyc.example.com",
  apiKey: "your-api-key",
  timeout: 30000, // optional, defaults to 30s
});

// Run the full eKYC flow: OCR → Liveness → Face Match
const result = await ekyc.startEkycFlow({
  frontImage: "<base64-encoded-front-image>",
  backImage: "<base64-encoded-back-image>", // optional
  documentType: "cccd", // 'cmnd' | 'cccd' | 'passport'
  selfieMedia: "<base64-encoded-selfie>",
  selfieMediaType: "image", // 'image' | 'video'
});

console.log(result.isVerified); // true | false
console.log(result.totalDuration); // duration in ms
```

## API Reference

### EkycService

#### `EkycService.getInstance(config?: EkycConfig): EkycService`

Returns the singleton instance. Config is required on first call.

#### `EkycService.resetInstance(): void`

Resets the singleton instance (useful for testing or reconfiguration).

#### `ekyc.performOcr(request: OcrRequest): Promise<OcrResponse>`

Extract information from ID card images (CMND/CCCD).

#### `ekyc.checkLiveness(request: LivenessRequest): Promise<LivenessResponse>`

Verify liveness from a selfie image or video.

#### `ekyc.matchFaces(request: FaceMatchRequest): Promise<FaceMatchResponse>`

Compare two face images for identity verification.

#### `ekyc.startEkycFlow(input: EkycFlowInput): Promise<EkycFlowResult>`

Orchestrates the full eKYC flow: OCR → Liveness → Face Match.

## Error Handling

All errors are wrapped in `EkycError` with structured information:

```typescript
import { EkycError, EkycErrorCode } from "ermis-ekyc-sdk";

try {
  const result = await ekyc.startEkycFlow(input);
} catch (error) {
  if (error instanceof EkycError) {
    console.error(error.code); // EkycErrorCode enum
    console.error(error.statusCode); // HTTP status code
    console.error(error.details); // Additional details
    console.error(error.timestamp); // ISO timestamp
  }
}
```

### Error Codes

| Code                    | Description                 |
| ----------------------- | --------------------------- |
| `NETWORK_ERROR`         | Network connectivity issues |
| `TIMEOUT_ERROR`         | Request timeout             |
| `OCR_FAILED`            | OCR extraction failed       |
| `LIVENESS_FAILED`       | Liveness detection failed   |
| `FACE_MATCH_FAILED`     | Face comparison failed      |
| `AUTHENTICATION_FAILED` | Invalid API key             |
| `INVALID_CONFIG`        | Invalid SDK configuration   |
| `UNKNOWN`               | Unexpected error            |

## Project Structure

```
src/
├── index.ts                  # Entry point, re-exports
├── EkycService.ts            # Singleton SDK class + startEkycFlow()
├── types/
│   └── index.ts              # All interfaces & types
├── errors/
│   ├── EkycError.ts          # Custom error class + error codes
│   └── errorHandler.ts       # Centralized error handler
├── http/
│   └── httpClient.ts         # Axios instance + interceptors
└── services/
    ├── ocrService.ts          # OCR API service
    ├── livenessService.ts     # Liveness API service
    └── faceMatchService.ts    # Face Match API service
```

## License

MIT
