#!/usr/bin/env python3
"""
Lightweight MS-ASL Model Training
==================================
Trains a neural network on synthetic hand landmark data based on MS-ASL dataset.

This approach:
1. Generates synthetic landmark training data from dataset structure
2. Trains a lightweight neural network (no TensorFlow required for basic training)
3. Exports model in multiple formats
4. Can be extended with real video data

Usage:
    python training/train_lightweight.py --classes 100
    python training/train_lightweight.py --classes 500
    python training/train_lightweight.py --classes 1000
"""

import json
import numpy as np
from pathlib import Path
import argparse
import logging
from typing import Tuple, Dict, List
import pickle
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
SCRIPT_DIR = Path(__file__).parent
MSASL_DIR = SCRIPT_DIR.parent / 'MS-ASL'
OUTPUT_DIR = SCRIPT_DIR / 'models'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Constants
NUM_LANDMARKS = 21  # MediaPipe Hands
LANDMARK_DIM = 3     # x, y, z
FEATURE_SIZE = NUM_LANDMARKS * LANDMARK_DIM  # 63

class LightweightModel:
    """Simple neural network for ASL gesture recognition."""
    
    def __init__(self, num_classes: int, hidden_size: int = 256):
        """Initialize model weights."""
        self.num_classes = num_classes
        self.hidden_size = hidden_size
        np.random.seed(42)
        
        # Layer 1: Input -> Hidden
        self.W1 = np.random.randn(FEATURE_SIZE, hidden_size) * 0.01
        self.b1 = np.zeros((1, hidden_size))
        
        # Layer 2: Hidden -> Output
        self.W2 = np.random.randn(hidden_size, num_classes) * 0.01
        self.b2 = np.zeros((1, num_classes))
        
        # Learning rate
        self.lr = 0.001
    
    @staticmethod
    def relu(x):
        """ReLU activation."""
        return np.maximum(0, x)
    
    @staticmethod
    def relu_derivative(x):
        """ReLU derivative."""
        return (x > 0).astype(float)
    
    @staticmethod
    def softmax(x):
        """Softmax activation."""
        exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)
    
    def forward(self, X):
        """Forward pass."""
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.relu(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.softmax(self.z2)
        return self.a2
    
    def backward(self, X, y, output):
        """Backward pass."""
        m = X.shape[0]
        
        # Output layer gradient
        dz2 = output.copy()
        dz2[np.arange(m), y] -= 1
        dz2 /= m
        
        dW2 = np.dot(self.a1.T, dz2)
        db2 = np.sum(dz2, axis=0, keepdims=True)
        
        # Hidden layer gradient
        da1 = np.dot(dz2, self.W2.T)
        dz1 = da1 * self.relu_derivative(self.z1)
        
        dW1 = np.dot(X.T, dz1)
        db1 = np.sum(dz1, axis=0, keepdims=True)
        
        # Update weights
        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2
    
    def train(self, X_train, y_train, X_val, y_val, epochs: int = 20, batch_size: int = 32):
        """Train the model."""
        train_losses = []
        val_losses = []
        
        for epoch in range(epochs):
            # Shuffle data
            indices = np.random.permutation(len(X_train))
            X_shuffled = X_train[indices]
            y_shuffled = y_train[indices]
            
            # Mini-batch training
            for i in range(0, len(X_train), batch_size):
                X_batch = X_shuffled[i:i + batch_size]
                y_batch = y_shuffled[i:i + batch_size]
                
                # Forward pass
                output = self.forward(X_batch)
                
                # Backward pass
                self.backward(X_batch, y_batch, output)
            
            # Evaluate
            train_pred = self.forward(X_train)
            train_loss = -np.mean(np.log(train_pred[np.arange(len(y_train)), y_train] + 1e-8))
            train_losses.append(train_loss)
            
            val_pred = self.forward(X_val)
            val_loss = -np.mean(np.log(val_pred[np.arange(len(y_val)), y_val] + 1e-8))
            val_losses.append(val_loss)
            
            if (epoch + 1) % 5 == 0:
                train_acc = np.mean(np.argmax(train_pred, axis=1) == y_train)
                val_acc = np.mean(np.argmax(val_pred, axis=1) == y_val)
                logger.info(f"Epoch {epoch + 1}/{epochs} - "
                           f"Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f} - "
                           f"Acc: {train_acc:.4f}, Val Acc: {val_acc:.4f}")
        
        return train_losses, val_losses
    
    def predict(self, X):
        """Make predictions."""
        output = self.forward(X)
        return np.argmax(output, axis=1), np.max(output, axis=1)
    
    def save(self, path: str):
        """Save model weights."""
        model_data = {
            'W1': self.W1,
            'b1': self.b1,
            'W2': self.W2,
            'b2': self.b2,
            'num_classes': self.num_classes,
            'hidden_size': self.hidden_size
        }
        with open(path, 'wb') as f:
            pickle.dump(model_data, f)
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str):
        """Load model weights."""
        with open(path, 'rb') as f:
            model_data = pickle.load(f)
        self.W1 = model_data['W1']
        self.b1 = model_data['b1']
        self.W2 = model_data['W2']
        self.b2 = model_data['b2']
        logger.info(f"Model loaded from {path}")

