# ermis-ekyc-react

React UI SDK for eKYC appraisal meeting sessions – provides ready-to-use components and hooks for previewing devices and joining meetings.

## Installation

```bash
npm install ermis-ekyc-react ermis-ekyc-sdk react react-dom
```

## Components

### `EkycMeetingPreview`

Camera and microphone preview component before joining an appraisal session.

```tsx
import { EkycMeetingProvider, EkycMeetingPreview } from "ermis-ekyc-react";
import { ErmisService } from "ermis-ekyc-sdk";

const ermis = ErmisService.getInstance({ baseUrl: "https://api.example.com" });
ermis.setToken(accessToken);

function App() {
  return (
    <EkycMeetingProvider ermisService={ermis}>
      <EkycMeetingPreview
        joinCode="ABC123"
        onJoinSuccess={(data) => console.log("Joined!", data)}
        onJoinError={(err) => console.error(err)}
      />
    </EkycMeetingProvider>
  );
}
```

### `EkycMeetingRoom`

Meeting room component (placeholder – integrate your meeting SDK/library here).

```tsx
import { EkycMeetingProvider, EkycMeetingRoom } from "ermis-ekyc-react";

<EkycMeetingProvider ermisService={ermis}>
  <EkycMeetingRoom meetingData={joinData} onLeave={() => navigate("/")} />
</EkycMeetingProvider>;
```

## Hooks

### `useMediaPreview`

Hook for managing camera/mic preview, device selection, and audio level metering.

```tsx
import { useMediaPreview } from "ermis-ekyc-react";

function MyPreview() {
  const {
    stream,
    videoEnabled,
    audioEnabled,
    audioLevel,
    videoDevices,
    audioDevices,
    toggleVideo,
    toggleAudio,
    selectVideoDevice,
    selectAudioDevice,
    cleanup,
    error,
    isLoading,
  } = useMediaPreview();

  // ...
}
```

### `useEkycMeetingService`

Hook to access the `ErmisService` instance from context.

```tsx
import { useEkycMeetingService } from "ermis-ekyc-react";

function MyComponent() {
  const ermis = useEkycMeetingService();
  // ermis.meetings.joinWithCode(...)
}
```

## Peer Dependencies

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `ermis-ekyc-sdk` ^1.0.0

## License

MIT
