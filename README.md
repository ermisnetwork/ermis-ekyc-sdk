# Ermis eKYC SDK

A TypeScript SDK for identity verification (eKYC) with **two modules**:

1. **ErmisService** – Management APIs (auth, customers, appraisers, appraisal sessions) using Bearer token authentication
2. **EkycService** – eKYC APIs (OCR, Liveness, Face Match) using API key authentication

## Features

### Management Module (`ErmisService`)

- 🔐 **Authentication** – Login, register, token management
- 👤 **Customer Management** – CRUD operations with ID card images
- 👨‍💼 **Appraiser Management** – List and create appraisers (auditors)
- 📋 **Appraisal Sessions** – Create sessions with registrants to generate room codes
- 🔗 **Join with Code** – Use room code to join video eKYC session

### eKYC Module (`EkycService`)

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

## Overall Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ErmisService (Management)                    │
│                                                                 │
│  1. Login ──► 2. Create Customer ──► 3. Create Appraiser        │
│                                           │                     │
│                    4. Setup Appraisal Session                   │
│                       (1 HOST + 1 GUEST)                        │
│                           │                                     │
│                    5. Get joinCode from registrants              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ermis-ekyc-react (React UI)                    │
│                                                                 │
│  6. EkycMeetingPreview ──► 7. EkycMeetingRoom ──► 8. ActionPanel│
│     (join with code)          (video call)         (OCR/Live/FM)│
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start – Management Module

```typescript
import { ErmisService } from "ermis-ekyc-sdk";

// 1. Initialize
const ermis = ErmisService.getInstance({
  baseUrl: "https://api-ekyc.ermis.network",
});

// 2. Login
const auth = await ermis.auth.login({
  username: "admin",
  password: "password",
});
ermis.setToken(auth.access_token);

// 3. Create customer
const customer = await ermis.customers.createCustomer({
  fullName: "Nguyen Van A",
  dateOfBirth: "1990-01-15",
  identityNumber: "012345678901",
  placeOfOrigin: "Ha Noi",
  issueDate: "2020-01-01",
  issuePlace: "Cuc CS QLHC",
  phoneNumber: "0901234567",
  address: "123 ABC, Ha Noi",
  occupation: "Engineer",
  monthlyIncome: 20000000,
  loanAmount: 100000000,
  loanTerm: 12,
  frontIdImage: frontFile, // File object
  backIdImage: backFile, // File object
});

// 4. Create appraiser
const appraiser = await ermis.appraisers.createAppraiser({
  firstName: "Tran",
  lastName: "Thi B",
  email: "appraiser@example.com",
  phoneNumber: "0987654321",
  location: "Ho Chi Minh",
});

// 5. Setup appraisal session (creates meeting + 2 registrants)
const session = await ermis.meetings.setupMeeting({
  meeting: {
    title: "eKYC Session - Nguyen Van A",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    location: "Online",
  },
  registrants: [
    { objectId: appraiser._id, type: "APPRAISER", role: "HOST" },
    { objectId: customer._id, type: "CUSTOMER", role: "GUEST" },
  ],
});

// 6. Get join codes for each registrant
const hostCode = session.registrants.find((r) => r.role === "HOST")?.joinCode;
const guestCode = session.registrants.find((r) => r.role === "GUEST")?.joinCode;

console.log("Host join code:", hostCode); // Appraiser uses this
console.log("Guest join code:", guestCode); // Customer uses this
```

### Joining with Room Code

Once you have the `joinCode`, use `ermis-ekyc-react` to enter the video eKYC session:

```tsx
import { EkycMeetingProvider, EkycMeetingPreview } from "ermis-ekyc-react";

<EkycMeetingProvider
  ermisApiUrl="https://api-ekyc.ermis.network"
  ekycApiUrl="https://ekyc-api.ktssolution.com/api/ekyc"
  ekycApiKey="your-api-key"
  meetingHostUrl="https://meet.ermis.network"
  meetingNodeUrl="https://node.ermis.network"
>
  <EkycMeetingPreview
    joinCode={guestCode} // or hostCode
    onJoinMeeting={setRoomData}
  />
</EkycMeetingProvider>;
```

