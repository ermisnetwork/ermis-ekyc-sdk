// ============================================================
// Types for joinWithCode API response
// ============================================================

/** Room information from the meeting system */
export interface MeetingRoomInfo {
  id: string;
  name: string;
  status: string;
  code: string;
}

/** Registrant information for the current participant */
export interface MeetingRegistrantInfo {
  id: string;
  authId: string;
  firstName: string;
  lastName: string;
  role: "HOST" | "GUEST";
}

/** Meeting (appraisal session) metadata */
export interface MeetingInfo {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  ermisRoomCode: string;
  ermisRoomId: string;
  ermisRoomName: string;
}

/** Full response from the `joinWithCode` API */
export interface JoinWithCodeResponse {
  meetingToken: string;
  apiHost: string;
  meetingNode: string;
  room: MeetingRoomInfo;
  registrant: MeetingRegistrantInfo;
  meeting: MeetingInfo;
}
