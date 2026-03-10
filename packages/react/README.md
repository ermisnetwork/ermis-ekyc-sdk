# ermis-ekyc-react

React UI SDK for eKYC verification sessions — includes Preview (device testing), Room (video meeting), and ActionPanel (eKYC flow) components.

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

---

## Quick Start

```tsx
import { useState, useRef } from "react";
import "ermis-ekyc-react/styles.css";
import {
  EkycMeetingProvider,
  EkycMeetingPreview,
  EkycMeetingRoom,
  EkycActionPanel,
  type EkycPreviewJoinData,
  type EkycMeetingRoomRef,
} from "ermis-ekyc-react";

function App() {
  const [roomData, setRoomData] = useState<EkycPreviewJoinData | null>(null);
  const roomRef = useRef<EkycMeetingRoomRef>(null);

  return (
    <EkycMeetingProvider
      ermisApiUrl="https://api-ekyc.ermis.network"
      ekycApiUrl="https://ekyc-api.ktssolution.com/api/ekyc"
      ekycApiKey="your-api-key"
      meetingHostUrl="https://meet.ermis.network"
      meetingNodeUrl="https://node.ermis.network"
    >
      {!roomData ? (
        <EkycMeetingPreview joinCode="ABC-1234" onJoinMeeting={setRoomData} />
      ) : (
        <div style={{ display: "flex", height: "100vh" }}>
          <EkycMeetingRoom
            ref={roomRef}
            localStream={roomData.localStream}
            meetingData={roomData.meetingData}
            onLeave={() => setRoomData(null)}
          />
          {roomRef.current && (
            <EkycActionPanel
              remoteVideoRef={roomRef.current.remoteVideoRef}
              onOcrComplete={(r) => console.log("OCR:", r)}
              onLivenessComplete={(r) => console.log("Liveness:", r)}
              onFaceMatchComplete={(r) => console.log("FaceMatch:", r)}
            />
          )}
        </div>
      )}
    </EkycMeetingProvider>
  );
}
```

---

## Components

### 1. `EkycMeetingProvider`

Wraps the component tree. Initializes `ErmisService` and `EkycService` singletons.

```tsx
<EkycMeetingProvider
  ermisApiUrl="..."
  ekycApiUrl="..."
  ekycApiKey="..."
  meetingHostUrl="..."
  meetingNodeUrl="..."
  locale={enLocale}   // optional, defaults to Vietnamese
>
```

| Prop             | Type         | Description                              |
| ---------------- | ------------ | ---------------------------------------- |
| `ermisApiUrl`    | `string`     | Ermis management API URL                 |
| `ekycApiUrl`     | `string`     | eKYC API URL (OCR/Liveness/FaceMatch)    |
| `ekycApiKey`     | `string`     | API key for eKYC API                     |
| `meetingHostUrl` | `string`     | Meeting server URL                       |
| `meetingNodeUrl` | `string`     | Meeting node URL                         |
| `locale`         | `EkycLocale` | i18n locale object (default: `viLocale`) |

### 2. `EkycMeetingPreview`

Camera/mic test with a Join button. Auto-calls `joinWithCode` on mount.

```tsx
<EkycMeetingPreview
  joinCode="ABC-1234"
  onJoinMeeting={(data) => setRoomData(data)}
  onJoinError={(err) => console.error(err)}
/>
```

| Prop                  | Type                                  | Default     | Description                   |
| --------------------- | ------------------------------------- | ----------- | ----------------------------- |
| `joinCode`            | `string`                              | —           | Join code for this registrant |
| `onJoinMeeting`       | `(data: EkycPreviewJoinData) => void` | —           | Fired when user clicks Join   |
| `onJoinError`         | `(error: Error) => void`              | —           | Fired on joinWithCode failure |
| `showHeader`          | `boolean`                             | `true`      | Show title + description      |
| `showToggleButtons`   | `boolean`                             | `true`      | Show mic/camera toggles       |
| `showDeviceSelectors` | `boolean`                             | `true`      | Show device dropdowns         |
| `showAudioLevel`      | `boolean`                             | `true`      | Show audio level meter        |
| `headerTitle`         | `string`                              | from locale | Override title text           |
| `headerDescription`   | `string`                              | from locale | Override description text     |
| `joinButtonLabel`     | `string`                              | from locale | Override join button text     |
| `joiningLabel`        | `string`                              | from locale | Override "joining" text       |

### 3. `EkycMeetingRoom`

Video meeting room. Uses `forwardRef` to expose `remoteVideoRef` for eKYC capture.

