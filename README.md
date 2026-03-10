# Ermis eKYC SDK

A TypeScript SDK for identity verification (eKYC) with **OCR**, **Liveness Detection**, and **Face Match** capabilities.

## Features

- 📄 **OCR** – Extract information from identity documents (CCCD, Passport, Driver's License)
- 🧬 **Liveness Detection** – Verify a selfie is from a live person (anti-spoofing)
- 🔍 **Face Match** – Compare a selfie with a document photo
- 🚀 **Full Flow** – Orchestrate all 3 steps in a single call
- 🔧 **Flexible Input** – Accepts `File`, `Blob`, or base64 strings

---

## Installation

```bash
# npm
npm install ermis-ekyc-sdk

# yarn
yarn add ermis-ekyc-sdk
```

---

## Quick Start

```typescript
import { EkycService, DocumentType } from "ermis-ekyc-sdk";

// 1. Initialize the SDK (singleton — config required on first call)
const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.example.com/api/ekyc",
  apiKey: "your-api-key",
  timeout: 30000, // optional, defaults to 30s
});

// 2. Perform OCR
const ocrResult = await ekyc.performOcr({
  documentFront: frontImageFile,
  documentBack: backImageFile, // optional for PASSPORT
  documentType: DocumentType.CCCD,
});

console.log(ocrResult.data.full_name);
console.log(ocrResult.data.id_number);

// 3. Check Liveness
const livenessResult = await ekyc.checkLiveness({
  images: selfieFile,
});

console.log(livenessResult.is_live); // true | false

// 4. Face Match
const matchResult = await ekyc.matchFaces({
  selfieImage: selfieFile,
  documentImage: frontImageFile,
});

console.log(matchResult.match); // true | false
console.log(matchResult.similarity); // 0.0 - 1.0
```

### Full eKYC Flow (All-in-One)

```typescript
const result = await ekyc.startEkycFlow({
  documentFront: frontImageFile,
  documentBack: backImageFile,
  documentType: DocumentType.CCCD,
  selfieImage: selfieFile,
});

console.log(result.isVerified); // true | false
console.log(result.totalDuration); // total time in ms
console.log(result.ocr); // OcrResponse
console.log(result.liveness); // LivenessResponse
console.log(result.faceMatch); // FaceMatchResponse
```

---

## React UI SDK (`ermis-ekyc-react`)

A full-featured React component library for eKYC meeting sessions:

- 📹 **EkycMeetingPreview** – Camera/mic testing + join flow
- 🎥 **EkycMeetingRoom** – Video meeting with `forwardRef` for composable layouts
- 📋 **EkycActionPanel** – Detachable 3-step eKYC panel (OCR → Liveness → Face Match)
- 🌐 **i18n** – Built-in Vietnamese/English locales, custom locale support
- 🎨 **CSS Theming** – 20+ CSS custom properties for full visual customization

```bash
npm install ermis-ekyc-react ermis-ekyc-sdk
```

👉 See full documentation: [packages/react/README.md](packages/react/README.md)

---

## API Reference

### Initialization

#### `EkycService.getInstance(config?: EkycConfig): EkycService`

Returns the singleton instance. Config is **required on first call**.

```typescript
interface EkycConfig {
  baseUrl: string; // Base URL of the eKYC API
  apiKey: string; // API key for authentication
  timeout?: number; // Request timeout in ms (default: 30000)
}
```

#### `EkycService.resetInstance(): void`

Resets the singleton, allowing re-initialization with a new config.

---

### OCR – Document Extraction

#### `ekyc.performOcr(request: OcrRequest): Promise<OcrResponse>`

Extract information from identity document images.

```typescript
// Document types
enum DocumentType {
  CCCD = "CCCD", // Citizen Identity Card
  PASSPORT = "PASSPORT", // Passport
  GPLX = "GPLX", // Driver's License
}

interface OcrRequest {
  documentFront: Blob | File | string; // Front side (required)
  documentBack?: Blob | File | string; // Back side (required for CCCD/GPLX, not needed for PASSPORT)
  documentType?: DocumentType | string; // Default: "CCCD"
  extractFace?: boolean; // Default: true
  ocrApi?: string; // Default: "advanced"
}
```

**Response** includes extracted fields: `id_number`, `full_name`, `date_of_birth`, `gender`, `nationality`, `place_of_origin`, `place_of_residence`, `expiry_date`, `issue_date`, and optional `face_region`.

---

### Liveness Detection

#### `ekyc.checkLiveness(request: LivenessRequest): Promise<LivenessResponse>`

Verify a selfie is from a live person (not a photo/video of a photo).

```typescript
interface LivenessRequest {
  images: Blob | File | string; // Selfie image (required)
  mode?: string; // Default: "passive"
  challenge?: string; // Default: "blink"
}
```

**Response** includes `is_live`, `confidence`, `spoofing_detected`, and detailed `checks` (texture analysis, moiré detection, reflection, depth estimation, face size, CLIP liveness).

---

### Face Match

#### `ekyc.matchFaces(request: FaceMatchRequest): Promise<FaceMatchResponse>`

Compare a selfie with a document photo.

```typescript
interface FaceMatchRequest {
  selfieImage: Blob | File | string; // Selfie image (required)
  documentImage: Blob | File | string; // Document image (required)
  threshold?: string; // Default: "0.6"
}
```

**Response** includes `match` (boolean), `similarity` (0-1), `threshold`, face detection counts, and `processing_time_ms`.

---

### Full Flow

#### `ekyc.startEkycFlow(input: EkycFlowInput): Promise<EkycFlowResult>`

Orchestrates: **OCR → Liveness → Face Match**. Stops early if liveness fails.

```typescript
interface EkycFlowInput {
  documentFront: Blob | File | string;
  documentBack: Blob | File | string;
  documentType?: DocumentType | string;
  extractFace?: boolean;
  selfieImage: Blob | File | string;
  faceMatchThreshold?: string;
  livenessMode?: string;
  livenessChallenge?: string;
}

interface EkycFlowResult {
  ocr: OcrResponse;
  liveness: LivenessResponse;
  faceMatch: FaceMatchResponse;
  isVerified: boolean; // true if all steps passed
  totalDuration: number; // total time in ms
}
```

---

## Error Handling

All errors are wrapped in `EkycError`:

```typescript
import { EkycError, EkycErrorCode } from "ermis-ekyc-sdk";

try {
  const result = await ekyc.performOcr({ ... });
} catch (error) {
  if (error instanceof EkycError) {
    console.error(error.code);       // EkycErrorCode
    console.error(error.message);    // Error message
    console.error(error.statusCode); // HTTP status code
    console.error(error.details);    // Additional details
    console.error(error.timestamp);  // ISO timestamp
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

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### Setup

```bash
# Clone the repo
git clone https://github.com/ermisnetwork/ermis-ekyc-sdk.git
cd ermis-ekyc-sdk

# Install dependencies
npm install
# or
yarn install

# Build
npm run build
# or
yarn build
```

### Run Demo App

```bash
# Install demo dependencies (first time)
npm run demo:install
# or
yarn demo:install

# Run demo with hot-reload (SDK + demo simultaneously)
npm run demo
# or
yarn demo
```

The demo app will start at `http://localhost:3001`. Changes to SDK source files (`src/`) will auto-rebuild and hot-reload in the demo.

### Available Scripts

| Script         | Description                               |
| -------------- | ----------------------------------------- |
| `build`        | Compile TypeScript to `dist/`             |
| `dev`          | Watch mode – auto-compile on file changes |
| `lint`         | Type-check without emitting files         |
| `demo`         | Build SDK + run demo with hot-reload      |
| `demo:install` | Build SDK + install demo dependencies     |

---

## Project Structure

```
packages/
├── sdk/                          # Core eKYC SDK
│   └── src/
│       ├── index.ts              # Entry point, re-exports
│       ├── EkycService.ts        # Singleton SDK + startEkycFlow()
│       ├── types/
│       │   └── index.ts          # Interfaces, types & DocumentType enum
│       ├── errors/
│       │   ├── EkycError.ts      # Custom error class + error codes
│       │   └── errorHandler.ts   # Centralized error handler
│       ├── http/
│       │   └── httpClient.ts     # Axios instance + interceptors
│       ├── services/
│       │   ├── ocrService.ts     # OCR API service
│       │   ├── livenessService.ts# Liveness API service
│       │   └── faceMatchService.ts# Face Match API service
│       └── utils/
│           └── base64.ts         # base64 to Blob conversion utilities
│
├── react/                        # React UI SDK
│   └── src/
│       ├── index.ts              # Entry point, re-exports
│       ├── EkycMeetingProvider.tsx# Provider (config + locale context)
│       ├── locale/               # i18n locale system
│       │   ├── types.ts          # EkycLocale interface
│       │   ├── vi.ts             # Vietnamese (default)
│       │   └── en.ts             # English
│       ├── components/
│       │   ├── EkycMeetingPreview.tsx  # Camera/mic preview
│       │   ├── EkycMeetingRoom.tsx     # Video room (forwardRef)
│       │   └── EkycActionPanel.tsx     # 3-step eKYC panel
│       └── hooks/
│           └── useMediaPreview.ts      # Camera/mic management
│
examples/
└── demo/                         # React + Vite demo app
```

## License

MIT
