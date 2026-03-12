"""
ASL Alphabet Model Training Script
===================================
Trains a dense neural network on MediaPipe hand landmarks for ASL alphabet recognition.

Usage:
    python training/scripts/train_alphabet.py

Prerequisites:
    pip install tensorflow mediapipe opencv-python numpy scikit-learn
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ── Configuration ───────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
EXPORT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'models', 'alphabet')

LABELS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing',
]

INPUT_FEATURES = 63  # 21 landmarks × 3 coordinates (x, y, z)
NUM_CLASSES = len(LABELS)
EPOCHS = 50
BATCH_SIZE = 64
LEARNING_RATE = 0.001


def build_model():
    """Build the dense neural network for landmark classification."""
    model = keras.Sequential([
        keras.layers.Input(shape=(INPUT_FEATURES,)),
        keras.layers.Dense(256, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(128, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(NUM_CLASSES, activation='softmax'),
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy'],
    )
    
    return model


def load_data():
    """Load processed landmark data from numpy files."""
    X_path = os.path.join(DATA_DIR, 'X_landmarks.npy')
    y_path = os.path.join(DATA_DIR, 'y_labels.npy')
    
    if not os.path.exists(X_path) or not os.path.exists(y_path):
        print("❌ Processed data not found!")
        print(f"   Expected: {X_path}")
        print(f"   Expected: {y_path}")
        print()
        print("Run extract_landmarks.py first to generate the training data.")
        return None, None
    
    X = np.load(X_path)
    y = np.load(y_path)
    
    print(f"✅ Loaded {len(X)} samples with {X.shape[1]} features")
    print(f"   Classes: {len(np.unique(y))}")
    
    return X, y


def train():
    """Main training function."""
    print("=" * 60)
    print("  ASL Alphabet Model Training")
    print("=" * 60)
    print()
    
    # Load data
    X, y = load_data()
    if X is None:
        return
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")
    print()
    
    # Build model
    model = build_model()
    model.summary()
    print()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
        ),
    ]
    
    # Train
    print("🏋️ Training...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )
    
    # Evaluate
    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print()
    print(f"📊 Final Results:")
    print(f"   Loss:     {loss:.4f}")
    print(f"   Accuracy: {accuracy:.4f} ({accuracy * 100:.1f}%)")
    print()
    
    # Save Keras model
    os.makedirs(MODEL_DIR, exist_ok=True)
    keras_path = os.path.join(MODEL_DIR, 'alphabet_model.keras')
    model.save(keras_path)
    print(f"💾 Saved Keras model: {keras_path}")
    
    # Save labels
    labels_path = os.path.join(MODEL_DIR, 'labels.json')
    with open(labels_path, 'w') as f:
        json.dump(LABELS, f)
    print(f"📝 Saved labels: {labels_path}")
    
    # Export to TensorFlow.js
    export_to_tfjs(model)
    
    print()
    print("✅ Training complete!")


def export_to_tfjs(model):
    """Export the trained model to TensorFlow.js format."""
    try:
        import tensorflowjs as tfjs
        
        os.makedirs(EXPORT_DIR, exist_ok=True)
        tfjs.converters.save_keras_model(model, EXPORT_DIR)
        
        # Also save labels alongside the model
        labels_path = os.path.join(EXPORT_DIR, 'labels.json')
        with open(labels_path, 'w') as f:
            json.dump(LABELS, f)
        
        print(f"🌐 Exported TF.js model: {EXPORT_DIR}")
    except ImportError:
        print()
        print("⚠️  tensorflowjs not installed. Install it to export:")
        print("    pip install tensorflowjs")
        print()
        print("   Then export manually:")
        print(f"    tensorflowjs_converter --input_format=keras \\")
        print(f"      {os.path.join(MODEL_DIR, 'alphabet_model.keras')} \\")
        print(f"      {EXPORT_DIR}")


if __name__ == '__main__':
    train()
