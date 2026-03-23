'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Prediction } from '@/types';

interface UseModelReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  predict: (inputData: number[]) => Promise<Prediction[]>;
  loadModel: (path: string) => Promise<void>;
}

export function useModel(): UseModelReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tfRef = useRef<any>(null);
  const labelsRef = useRef<string[]>([]);

  const loadModel = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamically import TensorFlow.js
      const tf = await import('@tensorflow/tfjs');
      tfRef.current = tf;

      // Load the model
      const model = await tf.loadLayersModel(path);
      modelRef.current = model;

      // Load labels if they exist alongside the model
      try {
        const labelsPath = path.replace('model.json', 'labels.json');
        const response = await fetch(labelsPath);
        if (response.ok) {
          labelsRef.current = await response.json();
        }
      } catch {
        // Default ASL alphabet labels
        labelsRef.current = [
          'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
          'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
          'U', 'V', 'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing',
        ];
      }

      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
      setIsLoaded(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predict = useCallback(async (inputData: number[]): Promise<Prediction[]> => {
    if (!modelRef.current || !tfRef.current) return [];

    const tf = tfRef.current;

    try {
      // Create tensor from input
      const inputTensor = tf.tensor2d([inputData]);
      const outputTensor = modelRef.current.predict(inputTensor) as { data: () => Promise<Float32Array>; dispose: () => void };
      const predictions = await outputTensor.data();

      // Clean up tensors
      inputTensor.dispose();
      outputTensor.dispose();

      // Convert to prediction objects and sort by confidence
      const results: Prediction[] = Array.from(predictions)
        .map((confidence: number, index: number) => ({
          label: labelsRef.current[index] || `Class ${index}`,
          confidence,
          index,
        }))
        .sort((a: Prediction, b: Prediction) => b.confidence - a.confidence)
        .slice(0, 5);

      return results;
    } catch {
      return [];
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (modelRef.current?.dispose) {
        modelRef.current.dispose();
      }
    };
  }, []);

  return { isLoaded, isLoading, error, predict, loadModel };
}
