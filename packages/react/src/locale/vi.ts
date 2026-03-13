import type { EkycLocale } from "./types";

/** Vietnamese locale (default) */
export const viLocale: EkycLocale = {
  preview: {
    title: "Kiểm tra thiết bị",
    description: "Kiểm tra camera và micro trước khi tham gia phiên thẩm định",
    joinButton: "Tham gia phiên thẩm định",
    joining: "Đang kết nối...",
    cameraLabel: "Camera",
    micLabel: "Micro",
    cameraOff: "Camera đã tắt",
  },
  room: {
    connecting: "Đang kết nối phòng họp...",
    hostLabel: "Thẩm định viên (HOST)",
    guestLabel: "Khách hàng (GUEST)",
    you: "Bạn",
    leaveButton: "Rời phòng",
  },
  panel: {
    title: "Xác minh eKYC",
    reset: "Làm lại",

    ocrTitle: "OCR – Giấy tờ tùy thân",
    livenessTitle: "Liveness – Xác minh người thật",
    faceMatchTitle: "Face Match – So khớp khuôn mặt",
    faceMatchDesc: "So sánh khuôn mặt với ảnh trên giấy tờ",

    docCccd: "CCCD",
    docPassport: "Hộ chiếu",

    frontSide: "Mặt trước",
    backSide: "Mặt sau",
    captureBtn: "Chụp",
    clearImage: "Xoá ảnh",
    face: "Khuôn mặt",

    sendOcr: "Gửi OCR",
    sendLiveness: "Gửi Liveness",
    sendFaceMatch: "Gửi Face Match",
    processing: "Đang xử lý...",

    ocrStatus: "Trạng thái",
    ocrSuccess: "✓ Thành công",
    ocrFailed: "✗ Thất bại",
    docType: "Loại giấy tờ",
    confidence: "Độ tin cậy",
    fullName: "Họ tên",
    idNumber: "Số CMND/CCCD",
    dateOfBirth: "Ngày sinh",
    gender: "Giới tính",
    nationality: "Quốc tịch",
    placeOfOrigin: "Quê quán",
    placeOfResidence: "Nơi thường trú",
    expiryDate: "Ngày hết hạn",
    issueDate: "Ngày cấp",
    processingTime: "Thời gian xử lý",

    isLive: "Người thật",
    liveYes: "✓ Có",
    liveNo: "✗ Không",
    spoofing: "Giả mạo",
    spoofingNone: "✓ Không",

    matchLabel: "Khớp",
    matchYes: "✓ Có",
    matchNo: "✗ Không",
    similarity: "Độ tương đồng",
    threshold: "Ngưỡng",
    selfieFaceDetected: "Phát hiện khuôn mặt (selfie)",
    documentFaceDetected: "Phát hiện khuôn mặt (giấy tờ)",
  },
};
