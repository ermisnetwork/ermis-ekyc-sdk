---
sidebar_position: 4
---

# EkycMeetingRoom

Video meeting room component for the eKYC session. Displays video streams for both the appraiser (HOST) and customer (GUEST).

## Usage

```tsx
import { EkycMeetingRoom } from "ermis-ekyc-react";
import type { EkycMeetingRoomRef } from "ermis-ekyc-react";

function MeetingPage({ joinData }) {
  const roomRef = useRef<EkycMeetingRoomRef>(null);

  return (
    <EkycMeetingRoom
      ref={roomRef}
      localStream={joinData.localStream}
      roomInfo={joinData.roomInfo}
      registrant={joinData.registrant}
      meeting={joinData.meeting}
      onLeave={() => console.log("Left the room")}
    />
  );
}
```

## Props

| Prop          | Type                    | Required | Description                          |
| ------------- | ----------------------- | -------- | ------------------------------------ |
| `localStream` | `MediaStream`           | ✅       | Local camera/mic stream from preview |
| `roomInfo`    | `MeetingRoomInfo`       | ✅       | Room connection details              |
| `registrant`  | `MeetingRegistrantInfo` | ✅       | Current user's registrant info       |
| `meeting`     | `MeetingInfo`           | ✅       | Meeting details                      |
| `onLeave`     | `() => void`            | ❌       | Called when user leaves the room     |

:::tip
All props are provided by `EkycPreviewJoinData` from `EkycMeetingPreview`. Simply spread the join data.
:::

## Ref Methods

Access the room instance via ref:

```typescript
interface EkycMeetingRoomRef {
  // Get the current call instance
  getCall(): Call | null;
}
```

## Features

- 🎥 Two-way video call (HOST + GUEST)
- 🏷️ Role labels ("Appraiser (HOST)" / "Customer (GUEST)")
- 📹 Camera on/off toggle
- 🎤 Microphone on/off toggle
- 🚪 Leave room button
- 🌐 Localized UI
