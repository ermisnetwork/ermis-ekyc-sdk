// ============================================================
// Customer Types – CRUD, Loan Info, ID Images
// ============================================================

export interface CurrentLocation {
  lat: number;
  lng: number;
}

export interface Customer {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  identityNumber: string;
  placeOfOrigin: string;
  issueDate: string;
  issuePlace: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  loanAmount: number;
  loanTerm: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS";
  frontIdImage?: string;
  backIdImage?: string;
  currentLocation?: CurrentLocation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  dateOfBirth: string;
  identityNumber: string;
  placeOfOrigin: string;
  issueDate: string;
  issuePlace: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  loanAmount: number;
  loanTerm: number;
  frontIdImage?: File;
  backIdImage?: File;
}

export interface UpdateCustomerRequest {
  fullName?: string;
  dateOfBirth?: string;
  identityNumber?: string;
  placeOfOrigin?: string;
  issueDate?: string;
  issuePlace?: string;
  phoneNumber?: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
  loanAmount?: number;
  loanTerm?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS";
  frontIdImage?: File;
  backIdImage?: File;
  currentLocation?: CurrentLocation;
}
