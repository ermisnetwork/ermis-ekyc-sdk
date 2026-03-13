---
sidebar_position: 5
---

# EkycActionPanel

3-step eKYC verification panel used by the appraiser (HOST) during a video session. Performs OCR, Liveness Detection, and Face Match.

## Usage

```tsx
import { EkycActionPanel } from "ermis-ekyc-react";

function HostView({ joinData }) {
  return (
    <div style={{ display: "flex" }}>
      <EkycMeetingRoom {...joinData} />
      <EkycActionPanel
        meetingId={joinData.meeting.id}
        registrantId={joinData.registrant.id}
      />
    </div>
  );
}
```

## Props

| Prop           | Type     | Required | Description           |
| -------------- | -------- | -------- | --------------------- |
| `meetingId`    | `string` | ✅       | Current meeting ID    |
| `registrantId` | `string` | ✅       | Current registrant ID |

## 3-Step Flow

### Step 1: OCR – Identity Document

1. Select document type (CCCD / Passport / GPLX)
2. Capture front side of the document
3. Capture back side (optional for Passport)
4. Click "Send OCR"
5. View extracted information (name, ID number, DOB, etc.)

### Step 2: Liveness – Live Person Check

1. Capture a selfie of the customer
2. Click "Send Liveness"
3. View result: live person detected? Spoofing detected?

### Step 3: Face Match – Face Comparison

1. Selfie is automatically used from Step 2
2. Document photo from Step 1
3. Click "Send Face Match"
4. View result: match? Similarity score? Threshold?

## Features

- 📷 In-call photo capture (uses the video stream)
- 🔄 Reset button to start over
- 📊 Detailed results display for each step
- 🌐 Localized labels
