import { AxiosInstance } from "axios";
import { Appraiser, CreateAppraiserRequest } from "../types/appraiser.types";
import { handleApiError } from "../errors/errorHandler";

/**
 * Appraiser Service – List and create appraisers (auditors).
 */
export class AppraiserService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Get all appraisers with pagination metadata.
   *
   * @returns Appraiser list and pagination info
   * @throws {EkycError} When request fails
   */
  async getAppraisers(): Promise<{
    data: Appraiser[];
    meta: Record<string, unknown>;
  }> {
    try {
      const response = await this.httpClient.get("/appraisers");
      const raw = response.data;

      let appraisers: Appraiser[] = [];
      let meta: Record<string, unknown> = {};

      if (Array.isArray(raw)) {
        appraisers = raw;
      } else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) {
          appraisers = raw.data;
          meta = (raw.meta as Record<string, unknown>) || {};
        } else if (
          raw.data &&
          typeof raw.data === "object" &&
          Array.isArray(raw.data.data)
        ) {
          appraisers = raw.data.data;
          meta = (raw.data.meta as Record<string, unknown>) || {};
        }
      }

      return { data: appraisers, meta };
    } catch (error: unknown) {
      throw handleApiError(error, "APPRAISER");
    }
  }

  /**
   * Create a new appraiser.
   *
   * @param data - Appraiser creation data
   * @returns Created appraiser
   * @throws {EkycError} When request fails
   */
  async createAppraiser(data: CreateAppraiserRequest): Promise<Appraiser> {
    try {
      const response = await this.httpClient.post<{ data: Appraiser }>(
        "/appraisers",
        data,
      );
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "APPRAISER");
    }
  }
}