```tsx
const roomRef = useRef<EkycMeetingRoomRef>(null);

<EkycMeetingRoom
  ref={roomRef}
  localStream={roomData.localStream}
  meetingData={roomData.meetingData}
  onLeave={() => navigate("/")}
/>;
```

| Prop           | Type                   | Default | Description                     |
| -------------- | ---------------------- | ------- | ------------------------------- |
| `localStream`  | `MediaStream`          | —       | Local media stream from preview |
| `meetingData`  | `JoinWithCodeResponse` | —       | Data from `joinWithCode` API    |
| `onLeave`      | `() => void`           | —       | Called when user leaves room    |
| `showControls` | `boolean`              | `true`  | Show bottom control bar         |
| `className`    | `string`               | —       | Custom CSS class                |

**Ref handle (`EkycMeetingRoomRef`):**

```ts
interface EkycMeetingRoomRef {
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}
```

### 4. `EkycActionPanel`

3-step eKYC flow panel (OCR → Liveness → FaceMatch). **Composable** — render it anywhere in your layout.

```tsx
<EkycActionPanel
  remoteVideoRef={roomRef.current.remoteVideoRef}
  onOcrComplete={(result) => sendToBackend("/ocr", result)}
  onLivenessComplete={(result) => sendToBackend("/liveness", result)}
  onFaceMatchComplete={(result) => sendToBackend("/facematch", result)}
  onEkycComplete={(result) => console.log("All done:", result.isVerified)}
/>
```

| Prop                  | Type                                  | Description                                     |
| --------------------- | ------------------------------------- | ----------------------------------------------- |
| `remoteVideoRef`      | `RefObject<HTMLVideoElement>`         | Ref to remote video (from `EkycMeetingRoomRef`) |
| `onOcrComplete`       | `(result: OcrResponse) => void`       | Per-step callback: OCR done                     |
| `onLivenessComplete`  | `(result: LivenessResponse) => void`  | Per-step callback: Liveness done                |
| `onFaceMatchComplete` | `(result: FaceMatchResponse) => void` | Per-step callback: FaceMatch done               |
| `onEkycComplete`      | `(result) => void`                    | All 3 steps completed                           |

---

## Composable Layout

`EkycActionPanel` is **detached** from `EkycMeetingRoom`, giving consumers full control:

```tsx
// Side panel (default)
<div style={{ display: "flex" }}>
  <EkycMeetingRoom ref={roomRef} ... />
  <EkycActionPanel remoteVideoRef={roomRef.current?.remoteVideoRef} ... />
</div>

// Drawer / Modal
<EkycMeetingRoom ref={roomRef} ... />
<Drawer open={showPanel}>
  <EkycActionPanel remoteVideoRef={roomRef.current?.remoteVideoRef} ... />
</Drawer>

// No panel at all (GUEST doesn't need eKYC)
<EkycMeetingRoom ref={roomRef} ... />
```

---

## i18n (Internationalization)

All UI text is translatable via locale objects.

### Usage

```tsx
import { EkycMeetingProvider, enLocale } from "ermis-ekyc-react";

// Use English
<EkycMeetingProvider locale={enLocale} ...>

// Default is Vietnamese (viLocale)
<EkycMeetingProvider ...>
```

### Custom Locale

```tsx
import type { EkycLocale } from "ermis-ekyc-react";

const jaLocale: EkycLocale = {
  preview: {
    title: "デバイスチェック",
    description: "セッション参加前にカメラとマイクをテスト",
    joinButton: "セッション参加",
    joining: "接続中...",
    cameraLabel: "カメラ",
    micLabel: "マイク",
    cameraOff: "カメラオフ",
  },
  room: { ... },
  panel: { ... },
};

<EkycMeetingProvider locale={jaLocale} ...>
```

### Available Locales

| Export     | Language             |
| ---------- | -------------------- |
| `viLocale` | Vietnamese (default) |
| `enLocale` | English              |

### Hooks

| Hook              | Return Type  | Description                                |
| ----------------- | ------------ | ------------------------------------------ |
| `useEkycLocale()` | `EkycLocale` | Access current locale in custom components |

---

## CSS Theming

All styles use CSS custom properties with sensible dark-theme defaults. Override to create your own theme.

### Usage

