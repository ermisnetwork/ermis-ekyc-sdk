# ermis-ekyc-react

React UI SDK for eKYC verification sessions — includes Preview (device testing) and Room (video meeting) components.

## Installation

```bash
npm install ermis-ekyc-react ermis-ekyc-sdk
```

### Static Assets Setup

The package requires static files (WASM workers, polyfills) for the video meeting engine. There are 2 ways to set them up:

**Automatic (postinstall):**
When installing `ermis-ekyc-react`, the `postinstall` script automatically copies 4 folders (`opus_decoder`, `polyfills`, `raptorQ`, `workers`) into your project's `public/` directory.

**Manual (if postinstall is skipped):**

```bash
# If published to npm
npx ermis-ekyc-setup

# In local development
node node_modules/ermis-ekyc-react/scripts/copy-assets.cjs
```

## Usage

### 1. Provider

Wrap your component tree with `EkycMeetingProvider` and pass 3 URL configs:

```tsx
import { EkycMeetingProvider } from "ermis-ekyc-react";
import "ermis-ekyc-react/styles.css";

function App() {
  return (
    <EkycMeetingProvider
      ekycApiUrl="https://api-ekyc.ermis.network"
      meetingHostUrl="https://meet.ermis.network"
      meetingNodeUrl="https://node.ermis.network"
    >
      <MyEkycFlow />
    </EkycMeetingProvider>
  );
}
```

| Prop             | Description                                    |
| ---------------- | ---------------------------------------------- |
| `ekycApiUrl`     | API URL for the eKYC session management system |
| `meetingHostUrl` | Meeting server URL (host)                      |
| `meetingNodeUrl` | Meeting node URL                               |

### 2. Preview (Device Testing)

`EkycMeetingPreview` displays a camera/mic preview with a Join button:

```tsx
import { EkycMeetingPreview, type EkycPreviewJoinData } from "ermis-ekyc-react";

function PreviewScreen() {
  const handleJoin = (data: EkycPreviewJoinData) => {
    // data contains: meetingHostUrl, meetingNodeUrl, localStream, meetingData
    // Navigate to Room screen
  };

  return (
    <EkycMeetingPreview
      joinCode="ABC-1234"
      onJoinMeeting={handleJoin}
      onJoinError={(err) => console.error(err)}
    />
  );
}
```

> **Note:** The Join button is only enabled when all conditions are met:
>
> - ✅ Camera is **ON**
> - ✅ Microphone is **ON**
> - ✅ `joinWithCode` API returned successfully

### 3. Room (Video Meeting)

`EkycMeetingRoom` receives data from Preview and automatically connects to the meeting room:

```tsx
import { EkycMeetingRoom } from "ermis-ekyc-react";

function RoomScreen({ joinData }: { joinData: EkycPreviewJoinData }) {
  return (
    <EkycMeetingRoom
      meetingHostUrl={joinData.meetingHostUrl}
      meetingNodeUrl={joinData.meetingNodeUrl}
      localStream={joinData.localStream}
      meetingData={joinData.meetingData}
      onLeave={() => navigate("/")}
    />
  );
}
```

**On mount flow:**

1. `ErmisClassroomProvider` initializes the client
2. `authenticate(registrant.authId)` — authenticates the participant
3. `joinRoom(meeting.ermisRoomCode)` — joins the meeting room

## Data Flow

```
EkycMeetingPreview                    EkycMeetingRoom
┌─────────────────┐                  ┌─────────────────┐
│ joinWithCode()  │   onJoinMeeting  │ authenticate()  │
│ Camera/Mic test │ ──────────────►  │ joinRoom()      │
│ [Join Button]   │  EkycPreviewData │ Video Grid      │
└─────────────────┘                  └─────────────────┘
```

## Types

### `EkycPreviewJoinData`

```ts
interface EkycPreviewJoinData {
  meetingHostUrl: string;
  meetingNodeUrl: string;
  localStream: MediaStream; // Required (camera + mic mandatory)
  meetingData: JoinWithCodeResponse;
}
```

### `JoinWithCodeResponse`

```ts
interface JoinWithCodeResponse {
  meetingToken: string;
  apiHost: string;
  meetingNode: string;
  room: MeetingRoomInfo;
  registrant: MeetingRegistrantInfo;
  meeting: MeetingInfo;
}
```

## Exports

| Export                 | Kind      | Description                      |
| ---------------------- | --------- | -------------------------------- |
| `EkycMeetingProvider`  | Component | Provider for URL configuration   |
| `EkycMeetingPreview`   | Component | Camera/mic preview + join flow   |
| `EkycMeetingRoom`      | Component | Video meeting room               |
| `useEkycMeetingConfig` | Hook      | Access config from Provider      |
| `useMediaPreview`      | Hook      | Manage camera/mic preview        |
| `JoinWithCodeResponse` | Type      | Response from `joinWithCode` API |
| `EkycPreviewJoinData`  | Type      | Data passed from Preview → Room  |

## Peer Dependencies

```json
{
  "ermis-ekyc-sdk": "*",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```
