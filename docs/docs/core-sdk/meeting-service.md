---
sidebar_position: 3
---

# Meeting Service

The Meeting Service manages appraisal sessions, registrants, and room codes for video eKYC sessions.

## Setup Meeting

The recommended way to create appraisal sessions. Creates a meeting + 2 registrants atomically.

```typescript
const session = await ermis.meetings.setupMeeting({
  meeting: {
    title: "eKYC Session - Nguyen Van A",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    location: "Online",
    description: "Verification session", // optional
  },
  registrants: [
    { objectId: appraiserId, type: "APPRAISER", role: "HOST" },
    { objectId: customerId, type: "CUSTOMER", role: "GUEST" },
  ],
});
```

:::warning Business Rules

- Exactly **2 registrants** required
- Must have exactly **1 HOST** and **1 GUEST**
- HOST must be an `APPRAISER`, GUEST must be a `CUSTOMER`
  :::

### Result

```typescript
session.meeting._id; // Meeting ID
session.registrants[0].joinCode; // Room code for joining
session.registrants[0].role; // "HOST" or "GUEST"
```

Each registrant receives a unique `joinCode` used to join the video session.

## API Reference

| Method                                            | Description                                   |
| ------------------------------------------------- | --------------------------------------------- |
| `setupMeeting(request)`                           | Create session + 2 registrants in one call    |
| `getMeetings()`                                   | List all sessions                             |
| `getMeetingById(id)`                              | Get session details                           |
| `updateMeeting(id, data)`                         | Update session                                |
| `getRegistrants(meetingId)`                       | List registrants for a session                |
| `updateRegistrant(meetingId, registrantId, data)` | Update registrant info                        |
| `joinWithCode(joinCode)`                          | Join session with room code (public, no auth) |

## Join with Code

This is a public endpoint (no authentication required) used by the React UI to join a video session:

```typescript
const response = await ermis.meetings.joinWithCode("ABC123");

console.log(response.meeting); // Meeting info
console.log(response.registrant); // Registrant info
console.log(response.roomInfo); // Room connection details
```

The `joinCode` is passed to `EkycMeetingPreview` in the React SDK to initiate the video call.

## Types

### SetupMeetingRequest

```typescript
interface SetupMeetingRequest {
  meeting: {
    title: string;
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    location: string;
    description?: string;
  };
  registrants: Array<{
    objectId: string; // Customer or Appraiser _id
    type: "CUSTOMER" | "APPRAISER";
    role: "HOST" | "GUEST";
  }>;
}
```

### SetupMeetingResult

```typescript
interface SetupMeetingResult {
  meeting: Meeting;
  registrants: MeetingRegistrant[];
}

interface MeetingRegistrant {
  _id: string;
  joinCode: string;
  role: "HOST" | "GUEST";
  type: "CUSTOMER" | "APPRAISER";
  objectId: string;
}
```