👉 Full React documentation: [packages/react/README.md](packages/react/README.md)

---

## Quick Start – eKYC Module

```typescript
import { EkycService, DocumentType } from "ermis-ekyc-sdk";

// 1. Initialize
const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key",
});

// 2. Perform OCR
const ocrResult = await ekyc.performOcr({
  documentFront: frontImageFile,
  documentBack: backImageFile,
  documentType: DocumentType.CCCD,
});

// 3. Check Liveness
const livenessResult = await ekyc.checkLiveness({
  images: selfieFile,
});

// 4. Face Match
const matchResult = await ekyc.matchFaces({
  selfieImage: selfieFile,
  documentImage: frontImageFile,
});

// Or run all 3 steps at once
const result = await ekyc.startEkycFlow({
  documentFront: frontImageFile,
  documentBack: backImageFile,
  documentType: DocumentType.CCCD,
  selfieImage: selfieFile,
});

console.log(result.isVerified); // true | false
```

---

## API Reference – ErmisService (Management)

### Initialization

```typescript
import { ErmisService } from "ermis-ekyc-sdk";

const ermis = ErmisService.getInstance({
  baseUrl: string;  // Ermis management API URL
  timeout?: number; // Request timeout in ms (default: 30000)
});
```

### Authentication (`ermis.auth`)

| Method                                               | Description                             |
| ---------------------------------------------------- | --------------------------------------- |
| `login({ username, password })`                      | Login, returns `{ access_token, user }` |
| `register({ email, password, firstName, lastName })` | Register new account                    |
| `logout()`                                           | Clear client-side token                 |

After login, set the token:

```typescript
const auth = await ermis.auth.login({ username, password });
ermis.setToken(auth.access_token);
```

### Customer Management (`ermis.customers`)

| Method                     | Description                         |
| -------------------------- | ----------------------------------- |
| `getCustomers()`           | List all customers with pagination  |
| `getCustomerById(id)`      | Get customer details                |
| `createCustomer(data)`     | Create customer with ID card images |
| `updateCustomer(id, data)` | Update customer                     |

```typescript
interface CreateCustomerRequest {
  fullName: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  identityNumber: string; // CCCD number
  placeOfOrigin: string;
  issueDate: string;
  issuePlace: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  loanAmount: number;
  loanTerm: number;
  frontIdImage?: File; // Front of ID card
  backIdImage?: File; // Back of ID card
}
```

Customer statuses: `"PENDING"` | `"APPROVED"` | `"REJECTED"` | `"IN_PROGRESS"`

### Appraiser Management (`ermis.appraisers`)

| Method                  | Description                         |
| ----------------------- | ----------------------------------- |
| `getAppraisers()`       | List all appraisers with pagination |
| `createAppraiser(data)` | Create new appraiser                |

```typescript
interface CreateAppraiserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
}
```

### Appraisal Sessions (`ermis.meetings`)

| Method                                            | Description                                    |
| ------------------------------------------------- | ---------------------------------------------- |
| `setupMeeting(request)`                           | **Create session + 2 registrants in one call** |
| `getMeetings()`                                   | List all sessions                              |
| `getMeetingById(id)`                              | Get session details                            |
| `updateMeeting(id, data)`                         | Update session                                 |
| `getRegistrants(meetingId)`                       | List registrants for a session                 |
| `updateRegistrant(meetingId, registrantId, data)` | Update registrant info                         |
| `joinWithCode(joinCode)`                          | Join session with room code (public, no auth)  |

#### `setupMeeting` – Recommended way to create sessions

Creates meeting + 2 registrants atomically. **Business rules:**

- Exactly 2 registrants required
- Must have exactly 1 `HOST` and 1 `GUEST`

