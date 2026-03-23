'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { HandData, HandLandmark } from '@/types';

/* ------------------------------------------------------------------ */
/*  MediaPipe Hands – loaded via <script> tag locally                 */
/*  This avoids Next.js / webpack ESM-bundling issues that silently   */
/*  break the WASM-based @mediapipe/hands npm package.                */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any;

interface UseMediaPipeReturn {
  handData: HandData | null;
  allHands: HandData[];
  isReady: boolean;
  error: string | null;
  processFrame: (video: HTMLVideoElement) => Promise<HandData[]>;
}

const LOCAL_BASE = '/mediapipe/hands';

/** Load a script tag and resolve when it finishes. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Don't load twice
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

export function useMediaPipe(): UseMediaPipeReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handsRef = useRef<any>(null);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [allHands, setAllHands] = useState<HandData[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const latestResultsRef = useRef<HandData[]>([]);

  // Initialize MediaPipe Hands via CDN script
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Load the MediaPipe Hands script locally → exposes window.Hands
        await loadScript(`${LOCAL_BASE}/hands.js`);

        if (cancelled) return;

        const HandsCtor = window.Hands;
        if (!HandsCtor) {
          throw new Error('window.Hands not available after script load');
        }

        // 2. Create instance — locateFile tells it where to fetch WASM + model files
        const hands = new HandsCtor({
          locateFile: (file: string) => `${LOCAL_BASE}/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // 3. Register results callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hands.onResults((results: any) => {
          const handsData: HandData[] = [];

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
              const landmarks: HandLandmark[] = results.multiHandLandmarks[i].map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (lm: any) => ({ x: lm.x, y: lm.y, z: lm.z })
              );

              const worldLandmarks: HandLandmark[] =
                results.multiHandWorldLandmarks?.[i]?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (lm: any) => ({ x: lm.x, y: lm.y, z: lm.z })
                ) || landmarks;

              const handedness =
                (results.multiHandedness?.[i]?.label as 'Left' | 'Right') || 'Right';

              handsData.push({ landmarks, worldLandmarks, handedness });
            }
          }

          latestResultsRef.current = handsData;
          if (!cancelled) {
            setAllHands(handsData);
            setHandData(handsData[0] || null);
          }
        });

        // 4. Warm up — initialize the WASM runtime by running a blank frame
        //    We create a tiny off-screen canvas so Hands loads its model files.
        const warmupCanvas = document.createElement('canvas');
        warmupCanvas.width = 1;
        warmupCanvas.height = 1;
        await hands.send({ image: warmupCanvas });

        handsRef.current = hands;
        if (!cancelled) {
          setIsReady(true);
          console.log('[useMediaPipe] ✅ MediaPipe Hands ready');
        }
      } catch (err) {
        console.error('[useMediaPipe] ❌ Init failed:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load MediaPipe');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (handsRef.current) {
        try { handsRef.current.close(); } catch { /* ignore */ }
      }
    };
  }, []);

  const processFrame = useCallback(
    async (video: HTMLVideoElement): Promise<HandData[]> => {
      if (!handsRef.current || isProcessingRef.current) {
        return latestResultsRef.current;
      }

      try {
        isProcessingRef.current = true;
        await handsRef.current.send({ image: video });
      } catch (err) {
        console.warn('[useMediaPipe] Frame error:', err);
      } finally {
        isProcessingRef.current = false;
      }

      return latestResultsRef.current;
    },
    []
  );

  return { handData, allHands, isReady, error, processFrame };
}
