# ASL Alphabet Model

This directory will contain the TensorFlow.js model files after training.

## Files Generated After Training

- `model.json` — Model architecture and weights manifest
- `group1-shard1of1.bin` — Model weights  
- `labels.json` — Class labels mapping

## How to Generate

1. Download the ASL Alphabet Dataset from Kaggle
2. Run `python training/scripts/extract_landmarks.py`
3. Run `python training/scripts/train_alphabet.py`

The model will be automatically exported here.
