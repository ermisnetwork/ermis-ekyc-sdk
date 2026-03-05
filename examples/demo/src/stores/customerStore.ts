import { create } from "zustand";
import { ErmisService } from "ermis-ekyc-sdk";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "ermis-ekyc-sdk";

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  meta: Record<string, unknown>;
}

interface CustomerActions {
  fetchCustomers: () => Promise<void>;
  createCustomer: (data: CreateCustomerRequest) => Promise<void>;
  updateCustomer: (id: string, data: UpdateCustomerRequest) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState & CustomerActions>(
  (set) => ({
    customers: [],
    selectedCustomer: null,
    isLoading: false,
    error: null,
    meta: {},

    fetchCustomers: async () => {
      set({ isLoading: true, error: null });
      try {
        const ermis = ErmisService.getInstance();
        const result = await ermis.customers.getCustomers();
        set({ customers: result.data, meta: result.meta, isLoading: false });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load customers";
        set({ error: message, isLoading: false });
      }
    },

    createCustomer: async (data: CreateCustomerRequest) => {
      set({ isLoading: true, error: null });
      try {
        const ermis = ErmisService.getInstance();
        const newCustomer = await ermis.customers.createCustomer(data);
        set((state) => ({
          customers: [newCustomer, ...state.customers],
          isLoading: false,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create customer";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    updateCustomer: async (id: string, data: UpdateCustomerRequest) => {
      set({ isLoading: true, error: null });
      try {
        const ermis = ErmisService.getInstance();
        const updated = await ermis.customers.updateCustomer(id, data);
        set((state) => ({
          customers: state.customers.map((c) => (c._id === id ? updated : c)),
          selectedCustomer:
            state.selectedCustomer?._id === id
              ? updated
              : state.selectedCustomer,
          isLoading: false,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update customer";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

    clearError: () => set({ error: null }),
  }),
);
