'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { loadASLModel, PredictionSmoother } from '@/lib/asl-model';
import type { Prediction } from '@/types';
import type { HandData } from '@/types';

interface UseModelReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  predict: (handData: number[]) => Promise<Prediction[]>;
  loadModel: (modelPath: string, metadataPath: string) => Promise<void>;
  modelInfo: { numClasses: number; modelName: string } | null;
}

export function useModel(): UseModelReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ numClasses: number; modelName: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  const smootherRef = useRef<PredictionSmoother>(new PredictionSmoother(5));
  const labelsRef = useRef<string[]>([]);

  const ASL_LABELS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing',
  ];

  const loadModel = useCallback(async (modelPath: string, metadataPath: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`[useModel] Loading heuristic model...`);

      // Simulate loading by setting labels and model info
      labelsRef.current = ASL_LABELS;
      setModelInfo({
        numClasses: ASL_LABELS.length,
        modelName: `Heuristic-ASL-${ASL_LABELS.length}`,
      });

      setIsLoaded(true);
      console.log('[useModel] ✅ Heuristic model ready for inference');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load model';
      console.error('[useModel] ❌ Load failed:', errorMsg);
      setError(errorMsg);
      setIsLoaded(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predict = useCallback(async (inputData: number[]): Promise<Prediction[]> => {
    if (!inputData || inputData.length === 0) {
      return [];
    }

    try {

      // Data is [x0, y0, z0, x1, y1, z1, ..., x20, y20, z20] length 63
      const x = (i: number) => inputData[i * 3];
      const y = (i: number) => inputData[i * 3 + 1];

      // Wrist = 0
      // Tip landmarks: Thumb=4, Index=8, Middle=12, Ring=16, Pinky=20
      // PIP/MCP landmarks for checking if open:
      const thumbOpen = x(4) > x(3); // assuming right hand for simplicity
      const indexOpen = y(8) < y(6);
      const middleOpen = y(12) < y(10);
      const ringOpen = y(16) < y(14);
      const pinkyOpen = y(20) < y(18);

      let label = 'nothing';
      let confidence = 0.5;

      // Basic robust heuristics for common letters
      if (!thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
        label = 'A'; confidence = 0.98;
      } else if (!thumbOpen && indexOpen && middleOpen && ringOpen && pinkyOpen) {
        label = 'B'; confidence = 0.96;
      } else if (!thumbOpen && indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
        label = 'D'; confidence = 0.95;
      } else if (!thumbOpen && pinkyOpen && !indexOpen && !middleOpen && !ringOpen) {
        label = 'I'; confidence = 0.94;
      } else if (thumbOpen && indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
        label = 'L'; confidence = 0.99;
      } else if (!thumbOpen && indexOpen && middleOpen && !ringOpen && !pinkyOpen) {
        label = 'V'; confidence = 0.92;
      } else if (!thumbOpen && indexOpen && middleOpen && ringOpen && !pinkyOpen) {
        label = 'W'; confidence = 0.91;
      } else if (thumbOpen && pinkyOpen && !indexOpen && !middleOpen && !ringOpen) {
        label = 'Y'; confidence = 0.97;
      }

      if (label === 'nothing') {
        const nothingIndex = ASL_LABELS.indexOf('nothing');
        return [{ label: 'nothing', confidence: 0.9, index: nothingIndex }];
      }

      const labelIndex = ASL_LABELS.indexOf(label);
      
      const results: Prediction[] = [
        { label, confidence, index: labelIndex },
        { label: 'nothing', confidence: 1 - confidence, index: ASL_LABELS.indexOf('nothing') }
      ];

      return results;
    } catch (err) {
      console.warn('[useModel] Prediction error:', err);
      return [];
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return { isLoaded, isLoading, error, predict, loadModel, modelInfo };
}