class MSASLDataGenerator:
    """Generate synthetic training data based on MS-ASL structure."""
    
    def __init__(self, num_classes: int):
        """Initialize data generator."""
        self.num_classes = num_classes
        self.classes = self._load_classes()[:num_classes]
        self.train_data = self._load_json('MSASL_train.json')
        self.val_data = self._load_json('MSASL_val.json')
        self.test_data = self._load_json('MSASL_test.json')
    
    def _load_classes(self) -> List[str]:
        """Load class labels."""
        with open(MSASL_DIR / 'MSASL_classes.json', 'r') as f:
            return json.load(f)
    
    def _load_json(self, filename: str) -> List[Dict]:
        """Load JSON data."""
        path = MSASL_DIR / filename
        if not path.exists():
            return []
        with open(path, 'r') as f:
            return json.load(f)
    
    def _generate_synthetic_landmarks(self, label: int, noise_level: float = 0.1):
        """Generate synthetic hand landmarks for a class."""
        # Create base landmarks based on class ID
        np.random.seed(label)
        
        # Generate base pattern (0-1 range)
        landmarks = np.random.randn(NUM_LANDMARKS, LANDMARK_DIM) * 0.3 + 0.5
        landmarks = np.clip(landmarks, 0, 1)
        
        # Add slight class-specific variation
        landmarks += (label / self.num_classes) * 0.1
        landmarks = np.clip(landmarks, 0, 1)
        
        # Add random noise
        landmarks += np.random.randn(NUM_LANDMARKS, LANDMARK_DIM) * noise_level
        landmarks = np.clip(landmarks, 0, 1)
        
        return landmarks.flatten()
    
    def generate_training_data(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Generate synthetic training data."""
        logger.info(f"Generating synthetic training data for {self.num_classes} classes...")
        
        # Filter data to only use available classes
        train_data = [d for d in self.train_data if 0 <= d.get('label', -1) < self.num_classes]
        val_data = [d for d in self.val_data if 0 <= d.get('label', -1) < self.num_classes]
        
        # Generate training set
        X_train = []
        y_train = []
        for sample in train_data:
            label = sample['label']
            # Generate multiple samples per video clip (with variation)
            for _ in range(2):  # 2 variations per clip
                landmarks = self._generate_synthetic_landmarks(label, noise_level=0.15)
                X_train.append(landmarks)
                y_train.append(label)
        
        X_train = np.array(X_train, dtype=np.float32)
        y_train = np.array(y_train, dtype=np.int32)
        
        # Generate validation set
        X_val = []
        y_val = []
        for sample in val_data:
            label = sample['label']
            landmarks = self._generate_synthetic_landmarks(label, noise_level=0.10)
            X_val.append(landmarks)
            y_val.append(label)
        
        X_val = np.array(X_val, dtype=np.float32)
        y_val = np.array(y_val, dtype=np.int32)
        
        logger.info(f"Generated {len(X_train)} training samples")
        logger.info(f"Generated {len(X_val)} validation samples")
        
        return X_train, y_train, X_val, y_val

def main():
    """Main training pipeline."""
    parser = argparse.ArgumentParser(description='Train MS-ASL model')
    parser.add_argument('--classes', type=int, default=100,
                       choices=[100, 200, 500, 1000],
                       help='Number of ASL classes to train on')
    parser.add_argument('--epochs', type=int, default=20,
                       help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=32,
                       help='Batch size for training')
    args = parser.parse_args()
    
    logger.info("=" * 70)
    logger.info("MS-ASL LIGHTWEIGHT MODEL TRAINING")
    logger.info("=" * 70)
    logger.info(f"Classes: {args.classes}")
    logger.info(f"Epochs: {args.epochs}")
    logger.info(f"Batch Size: {args.batch_size}")
    logger.info("")
    
    try:
        # Generate data
        generator = MSASLDataGenerator(args.classes)
        X_train, y_train, X_val, y_val = generator.generate_training_data()
        
        # Create and train model
        logger.info("Creating model...")
        model = LightweightModel(args.classes, hidden_size=256)
        
        logger.info("Training...")
        train_losses, val_losses = model.train(
            X_train, y_train, X_val, y_val,
            epochs=args.epochs,
            batch_size=args.batch_size
        )
        
        # Evaluate on validation set
        logger.info("\nEvaluating on validation set...")
        val_pred, val_conf = model.predict(X_val)
        val_acc = np.mean(val_pred == y_val)
        logger.info(f"Validation Accuracy: {val_acc:.4f}")
        logger.info(f"Average Confidence: {np.mean(val_conf):.4f}")
        
        # Save model
        model_path = OUTPUT_DIR / f'msasl_{args.classes}_classes.pkl'
        model.save(str(model_path))
        
        # Save metadata
        metadata = {
            'num_classes': args.classes,
            'classes': generator.classes,
            'feature_size': FEATURE_SIZE,
            'num_landmarks': NUM_LANDMARKS,
            'landmark_dim': LANDMARK_DIM,
            'validation_accuracy': float(val_acc),
        }
        
        metadata_path = OUTPUT_DIR / f'msasl_{args.classes}_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"Metadata saved to {metadata_path}")
        
        logger.info("\n" + "=" * 70)
        logger.info("TRAINING COMPLETE")
        logger.info("=" * 70)
        logger.info(f"Model: {model_path}")
        logger.info(f"Classes trained: {args.classes}")
        logger.info(f"Final validation accuracy: {val_acc:.4f}")
        
    except Exception as e:
        logger.error(f"Error during training: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
