// ============================================================
// EkycLocale – i18n type definitions
// ============================================================

export interface EkycLocale {
  preview: EkycPreviewLocale;
  room: EkycRoomLocale;
  panel: EkycPanelLocale;
}

export interface EkycPreviewLocale {
  title: string;
  description: string;
  joinButton: string;
  joining: string;
  cameraLabel: string;
  micLabel: string;
  cameraOff: string;
}

export interface EkycRoomLocale {
  connecting: string;
  hostLabel: string;
  guestLabel: string;
  you: string;
  leaveButton: string;
}

export interface EkycPanelLocale {
  title: string;
  reset: string;

  // Step titles
  ocrTitle: string;
  livenessTitle: string;
  faceMatchTitle: string;
  faceMatchDesc: string;

  // Document types
  docCccd: string;
  docPassport: string;

  // Capture
  frontSide: string;
  backSide: string;
  captureBtn: string;
  clearImage: string;
  face: string;

  // Actions
  sendOcr: string;
  sendLiveness: string;
  sendFaceMatch: string;
  processing: string;

  // OCR result labels
  ocrStatus: string;
  ocrSuccess: string;
  ocrFailed: string;
  docType: string;
  confidence: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
  issueDate: string;
  processingTime: string;

  // Liveness result labels
  isLive: string;
  liveYes: string;
  liveNo: string;
  spoofing: string;
  spoofingNone: string;

  // Face match result labels
  matchLabel: string;
  matchYes: string;
  matchNo: string;
  similarity: string;
  threshold: string;
  selfieFaceDetected: string;
  documentFaceDetected: string;
}
