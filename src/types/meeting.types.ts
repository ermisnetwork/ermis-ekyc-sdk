// ============================================================
// Meeting (Appraisal Session) Types
// ============================================================

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recordingEnabled: boolean;
  isPublic: boolean;
  location?: string;
  ermisRoomCode?: string;
  ermisRoomId?: string;
  ermisRoomName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingRequest {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isPublic?: boolean;
  recordingEnabled?: boolean;
}

export interface MeetingRegistrant {
  _id: string;
  meetingId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  authId: string;
  joinCode: string;
  personalJoinLink: string;
  role: "GUEST" | "HOST";
  status: "active" | "inactive";
  type?: "CUSTOMER" | "APPRAISER";
  objectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistrantRequest {
  objectId: string;
  type: "CUSTOMER" | "APPRAISER";
  role: "GUEST" | "HOST";
}

export interface UpdateRegistrantRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

// ── Setup Meeting (atomic session creation) ──────────────────

/**
 * Request payload for `setupMeeting`.
 * Bundles meeting info + exactly 2 registrants (HOST, GUEST).
 */
export interface SetupMeetingRequest {
  /** Meeting metadata (title, time, etc.) */
  meeting: CreateMeetingRequest;
  /**
   * Exactly 2 registrants – one HOST and one GUEST.
   * The SDK validates this at runtime.
   */
  registrants: [CreateRegistrantRequest, CreateRegistrantRequest];
}

/**
 * Result returned by `setupMeeting`.
 */
export interface SetupMeetingResult {
  meeting: Meeting;
  registrants: MeetingRegistrant[];
}
