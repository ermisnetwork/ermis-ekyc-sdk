---
sidebar_position: 3
---

# EkycMeetingPreview

Camera and microphone preview component. Lets users test their devices and join a session with a room code.

## Usage

```tsx
import { EkycMeetingPreview } from "ermis-ekyc-react";
import type { EkycPreviewJoinData } from "ermis-ekyc-react";

function PreviewPage() {
  const handleJoin = (joinData: EkycPreviewJoinData) => {
    // joinData contains everything needed for EkycMeetingRoom
    console.log(joinData);
    // Navigate to meeting room with this data
  };

  return <EkycMeetingPreview joinCode="ABC123" onJoinMeeting={handleJoin} />;
}
```

## Props

| Prop            | Type                                  | Required | Description                    |
| --------------- | ------------------------------------- | -------- | ------------------------------ |
| `joinCode`      | `string`                              | ✅       | Room code from registrant      |
| `onJoinMeeting` | `(data: EkycPreviewJoinData) => void` | ✅       | Called when user clicks "Join" |

## Join Data

When the user clicks "Join Session", `onJoinMeeting` is called with:

```typescript
interface EkycPreviewJoinData {
  // Media streams
  localStream: MediaStream;

  // Room connection info
  roomInfo: MeetingRoomInfo;

  // Registrant info
  registrant: MeetingRegistrantInfo;

  // Meeting info
  meeting: MeetingInfo;
}
```

Pass this data directly to `EkycMeetingRoom` to enter the video call.

## Features

- 📹 Camera preview with on/off toggle
- 🎤 Microphone test with on/off toggle
- 🔗 Automatic room code validation via `joinWithCode` API
- 🌐 Localized UI (Vietnamese/English)
