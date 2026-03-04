import { AxiosInstance } from "axios";
import { OcrRequest, OcrResponse } from "../types";
import { ensureBlob } from "../utils/base64";
import { handleApiError } from "../errors/errorHandler";

/**
 * OCR Service – Extract information from ID card images (CMND/CCCD).
 * Uses multipart/form-data to upload document images.
 */
export class OcrService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Submit front and back ID card images for OCR extraction.
   *
   * @param request - Document images and options
   * @returns Extracted document information
   * @throws {EkycError} When OCR fails
   */
  async performOcr(request: OcrRequest): Promise<OcrResponse> {
    try {
      const formData = new FormData();
      formData.append("document_front", ensureBlob(request.documentFront));
      if (request.documentBack) {
        formData.append("document_back", ensureBlob(request.documentBack));
      }
      formData.append("document_type", request.documentType ?? "CCCD");
      formData.append("extract_face", String(request.extractFace ?? true));
      formData.append("ocr_api", request.ocrApi ?? "advanced");

      const response = await this.httpClient.post<OcrResponse>(
        "/ocr",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error, "OCR");
    }
  }
}
