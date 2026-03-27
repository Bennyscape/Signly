"""
MS-ASL Model Training Script
=============================
Trains a neural network model on MS-ASL (Microsoft American Sign Language) dataset.

This script:
1. Loads MS-ASL metadata and classes
2. Works with pre-extracted hand landmarks (or simulated data for demo)
3. Builds and trains a neural network
4. Exports model in TensorFlow.js format for web deployment

Usage:
    python train_msasl_model.py --mode demo      # Demo with synthetic data
    python train_msasl_model.py --mode subset    # Train on 100 classes
    python train_msasl_model.py --mode full      # Train on all 1000 classes
"""

import json
import os
import numpy as np
import pandas as pd
from pathlib import Path
import argparse
import logging
from typing import Tuple, List, Dict

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, Model
    from tensorflow.keras.layers import Dense, Dropout, Input, GlobalAveragePooling1D
    from tensorflow.keras.utils import to_categorical
    from sklearn.model_selection import train_test_split
    import tensorflowjs as tfjs
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("Warning: TensorFlow not available. Install it with: pip install tensorflow")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
SCRIPT_DIR = Path(__file__).parent
MSASL_DIR = SCRIPT_DIR.parent / 'MS-ASL'
DATA_DIR = SCRIPT_DIR / 'data'
PROCESSED_DIR = DATA_DIR / 'processed'
OUTPUT_DIR = SCRIPT_DIR / 'models'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Constants
HAND_LANDMARKS_SIZE = 21  # MediaPipe Hands has 21 landmarks
LANDMARK_FEATURES = 3    # Each landmark has x, y, z
INPUT_SHAPE = HAND_LANDMARKS_SIZE * LANDMARK_FEATURES  # 63 features

