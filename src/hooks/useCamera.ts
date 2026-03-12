'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  stream: MediaStream | null;
}

export function useCamera(facing: 'user' | 'environment' = 'user'): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [stream]);

  const start = useCallback(async () => {
    try {
      setError(null);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera';
      setError(message);
      setIsActive(false);
    }
  }, [facing, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return { videoRef, isActive, error, start, stop, stream };
}
