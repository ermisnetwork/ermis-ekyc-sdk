import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type MutableRefObject,
} from "react";

// ============================================================
// useMediaPreview – mic & camera preview hook
// ============================================================

export interface MediaPreviewState {
  /** Local MediaStream (video + audio) */
  stream: MediaStream | null;
  /** Is camera currently active? */
  videoEnabled: boolean;
  /** Is microphone currently active? */
  audioEnabled: boolean;
  /** Ref to current audio volume level (0-1) – updated via RAF, does NOT cause re-renders */
  audioLevelRef: MutableRefObject<number>;
  /** Available video input devices */
  videoDevices: MediaDeviceInfo[];
  /** Available audio input devices */
  audioDevices: MediaDeviceInfo[];
  /** Selected video device ID */
  selectedVideoDeviceId: string;
  /** Selected audio device ID */
  selectedAudioDeviceId: string;
  /** Error message if media access fails */
  error: string | null;
  /** Is the media loading/initializing? */
  isLoading: boolean;
}

export interface MediaPreviewActions {
  /** Toggle camera on/off */
  toggleVideo: () => void;
  /** Toggle microphone on/off */
  toggleAudio: () => void;
  /** Switch to a different video device */
  selectVideoDevice: (deviceId: string) => void;
  /** Switch to a different audio device */
  selectAudioDevice: (deviceId: string) => void;
  /** Stop all streams and cleanup */
  cleanup: () => void;
}

export type UseMediaPreviewReturn = MediaPreviewState & MediaPreviewActions;

/**
 * Hook to manage camera & microphone preview before joining a meeting.
 *
 * - Requests getUserMedia on mount
 * - Provides real-time audio level via AnalyserNode
 * - Allows toggling camera/mic and switching devices
 * - Cleans up on unmount
 */
export function useMediaPreview(): UseMediaPreviewReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioLevelRef = useRef(0);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── Enumerate devices ──────────────────────────────────────
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
    } catch {
      /* ignore – devices will be empty */
    }
  }, []);

  // ── Start stream ───────────────────────────────────────────
  const startStream = useCallback(
    async (videoDeviceId?: string, audioDeviceId?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const constraints: MediaStreamConstraints = {
          video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        };

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        // ── Audio level metering ───────────────────────────
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const avg = sum / dataArray.length / 255;
          audioLevelRef.current = avg;
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();

        // Refresh device list (labels are only available after permission)
        await refreshDevices();
      } catch (err: unknown) {
        const message =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Quyền truy cập camera/microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt."
            : "Không thể truy cập camera/microphone. Vui lòng kiểm tra thiết bị.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshDevices],
  );

  // ── Init on mount ──────────────────────────────────────────
  useEffect(() => {
    startStream();

    return () => {
      // cleanup is handled by the cleanup function
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cleanup ────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
      // Stop tracks from current stream ref
    };
  }, []);

  // ── Toggle video ───────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setVideoEnabled((v) => !v);
  }, [stream]);

  // ── Toggle audio ───────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setAudioEnabled((a) => !a);
  }, [stream]);

  // ── Switch video device ────────────────────────────────────
  const selectVideoDevice = useCallback(
    (deviceId: string) => {
      setSelectedVideoDeviceId(deviceId);
      cleanup();
      startStream(deviceId, selectedAudioDeviceId || undefined);
    },
    [cleanup, startStream, selectedAudioDeviceId],
  );

  // ── Switch audio device ────────────────────────────────────
  const selectAudioDevice = useCallback(
    (deviceId: string) => {
      setSelectedAudioDeviceId(deviceId);
      cleanup();
      startStream(selectedVideoDeviceId || undefined, deviceId);
    },
    [cleanup, startStream, selectedVideoDeviceId],
  );

  return {
    stream,
    videoEnabled,
    audioEnabled,
    audioLevelRef,
    videoDevices,
    audioDevices,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    error,
    isLoading,
    toggleVideo,
    toggleAudio,
    selectVideoDevice,
    selectAudioDevice,
    cleanup,
  };
}
