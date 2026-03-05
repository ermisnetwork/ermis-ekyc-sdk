import { AxiosInstance } from "axios";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";
import { handleApiError } from "../errors/errorHandler";

/**
 * Auth Service – Login, Register, Logout.
 * Uses token-based HTTP client for authentication endpoints.
 */
export class AuthService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Login with username and password.
   *
   * @param data - Login credentials
   * @returns Auth response with access_token and user info
   * @throws {EkycError} When login fails
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.httpClient.post<
        AuthResponse | { data: AuthResponse }
      >("/auth/login", data);
      // Handle both direct { access_token, user } and wrapped { data: { access_token, user } } formats
      const raw = response.data as Record<string, unknown>;
      if (raw.access_token) {
        return raw as unknown as AuthResponse;
      }
      if (raw.data && typeof raw.data === "object") {
        return raw.data as AuthResponse;
      }
      return response.data as AuthResponse;
    } catch (error: unknown) {
      throw handleApiError(error, "AUTH");
    }
  }

  /**
   * Register a new user account.
   *
   * @param data - Registration data
   * @returns Auth response with access_token and user info
   * @throws {EkycError} When registration fails
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.httpClient.post<AuthResponse>(
        "/auth/register",
        data,
      );
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error, "AUTH");
    }
  }

  /**
   * Logout – clears client-side token.
   */
  async logout(): Promise<void> {
    // Server-side logout can be added here if needed
  }
}
