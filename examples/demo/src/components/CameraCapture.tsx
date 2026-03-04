import { useState, useRef, useCallback, useEffect } from "react";

interface CameraCaptureProps {
  label: string;
  onChange: (file: File | null) => void;
}

export function CameraCapture({ label, onChange }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Attach stream to video element once it's rendered
  useEffect(() => {
    if (isOpen && !preview && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isOpen, preview]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      setPreview(null);
      setIsOpen(true);
      onChange(null);
    } catch {
      setError("Unable to access camera. Please allow camera permission.");
    }
  }, [onChange]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      onChange(file);
    }, "image/jpeg", 0.92);

    // Stop camera after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
  }, [onChange]);

  const retake = useCallback(() => {
    setPreview(null);
    onChange(null);
    startCamera();
  }, [onChange, startCamera]);

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>

      {/* Preview state – photo taken */}
      {preview && (
        <div className="border-2 border-emerald-500 bg-emerald-500/10 rounded-lg p-3 text-center">
          <img src={preview} alt="Captured selfie" className="max-h-[200px] mx-auto rounded-lg object-contain" />
          <div className="text-sm text-emerald-400 font-medium mt-2">✓ Photo captured</div>
          <button
            type="button"
            onClick={retake}
            className="mt-2 px-4 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] text-slate-300 hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            📷 Retake
          </button>
        </div>
      )}

      {/* Camera live view */}
      {isOpen && !preview && (
        <div className="border-2 border-indigo-500 bg-indigo-500/10 rounded-lg p-3 text-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-[280px] mx-auto rounded-lg object-contain bg-black"
          />
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={capture}
              className="px-5 py-2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-[0_2px_12px_var(--color-accent-glow)] hover:translate-y-[-1px] transition-all text-sm"
            >
              📸 Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-slate-300 hover:bg-[var(--color-bg-secondary)] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Idle state – no camera, no photo */}
      {!isOpen && !preview && (
        <div
          onClick={startCamera}
          className="border-2 border-dashed border-[var(--color-border)] hover:border-indigo-500 hover:bg-indigo-500/5 rounded-lg p-6 text-center cursor-pointer transition-all"
        >
          <div className="text-3xl mb-2">📷</div>
          <div className="text-sm text-slate-400">Click to open camera</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs">
          {error}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
