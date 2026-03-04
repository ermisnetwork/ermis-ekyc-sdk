import { AxiosInstance } from "axios";
import { FaceMatchRequest, FaceMatchResponse } from "../types";
import { ensureBlob } from "../utils/base64";
import { handleApiError } from "../errors/errorHandler";

/**
 * Face Match Service – Compare selfie with document photo.
 * Uses multipart/form-data to upload face images.
 */
export class FaceMatchService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Compare a selfie image with a document photo for identity verification.
   *
   * @param request - Selfie and document images with threshold
   * @returns Face comparison result with similarity score
   * @throws {EkycError} When face match fails
   */
  async matchFaces(request: FaceMatchRequest): Promise<FaceMatchResponse> {
    try {
      const formData = new FormData();
      formData.append("selfie_image", ensureBlob(request.selfieImage));
      formData.append("document_image", ensureBlob(request.documentImage));
      formData.append("threshold", request.threshold ?? "0.6");

      const response = await this.httpClient.post<FaceMatchResponse>(
        "/face-match",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error, "FACE_MATCH");
    }
  }
}
