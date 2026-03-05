import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { handleApiError } from "../errors/errorHandler";

/**
 * Configuration for the token-based HTTP client.
 */
export interface TokenHttpClientConfig {
  /** Base URL of the API server */
  baseUrl: string;

  /** Request timeout in milliseconds, defaults to 30000 */
  timeout?: number;
}

/**
 * Token-based HTTP client for authenticated API calls.
 *
 * Unlike `createHttpClient` (which uses a static API key),
 * this client uses `Authorization: Bearer <token>` and allows
 * the token to be set/cleared dynamically after login/logout.
 */
export class TokenHttpClient {
  private readonly client: AxiosInstance;
  private token: string | null = null;

  constructor(config: TokenHttpClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? 30_000,
    });

    // ── Request Interceptor ──────────────────────────────────
    // Attach Bearer token to every request (if available)
    this.client.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        if (this.token) {
          requestConfig.headers.set("Authorization", `Bearer ${this.token}`);
        }
        return requestConfig;
      },
      (error: unknown) => {
        return Promise.reject(handleApiError(error));
      },
    );

    // ── Response Interceptor ─────────────────────────────────
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: unknown) => {
        return Promise.reject(handleApiError(error));
      },
    );
  }

  /**
   * Set the authentication token (after login).
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the authentication token (on logout).
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Get the underlying Axios instance for use by services.
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}
