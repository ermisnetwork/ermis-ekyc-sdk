---
sidebar_position: 3
---

# Example: React Integration

Complete React application integrating the management module with the React UI components for video eKYC.

## Full Application

```tsx
import { useState } from "react";
import {
  EkycMeetingProvider,
  EkycMeetingPreview,
  EkycMeetingRoom,
  EkycActionPanel,
  enLocale,
} from "ermis-ekyc-react";
import type { EkycPreviewJoinData } from "ermis-ekyc-react";
import "ermis-ekyc-react/styles.css";

function App() {
  const [joinCode, setJoinCode] = useState("");
  const [roomData, setRoomData] = useState<EkycPreviewJoinData | null>(null);

  return (
    <EkycMeetingProvider
      ermisApiUrl="https://api-ekyc.ermis.network"
      ekycApiUrl="https://ekyc-api.ktssolution.com/api/ekyc"
      ekycApiKey="your-api-key"
      meetingHostUrl="https://meet.ermis.network"
      meetingNodeUrl="https://node.ermis.network"
      locale={enLocale}
    >
      {!roomData ? (
        <div>
          <h1>Enter Room Code</h1>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter join code..."
          />
          <EkycMeetingPreview joinCode={joinCode} onJoinMeeting={setRoomData} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: "16px" }}>
          <EkycMeetingRoom
            localStream={roomData.localStream}
            roomInfo={roomData.roomInfo}
            registrant={roomData.registrant}
            meeting={roomData.meeting}
            onLeave={() => setRoomData(null)}
          />
          <EkycActionPanel
            meetingId={roomData.meeting.id}
            registrantId={roomData.registrant.id}
          />
        </div>
      )}
    </EkycMeetingProvider>
  );
}

export default App;
```

## Step-by-Step Breakdown

### 1. Setup Provider

The `EkycMeetingProvider` wraps your entire app and initializes both `ErmisService` and `EkycService`:

```tsx
<EkycMeetingProvider
  ermisApiUrl="..."   // Management API
  ekycApiUrl="..."    // eKYC API (OCR, Liveness, Face Match)
  ekycApiKey="..."    // eKYC API key
  meetingHostUrl="..."
  meetingNodeUrl="..."
  locale={enLocale}   // Optional, defaults to Vietnamese
>
```

### 2. Preview & Join

`EkycMeetingPreview` handles device testing and joining:

```tsx
<EkycMeetingPreview
  joinCode={code} // Room code from registrant
  onJoinMeeting={(data) => {
    // data contains: localStream, roomInfo, registrant, meeting
    setRoomData(data);
  }}
/>
```

### 3. Meeting Room + Action Panel

For the HOST (appraiser), show both the video room and the action panel:

```tsx
<div style={{ display: "flex" }}>
  <EkycMeetingRoom {...roomData} />
  <EkycActionPanel
    meetingId={roomData.meeting.id}
    registrantId={roomData.registrant.id}
  />
</div>
```

For the GUEST (customer), show only the video room:

```tsx
<EkycMeetingRoom {...roomData} />
```

## Creating Sessions Programmatically

Before users can join, you need to create a session via the management API:

```typescript
import { ErmisService } from "ermis-ekyc-sdk";

const ermis = ErmisService.getInstance({
  baseUrl: "https://api-ekyc.ermis.network",
});

// Login
const auth = await ermis.auth.login({ username: "admin", password: "pass" });
ermis.setToken(auth.access_token);

// Create session with 2 registrants
const session = await ermis.meetings.setupMeeting({
  meeting: {
    title: "Verification Session",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    location: "Online",
  },
  registrants: [
    { objectId: appraiserId, type: "APPRAISER", role: "HOST" },
    { objectId: customerId, type: "CUSTOMER", role: "GUEST" },
  ],
});

// Get join codes
const hostCode = session.registrants.find((r) => r.role === "HOST")?.joinCode;
const guestCode = session.registrants.find((r) => r.role === "GUEST")?.joinCode;

// Share these codes with the appraiser and customer
```
