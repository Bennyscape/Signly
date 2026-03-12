"""
Hand Landmark Extraction Script
================================
Extracts MediaPipe hand landmarks from the ASL Alphabet dataset images 
and saves them as numpy arrays for training.

Usage:
    python training/scripts/extract_landmarks.py

Prerequisites:
    pip install mediapipe opencv-python numpy
    
Dataset Setup:
    Download the ASL Alphabet Dataset from Kaggle:
    https://www.kaggle.com/datasets/grassknoted/asl-alphabet
    
    Extract it to: training/data/raw/asl_alphabet_train/
    Structure should be:
        training/data/raw/asl_alphabet_train/
        ├── A/
        ├── B/
        ├── C/
        ...
        └── nothing/
"""

import os
import cv2
import numpy as np
import mediapipe as mp

# ── Configuration ───────────────────────────────────
RAW_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw', 'asl_alphabet_train')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')

LABELS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing',
]


def normalize_landmarks(landmarks):
    """
    Normalize hand landmarks to be position- and scale-invariant.
    Centers on wrist and normalizes by max distance.
    """
    coords = np.array([[lm.x, lm.y, lm.z] for lm in landmarks])
    
    # Center on wrist
    wrist = coords[0]
    centered = coords - wrist
    
    # Normalize by max distance
    max_dist = np.max(np.linalg.norm(centered, axis=1))
    if max_dist > 0:
        centered /= max_dist
    
    return centered.flatten()  # Returns 63 features (21 × 3)


def extract_landmarks():
    """Extract landmarks from all images in the dataset."""
    print("=" * 60)
    print("  Hand Landmark Extraction")
    print("=" * 60)
    print()
    
    if not os.path.exists(RAW_DIR):
        print(f"❌ Dataset not found at: {RAW_DIR}")
        print()
        print("Download the ASL Alphabet Dataset from Kaggle:")
        print("  https://www.kaggle.com/datasets/grassknoted/asl-alphabet")
        print()
        print(f"Extract it to: {RAW_DIR}")
        return
    
    # Initialize MediaPipe Hands
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5,
    )
    
    all_landmarks = []
    all_labels = []
    
    for label in LABELS:
        label_dir = os.path.join(RAW_DIR, label)
        if not os.path.exists(label_dir):
            print(f"⚠️  Skipping {label} — directory not found")
            continue
        
        images = [f for f in os.listdir(label_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        success_count = 0
        
        for img_name in images:
            img_path = os.path.join(label_dir, img_name)
            
            # Read and process image
            image = cv2.imread(img_path)
            if image is None:
                continue
            
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image_rgb)
            
            if results.multi_hand_landmarks:
                # Take the first hand
                hand_landmarks = results.multi_hand_landmarks[0]
                normalized = normalize_landmarks(hand_landmarks.landmark)
                
                all_landmarks.append(normalized)
                all_labels.append(label)
                success_count += 1
        
        print(f"  {label:>8}: {success_count:>5} / {len(images):>5} landmarks extracted")
    
    hands.close()
    
    if len(all_landmarks) == 0:
        print("\n❌ No landmarks extracted!")
        return
    
    # Save as numpy arrays
    X = np.array(all_landmarks, dtype=np.float32)
    y = np.array(all_labels)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    np.save(os.path.join(OUTPUT_DIR, 'X_landmarks.npy'), X)
    np.save(os.path.join(OUTPUT_DIR, 'y_labels.npy'), y)
    
    print()
    print(f"✅ Saved {len(X)} samples to {OUTPUT_DIR}")
    print(f"   X shape: {X.shape}")
    print(f"   Labels:  {len(np.unique(y))} classes")


if __name__ == '__main__':
    extract_landmarks()