```typescript
const session = await ermis.meetings.setupMeeting({
  meeting: {
    title: "eKYC Session",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    location: "Online",
    description: "Verification session", // optional
  },
  registrants: [
    { objectId: appraiserId, type: "APPRAISER", role: "HOST" },
    { objectId: customerId, type: "CUSTOMER", role: "GUEST" },
  ],
});

// Result
session.meeting._id; // Meeting ID
session.registrants[0].joinCode; // Room code for joining
session.registrants[0].role; // "HOST" or "GUEST"
```

Each registrant receives a unique `joinCode` used to join the video session via `ermis-ekyc-react`.

---

## API Reference – EkycService (eKYC)

### Initialization

```typescript
import { EkycService, DocumentType } from "ermis-ekyc-sdk";

const ekyc = EkycService.getInstance({
  baseUrl: string;  // eKYC API URL
  apiKey: string;   // API key
  timeout?: number; // Request timeout in ms (default: 30000)
});
```

### OCR – Document Extraction

#### `ekyc.performOcr(request): Promise<OcrResponse>`

```typescript
interface OcrRequest {
  documentFront: Blob | File | string; // Front side (required)
  documentBack?: Blob | File | string; // Back side (required for CCCD/GPLX)
  documentType?: DocumentType | string; // Default: "CCCD"
  extractFace?: boolean; // Default: true
  ocrApi?: string; // Default: "advanced"
}

enum DocumentType {
  CCCD = "CCCD", // Citizen Identity Card
  PASSPORT = "PASSPORT", // Passport
  GPLX = "GPLX", // Driver's License
}
```

**Response** includes: `id_number`, `full_name`, `date_of_birth`, `gender`, `nationality`, `place_of_origin`, `place_of_residence`, `expiry_date`, `issue_date`, and optional `face_region`.

### Liveness Detection

#### `ekyc.checkLiveness(request): Promise<LivenessResponse>`

```typescript
interface LivenessRequest {
  images: Blob | File | string; // Selfie image (required)
  mode?: string; // Default: "passive"
  challenge?: string; // Default: "blink"
}
```

**Response** includes: `is_live`, `confidence`, `spoofing_detected`, and detailed `checks`.

### Face Match

#### `ekyc.matchFaces(request): Promise<FaceMatchResponse>`

```typescript
interface FaceMatchRequest {
  selfieImage: Blob | File | string; // Selfie (required)
  documentImage: Blob | File | string; // Document photo (required)
  threshold?: string; // Default: "0.6"
}
```

**Response** includes: `match` (boolean), `similarity` (0-1), `threshold`, and `processing_time_ms`.

### Full Flow (All-in-One)

#### `ekyc.startEkycFlow(input): Promise<EkycFlowResult>`

Orchestrates: **OCR → Liveness → Face Match**. Stops early if liveness fails.

```typescript
interface EkycFlowResult {
  ocr: OcrResponse;
  liveness: LivenessResponse;
  faceMatch: FaceMatchResponse;
  isVerified: boolean; // true if all steps passed
  totalDuration: number; // total time in ms
}
```

---

## React UI SDK (`ermis-ekyc-react`)

Full-featured React components for video eKYC sessions:

- 📹 **EkycMeetingPreview** – Camera/mic testing + join with room code
- 🎥 **EkycMeetingRoom** – Video meeting room
- 📋 **EkycActionPanel** – 3-step eKYC panel (OCR → Liveness → Face Match)
- 🌐 **i18n** – Vietnamese/English, custom locales
- 🎨 **CSS Theming** – 20+ CSS custom properties

```bash
# npm
npm install ermis-ekyc-react ermis-ekyc-sdk

# yarn
yarn add ermis-ekyc-react ermis-ekyc-sdk
```

👉 Full documentation: [packages/react/README.md](packages/react/README.md)

---

## Error Handling

All errors are wrapped in `EkycError`:

```typescript
import { EkycError, EkycErrorCode } from "ermis-ekyc-sdk";

try {
  const result = await ermis.meetings.setupMeeting({ ... });
} catch (error) {
  if (error instanceof EkycError) {
    console.error(error.code);       // EkycErrorCode
    console.error(error.message);    // Error message
    console.error(error.statusCode); // HTTP status code
    console.error(error.details);    // Additional details
  }
}
```

