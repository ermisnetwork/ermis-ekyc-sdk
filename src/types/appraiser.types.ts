// ============================================================
// Appraiser (Auditor) Types – List, Create
// ============================================================

export interface Appraiser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppraiserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
}