class MSASLTrainer:
    """Train a neural network on MS-ASL dataset."""
    
    def __init__(self, num_classes: int = 1000, mode: str = 'subset'):
        """
        Initialize the trainer.
        
        Args:
            num_classes: Number of classes to use
            mode: 'demo', 'subset', or 'full'
        """
        self.num_classes = num_classes
        self.mode = mode
        self.model = None
        
        # Load MS-ASL metadata
        self._load_classes()
        self._load_dataset()
    
    def _load_classes(self):
        """Load class labels from MS-ASL."""
        classes_path = MSASL_DIR / 'MSASL_classes.json'
        with open(classes_path, 'r') as f:
            all_classes = json.load(f)
        
        # Use subset if specified
        self.classes = all_classes[:self.num_classes]
        self.class_to_id = {cls: idx for idx, cls in enumerate(self.classes)}
        logger.info(f"Loaded {len(self.classes)} ASL classes")
    
    def _load_dataset(self):
        """Load MS-ASL dataset metadata."""
        train_path = MSASL_DIR / 'MSASL_train.json'
        val_path = MSASL_DIR / 'MSASL_val.json'
        test_path = MSASL_DIR / 'MSASL_test.json'
        
        with open(train_path, 'r') as f:
            self.train_data = json.load(f)
        with open(val_path, 'r') as f:
            self.val_data = json.load(f)
        with open(test_path, 'r') as f:
            self.test_data = json.load(f)
        
        logger.info(f"Loaded {len(self.train_data)} training samples")
        logger.info(f"Loaded {len(self.val_data)} validation samples")
        logger.info(f"Loaded {len(self.test_data)} test samples")
    
    def _generate_synthetic_data(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic hand landmark data for demonstration.
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            X (features), y (labels)
        """
        logger.info(f"Generating {num_samples} synthetic samples for {len(self.classes)} classes")
        
        X = []
        y = []
        
        np.random.seed(42)
        samples_per_class = num_samples // len(self.classes)
        
        for class_id in range(len(self.classes)):
            for _ in range(samples_per_class):
                # Generate random hand landmarks (normalized coordinates)
                landmarks = np.random.randn(INPUT_SHAPE) * 0.3 + class_id * 0.01
                X.append(landmarks)
                y.append(class_id)
        
        X = np.array(X, dtype=np.float32)
        y = np.array(y, dtype=np.int32)
        
        logger.info(f"Generated data shape: X={X.shape}, y={y.shape}")
        return X, y
    
    def _load_landmarks_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load pre-extracted landmark data from CSV files.
        
        For this to work, landmark extraction must have been completed.
        Fall back to synthetic data if not available.
        """
        landmarks_path = PROCESSED_DIR / 'landmarks_train.csv'
        
        if landmarks_path.exists():
            logger.info(f"Loading landmarks from {landmarks_path}")
            df = pd.read_csv(landmarks_path)
            
            # Separate features and labels
            X = df.drop('class_id', axis=1).values.astype(np.float32)
            y = df['class_id'].values.astype(np.int32)
            
            logger.info(f"Loaded data shape: X={X.shape}, y={y.shape}")
            return X, y
        else:
            logger.warning(f"Landmarks file not found: {landmarks_path}")
            logger.info("Using synthetic data for demonstration")
            return self._generate_synthetic_data()
    
    def build_model(self):
        """Build a neural network model."""
        logger.info("Building neural network model...")
        
        self.model = Sequential([
            Dense(256, activation='relu', input_shape=(INPUT_SHAPE,)),
            Dropout(0.3),
            
            Dense(128, activation='relu'),
            Dropout(0.3),
            
            Dense(64, activation='relu'),
            Dropout(0.2),
            
            Dense(len(self.classes), activation='softmax')
        ])
        
        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        logger.info(self.model.summary())
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray,
              X_val: np.ndarray, y_val: np.ndarray,
              epochs: int = 50, batch_size: int = 32):
        """
        Train the model.
        
        Args:
            X_train, y_train: Training data
            X_val, y_val: Validation data
            epochs: Number of epochs
            batch_size: Batch size
        """
        logger.info("Starting training...")
        
        # Convert labels to one-hot encoding
        y_train_categorical = to_categorical(y_train, num_classes=len(self.classes))
        y_val_categorical = to_categorical(y_val, num_classes=len(self.classes))
        
        # Train with early stopping
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        )
        
        history = self.model.fit(
            X_train, y_train_categorical,
            validation_data=(X_val, y_val_categorical),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stopping],
            verbose=1
        )
        
        return history
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray):
        """Evaluate model on test set."""
        logger.info("Evaluating model on test set...")
        
        y_test_categorical = to_categorical(y_test, num_classes=len(self.classes))
        loss, accuracy = self.model.evaluate(X_test, y_test_categorical, verbose=0)
        
        logger.info(f"Test Loss: {loss:.4f}")
        logger.info(f"Test Accuracy: {accuracy * 100:.2f}%")
        
        return loss, accuracy
    
    def export_model(self, output_name: str = 'msasl_model'):
        """
        Export model to TensorFlow.js format.
        
        Args:
            output_name: Name for output directory
        """
        logger.info("Exporting model...")
        
        # Save as H5 first
        h5_path = OUTPUT_DIR / f'{output_name}.h5'
        self.model.save(str(h5_path))
        logger.info(f"Saved Keras model to {h5_path}")
        
        # Export to TensorFlow.js
        tfjs_dir = OUTPUT_DIR / f'{output_name}_tfjs'
        tfjs_dir.mkdir(parents=True, exist_ok=True)
        
        tfjs.converters.save_keras_model(self.model, str(tfjs_dir))
        logger.info(f"Exported TensorFlow.js model to {tfjs_dir}/")
        
        # Save class labels
        labels_path = tfjs_dir / 'labels.json'
        with open(labels_path, 'w') as f:
            json.dump(self.classes, f, indent=2)
        logger.info(f"Saved class labels to {labels_path}")
        
        # Save metadata
        metadata = {
            'num_classes': len(self.classes),
            'input_features': INPUT_SHAPE,
            'landmark_count': HAND_LANDMARKS_SIZE,
            'landmark_dimensions': LANDMARK_FEATURES,
            'classes': self.classes
        }
        metadata_path = tfjs_dir / 'metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"Saved metadata to {metadata_path}")
        
        return str(tfjs_dir)
    
    def train_pipeline(self, epochs: int = 50, test_size: float = 0.2):
        """Run complete training pipeline."""
        logger.info("=" * 70)
        logger.info(f'MS-ASL MODEL TRAINING - Mode: {self.mode.upper()}')
        logger.info("=" * 70)
        logger.info(f"Classes: {len(self.classes)}")
        logger.info("")
        
        # Load or generate data
        X, y = self._load_landmarks_data()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Further split training into train/val
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
        )
        
        logger.info(f"Training samples: {len(X_train)}")
        logger.info(f"Validation samples: {len(X_val)}")
        logger.info(f"Test samples: {len(X_test)}")
        logger.info("")
        
        # Build and train model
        self.build_model()
        self.train(X_train, y_train, X_val, y_val, epochs=epochs)
        
        # Evaluate
        self.evaluate(X_test, y_test)
        
        # Export
        tfjs_dir = self.export_model()
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("TRAINING COMPLETE!")
        logger.info("=" * 70)
        logger.info(f"Model exported to: {tfjs_dir}")
        logger.info("")
        logger.info("Next steps:")
        logger.info(f"  1. Copy the contents of '{tfjs_dir}' to 'public/models/msasl/'")
        logger.info("  2. Update the app to use the new model")
        logger.info("")


def main():
    parser = argparse.ArgumentParser(description='Train MS-ASL model')
    parser.add_argument(
        '--mode',
        choices=['demo', 'subset', 'full'],
        default='subset',
        help='Training mode: demo (synthetic), subset (100 classes), or full (1000 classes)'
    )
    parser.add_argument(
        '--epochs',
        type=int,
        default=50,
        help='Number of training epochs'
    )
    parser.add_argument(
        '--classes',
        type=int,
        default=None,
        help='Number of classes to train on (overrides mode)'
    )
    
    args = parser.parse_args()
    
    if not TENSORFLOW_AVAILABLE:
        logger.error("TensorFlow is required for training. Install with:")
        logger.error("  pip install tensorflow")
        return
    
    # Determine number of classes
    if args.classes:
        num_classes = args.classes
    elif args.mode == 'demo':
        num_classes = 29  # Alphabet + space + del + nothing
    elif args.mode == 'subset':
        num_classes = 100
    else:  # full
        num_classes = 1000
    
    # Create trainer and run pipeline
    trainer = MSASLTrainer(num_classes=num_classes, mode=args.mode)
    trainer.train_pipeline(epochs=args.epochs)


if __name__ == '__main__':
    main()
