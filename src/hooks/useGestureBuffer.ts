'use client';

import { useRef, useCallback, useState } from 'react';
import type { Prediction } from '@/types';

interface UseGestureBufferReturn {
  processNewPrediction: (predictions: Prediction[], threshold: number, requiredFrames: number) => Prediction | null;
  stableLabel: string | null;
  stabilityCount: number;
  reset: () => void;
}

/**
 * Gesture stability buffer: requires the same prediction to appear
 * consistently for N frames above the confidence threshold before
 * committing the gesture.
 */
export function useGestureBuffer(): UseGestureBufferReturn {
  const lastLabelRef = useRef<string | null>(null);
  const countRef = useRef(0);
  const [stableLabel, setStableLabel] = useState<string | null>(null);
  const [stabilityCount, setStabilityCount] = useState(0);
  const committedRef = useRef(false);

  const processNewPrediction = useCallback(
    (predictions: Prediction[], threshold: number, requiredFrames: number): Prediction | null => {
      if (predictions.length === 0) {
        lastLabelRef.current = null;
        countRef.current = 0;
        setStabilityCount(0);
        setStableLabel(null);
        committedRef.current = false;
        return null;
      }

      const top = predictions[0];

      // If below threshold, reset
      if (top.confidence < threshold) {
        lastLabelRef.current = null;
        countRef.current = 0;
        setStabilityCount(0);
        setStableLabel(null);
        committedRef.current = false;
        return null;
      }

      // Same label as before — increment
      if (top.label === lastLabelRef.current) {
        countRef.current += 1;
        setStabilityCount(countRef.current);

        // Check if we've reached the threshold and haven't committed yet
        if (countRef.current >= requiredFrames && !committedRef.current) {
          committedRef.current = true;
          setStableLabel(top.label);
          return top;
        }
      } else {
        // New label — reset
        lastLabelRef.current = top.label;
        countRef.current = 1;
        setStabilityCount(1);
        setStableLabel(null);
        committedRef.current = false;
      }

      return null;
    },
    []
  );

  const reset = useCallback(() => {
    lastLabelRef.current = null;
    countRef.current = 0;
    setStabilityCount(0);
    setStableLabel(null);
    committedRef.current = false;
  }, []);

  return { processNewPrediction, stableLabel, stabilityCount, reset };
}
