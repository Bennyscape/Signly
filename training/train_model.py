import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
import tensorflowjs as tfjs
import json
import os

DATASET_PATH = 'dataset.csv'
CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing']

def train():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: {DATASET_PATH} not found. Run collect_data.py first.")
        return

    print("Loading data...")
    df = pd.read_csv(DATASET_PATH)
    
    # Extract features (X) and labels (y)
    X = df.drop('class_id', axis=1).values
    y = df['class_id'].values
    
    # One-hot encode labels
    y = to_categorical(y, num_classes=len(CLASSES))
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training on {len(X_train)} samples, validating on {len(X_test)} samples.")
    
    # Build Model
    model = Sequential([
        Dense(128, activation='relu', input_shape=(63,)),
        Dropout(0.2),
        Dense(64, activation='relu'),
        Dense(len(CLASSES), activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    # Train Model
    print("Training model...")
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test))
    
    # Evaluate
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"Validation Accuracy: {accuracy * 100:.2f}%")
    
    # Save Model (H5)
    model.save('asl_model.h5')
    print("Saved Keras model to asl_model.h5")
    
    # Export to TensorFlow.js
    tfjs_dir = 'tfjs_model'
    if not os.path.exists(tfjs_dir):
        os.makedirs(tfjs_dir)
        
    tfjs.converters.save_keras_model(model, tfjs_dir)
    print(f"Exported TensorFlow.js model to {tfjs_dir}/")
    
    # Save Labels
    with open(os.path.join(tfjs_dir, 'labels.json'), 'w') as f:
        json.dump(CLASSES, f)
    print(f"Saved labels.json to {tfjs_dir}/")
    
    print("\n--- DONE ---")
    print(f"Copy the contents of '{tfjs_dir}' to your Next.js 'public/models/alphabet' folder!")

if __name__ == "__main__":
    train()
