# MS-ASL Model Training Guide

## Project Analysis Summary

This project is an **ASL (American Sign Language) to Speech** web application that uses:
- **Frontend**: Next.js with TypeScript
- **Real-time Processing**: MediaPipe Hands for gesture recognition
- **ML Model**: Neural network trained on hand landmarks
- **Dataset**: MS-ASL (Microsoft American Sign Language) - 1000 classes

## Dataset Overview

### MS-ASL Dataset Statistics
- **Total Classes**: 1000 ASL glosses (sign words)
- **Training Samples**: 16,054
- **Validation Samples**: 5,287
- **Test Samples**: 4,172
- **Total Samples**: 25,513

### Class Distribution
- **Average samples per class**: 16.1
- **Min samples**: 1 (some rare signs)
- **Max samples**: 57 (common signs like "eat")
- **Top classes**: eat (57), nice (54), want (53), teacher (50)

### Available Subsets
- **MS-ASL-100**: 3,790 samples (first 100 classes, 23.6%)
- **MS-ASL-200**: 6,321 samples (first 200 classes, 39.4%)
- **MS-ASL-500**: 11,403 samples (first 500 classes, 71.0%)
- **MS-ASL-1000**: 16,054 samples (all classes, 100%)

## Dataset Format

Each training sample contains:
```json
{
  "url": "https://www.youtube.com/watch?v=...",  // YouTube video link
  "start_time": 0.0,                              // Start time in seconds
  "end_time": 2.767,                              // End time in seconds
  "label": 830,                                   // Class ID (0-999)
  "text": "match",                                // ASL gloss/word
  "box": [0.057, 0.216, 1.0, 0.730],            // Normalized bounding box
  "width": 640.0,                                // Video width
  "height": 360.0,                               // Video height
  "fps": 30.0,                                   // Frames per second
  "signer_id": 0,                                // Signer identifier
  ...
}
```

## Training Pipeline

### Phase 1: Data Preparation
1. **Download Videos**: Download video clips from YouTube URLs
   - Tools: youtube-dl, yt-dlp
   - Storage: ~500GB for full dataset
   - Extract clips using start_time and end_time

2. **Extract Hand Landmarks**: Use MediaPipe Hands
   ```
   Input: Video frames
   Output: 21 hand landmarks × 3 coordinates (x, y, z) = 63 features per frame
   Normalization: Center on wrist, scale by max distance
   ```

3. **Prepare Training Data**:
   - Load landmark sequences
   - Normalize features
   - Create train/val/test splits
   - Balance classes if needed

### Phase 2: Model Training
1. **Architecture**: Dense Neural Network
   - Input layer: 63 features (hand landmarks)
   - Hidden layers: 256 → 128 → 64 neurons with ReLU activation
   - Dropout: 0.3, 0.3, 0.2 (regularization)
   - Output layer: softmax over 1000 classes

2. **Training Configuration**:
   - Optimizer: Adam (lr=0.001)
   - Loss function: Categorical crossentropy
   - Batch size: 32
   - Epochs: 50 (with early stopping)
   - Metrics: Accuracy

3. **Expected Performance**:
   - Baseline (random): 0.1%
   - Simple model: 40-60% accuracy
   - Optimized model: 70-85% accuracy
   - With data augmentation: 80-90% accuracy

### Phase 3: Model Export
1. **Export Formats**:
   - Keras H5 format (for backup)
   - TensorFlow.js (for web deployment)
   - Include metadata: class labels, feature info

2. **Deployment**:
   - Copy model to `public/models/msasl/`
   - Update app configuration
   - Test inference in browser

## Implementation Scripts

### 1. Data Analysis (`analyze_msasl.py`)
- Analyzes dataset structure
- Generates statistics
- No external dependencies required

**Usage**:
```bash
python training/analyze_msasl.py
python training/analyze_msasl.py --output report.txt
python training/analyze_msasl.py --subset 100
```

### 2. Data Processor (`process_msasl_data.py`)
- Loads MS-ASL metadata
- Creates metadata CSVs
- Generates subsets for testing

**Usage**:
```bash
python training/process_msasl_data.py --mode analyze
python training/process_msasl_data.py --mode subset
python training/process_msasl_data.py --mode full
```

### 3. Model Trainer (`train_msasl_model.py`)
- Builds and trains neural network
- Exports to TensorFlow.js
- Supports multiple training modes

