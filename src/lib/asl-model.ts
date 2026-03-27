/**
 * MS-ASL Model Loader and Inference Engine
 * =======================================
 * 
 * TypeScript implementation for loading and running trained ASL models in the browser.
 * Integrates with MediaPipe Hands for real-time gesture recognition.
 */

interface ModelWeights {
  W1: number[][];
  b1: number[][];
  W2: number[][];
  b2: number[][];
  num_classes: number;
  hidden_size: number;
}

interface PredictionResult {
  class_id: number;
  class_name: string;
  confidence: number;
  top_5: Array<{ id: number; name: string; confidence: number }>;
}

export class ASLModelInference {
  private W1: Float32Array;
  private b1: Float32Array;
  private W2: Float32Array;
  private b2: Float32Array;
  private numClasses: number;
  private hiddenSize: number;
  private classes: string[];
  private inputSize: number; // 21 landmarks * 3 coords = 63

  constructor(
    weights: ModelWeights,
    classes: string[]
  ) {
    this.W1 = new Float32Array(this.flattenArray(weights.W1));
    this.b1 = new Float32Array(this.flattenArray(weights.b1));
    this.W2 = new Float32Array(this.flattenArray(weights.W2));
    this.b2 = new Float32Array(this.flattenArray(weights.b2));
    this.numClasses = weights.num_classes;
    this.hiddenSize = weights.hidden_size;
    this.classes = classes;
    this.inputSize = 63; // 21 landmarks * 3 dimensions
  }

  /**
   * Flatten nested array to 1D
   */
  private flattenArray(arr: number[][]): number[] {
    return arr.flat();
  }

  /**
   * ReLU activation function
   */
  private relu(x: Float32Array): Float32Array {
    const result = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      result[i] = Math.max(0, x[i]);
    }
    return result;
  }

  /**
   * Softmax activation function
   */
  private softmax(x: Float32Array): Float32Array {
    // Find max for numerical stability
    let max = -Infinity;
    for (let i = 0; i < x.length; i++) {
      max = Math.max(max, x[i]);
    }

    // Calculate exp and sum
    const exps = new Float32Array(x.length);
    let sum = 0;
    for (let i = 0; i < x.length; i++) {
      exps[i] = Math.exp(x[i] - max);
      sum += exps[i];
    }

    // Normalize
    const result = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      result[i] = exps[i] / sum;
    }
    return result;
  }

  /**
   * Matrix multiplication: (m x n) @ (n x p) -> (m x p)
   */
  private matmul(
    A: Float32Array,
    B: Float32Array,
    m: number,
    n: number,
    p: number
  ): Float32Array {
    const result = new Float32Array(m * p);

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += A[i * n + k] * B[k * p + j];
        }
        result[i * p + j] = sum;
      }
    }
    return result;
  }

  /**
   * Add bias to matrix
   */
  private addBias(
    A: Float32Array,
    bias: Float32Array,
    m: number,
    n: number
  ): Float32Array {
    const result = new Float32Array(A.length);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        result[i * n + j] = A[i * n + j] + bias[j];
      }
    }
    return result;
  }

  /**
   * Forward pass through neural network
   */
  private forward(input: Float32Array): Float32Array {
    // Input: 1 x 63
    // W1: 63 x hidden_size
    // b1: 1 x hidden_size
    
    // z1 = input @ W1 + b1
    let z1 = this.matmul(input, this.W1, 1, this.inputSize, this.hiddenSize);
    z1 = this.addBias(z1, this.b1, 1, this.hiddenSize);

    // a1 = relu(z1)
    const a1 = this.relu(z1);

    // z2 = a1 @ W2 + b2
    let z2 = this.matmul(a1, this.W2, 1, this.hiddenSize, this.numClasses);
    z2 = this.addBias(z2, this.b2, 1, this.numClasses);

    // output = softmax(z2)
    const output = this.softmax(z2);

    return output;
  }

  /**
   * Convert hand landmarks to input features
   * Expects array of 21 landmarks with [x, y, z] coordinates
   */
  normalizeLandmarks(landmarks: Array<{ x: number; y: number; z: number }>): Float32Array {
    if (landmarks.length !== 21) {
      throw new Error(`Expected 21 landmarks, got ${landmarks.length}`);
    }

    const features = new Float32Array(63);
    for (let i = 0; i < 21; i++) {
      features[i * 3] = landmarks[i].x;
      features[i * 3 + 1] = landmarks[i].y;
      features[i * 3 + 2] = landmarks[i].z;
    }
    return features;
  }

  /**
   * Make prediction from hand landmarks
   */
  predict(landmarks: Array<{ x: number; y: number; z: number }>): PredictionResult {
    // Normalize landmarks to input features
    const features = this.normalizeLandmarks(landmarks);

    // Forward pass
    const probabilities = this.forward(features);

    // Find top prediction
    let maxIdx = 0;
    let maxProb = probabilities[0];
    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIdx = i;
      }
    }

    // Get top 5 predictions
    const indices = Array.from({ length: this.numClasses }, (_, i) => i).sort(
      (a, b) => probabilities[b] - probabilities[a]
    );

    const top5 = indices.slice(0, 5).map((idx) => ({
      id: idx,
      name: this.classes[idx] || `class_${idx}`,
      confidence: probabilities[idx],
    }));

    return {
      class_id: maxIdx,
      class_name: this.classes[maxIdx] || `class_${maxIdx}`,
      confidence: maxProb,
      top_5: top5,
    };
  }

  /**
   * Batch prediction for multiple frames
   */
  predictBatch(
    landmarksList: Array<Array<{ x: number; y: number; z: number }>>
  ): PredictionResult[] {
    return landmarksList.map((landmarks) => this.predict(landmarks));
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      num_classes: this.numClasses,
      hidden_size: this.hiddenSize,
      input_size: this.inputSize,
      num_landmarks: 21,
      classes_sample: this.classes.slice(0, 10),
    };
  }
}

