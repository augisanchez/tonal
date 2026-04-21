import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  isPermissionDenied: boolean;
  error: string | null;
  requestCamera: () => Promise<void>;
  videoDims: { width: number; height: number } | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const acquiringRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDims, setVideoDims] = useState<{ width: number; height: number } | null>(null);

  const stopStream = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const v = videoRef.current;
    if (v) v.srcObject = null;
  }, []);

  const requestCamera = useCallback(async () => {
    if (acquiringRef.current) return;
    acquiringRef.current = true;

    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera API not available in this browser.');
        acquiringRef.current = false;
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsPermissionDenied(false);

      const video = videoRef.current;
      if (!video) {
        acquiringRef.current = false;
        return;
      }

      video.srcObject = stream;
      // iOS Safari requires these before play()
      video.setAttribute('playsinline', 'true');
      (video as HTMLVideoElement & { webkitPlaysInline?: boolean }).webkitPlaysInline = true;
      video.muted = true;

      const onMeta = () => {
        // Canvas sizing is owned by useFrameAnalysis — don't touch it here.
        setVideoDims({ width: video.videoWidth, height: video.videoHeight });
        video.play().catch((err) => {
          setError(err instanceof Error ? err.message : 'Video play failed');
        });
        setIsReady(true);
      };

      video.addEventListener('loadedmetadata', onMeta, { once: true });

      // Reacquire if iOS kills the stream when the app is backgrounded
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.addEventListener('ended', () => {
          setIsReady(false);
          acquiringRef.current = false;
          requestCamera();
        });
      }
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
        setIsPermissionDenied(true);
      } else {
        setError(e?.message ?? 'Camera error');
      }
    } finally {
      acquiringRef.current = false;
    }
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && !isReady && streamRef.current === null) {
        // Don't auto-request on first load — only re-request if we had a stream.
        return;
      }
      if (document.visibilityState === 'visible' && !isReady) {
        requestCamera();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isReady, requestCamera]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    canvasRef,
    isReady,
    isPermissionDenied,
    error,
    requestCamera,
    videoDims,
  };
}

// Kelvin estimation now lives inside useFrameAnalysis, which already has
// per-cell R/G/B data from the analysis loop.
