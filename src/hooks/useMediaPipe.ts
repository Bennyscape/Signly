'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { HandData, HandLandmark } from '@/types';

// MediaPipe Hands types (loaded dynamically)
interface MediaPipeHands {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: MediaPipeResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

interface MediaPipeResults {
  multiHandLandmarks?: { x: number; y: number; z: number }[][];
  multiHandWorldLandmarks?: { x: number; y: number; z: number }[][];
  multiHandedness?: { label: string }[][];
}

interface UseMediaPipeReturn {
  handData: HandData | null;
  allHands: HandData[];
  isReady: boolean;
  isProcessing: boolean;
  error: string | null;
  processFrame: (video: HTMLVideoElement) => Promise<void>;
}

export function useMediaPipe(): UseMediaPipeReturn {
  const handsRef = useRef<MediaPipeHands | null>(null);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [allHands, setAllHands] = useState<HandData[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HandData[]>([]);

  // Initialize MediaPipe Hands
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Dynamically import MediaPipe
        const handsModule = await import('@mediapipe/hands');
        const Hands = handsModule.Hands;

        const hands = new Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: MediaPipeResults) => {
          const handsData: HandData[] = [];

          if (results.multiHandLandmarks) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
              const landmarks: HandLandmark[] = results.multiHandLandmarks[i].map((lm) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
              }));

              const worldLandmarks: HandLandmark[] =
                results.multiHandWorldLandmarks?.[i]?.map((lm) => ({
                  x: lm.x,
                  y: lm.y,
                  z: lm.z,
                })) || landmarks;

              const handedness =
                (results.multiHandedness?.[i]?.[0]?.label as 'Left' | 'Right') || 'Right';

              handsData.push({ landmarks, worldLandmarks, handedness });
            }
          }

          resultsRef.current = handsData;
          if (!cancelled) {
            setAllHands(handsData);
            setHandData(handsData[0] || null);
          }
        });

        handsRef.current = hands as unknown as MediaPipeHands;
        if (!cancelled) setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load MediaPipe');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  const processFrame = useCallback(async (video: HTMLVideoElement) => {
    if (!handsRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      await handsRef.current.send({ image: video });
    } catch {
      // Frame processing error — skip silently
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return { handData, allHands, isReady, isProcessing, error, processFrame };
}
