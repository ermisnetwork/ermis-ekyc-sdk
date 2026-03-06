import { create } from "zustand";
import { ErmisService } from "ermis-ekyc-sdk";
import type {
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  MeetingRegistrant,
  UpdateRegistrantRequest,
} from "ermis-ekyc-sdk";

interface MeetingState {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  meta: Record<string, unknown>;
}

interface MeetingActions {
  fetchMeetings: () => Promise<void>;
  createFullSession: (
    meetingData: CreateMeetingRequest,
    appraiser: { objectId: string },
    customer: { objectId: string },
  ) => Promise<void>;
  /** Update meeting info */
  updateMeeting: (id: string, data: UpdateMeetingRequest) => Promise<Meeting>;
  /** Fetch registrants for a specific meeting */
  fetchRegistrants: (meetingId: string) => Promise<MeetingRegistrant[]>;
  /** Update a registrant */
  updateRegistrant: (
    meetingId: string,
    registrantId: string,
    data: UpdateRegistrantRequest,
  ) => Promise<MeetingRegistrant>;
  clearError: () => void;
}

export const useMeetingStore = create<MeetingState & MeetingActions>((set) => ({
  meetings: [],
  isLoading: false,
  error: null,
  meta: {},

  fetchMeetings: async () => {
    set({ isLoading: true, error: null });
    try {
      const ermis = ErmisService.getInstance();
      const result = await ermis.meetings.getMeetings();
      set({ meetings: result.data, meta: result.meta, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load meetings";
      set({ error: message, isLoading: false });
    }
  },

  createFullSession: async (meetingData, appraiser, customer) => {
    set({ isLoading: true, error: null });
    try {
      const ermis = ErmisService.getInstance();
      const result = await ermis.meetings.setupMeeting({
        meeting: meetingData,
        registrants: [
          {
            objectId: appraiser.objectId,
            type: "APPRAISER",
            role: "HOST",
          },
          {
            objectId: customer.objectId,
            type: "CUSTOMER",
            role: "GUEST",
          },
        ],
      });
      set((state) => ({
        meetings: [result.meeting, ...state.meetings],
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create appraisal session";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateMeeting: async (id, data) => {
    const ermis = ErmisService.getInstance();
    const updated = await ermis.meetings.updateMeeting(id, data);
    // Update in local list
    set((state) => ({
      meetings: state.meetings.map((m) => (m._id === id ? updated : m)),
    }));
    return updated;
  },

  fetchRegistrants: async (meetingId) => {
    const ermis = ErmisService.getInstance();
    return ermis.meetings.getRegistrants(meetingId);
  },

  updateRegistrant: async (meetingId, registrantId, data) => {
    const ermis = ErmisService.getInstance();
    return ermis.meetings.updateRegistrant(meetingId, registrantId, data);
  },

  clearError: () => set({ error: null }),
}));
