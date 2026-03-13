---
sidebar_position: 1
---

# React SDK Overview

The `ermis-ekyc-react` package provides React components for video eKYC sessions.

## Installation

```bash
npm install ermis-ekyc-react ermis-ekyc-sdk
```

## Import CSS

```typescript
import "ermis-ekyc-react/styles.css";
```

## Components

| Component                                                      | Description                                     |
| -------------------------------------------------------------- | ----------------------------------------------- |
| [`EkycMeetingProvider`](/docs/react-sdk/ekyc-meeting-provider) | Context provider – initializes SDK services     |
| [`EkycMeetingPreview`](/docs/react-sdk/ekyc-meeting-preview)   | Camera/mic test + join with room code           |
| [`EkycMeetingRoom`](/docs/react-sdk/ekyc-meeting-room)         | Video meeting room                              |
| [`EkycActionPanel`](/docs/react-sdk/ekyc-action-panel)         | 3-step eKYC panel (OCR → Liveness → Face Match) |

## Hooks

| Hook                     | Description                          |
| ------------------------ | ------------------------------------ |
| `useEkycMeetingConfig()` | Access meeting config from provider  |
| `useEkycLocale()`        | Access current locale                |
| `useMediaPreview()`      | Camera & microphone preview controls |

## Quick Example

```tsx
import {
  EkycMeetingProvider,
  EkycMeetingPreview,
  EkycMeetingRoom,
  enLocale,
} from "ermis-ekyc-react";
import "ermis-ekyc-react/styles.css";

function App() {
  const [roomData, setRoomData] = useState(null);

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
        <EkycMeetingPreview joinCode="ABC123" onJoinMeeting={setRoomData} />
      ) : (
        <EkycMeetingRoom {...roomData} />
      )}
    </EkycMeetingProvider>
  );
}
```