| Code                    | Description                           |
| ----------------------- | ------------------------------------- |
| `NETWORK_ERROR`         | Network connectivity issues           |
| `TIMEOUT_ERROR`         | Request timeout                       |
| `AUTHENTICATION_FAILED` | Invalid credentials or token          |
| `INVALID_CONFIG`        | Invalid SDK configuration             |
| `INVALID_REGISTRANTS`   | Invalid registrants in `setupMeeting` |
| `OCR_FAILED`            | OCR extraction failed                 |
| `LIVENESS_FAILED`       | Liveness detection failed             |
| `FACE_MATCH_FAILED`     | Face comparison failed                |
| `UNKNOWN`               | Unexpected error                      |

---

## Exports

```typescript
// ── Management Module ──────────────────────────────────
export { ErmisService } from "ermis-ekyc-sdk";

// Types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Appraiser,
  CreateAppraiserRequest,
  Meeting,
  MeetingRegistrant,
  SetupMeetingRequest,
  SetupMeetingResult,
  CreateRegistrantRequest,
  UpdateRegistrantRequest,
} from "ermis-ekyc-sdk";

// ── eKYC Module ────────────────────────────────────────
export { EkycService, DocumentType } from "ermis-ekyc-sdk";

// Types
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
} from "ermis-ekyc-sdk";

// ── Shared ─────────────────────────────────────────────
export { EkycError, EkycErrorCode } from "ermis-ekyc-sdk";
export { base64ToBlob, ensureBlob } from "ermis-ekyc-sdk";
```

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### Setup

```bash
git clone https://github.com/ermisnetwork/ermis-ekyc-sdk.git
cd ermis-ekyc-sdk
npm install
npm run build
```

### Run Demo App

```bash
npm run demo:install   # first time
npm run demo           # hot-reload (SDK + React + Demo)
```

Demo runs at `http://localhost:3001`.

### Scripts

| Script         | Description                               |
| -------------- | ----------------------------------------- |
| `build`        | Compile TypeScript to `dist/`             |
| `dev`          | Watch mode – auto-compile on file changes |
| `lint`         | Type-check without emitting files         |
| `build:react`  | Build the React UI SDK                    |
| `build:all`    | Build both SDK + React                    |
| `demo`         | Build all + run demo with hot-reload      |
| `demo:install` | Build SDK + install demo dependencies     |

---

## Project Structure

```
├── src/                              # Core SDK source
│   ├── index.ts                      # Entry point, re-exports
│   ├── EkycService.ts                # eKYC API (API key auth)
│   ├── ErmisService.ts               # Management API (Bearer token auth)
│   ├── types/
│   │   ├── index.ts                  # eKYC types & DocumentType enum
│   │   ├── auth.types.ts             # Login, Register, User, AuthResponse
│   │   ├── customer.types.ts         # Customer CRUD types
│   │   ├── appraiser.types.ts        # Appraiser types
│   │   └── meeting.types.ts          # Meeting, Registrant, SetupMeeting types
│   ├── errors/
│   │   ├── EkycError.ts              # Custom error class + error codes
│   │   └── errorHandler.ts           # Centralized error handler
│   ├── http/
│   │   ├── httpClient.ts             # Axios client (API key auth)
│   │   └── tokenHttpClient.ts        # Axios client (Bearer token auth)
│   ├── services/
│   │   ├── authService.ts            # Auth endpoints
│   │   ├── customerService.ts        # Customer endpoints
│   │   ├── appraiserService.ts       # Appraiser endpoints
│   │   ├── meetingService.ts         # Meeting & registrant endpoints
│   │   ├── ocrService.ts             # OCR endpoint
│   │   ├── livenessService.ts        # Liveness endpoint
│   │   └── faceMatchService.ts       # Face Match endpoint
│   └── utils/
│       └── base64.ts                 # base64 to Blob utilities
│
├── packages/react/                   # React UI SDK (ermis-ekyc-react)
│   └── ...                           # See packages/react/README.md
│
└── examples/demo/                    # React + Vite demo app
```

## License

MIT
