import { create } from 'zustand';
import type { Prediction } from '@/types';

interface RecognitionState {
  // Status
  isModelLoaded: boolean;
  isDetecting: boolean;
  numHands: number;
  fps: number;
  inferenceTime: number;

  // Predictions
  currentPredictions: Prediction[];
  stablePrediction: Prediction | null;
  stabilityCount: number;

  // Actions
  setModelLoaded: (loaded: boolean) => void;
  setDetecting: (detecting: boolean) => void;
  setNumHands: (num: number) => void;
  setFps: (fps: number) => void;
  setInferenceTime: (time: number) => void;
  setPredictions: (predictions: Prediction[]) => void;
  setStablePrediction: (prediction: Prediction | null) => void;
  setStabilityCount: (count: number) => void;
  reset: () => void;
}

const initialState = {
  isModelLoaded: false,
  isDetecting: false,
  numHands: 0,
  fps: 0,
  inferenceTime: 0,
  currentPredictions: [],
  stablePrediction: null,
  stabilityCount: 0,
};

export const useRecognitionStore = create<RecognitionState>((set) => ({
  ...initialState,
  setModelLoaded: (loaded) => set({ isModelLoaded: loaded }),
  setDetecting: (detecting) => set({ isDetecting: detecting }),
  setNumHands: (num) => set({ numHands: num }),
  setFps: (fps) => set({ fps }),
  setInferenceTime: (time) => set({ inferenceTime: time }),
  setPredictions: (predictions) => set({ currentPredictions: predictions }),
  setStablePrediction: (prediction) => set({ stablePrediction: prediction }),
  setStabilityCount: (count) => set({ stabilityCount: count }),
  reset: () => set(initialState),
}));
