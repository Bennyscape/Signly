export interface Prediction {
  label: string;
  confidence: number;
  index: number;
}

export interface PredictionResult {
  predictions: Prediction[];
  topPrediction: Prediction | null;
  isStable: boolean;
  timestamp: number;
}

export type RecognitionMode = 'alphabet' | 'word' | 'auto';
