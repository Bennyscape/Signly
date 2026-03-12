'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, FlipHorizontal } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useRecognitionStore } from '@/stores/recognition-store';
import { HAND_CONNECTIONS } from '@/types';
import type { HandData } from '@/types';

interface CameraFeedProps {
  onLandmarks?: (handData: HandData | null) => void;
  showLandmarks?: boolean;
}

export function CameraFeed({ onLandmarks, showLandmarks = true }: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });
  const { videoRef, isActive, error, start, stop } = useCamera('user');
  const { handData, allHands, isReady, processFrame } = useMediaPipe();
  const setDetecting = useRecognitionStore((s) => s.setDetecting);
  const setNumHands = useRecognitionStore((s) => s.setNumHands);
  const setFps = useRecognitionStore((s) => s.setFps);

  // Draw landmarks on canvas
  const drawLandmarks = useCallback(
    (ctx: CanvasRenderingContext2D, hands: HandData[], width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const hand of hands) {
        const { landmarks } = hand;

        // Draw connections
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)';
        ctx.lineWidth = 2;
        for (const [start, end] of HAND_CONNECTIONS) {
          const s = landmarks[start];
          const e = landmarks[end];
          ctx.beginPath();
          ctx.moveTo(s.x * width, s.y * height);
          ctx.lineTo(e.x * width, e.y * height);
          ctx.stroke();
        }

        // Draw landmarks
        for (let i = 0; i < landmarks.length; i++) {
          const lm = landmarks[i];
          const x = lm.x * width;
          const y = lm.y * height;

          // Outer ring
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
          ctx.fill();

          // Inner dot
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? '#f59e0b' : '#60a5fa';
          ctx.fill();
        }
      }
    },
    []
  );

  // Main render loop
  useEffect(() => {
    if (!isActive || !isReady) return;

    const loop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        // Process frame through MediaPipe
        await processFrame(videoRef.current);

        // FPS counter
        fpsCounterRef.current.frames++;
        const now = performance.now();
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(fpsCounterRef.current.frames);
          fpsCounterRef.current.frames = 0;
          fpsCounterRef.current.lastTime = now;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, isReady, processFrame, setFps, videoRef]);

  // Update recognition store & draw when hand data changes
  useEffect(() => {
    setDetecting(allHands.length > 0);
    setNumHands(allHands.length);
    onLandmarks?.(handData);

    if (showLandmarks && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawLandmarks(ctx, allHands, canvas.width, canvas.height);
      }
    }
  }, [handData, allHands, showLandmarks, drawLandmarks, setDetecting, setNumHands, onLandmarks]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="camera-container relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-border"
      style={{ background: '#0a0a0a' }}
    >
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />

      {/* Landmark Overlay */}
      {showLandmarks && (
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scaleX(-1)' }}
        />
      )}

      {/* Inactive State */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface/80 backdrop-blur-sm">
          <CameraOff className="w-12 h-12 text-text-tertiary mb-4" />
          <p className="text-text-secondary text-sm mb-4">Camera is not active</p>
          <button
            onClick={start}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-text-inverse rounded-xl font-medium text-sm hover:bg-accent-hover transition-all glow-accent"
          >
            <Camera className="w-4 h-4" />
            Start Camera
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-error-soft backdrop-blur-sm">
          <p className="text-error text-sm font-medium mb-2">Camera Error</p>
          <p className="text-text-secondary text-xs max-w-[250px] text-center">{error}</p>
        </div>
      )}

      {/* Controls Overlay */}
      {isActive && (
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={stop}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-error transition-colors"
            title="Stop camera"
          >
            <CameraOff className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
            title="Flip camera"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Detection Indicator */}
      {isActive && (
        <div className="absolute bottom-3 left-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium glass ${
              allHands.length > 0 ? 'text-success' : 'text-text-tertiary'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                allHands.length > 0 ? 'bg-success animate-pulse-glow' : 'bg-text-tertiary'
              }`}
            />
            {allHands.length > 0
              ? `${allHands.length} Hand${allHands.length > 1 ? 's' : ''} Detected`
              : 'No Hand Detected'}
          </div>
        </div>
      )}

      {/* MediaPipe Loading */}
      {isActive && !isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary text-sm">Loading hand tracking...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