```css
/* Light theme */
:root {
  --ekyc-bg-primary: #ffffff;
  --ekyc-bg-secondary: #f8fafc;
  --ekyc-bg-tertiary: rgba(0, 0, 0, 0.05);
  --ekyc-text-primary: #1e293b;
  --ekyc-text-secondary: #64748b;
  --ekyc-text-muted: #94a3b8;
  --ekyc-border: rgba(0, 0, 0, 0.1);
  --ekyc-accent: #3b82f6;
  --ekyc-accent-hover: #2563eb;
  --ekyc-accent-text: #2563eb;
  --ekyc-accent-bg: rgba(59, 130, 246, 0.1);
  --ekyc-success: #22c55e;
  --ekyc-error: #ef4444;
  --ekyc-error-hover: #dc2626;
  --ekyc-radius: 12px;
  --ekyc-font-family: "Inter", sans-serif;
}
```

### Available CSS Variables

| Variable                 | Default                 | Purpose                  |
| ------------------------ | ----------------------- | ------------------------ |
| `--ekyc-bg-primary`      | `#0f172a`               | Main background          |
| `--ekyc-bg-secondary`    | `#1e293b`               | Cards, inputs, overlays  |
| `--ekyc-bg-tertiary`     | `rgba(148,163,184,0.1)` | Subtle backgrounds       |
| `--ekyc-bg-hover`        | `rgba(148,163,184,0.2)` | Hover state              |
| `--ekyc-bg-controls`     | `rgba(15,23,42,0.85)`   | Control bar              |
| `--ekyc-text-primary`    | `#e2e8f0`               | Primary text             |
| `--ekyc-text-secondary`  | `#94a3b8`               | Secondary text           |
| `--ekyc-text-muted`      | `#64748b`               | Muted text, labels       |
| `--ekyc-border`          | `rgba(148,163,184,0.1)` | Borders                  |
| `--ekyc-accent`          | `#6366f1`               | Primary accent / buttons |
| `--ekyc-accent-hover`    | `#4f46e5`               | Accent hover             |
| `--ekyc-accent-text`     | `#818cf8`               | Accent text              |
| `--ekyc-accent-bg`       | `rgba(99,102,241,0.15)` | Accent background        |
| `--ekyc-accent-border`   | `rgba(99,102,241,0.4)`  | Accent border            |
| `--ekyc-accent-gradient` | `linear-gradient(...)`  | Join button gradient     |
| `--ekyc-success`         | `#34d399`               | Pass / success           |
| `--ekyc-error`           | `#ef4444`               | Error / fail             |
| `--ekyc-error-hover`     | `#dc2626`               | Error hover              |
| `--ekyc-font-family`     | `Inter, ...`            | Font stack               |
| `--ekyc-radius`          | `12px`                  | Default border radius    |
| `--ekyc-radius-sm`       | `6px`                   | Small radius             |
| `--ekyc-radius-lg`       | `16px`                  | Large radius             |

---

## Data Flow

```
EkycMeetingPreview                EkycMeetingRoom              EkycActionPanel
┌────────────────┐              ┌─────────────────┐           ┌─────────────────┐
│ joinWithCode() │ onJoinMeeting│ authenticate()  │  ref      │ OCR             │
│ Camera/Mic     │ ────────────►│ joinRoom()      │──────────►│ Liveness        │
│ [Join Button]  │ JoinData     │ Video Grid      │ videoRef  │ Face Match      │
└────────────────┘              └─────────────────┘           └─────────────────┘
```

---

## Exports

| Export                 | Kind      | Description                           |
| ---------------------- | --------- | ------------------------------------- |
| `EkycMeetingProvider`  | Component | Provider (services + config + locale) |
| `EkycMeetingPreview`   | Component | Camera/mic preview + join flow        |
| `EkycMeetingRoom`      | Component | Video meeting room (forwardRef)       |
| `EkycActionPanel`      | Component | 3-step eKYC flow panel                |
| `useEkycMeetingConfig` | Hook      | Access config from Provider           |
| `useEkycLocale`        | Hook      | Access current locale                 |
| `useMediaPreview`      | Hook      | Manage camera/mic preview             |
| `viLocale`             | Object    | Vietnamese locale (default)           |
| `enLocale`             | Object    | English locale                        |
| `EkycLocale`           | Type      | Full locale interface                 |
| `EkycMeetingRoomRef`   | Type      | Ref handle for MeetingRoom            |
| `EkycPreviewJoinData`  | Type      | Data passed Preview → Room            |
| `EkycActionPanelProps` | Type      | Props for ActionPanel                 |
| `JoinWithCodeResponse` | Type      | Response from joinWithCode            |

## Peer Dependencies

```json
{
  "ermis-ekyc-sdk": "*",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```
