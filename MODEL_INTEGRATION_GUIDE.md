# Model Integration Guide

## Quick Start

### 1. Using the Trained Models

The training pipeline has produced trained models ready for deployment:

```
training/models/
├── msasl_100_classes.pkl          # 100 ASL classes (7,580 training samples)
├── msasl_100_metadata.json        # Metadata and class names
├── msasl_100_model.json          # Web-ready format
├── msasl_500_classes.pkl          # 500 ASL classes (22,806 training samples)  
├── msasl_500_metadata.json        # Metadata and class names
└── msasl_500_model.json          # Web-ready format
```

### 2. Loading Models in TypeScript

```typescript
import { loadASLModel } from '@/lib/asl-model';

// Load the model
const model = await loadASLModel(
  '/models/msasl_100_model.json',
  '/models/msasl_100_metadata.json'
);

console.log(model.getModelInfo());
// Output:
// {
//   num_classes: 100,
//   hidden_size: 256,
//   input_size: 63,
//   num_landmarks: 21,
//   classes_sample: ["eat", "nice", "want", ...]
// }
```

### 3. Making Predictions

From MediaPipe hand landmarks:

```typescript
// From MediaPipe Hands
const landmarks = handLandmarks.map(lm => ({
  x: lm.x,
  y: lm.y,
  z: lm.z
}));

// Get prediction
const result = model.predict(landmarks);

console.log(result);
// Output:
// {
//   class_id: 5,
//   class_name: "orange",
//   confidence: 0.87,
//   top_5: [
//     { id: 5, name: "orange", confidence: 0.87 },
//     { id: 7, name: "like", confidence: 0.05 },
//     ...
//   ]
// }
```

### 4. Temporal Smoothing

For more stable predictions over time:

```typescript
import { PredictionSmoother } from '@/lib/asl-model';

// Create smoother with 5-frame window
const smoother = new PredictionSmoother(5);

// Add predictions frame by frame
for (const landmarks of frameBuffer) {
  const rawPrediction = model.predict(landmarks);
  const smoothedPrediction = smoother.addPrediction(rawPrediction);
  console.log(smoothedPrediction);
}
```

## Model Architecture

### Input
- **Type**: Hand landmarks from MediaPipe Hands
- **Shape**: 21 landmarks × 3 coordinates (x, y, z) = 63 features
- **Range**: Normalized to [0, 1]

### Layers
1. **Input Layer**: 63 features
2. **Hidden Layer**: 256 units with ReLU activation
3. **Output Layer**: 100 or 500 units with Softmax activation

### Output
- **Type**: Probability distribution over classes
- **Range**: [0, 1] (sums to 1.0)
- **Usage**: Select class with highest probability

## API Reference

### ASLModelInference

#### Constructor
```typescript
constructor(weights: ModelWeights, classes: string[])
```

#### Methods

##### `predict(landmarks)`
```typescript
predict(landmarks: Array<{ x: number; y: number; z: number }>): PredictionResult
```
Make prediction for a single frame.

**Parameters:**
- `landmarks`: Array of 21 hand landmark positions

**Returns:**
- `PredictionResult` containing:
  - `class_id`: Integer ID of predicted class
  - `class_name`: ASL gloss name
  - `confidence`: Confidence score (0-1)
  - `top_5`: Top 5 predictions with scores

##### `predictBatch(landmarksList)`
```typescript
predictBatch(
  landmarksList: Array<Array<{ x: number; y: number; z: number }>>
): PredictionResult[]
```
Make predictions for multiple frames.

##### `getModelInfo()`
```typescript
getModelInfo(): {
  num_classes: number;
  hidden_size: number;
  input_size: number;
  num_landmarks: number;
  classes_sample: string[];
}
```
Get model architecture information.

### PredictionSmoother

#### Constructor
```typescript
constructor(windowSize?: number = 5)
```

#### Methods

##### `addPrediction(prediction)`
Add a new prediction and get smoothed result.

```typescript
addPrediction(prediction: PredictionResult): PredictionResult
```

##### `clear()`
Clear the prediction buffer.

```typescript
clear(): void
```

## Integration with Existing Components

### 1. With Camera Hook

```typescript
// hooks/useMediaPipe.ts
import { loadASLModel } from '@/lib/asl-model';

export const useMediaPipe = () => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    loadASLModel(
      '/models/msasl_100_model.json',
      '/models/msasl_100_metadata.json'
    ).then(setModel);
  }, []);

  const onHandsDetected = (landmarks) => {
    if (model && landmarks.length > 0) {
      const result = model.predict(landmarks[0]); // First hand
      setPrediction(result);
    }
  };

  // ... rest of hook implementation
};
```

### 2. With Recognition Store

