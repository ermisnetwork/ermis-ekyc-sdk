---
sidebar_position: 4
---

# Error Handling

All errors from the SDK are wrapped in the `EkycError` class with structured error codes.

## Usage

```typescript
import { EkycError, EkycErrorCode } from 'ermis-ekyc-sdk';

try {
  const result = await ekyc.performOcr({ ... });
} catch (error) {
  if (error instanceof EkycError) {
    console.error(error.code);       // EkycErrorCode enum
    console.error(error.message);    // Human-readable message
    console.error(error.statusCode); // HTTP status code (if available)
    console.error(error.details);    // Additional API response details
    console.error(error.timestamp);  // When the error occurred

    // Serialize for logging
    console.log(JSON.stringify(error.toJSON()));
  }
}
```

## Error Codes

| Code                    | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `NETWORK_ERROR`         | Network connectivity issues (no connection, DNS failure)  |
| `TIMEOUT_ERROR`         | Request timeout                                           |
| `AUTHENTICATION_FAILED` | Invalid credentials or API key                            |
| `INVALID_CONFIG`        | Invalid SDK configuration (missing baseUrl, apiKey)       |
| `INVALID_REGISTRANTS`   | Invalid registrants in `setupMeeting` (wrong count/roles) |
| `OCR_FAILED`            | OCR document extraction failed                            |
| `LIVENESS_FAILED`       | Liveness detection failed                                 |
| `FACE_MATCH_FAILED`     | Face comparison failed                                    |
| `UNKNOWN`               | Unexpected error                                          |

## Handling Specific Errors

```typescript
try {
  const session = await ermis.meetings.setupMeeting({ ... });
} catch (error) {
  if (error instanceof EkycError) {
    switch (error.code) {
      case EkycErrorCode.INVALID_REGISTRANTS:
        console.error('Must have exactly 1 HOST and 1 GUEST');
        break;
      case EkycErrorCode.AUTHENTICATION_FAILED:
        console.error('Token expired, please login again');
        break;
      case EkycErrorCode.NETWORK_ERROR:
        console.error('Check your internet connection');
        break;
      default:
        console.error('Unexpected error:', error.message);
    }
  }
}
```

## Error Properties

| Property     | Type                                   | Description            |
| ------------ | -------------------------------------- | ---------------------- |
| `code`       | `EkycErrorCode`                        | Classified error code  |
| `message`    | `string`                               | Human-readable message |
| `statusCode` | `number \| undefined`                  | HTTP status code       |
| `details`    | `Record<string, unknown> \| undefined` | API response details   |
| `timestamp`  | `string`                               | ISO 8601 timestamp     |