/**
 * Utility function to load model from JSON
 */
export async function loadASLModel(
  modelPath: string,
  classesPath: string
): Promise<ASLModelInference> {
  try {
    // Load model weights
    const weightsResponse = await fetch(modelPath);
    const weights = (await weightsResponse.json()) as ModelWeights;

    // Load classes
    const classesResponse = await fetch(classesPath);
    const classes = (await classesResponse.json()) as string[];

    // Create and return model
    return new ASLModelInference(weights, classes);
  } catch (error) {
    console.error("Failed to load model:", error);
    throw error;
  }
}

/**
 * Smooth predictions over time (temporal smoothing)
 */
export class PredictionSmoother {
  private buffer: PredictionResult[] = [];
  private windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  addPrediction(prediction: PredictionResult): PredictionResult {
    this.buffer.push(prediction);

    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    return this.getSmoothedPrediction();
  }

  private getSmoothedPrediction(): PredictionResult {
    if (this.buffer.length === 0) {
      throw new Error("No predictions in buffer");
    }

    // Average confidence scores for each class
    const classScores = new Map<number, number>();
    for (const pred of this.buffer) {
      classScores.set(
        pred.class_id,
        (classScores.get(pred.class_id) || 0) + pred.confidence
      );
    }

    // Find class with highest average score
    let bestClass = this.buffer[0].class_id;
    let bestScore = 0;
    for (const [classId, score] of classScores.entries()) {
      const avgScore = score / this.buffer.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestClass = classId;
      }
    }

    // Return the latest prediction but with smoothed confidence
    const latestPred = this.buffer[this.buffer.length - 1];
    return {
      ...latestPred,
      class_id: bestClass,
      confidence: bestScore,
    };
  }

  clear() {
    this.buffer = [];
  }
}
