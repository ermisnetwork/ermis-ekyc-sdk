import React, { useCallback, useState } from "react";
import {
  EkycService,
  DocumentType,
  OcrResponse,
  LivenessResponse,
  FaceMatchResponse,
} from "ermis-ekyc-sdk";
import "./EkycActionPanel.css";

// ============================================================
// Types
// ============================================================

export interface EkycActionPanelProps {
  /** Ref to the remote participant's <video> element */
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;

  /** Called when OCR step completes */
  onOcrComplete?: (result: OcrResponse) => void;
  /** Called when liveness step completes */
  onLivenessComplete?: (result: LivenessResponse) => void;
  /** Called when face match step completes */
  onFaceMatchComplete?: (result: FaceMatchResponse) => void;

  /** Called when the full eKYC flow completes */
  onEkycComplete?: (result: {
    ocr: OcrResponse;
    liveness: LivenessResponse;
    faceMatch: FaceMatchResponse;
    isVerified: boolean;
  }) => void;
}

interface CapturedImages {
  front?: Blob;
  frontUrl?: string;
  back?: Blob;
  backUrl?: string;
  selfie?: Blob;
  selfieUrl?: string;
}

interface StepResults {
  ocr?: OcrResponse;
  liveness?: LivenessResponse;
  faceMatch?: FaceMatchResponse;
}

type ProcessingStep = "ocr" | "liveness" | "faceMatch" | null;

// ============================================================
// Capture utility
// ============================================================

function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to capture frame"));
      },
      "image/jpeg",
      0.92,
    );
  });
}

// ============================================================
// EkycActionPanel Component
// ============================================================

