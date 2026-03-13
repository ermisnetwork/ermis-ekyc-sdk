---
sidebar_position: 2
---

# Quick Start

## eKYC Module – Verify Identity in 3 Steps

```typescript
import { EkycService, DocumentType } from "ermis-ekyc-sdk";

// 1. Initialize the SDK
const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key",
});

// 2. Perform OCR – extract document info
const ocrResult = await ekyc.performOcr({
  documentFront: frontImageFile,
  documentBack: backImageFile,
  documentType: DocumentType.CCCD,
});
console.log(ocrResult.full_name); // "Nguyen Van A"

// 3. Check Liveness – verify real person
const liveness = await ekyc.checkLiveness({
  images: selfieFile,
});
console.log(liveness.is_live); // true

// 4. Face Match – compare with document
const match = await ekyc.matchFaces({
  selfieImage: selfieFile,
  documentImage: frontImageFile,
});
console.log(match.match); // true
console.log(match.similarity); // 0.95
```

### Or run all steps at once

```typescript
const result = await ekyc.startEkycFlow({
  documentFront: frontImageFile,
  documentBack: backImageFile,
  documentType: DocumentType.CCCD,
  selfieImage: selfieFile,
});

console.log(result.isVerified); // true | false
console.log(result.totalDuration); // 2500 (ms)
```

## Management Module – Create Appraisal Session

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
  frontIdImage: frontFile,
  backIdImage: backFile,
});

// 4. Setup appraisal session
const session = await ermis.meetings.setupMeeting({
  meeting: {
    title: "eKYC Session - Nguyen Van A",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    location: "Online",
  },
  registrants: [
    { objectId: appraiserId, type: "APPRAISER", role: "HOST" },
    { objectId: customer._id, type: "CUSTOMER", role: "GUEST" },
  ],
});

// 5. Get join codes
const hostCode = session.registrants.find((r) => r.role === "HOST")?.joinCode;
const guestCode = session.registrants.find((r) => r.role === "GUEST")?.joinCode;
```

## What's Next?

- [Overall Flow](/docs/getting-started/overall-flow) – Understand the complete architecture
- [EkycService API](/docs/core-sdk/ekyc-service) – Full OCR, Liveness & Face Match reference
- [React Components](/docs/react-sdk/overview) – Build the video eKYC UI
