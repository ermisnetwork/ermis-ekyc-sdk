import type { EkycLocale } from "./types";

/** English locale */
export const enLocale: EkycLocale = {
  preview: {
    title: "Device Check",
    description: "Test your camera and microphone before joining the session",
    joinButton: "Join Session",
    joining: "Connecting...",
    cameraLabel: "Camera",
    micLabel: "Microphone",
    cameraOff: "Camera is off",
  },
  room: {
    connecting: "Connecting to meeting room...",
    hostLabel: "Appraiser (HOST)",
    guestLabel: "Customer (GUEST)",
    you: "You",
    leaveButton: "Leave Room",
  },
  panel: {
    title: "eKYC Verification",
    reset: "Reset",

    ocrTitle: "OCR – Identity Document",
    livenessTitle: "Liveness – Live Person Check",
    faceMatchTitle: "Face Match – Face Comparison",
    faceMatchDesc: "Compare face with document photo",

    docCccd: "National ID",
    docPassport: "Passport",
    docGplx: "Driver License",

    frontSide: "Front side",
    backSide: "Back side",
    captureBtn: "Capture",
    clearImage: "Clear image",
    face: "Face",

    sendOcr: "Send OCR",
    sendLiveness: "Send Liveness",
    sendFaceMatch: "Send Face Match",
    processing: "Processing...",

    ocrStatus: "Status",
    ocrSuccess: "✓ Success",
    ocrFailed: "✗ Failed",
    docType: "Document type",
    confidence: "Confidence",
    fullName: "Full name",
    idNumber: "ID number",
    dateOfBirth: "Date of birth",
    gender: "Gender",
    nationality: "Nationality",
    placeOfOrigin: "Place of origin",
    placeOfResidence: "Place of residence",
    expiryDate: "Expiry date",
    issueDate: "Issue date",
    processingTime: "Processing time",

    isLive: "Live person",
    liveYes: "✓ Yes",
    liveNo: "✗ No",
    spoofing: "Spoofing",
    spoofingNone: "✓ None",

    matchLabel: "Match",
    matchYes: "✓ Yes",
    matchNo: "✗ No",
    similarity: "Similarity",
    threshold: "Threshold",
    selfieFaceDetected: "Face detected (selfie)",
    documentFaceDetected: "Face detected (document)",
  },
};
