import { EkycError, EkycErrorCode } from "./errors/EkycError";
import { TokenHttpClient, TokenHttpClientConfig } from "./http/tokenHttpClient";
import { AuthService } from "./services/authService";
import { CustomerService } from "./services/customerService";
import { AppraiserService } from "./services/appraiserService";

/**
 * ErmisService – Main class for authenticated API operations.
 *
 * Manages Auth, Customer, and Appraiser modules using
 * Bearer token authentication. Works alongside `EkycService`
 * (which uses API key authentication).
 *
 * Uses the **Singleton pattern** to ensure only one instance
 * exists throughout the entire application.
 *
 * @example
 * ```typescript
 * // Initialize the service
 * const ermis = ErmisService.getInstance({
 *   baseUrl: 'https://api.example.com',
 * });
 *
 * // Login
 * const authResult = await ermis.auth.login({
 *   username: 'admin',
 *   password: 'password',
 * });
 *
 * // Set the token after login
 * ermis.setToken(authResult.access_token);
 *
 * // Use authenticated APIs
 * const { data: customers } = await ermis.customers.getCustomers();
 * const { data: appraisers } = await ermis.appraisers.getAppraisers();
 * ```
 */
export class ErmisService {
  // ── Singleton ──────────────────────────────────────────────
  private static instance: ErmisService | null = null;

  private readonly tokenHttpClient: TokenHttpClient;

  /** Auth service – login, register, logout */
  public readonly auth: AuthService;

  /** Customer service – CRUD operations */
  public readonly customers: CustomerService;

  /** Appraiser service – list and create */
  public readonly appraisers: AppraiserService;

  // ── Private Constructor ────────────────────────────────────
  private constructor(config: TokenHttpClientConfig) {
    this.validateConfig(config);

    this.tokenHttpClient = new TokenHttpClient(config);
    const client = this.tokenHttpClient.getClient();

    this.auth = new AuthService(client);
    this.customers = new CustomerService(client);
    this.appraisers = new AppraiserService(client);
  }

  // ── Singleton Access ───────────────────────────────────────

  /**
   * Get the singleton instance of ErmisService.
   * If no instance exists, a new one will be created with the provided config.
   *
   * @param config - Service configuration (required on first call)
   * @returns The singleton instance of ErmisService
   * @throws {EkycError} When called for the first time without config
   */
  public static getInstance(config?: TokenHttpClientConfig): ErmisService {
    if (!ErmisService.instance) {
      if (!config) {
        throw new EkycError(
          "ErmisService has not been initialized. Please provide a config on the first call.",
          EkycErrorCode.INVALID_CONFIG,
        );
      }
      ErmisService.instance = new ErmisService(config);
    }

    return ErmisService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing or reconfiguration).
   */
  public static resetInstance(): void {
    ErmisService.instance = null;
  }

  // ── Token Management ───────────────────────────────────────

  /**
   * Set the authentication token (call after successful login).
   *
   * @param token - The access token from the login response
   */
  public setToken(token: string): void {
    this.tokenHttpClient.setToken(token);
  }

  /**
   * Clear the authentication token (call on logout).
   */
  public clearToken(): void {
    this.tokenHttpClient.clearToken();
  }

  // ── Validation ─────────────────────────────────────────────

  private validateConfig(config: TokenHttpClientConfig): void {
    if (!config.baseUrl || typeof config.baseUrl !== "string") {
      throw new EkycError(
        "baseUrl is required and must be a valid string.",
        EkycErrorCode.INVALID_CONFIG,
      );
    }

    if (
      config.timeout !== undefined &&
      (typeof config.timeout !== "number" || config.timeout <= 0)
    ) {
      throw new EkycError(
        "timeout must be a positive number (in ms).",
        EkycErrorCode.INVALID_CONFIG,
      );
    }
  }
}
