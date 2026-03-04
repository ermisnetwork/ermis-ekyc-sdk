import { AxiosInstance } from "axios";
import { LivenessRequest, LivenessResponse } from "../types";
import { ensureBlob } from "../utils/base64";
import { handleApiError } from "../errors/errorHandler";

/**
 * Liveness Service – Verify live person detection.
 * Uses multipart/form-data to upload selfie images.
 */
export class LivenessService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Submit a selfie image for liveness detection.
   *
   * @param request - Selfie image and detection options
   * @returns Liveness detection result with detailed checks
   * @throws {EkycError} When liveness detection fails
   */
  async checkLiveness(request: LivenessRequest): Promise<LivenessResponse> {
    try {
      const formData = new FormData();
      formData.append("images", ensureBlob(request.images));
      formData.append("mode", request.mode ?? "passive");
      formData.append("challenge", request.challenge ?? "blink");

      const response = await this.httpClient.post<LivenessResponse>(
        "/liveness",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error, "LIVENESS");
    }
  }
}
