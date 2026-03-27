#!/usr/bin/env python3
"""
Model Converter & WebGL Export
==============================
Converts trained models to TensorFlow.js and ONNX formats for web deployment.
"""

import json
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent
MODELS_DIR = SCRIPT_DIR / 'models'

def convert_to_json(model_path: str, output_path: str):
    """Convert model to JSON format for JavaScript."""
    import pickle
    
    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)
    
    # Convert numpy arrays to lists
    model_json = {
        'W1': model_data['W1'].tolist(),
        'b1': model_data['b1'].tolist(),
        'W2': model_data['W2'].tolist(),
        'b2': model_data['b2'].tolist(),
        'num_classes': int(model_data['num_classes']),
        'hidden_size': int(model_data['hidden_size']),
    }
    
    with open(output_path, 'w') as f:
        json.dump(model_json, f)
    
    logger.info(f"Converted to JSON: {output_path}")

def main():
    """Convert existing models."""
    logger.info("Converting models to web-friendly formats...")
    
    for model_file in MODELS_DIR.glob('msasl_*_classes.pkl'):
        num_classes = model_file.stem.split('_')[1]
        json_output = MODELS_DIR / f'msasl_{num_classes}_model.json'
        
        try:
            convert_to_json(str(model_file), str(json_output))
        except Exception as e:
            logger.error(f"Failed to convert {model_file}: {e}")
    
    logger.info("Conversion complete!")

if __name__ == '__main__':
    main()