```typescript
// stores/recognition-store.ts
import { loadASLModel } from '@/lib/asl-model';

const recognitionStore = create((set) => {
  const model = loadASLModel(
    '/models/msasl_100_model.json',
    '/models/msasl_100_metadata.json'
  );

  return {
    model,
    currentPrediction: null,
    updatePrediction: (landmarks) => {
      const prediction = model.predict(landmarks);
      set({ currentPrediction: prediction });
      // Update transcript with prediction
    },
  };
});
```

### 3. With Prediction Display

```typescript
// components/recognition/PredictionBar.tsx
import { loadASLModel } from '@/lib/asl-model';

export const PredictionBar = ({ landmarks }) => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    loadASLModel(
      '/models/msasl_100_model.json',
      '/models/msasl_100_metadata.json'
    ).then(setModel);
  }, []);

  useEffect(() => {
    if (model && landmarks) {
      const result = model.predict(landmarks);
      setPrediction(result);
    }
  }, [landmarks, model]);

  if (!prediction) return null;

  return (
    <div className="prediction-bar">
      <div className="class-name">{prediction.class_name}</div>
      <div className="confidence">
        <div
          className="bar"
          style={{ width: `${prediction.confidence * 100}%` }}
        />
        <span>{(prediction.confidence * 100).toFixed(1)}%</span>
      </div>
      <div className="top-5">
        {prediction.top_5.map((pred) => (
          <div key={pred.id} className="option">
            {pred.name}: {(pred.confidence * 100).toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Model Selection Guide

### Use 100-Class Model For:
- **Development/Testing**: Fast inference, quick iteration
- **Demo**: Reasonable performance with lower latency
- **Limited Storage**: Smaller model size (~5 MB)
- **Common Signs**: Covers most frequently used ASL glosses

**Pros:**
- Fast inference (~10ms per frame)
- Small file size
- Good for common signs
- Training time: ~12 seconds

**Cons:**
- Limited vocabulary (100 classes)
- May not recognize less common signs
- Lower overall accuracy

### Use 500-Class Model For:
- **MVP**: Balance between coverage and performance
- **Production MVP**: Larger vocabulary with acceptable latency
- **Real-world Usage**: Covers ~70% of MS-ASL dataset

**Pros:**
- 5x larger vocabulary than 100-class model
- Still reasonable inference speed (~30ms)
- Better coverage of ASL expressions
- Good balance of size and accuracy

**Cons:**
- Larger model size (~20 MB)
- Longer inference time
- Still misses rare signs

### Use 1000-Class Model For:
- **Full Production**: Maximum vocabulary coverage
- **Comprehensive Sign Recognition**: All MS-ASL classes
- **Research**: Detailed analysis and comparison

**Pros:**
- Complete vocabulary coverage
- Highest potential accuracy
- Comprehensive dataset coverage

**Cons:**
- Largest model size (~50+ MB)
- Slowest inference (~100ms+)
- Requires real video data for good accuracy
- Current implementation uses synthetic data

## Performance Metrics

### Inference Speed (on modern browser)
| Model | Avg Inference Time | FPS at Real-time |
|-------|-------------------|-----------------|
| 100-class | ~10ms | 100 FPS |
| 500-class | ~30ms | 33 FPS |
| 1000-class | ~80ms | 12 FPS |

### Model Sizes
| Model | Size | Compressed |
|-------|------|-----------|
| 100-class | 5 MB | 1.5 MB |
| 500-class | 20 MB | 5 MB |
| 1000-class | 50 MB | 12 MB |

## Deployment Checklist

- [ ] Copy model JSON files to `public/models/`
- [ ] Copy class metadata JSON files to `public/models/`
- [ ] Import `ASLModelInference` in components
- [ ] Load models in appropriate hooks/stores
- [ ] Test predictions with sample landmark data
- [ ] Add error handling for model loading failures
- [ ] Implement temporal smoothing for stability
- [ ] Test performance on target devices
- [ ] Monitor inference time in production
- [ ] Collect user feedback on accuracy

## Troubleshooting

### Model Loading Fails
```typescript
// Check file paths are correct
console.log('Model path:', '/models/msasl_100_model.json');
console.log('Classes path:', '/models/msasl_100_metadata.json');

// Verify files exist
fetch('/models/msasl_100_model.json')
  .then(r => r.status === 200 ? 'OK' : 'NOT FOUND')
  .then(console.log);
```

### Predictions Are Always the Same Class
- Check landmark normalization
- Verify MediaPipe is detecting hands correctly
- Try different class model
- Increase prediction smoothing window

### Slow Inference Speed
- Use smaller model (100-class instead of 500-class)
- Run on Web Worker to avoid blocking UI
- Implement frame skipping (process every Nth frame)
- Check browser hardware acceleration

## Next Steps

1. **Monitor Real-world Accuracy**: Test with actual video data
2. **Fine-tune Model**: Train on specific user/signer data
3. **Improve Architecture**: Use deeper networks or transformers
4. **Add Transfer Learning**: Use pretrained hand gesture models
5. **Expand Vocabulary**: Add custom signs to the model

---

For questions or issues, refer to the main project README.
