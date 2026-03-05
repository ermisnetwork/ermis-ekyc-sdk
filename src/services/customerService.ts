import { AxiosInstance } from "axios";
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/customer.types";
import { handleApiError } from "../errors/errorHandler";

/**
 * Customer Service – CRUD operations for customer management.
 * Uses multipart/form-data for requests that include ID card images.
 */
export class CustomerService {
  private readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Get all customers with pagination metadata.
   *
   * @returns Customer list and pagination info
   * @throws {EkycError} When request fails
   */
  async getCustomers(): Promise<{
    data: Customer[];
    meta: Record<string, unknown>;
  }> {
    try {
      const response = await this.httpClient.get("/customers");
      const raw = response.data;

      // Handle various response formats:
      // 1. Direct array: [...]
      // 2. Wrapped: { data: [...] }
      // 3. Double-wrapped: { data: { data: [...] } }
      let customers: Customer[] = [];
      let meta: Record<string, unknown> = {};

      if (Array.isArray(raw)) {
        customers = raw;
      } else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) {
          customers = raw.data;
          meta = (raw.meta as Record<string, unknown>) || {};
        } else if (
          raw.data &&
          typeof raw.data === "object" &&
          Array.isArray(raw.data.data)
        ) {
          customers = raw.data.data;
          meta = (raw.data.meta as Record<string, unknown>) || {};
        }
      }

      return { data: customers, meta };
    } catch (error: unknown) {
      throw handleApiError(error, "CUSTOMER");
    }
  }

  /**
   * Get a single customer by ID.
   *
   * @param id - Customer ID
   * @returns Customer details
   * @throws {EkycError} When request fails
   */
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await this.httpClient.get<Customer>(`/customers/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error, "CUSTOMER");
    }
  }

  /**
   * Create a new customer with ID card images (multipart/form-data).
   *
   * @param data - Customer creation data
   * @returns Created customer
   * @throws {EkycError} When request fails
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("dateOfBirth", data.dateOfBirth);
      formData.append("identityNumber", data.identityNumber);
      formData.append("placeOfOrigin", data.placeOfOrigin);
      formData.append("issueDate", data.issueDate);
      formData.append("issuePlace", data.issuePlace);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("address", data.address);
      formData.append("occupation", data.occupation);
      formData.append("monthlyIncome", data.monthlyIncome.toString());
      formData.append("loanAmount", data.loanAmount.toString());
      formData.append("loanTerm", data.loanTerm.toString());

      if (data.frontIdImage) {
        formData.append("frontIdImage", data.frontIdImage);
      }
      if (data.backIdImage) {
        formData.append("backIdImage", data.backIdImage);
      }

      const response = await this.httpClient.post<{ data: Customer }>(
        "/customers",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "CUSTOMER");
    }
  }

  /**
   * Update an existing customer (multipart/form-data).
   *
   * @param id - Customer ID
   * @param data - Fields to update
   * @returns Updated customer
   * @throws {EkycError} When request fails
   */
  async updateCustomer(
    id: string,
    data: UpdateCustomerRequest,
  ): Promise<Customer> {
    try {
      const formData = new FormData();

      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
      if (data.identityNumber)
        formData.append("identityNumber", data.identityNumber);
      if (data.placeOfOrigin)
        formData.append("placeOfOrigin", data.placeOfOrigin);
      if (data.issueDate) formData.append("issueDate", data.issueDate);
      if (data.issuePlace) formData.append("issuePlace", data.issuePlace);
      if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
      if (data.address) formData.append("address", data.address);
      if (data.occupation) formData.append("occupation", data.occupation);
      if (data.monthlyIncome !== undefined)
        formData.append("monthlyIncome", data.monthlyIncome.toString());
      if (data.loanAmount !== undefined)
        formData.append("loanAmount", data.loanAmount.toString());
      if (data.loanTerm !== undefined)
        formData.append("loanTerm", data.loanTerm.toString());
      if (data.status) formData.append("status", data.status);

      if (data.frontIdImage) {
        formData.append("frontIdImage", data.frontIdImage);
      }
      if (data.backIdImage) {
        formData.append("backIdImage", data.backIdImage);
      }
      if (data.currentLocation) {
        formData.append(
          "currentLocation",
          JSON.stringify(data.currentLocation),
        );
      }

      const response = await this.httpClient.put<{ data: Customer }>(
        `/customers/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.data;
    } catch (error: unknown) {
      throw handleApiError(error, "CUSTOMER");
    }
  }
}
