---
sidebar_position: 2
---

# EkycMeetingProvider

The root provider component that initializes `ErmisService` and `EkycService` singletons and provides meeting configuration to all child components.

## Usage

```tsx
import { EkycMeetingProvider, enLocale } from "ermis-ekyc-react";

<EkycMeetingProvider
  ermisApiUrl="https://api-ekyc.ermis.network"
  ekycApiUrl="https://ekyc-api.ktssolution.com/api/ekyc"
  ekycApiKey="your-api-key"
  meetingHostUrl="https://meet.ermis.network"
  meetingNodeUrl="https://node.ermis.network"
  locale={enLocale} // optional, defaults to Vietnamese
>
  {/* Your components here */}
</EkycMeetingProvider>;
```

:::warning
Must be rendered **before** any `EkycMeetingPreview`, `EkycMeetingRoom`, or `EkycActionPanel`.
:::

## Props

| Prop             | Type         | Required | Description                           |
| ---------------- | ------------ | -------- | ------------------------------------- |
| `ermisApiUrl`    | `string`     | ✅       | Ermis management API URL              |
| `ekycApiUrl`     | `string`     | ✅       | eKYC API URL                          |
| `ekycApiKey`     | `string`     | ✅       | eKYC API key                          |
| `meetingHostUrl` | `string`     | ✅       | Meeting server URL                    |
| `meetingNodeUrl` | `string`     | ✅       | Meeting node URL                      |
| `locale`         | `EkycLocale` | ❌       | Locale for i18n (default: `viLocale`) |
| `children`       | `ReactNode`  | ✅       | Child components                      |

## Hooks

### `useEkycMeetingConfig()`

Access the meeting configuration from anywhere within the provider:

```typescript
import { useEkycMeetingConfig } from "ermis-ekyc-react";

const { meetingHostUrl, meetingNodeUrl, locale } = useEkycMeetingConfig();
```

### `useEkycLocale()`

Access the current locale:

```typescript
import { useEkycLocale } from "ermis-ekyc-react";

const locale = useEkycLocale();
console.log(locale.preview.title); // "Device Check" or "Kiểm tra thiết bị"
```