export function EkycActionPanel({ remoteVideoRef, onOcrComplete, onLivenessComplete, onFaceMatchComplete, onEkycComplete }: EkycActionPanelProps) {
  const [docType, setDocType] = useState<DocumentType>(DocumentType.CCCD);
  const [images, setImages] = useState<CapturedImages>({});
  const [results, setResults] = useState<StepResults>({});
  const [processing, setProcessing] = useState<ProcessingStep>(null);
  const [errors, setErrors] = useState<{ ocr?: string; liveness?: string; faceMatch?: string }>({});

  const needsBackSide = docType !== DocumentType.PASSPORT;

  const ekyc = EkycService.getInstance();

  // ── Capture frame from remote video ──────────────────────
  const doCapture = useCallback(async (): Promise<Blob | null> => {
    if (!remoteVideoRef.current) return null;
    try {
      return await captureFrame(remoteVideoRef.current);
    } catch (err) {
      console.error("[EkycActionPanel] Capture error:", err);
      return null;
    }
  }, [remoteVideoRef]);

  // ── Capture front ────────────────────────────────────────
  const handleCaptureFront = useCallback(async () => {
    const blob = await doCapture();
    if (!blob) return;
    setImages((prev) => {
      if (prev.frontUrl) URL.revokeObjectURL(prev.frontUrl);
      return { ...prev, front: blob, frontUrl: URL.createObjectURL(blob) };
    });
  }, [doCapture]);

  // ── Capture back ─────────────────────────────────────────
  const handleCaptureBack = useCallback(async () => {
    const blob = await doCapture();
    if (!blob) return;
    setImages((prev) => {
      if (prev.backUrl) URL.revokeObjectURL(prev.backUrl);
      return { ...prev, back: blob, backUrl: URL.createObjectURL(blob) };
    });
  }, [doCapture]);

  // ── Capture selfie ───────────────────────────────────────
  const handleCaptureSelfie = useCallback(async () => {
    const blob = await doCapture();
    if (!blob) return;
    setImages((prev) => {
      if (prev.selfieUrl) URL.revokeObjectURL(prev.selfieUrl);
      return { ...prev, selfie: blob, selfieUrl: URL.createObjectURL(blob) };
    });
  }, [doCapture]);

  // ── OCR: call API with captured images ───────────────────
  const handleOcr = useCallback(async () => {
    if (!images.front) return;
    if (needsBackSide && !images.back) return;

    setProcessing("ocr");
    setErrors((prev) => ({ ...prev, ocr: undefined }));

    try {

      const ocrResult = await ekyc.performOcr({
        documentFront: images.front,
        documentBack: needsBackSide ? images.back : undefined,
        documentType: docType,
      });
      setResults((prev) => ({ ...prev, ocr: ocrResult }));
      onOcrComplete?.(ocrResult);
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, ocr: err instanceof Error ? err.message : "OCR thất bại" }));
    } finally {
      setProcessing(null);
    }
  }, [images.front, images.back, needsBackSide, docType, ekyc]);

  // ── Liveness: call API ───────────────────────────────────
  const handleLiveness = useCallback(async () => {
    if (!images.selfie) return;

    setProcessing("liveness");
    setErrors((prev) => ({ ...prev, liveness: undefined }));

    try {

      const livenessResult = await ekyc.checkLiveness({ images: images.selfie });
      setResults((prev) => ({ ...prev, liveness: livenessResult }));
      onLivenessComplete?.(livenessResult);
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, liveness: err instanceof Error ? err.message : "Liveness thất bại" }));
    } finally {
      setProcessing(null);
    }
  }, [images.selfie, ekyc]);

  // ── Face Match: call API ─────────────────────────────────
  const handleFaceMatch = useCallback(async () => {
    if (!images.selfie || !images.front) return;

    setProcessing("faceMatch");
    setErrors((prev) => ({ ...prev, faceMatch: undefined }));

    try {

      const faceMatchResult = await ekyc.matchFaces({
        selfieImage: images.selfie,
        documentImage: images.front,
      });
      setResults((prev) => ({ ...prev, faceMatch: faceMatchResult }));
      onFaceMatchComplete?.(faceMatchResult);

      // Notify parent if all steps complete
      if (onEkycComplete && results.ocr && results.liveness) {
        onEkycComplete({
          ocr: results.ocr,
          liveness: results.liveness,
          faceMatch: faceMatchResult,
          isVerified: results.ocr.success && results.liveness.is_live && faceMatchResult.match,
        });
      }
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, faceMatch: err instanceof Error ? err.message : "Face Match thất bại" }));
    } finally {
      setProcessing(null);
    }
  }, [images.selfie, images.front, results.ocr, results.liveness, ekyc, onEkycComplete]);

  // ── Reset ────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (images.frontUrl) URL.revokeObjectURL(images.frontUrl);
    if (images.backUrl) URL.revokeObjectURL(images.backUrl);
    if (images.selfieUrl) URL.revokeObjectURL(images.selfieUrl);
    setImages({});
    setResults({});
    setErrors({});
    setProcessing(null);
  }, [images]);

  // Can call OCR?
  const canCallOcr = images.front && (needsBackSide ? !!images.back : true) && !results.ocr;
  // Can call face match?
  const canCallFaceMatch = images.selfie && images.front && results.liveness && !results.faceMatch;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="ekyc-panel">
      <div className="ekyc-panel-header">
        <h3 className="ekyc-panel-title">Xác minh eKYC</h3>
        <button className="ekyc-panel-reset-btn" onClick={handleReset} title="Làm lại">
          ↺
        </button>
      </div>

      <div className="ekyc-panel-body">
        {/* ═══════════════════════════════════════════════════
            STEP 1: OCR
        ═══════════════════════════════════════════════════ */}
        <div className={`ekyc-panel-step-section ${results.ocr ? "ekyc-panel-step-section--done" : ""}`}>
          <div className="ekyc-panel-step-header">
            <span className="ekyc-panel-step-num">1</span>
            <h4 className="ekyc-panel-step-title">OCR – Giấy tờ tùy thân</h4>
            {results.ocr && <span className="ekyc-panel-step-badge ekyc-panel-step-badge--pass">✓</span>}
          </div>

          {/* Doc type selector */}
          <div className="ekyc-panel-doc-types">
            {([
              [DocumentType.CCCD, "CCCD"],
              [DocumentType.PASSPORT, "Hộ chiếu"],
              [DocumentType.GPLX, "GPLX"],
            ] as [DocumentType, string][]).map(([type, label]) => (
              <button
                key={type}
                className={`ekyc-panel-doc-btn ${docType === type ? "ekyc-panel-doc-btn--active" : ""}`}
                onClick={() => {
                  setDocType(type);
                  // Clear back image when switching to PASSPORT
                  if (type === DocumentType.PASSPORT) {
                    setImages((prev) => {
                      if (prev.backUrl) URL.revokeObjectURL(prev.backUrl);
                      return { ...prev, back: undefined, backUrl: undefined };
                    });
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Capture buttons + previews */}
          <div className="ekyc-panel-captures">
            {/* Front */}
            <div className="ekyc-panel-capture-item">
              <span className="ekyc-panel-capture-label">Mặt trước</span>
              {images.frontUrl ? (
                <div className="ekyc-panel-thumb-wrap">
                  <img src={images.frontUrl} alt="Front" className="ekyc-panel-thumb" />
                  <button className="ekyc-panel-recapture-btn" onClick={() => setImages((prev) => { if (prev.frontUrl) URL.revokeObjectURL(prev.frontUrl); return { ...prev, front: undefined, frontUrl: undefined }; })} title="Xoá ảnh">✕</button>
                </div>
              ) : (
                <CaptureButton onClick={handleCaptureFront} label="Chụp" />
              )}
            </div>
            {/* Back (if needed) */}
            {needsBackSide && (
              <div className="ekyc-panel-capture-item">
                <span className="ekyc-panel-capture-label">Mặt sau</span>
                {images.backUrl ? (
                  <div className="ekyc-panel-thumb-wrap">
                    <img src={images.backUrl} alt="Back" className="ekyc-panel-thumb" />
                    <button className="ekyc-panel-recapture-btn" onClick={() => setImages((prev) => { if (prev.backUrl) URL.revokeObjectURL(prev.backUrl); return { ...prev, back: undefined, backUrl: undefined }; })} title="Xoá ảnh">✕</button>
                  </div>
                ) : (
                  <CaptureButton onClick={handleCaptureBack} label="Chụp" />
                )}
              </div>
            )}
          </div>

          {/* Call OCR button */}
          {canCallOcr && (
            <button className="ekyc-panel-action-btn" onClick={handleOcr} disabled={processing === "ocr"}>
              {processing === "ocr" ? <><span className="ekyc-panel-spinner" /> Đang xử lý...</> : "Gửi OCR"}
            </button>
          )}

          {/* OCR Error */}
          {errors.ocr && <div className="ekyc-panel-error-msg">⚠️ {errors.ocr}</div>}

          {/* OCR Result */}
          {results.ocr && <OcrResultDisplay data={results.ocr} />}
        </div>

        {/* ═══════════════════════════════════════════════════
            STEP 2: Liveness
        ═══════════════════════════════════════════════════ */}
        <div className={`ekyc-panel-step-section ${results.liveness ? "ekyc-panel-step-section--done" : ""}`}>
          <div className="ekyc-panel-step-header">
            <span className="ekyc-panel-step-num">2</span>
            <h4 className="ekyc-panel-step-title">Liveness – Xác minh người thật</h4>
            {results.liveness && (
              <span className={`ekyc-panel-step-badge ${results.liveness.is_live ? "ekyc-panel-step-badge--pass" : "ekyc-panel-step-badge--fail"}`}>
                {results.liveness.is_live ? "✓" : "✗"}
              </span>
            )}
          </div>

          {/* Capture selfie */}
          {!results.liveness && (
            <div className="ekyc-panel-captures">
              <div className="ekyc-panel-capture-item">
                <span className="ekyc-panel-capture-label">Khuôn mặt</span>
                {images.selfieUrl ? (
                  <div className="ekyc-panel-thumb-wrap">
                    <img src={images.selfieUrl} alt="Selfie" className="ekyc-panel-thumb" />
                    <button className="ekyc-panel-recapture-btn" onClick={() => setImages((prev) => { if (prev.selfieUrl) URL.revokeObjectURL(prev.selfieUrl); return { ...prev, selfie: undefined, selfieUrl: undefined }; })} title="Xoá ảnh">✕</button>
                  </div>
                ) : (
                  <CaptureButton onClick={handleCaptureSelfie} label="Chụp" />
                )}
              </div>
            </div>
          )}

          {/* Call Liveness button */}
          {images.selfie && !results.liveness && (
            <button className="ekyc-panel-action-btn" onClick={handleLiveness} disabled={processing === "liveness"}>
              {processing === "liveness" ? <><span className="ekyc-panel-spinner" /> Đang xử lý...</> : "Gửi Liveness"}
            </button>
          )}

          {/* Liveness Error */}
          {errors.liveness && <div className="ekyc-panel-error-msg">⚠️ {errors.liveness}</div>}

          {/* Liveness Result */}
          {results.liveness && <LivenessResultDisplay data={results.liveness} />}
        </div>

        {/* ═══════════════════════════════════════════════════
            STEP 3: Face Match
        ═══════════════════════════════════════════════════ */}
        <div className={`ekyc-panel-step-section ${results.faceMatch ? "ekyc-panel-step-section--done" : ""}`}>
          <div className="ekyc-panel-step-header">
            <span className="ekyc-panel-step-num">3</span>
            <h4 className="ekyc-panel-step-title">Face Match – So khớp khuôn mặt</h4>
            {results.faceMatch && (
              <span className={`ekyc-panel-step-badge ${results.faceMatch.match ? "ekyc-panel-step-badge--pass" : "ekyc-panel-step-badge--fail"}`}>
                {results.faceMatch.match ? "✓" : "✗"}
              </span>
            )}
          </div>

          <p className="ekyc-panel-desc">So sánh khuôn mặt với ảnh trên giấy tờ</p>

          {/* Call Face Match button */}
          {canCallFaceMatch && (
            <button className="ekyc-panel-action-btn" onClick={handleFaceMatch} disabled={processing === "faceMatch"}>
              {processing === "faceMatch" ? <><span className="ekyc-panel-spinner" /> Đang xử lý...</> : "Gửi Face Match"}
            </button>
          )}

          {/* Face Match Error */}
          {errors.faceMatch && <div className="ekyc-panel-error-msg">⚠️ {errors.faceMatch}</div>}

          {/* Face Match Result */}
          {results.faceMatch && <FaceMatchResultDisplay data={results.faceMatch} />}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function CaptureButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button className="ekyc-panel-capture-btn" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
      {label}
    </button>
  );
}

function OcrResultDisplay({ data }: { data: OcrResponse }) {
  return (
    <div className="ekyc-panel-result-table">
      <ResultRow label="Trạng thái" value={data.success ? "✓ Thành công" : "✗ Thất bại"} pass={data.success} />
      <ResultRow label="Loại giấy tờ" value={data.document_type} />
      <ResultRow label="Độ tin cậy" value={`${(data.confidence * 100).toFixed(1)}%`} />
      {data.data && (
        <>
          <ResultRow label="Họ tên" value={data.data.full_name} highlight />
          <ResultRow label="Số CMND/CCCD" value={data.data.id_number} />
          <ResultRow label="Ngày sinh" value={data.data.date_of_birth} />
          <ResultRow label="Giới tính" value={data.data.gender} />
          <ResultRow label="Quốc tịch" value={data.data.nationality} />
          <ResultRow label="Quê quán" value={data.data.place_of_origin} />
          <ResultRow label="Nơi thường trú" value={data.data.place_of_residence} />
          <ResultRow label="Ngày hết hạn" value={data.data.expiry_date} />
          {data.data.issue_date && <ResultRow label="Ngày cấp" value={data.data.issue_date} />}
        </>
      )}
      <ResultRow label="Thời gian xử lý" value={`${data.processing_time_ms}ms`} />
    </div>
  );
}

function LivenessResultDisplay({ data }: { data: LivenessResponse }) {
  return (
    <div className="ekyc-panel-result-table">
      <ResultRow label="Người thật" value={data.is_live ? "✓ Có" : "✗ Không"} pass={data.is_live} />
      <ResultRow label="Độ tin cậy" value={`${(data.confidence * 100).toFixed(1)}%`} />
      <ResultRow label="Giả mạo" value={data.spoofing_detected ? `✗ ${data.spoofing_type}` : "✓ Không"} pass={!data.spoofing_detected} />
      {data.checks && (
        <>
          <ResultRow label="Texture" value={data.checks.texture_analysis.passed ? "✓" : "✗"} pass={data.checks.texture_analysis.passed} />
          <ResultRow label="Moiré" value={data.checks.moire_detection.passed ? "✓" : "✗"} pass={data.checks.moire_detection.passed} />
          <ResultRow label="Phản chiếu" value={data.checks.reflection_detection.passed ? "✓" : "✗"} pass={data.checks.reflection_detection.passed} />
          <ResultRow label="Depth" value={data.checks.depth_estimation.passed ? "✓" : "✗"} pass={data.checks.depth_estimation.passed} />
          <ResultRow label="CLIP" value={`${(data.checks.clip_liveness.liveness_score * 100).toFixed(1)}%`} pass={data.checks.clip_liveness.passed} />
        </>
      )}
      <ResultRow label="Thời gian xử lý" value={`${data.processing_time_ms}ms`} />
    </div>
  );
}

function FaceMatchResultDisplay({ data }: { data: FaceMatchResponse }) {
  return (
    <div className="ekyc-panel-result-table">
      <ResultRow label="Khớp" value={data.match ? "✓ Có" : "✗ Không"} pass={data.match} />
      <ResultRow label="Độ tương đồng" value={`${(data.similarity * 100).toFixed(1)}%`} />
      <ResultRow label="Ngưỡng" value={`${(data.threshold * 100).toFixed(1)}%`} />
      <ResultRow label="Phát hiện khuôn mặt (selfie)" value={data.selfie_face_detected ? "✓" : "✗"} pass={data.selfie_face_detected} />
      <ResultRow label="Phát hiện khuôn mặt (giấy tờ)" value={data.document_face_detected ? "✓" : "✗"} pass={data.document_face_detected} />
      <ResultRow label="Thời gian xử lý" value={`${data.processing_time_ms}ms`} />
    </div>
  );
}

function ResultRow({ label, value, pass, highlight }: { label: string; value: string; pass?: boolean; highlight?: boolean }) {
  return (
    <div className="ekyc-panel-result-row">
      <span className="ekyc-panel-result-row-label">{label}</span>
      <span className={`ekyc-panel-result-row-value${pass === true ? " ekyc-panel-result-row-value--pass" : pass === false ? " ekyc-panel-result-row-value--fail" : ""}${highlight ? " ekyc-panel-result-row-value--highlight" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}
