import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { EkycConfig } from "../types";
import { handleApiError } from "../errors/errorHandler";

/**
 * Create a configured Axios instance for the eKYC SDK.
 *
 * - Automatically attaches the API key via `x-api-key` header
 * - Supports both JSON and multipart/form-data requests
 * - Centralized error handling via response interceptor
 *
 * @param config - SDK configuration
 * @returns Configured Axios instance
 */
export function createHttpClient(config: EkycConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout ?? 30_000,
  });

  // ── Request Interceptor ──────────────────────────────────
  // Attach API key to every request
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      requestConfig.headers.set("x-api-key", config.apiKey);
      return requestConfig;
    },
    (error: unknown) => {
      return Promise.reject(handleApiError(error));
    },
  );

  // ── Response Interceptor ─────────────────────────────────
  // Pass through successful responses, wrap errors into EkycError
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: unknown) => {
      return Promise.reject(handleApiError(error));
    },
  );

  return client;
}
