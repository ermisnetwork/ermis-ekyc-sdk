import { AxiosInstance } from "axios";
import {
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  MeetingRegistrant,
  CreateRegistrantRequest,
  UpdateRegistrantRequest,
  SetupMeetingRequest,
  SetupMeetingResult,
} from "../types/meeting.types";
import { handleApiError } from "../errors/errorHandler";
import { EkycError, EkycErrorCode } from "../errors/EkycError";

/**
 * Meeting Service – CRUD operations for appraisal sessions.
 */
export class MeetingService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  // ── Meetings ─────────────────────────────────────────────

  /**
   * Get all meetings with pagination metadata.
   */
  async getMeetings(): Promise<{
    data: Meeting[];
    meta: Record<string, unknown>;
  }> {
    try {
      const response = await this.httpClient.get("/meet");
      const raw = response.data;

      let meetings: Meeting[] = [];
      let meta: Record<string, unknown> = {};

      if (Array.isArray(raw)) {
        meetings = raw;
      } else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) {
          meetings = raw.data;
          meta = (raw.meta as Record<string, unknown>) || {};
        } else if (
          raw.data &&
          typeof raw.data === "object" &&
          Array.isArray(raw.data.data)
        ) {
          meetings = raw.data.data;
          meta = (raw.data.meta as Record<string, unknown>) || {};
        }
      }

      return { data: meetings, meta };
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  /**
   * Get a single meeting by ID.
   */
  async getMeetingById(id: string): Promise<Meeting> {
    try {
      const response = await this.httpClient.get<Meeting>(`/meet/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  /**
   * Create a new meeting (internal – use `setupMeeting` instead).
   */
  private async createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
    try {
      const response = await this.httpClient.post<{ data: Meeting }>("/meet", {
        ...data,
        isPublic: true,
        recordingEnabled: true,
      });
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  /**
   * Update an existing meeting.
   */
  async updateMeeting(
    id: string,
    data: UpdateMeetingRequest,
  ): Promise<Meeting> {
    try {
      const response = await this.httpClient.put<{ data: Meeting }>(
        `/meet/${id}`,
        data,
      );
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  // ── Registrants ──────────────────────────────────────────

  /**
   * Get all registrants for a meeting.
   */
  async getRegistrants(meetingId: string): Promise<MeetingRegistrant[]> {
    try {
      const response = await this.httpClient.get(
        `/meet/${meetingId}/registrants`,
      );
      const raw = response.data;

      // Handle various API response shapes
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) return raw.data;
        if (
          raw.data &&
          typeof raw.data === "object" &&
          Array.isArray(raw.data.data)
        ) {
          return raw.data.data;
        }
      }
      return [];
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  /**
   * Create a registrant for a meeting (internal – use `setupMeeting` instead).
   */
  private async createRegistrant(
    meetingId: string,
    data: CreateRegistrantRequest & { authId: string },
  ): Promise<MeetingRegistrant> {
    try {
      const response = await this.httpClient.post<{ data: MeetingRegistrant }>(
        `/meet/${meetingId}/registrants`,
        data,
      );
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  /**
   * Update a registrant.
   */
  async updateRegistrant(
    meetingId: string,
    registrantId: string,
    data: UpdateRegistrantRequest,
  ): Promise<MeetingRegistrant> {
    try {
      const response = await this.httpClient.put<{ data: MeetingRegistrant }>(
        `/meet/${meetingId}/registrants/${registrantId}`,
        data,
      );
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  // ── Setup Meeting (atomic session creation) ──────────────

  /**
   * Create a complete appraisal session in one call.
   *
   * This method **enforces** two business rules:
   * 1. Both the meeting and registrants must be provided.
   * 2. Exactly 2 registrants are required – one with role `HOST`
   *    and one with role `GUEST`.
   *
   * Internally it calls:
   *   - `POST /meet` (create meeting)
   *   - `POST /meet/:id/registrants` × 2 (create both registrants)
   *
   * @throws {EkycError} INVALID_REGISTRANTS – when registrant rules are violated
   */
  async setupMeeting(
    request: SetupMeetingRequest,
  ): Promise<SetupMeetingResult> {
    // ── Validate registrants ──────────────────────────────
    const { meeting: meetingData, registrants } = request;

    if (!registrants || registrants.length !== 2) {
      throw new EkycError(
        "setupMeeting yêu cầu chính xác 2 registrants (1 HOST, 1 GUEST).",
        EkycErrorCode.INVALID_REGISTRANTS,
      );
    }

    const roles = registrants.map((r) => r.role);
    const hasHost = roles.includes("HOST");
    const hasGuest = roles.includes("GUEST");

    if (!hasHost || !hasGuest) {
      throw new EkycError(
        `setupMeeting yêu cầu đúng 1 HOST và 1 GUEST. Nhận được: [${roles.join(", ")}].`,
        EkycErrorCode.INVALID_REGISTRANTS,
      );
    }

    // ── Step 1: Create meeting ────────────────────────────
    try {
      const meeting = await this.createMeeting(meetingData);

      // ── Step 2: Create both registrants ─────────────────
      const createdRegistrants = await Promise.all(
        registrants.map((reg) => {
          const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          return this.createRegistrant(meeting._id, { ...reg, authId });
        }),
      );

      return { meeting, registrants: createdRegistrants };
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }

  /**
   * Join a meeting with a join code.
   */
  async joinWithCode(joinCode: string): Promise<unknown> {
    try {
      const response = await this.httpClient.post("/meet/join-with-code", {
        joinCode,
      });
      return (response.data as any).data;
    } catch (error: unknown) {
      throw handleApiError(error, "MEETING");
    }
  }
}