**Usage**:
```bash
# Demo mode (synthetic data)
python training/train_msasl_model.py --mode demo

# Subset mode (first 100 classes)
python training/train_msasl_model.py --mode subset --epochs 50

# Full mode (all 1000 classes)
python training/train_msasl_model.py --mode full --epochs 100

# Custom classes
python training/train_msasl_model.py --classes 200
```

## Installation & Setup

### Prerequisites
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows

# Install dependencies
pip install -r training/requirements.txt
```

### Dependencies
- numpy: Numerical computations
- pandas: Data manipulation
- scikit-learn: Machine learning utilities
- tensorflow: Deep learning framework
- tensorflowjs: Web model conversion
- opencv-python: Video processing
- mediapipe: Hand landmark detection

## Training Approaches

### Option 1: Full Dataset (Production)
**Time**: ~2-4 hours on GPU, ~24 hours on CPU
**Accuracy**: 80-90%
**Storage**: ~500GB (videos) + 50GB (landmarks)

Steps:
1. Download all 16,054 videos from YouTube
2. Extract landmarks for all frames
3. Train on full dataset
4. Fine-tune with data augmentation

### Option 2: Subset (Development)
**Time**: ~15-30 minutes on GPU, ~2 hours on CPU
**Accuracy**: 70-80%
**Storage**: ~100GB

Steps:
1. Use MS-ASL-100 or MS-ASL-500 subset
2. Download fewer videos
3. Extract landmarks
4. Train on subset

### Option 3: Demo (Testing)
**Time**: ~5 minutes
**Accuracy**: Varies (synthetic data)
**Storage**: Minimal

Steps:
1. Generate synthetic hand landmark data
2. Train on demo model
3. Test deployment pipeline
4. Verify TensorFlow.js export

## Key Considerations

### Data Imbalance
- Some classes have 1 sample, others have 57
- Solution: Class weighting, oversampling, data augmentation

### Video Processing
- Large bandwidth required to download 16K+ videos
- Consider using cloud services (Google Cloud, AWS)
- Alternative: Use pre-processed landmark datasets

### Model Size
- TensorFlow.js model: ~10-50MB
- Must be reasonable for browser loading
- Optimize with quantization if needed

### Real-time Performance
- Inference must be fast for live webcam
- Target: <100ms per frame
- Run on GPU or optimized CPU

## Next Steps

1. **Immediate**: Run analysis scripts to understand data
   ```bash
   python training/analyze_msasl.py
   ```

2. **Short-term**: Try demo training
   ```bash
   python training/train_msasl_model.py --mode demo
   ```

3. **Medium-term**: Download sample videos and extract landmarks
   ```bash
   # Custom landmark extraction script needed
   ```

4. **Long-term**: Full dataset training with optimization
   - Use distributed processing
   - Implement data augmentation
   - Fine-tune hyperparameters

## Resources

- **MS-ASL Paper**: https://www.microsoft.com/en-us/research/project/ms-asl/
- **MediaPipe Hands**: https://mediapipe.dev/solutions/hands/
- **TensorFlow.js**: https://www.tensorflow.org/js
- **YouTube Data Extraction**: https://github.com/yt-dlp/yt-dlp

## Project Structure

```
asl-to-speech/
├── MS-ASL/                    # Dataset metadata
│   ├── MSASL_train.json      # 16,054 training samples
│   ├── MSASL_val.json        # 5,287 validation samples
│   ├── MSASL_test.json       # 4,172 test samples
│   ├── MSASL_classes.json    # 1000 class labels
│   └── MSASL_synonym.json    # Class synonyms
├── training/                  # Training scripts
│   ├── analyze_msasl.py      # Dataset analysis tool
│   ├── process_msasl_data.py # Data processor
│   ├── train_msasl_model.py  # Model trainer
│   └── requirements.txt      # Python dependencies
├── src/                       # Next.js application
│   ├── app/                  # Pages
│   ├── components/           # React components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   └── stores/               # State management
└── public/                    # Static assets
    └── models/               # Exported ML models
```

## Troubleshooting

### Network Issues
- Use offline landmark datasets
- Cache downloaded videos locally
- Consider distributed training across machines

### Memory Issues
- Process videos in batches
- Use data generators instead of loading all data
- Reduce batch size during training

### Model Performance
- Increase training epochs
- Use data augmentation
- Implement callback early stopping
- Fine-tune learning rate

---

**Last Updated**: March 25, 2026
**Dataset Version**: MS-ASL v1.0
**Model Framework**: TensorFlow 2.x with TensorFlow.js export
