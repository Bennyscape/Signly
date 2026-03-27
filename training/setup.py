#!/usr/bin/env python3
"""
MS-ASL Training Setup & Helper Script
=====================================

Performs initial setup and provides utilities for training ASL models.

Usage:
    python training/setup.py --check          # Check dependencies
    python training/setup.py --install        # Install dependencies
    python training/setup.py --status         # Show training status
    python training/setup.py --benchmark      # Run performance benchmarks
"""

import json
import sys
from pathlib import Path
import argparse
import logging
from typing import Dict, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MSASL_DIR = PROJECT_ROOT / 'MS-ASL'
MODELS_DIR = SCRIPT_DIR / 'models'
PUBLIC_MODELS = PROJECT_ROOT / 'public' / 'models'

def check_dependencies() -> Dict[str, bool]:
    """Check if required dependencies are installed."""
    logger.info("Checking dependencies...")
    
    deps = {
        'numpy': False,
        'tensorflow': False,
        'tensorflowjs': False,
    }
    
    # Try to import each dependency
    try:
        import numpy
        deps['numpy'] = True
        logger.info("✓ numpy")
    except ImportError:
        logger.warning("✗ numpy - required for training")
    
    try:
        import tensorflow
        deps['tensorflow'] = True
        logger.info("✓ tensorflow")
    except ImportError:
        logger.warning("✗ tensorflow - optional, for advanced training")
    
    try:
        import tensorflowjs
        deps['tensorflowjs'] = True
        logger.info("✓ tensorflowjs")
    except ImportError:
        logger.warning("✗ tensorflowjs - optional, for TF.js export")
    
    return deps

def install_dependencies():
    """Install required dependencies."""
    logger.info("Installing dependencies...")
    
    # Only numpy is strictly required
    packages = ['numpy']
    
    for package in packages:
        logger.info(f"Installing {package}...")
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
    
    logger.info("Dependencies installed!")

def show_training_status():
    """Show status of trained models."""
    logger.info("\n" + "=" * 70)
    logger.info("MS-ASL TRAINING STATUS")
    logger.info("=" * 70 + "\n")
    
    if not MODELS_DIR.exists():
        logger.warning("No models directory found!")
        return
    
    models = {
        '100': MODELS_DIR / 'msasl_100_classes.pkl',
        '500': MODELS_DIR / 'msasl_500_classes.pkl',
        '1000': MODELS_DIR / 'msasl_1000_classes.pkl',
    }
    
    logger.info("Trained Models:")
    logger.info("-" * 70)
    
    for num_classes, model_path in models.items():
        status = "✓ READY" if model_path.exists() else "✗ NOT TRAINED"
        
        if model_path.exists():
            size_mb = model_path.stat().st_size / (1024 * 1024)
            logger.info(f"  {num_classes} classes: {status} ({size_mb:.1f} MB)")
            
            # Check for JSON export
            json_path = MODELS_DIR / f'msasl_{num_classes}_model.json'
            public_path = PUBLIC_MODELS / f'msasl_{num_classes}_model.json'
            
            if json_path.exists():
                logger.info(f"    → JSON export: ✓ READY ({json_path.stat().st_size / (1024 * 1024):.1f} MB)")
            
            if public_path.exists():
                logger.info(f"    → Public copy: ✓ DEPLOYED ({public_path.stat().st_size / (1024 * 1024):.1f} MB)")
            else:
                logger.info(f"    → Public copy: ✗ Need to deploy")
        else:
            logger.info(f"  {num_classes} classes: {status}")
    
    # Check dataset
    logger.info("\n" + "-" * 70)
    logger.info("Dataset Status:")
    logger.info("-" * 70)
    
    if MSASL_DIR.exists():
        files = {
            'MSASL_train.json': MSASL_DIR / 'MSASL_train.json',
            'MSASL_val.json': MSASL_DIR / 'MSASL_val.json',
            'MSASL_test.json': MSASL_DIR / 'MSASL_test.json',
            'MSASL_classes.json': MSASL_DIR / 'MSASL_classes.json',
        }
        
        for name, path in files.items():
            status = "✓" if path.exists() else "✗"
            logger.info(f"  {status} {name}")
    else:
        logger.warning("  ✗ MS-ASL directory not found!")
    
    logger.info("\n" + "=" * 70 + "\n")

def run_benchmarks():
    """Run performance benchmarks."""
    logger.info("\n" + "=" * 70)
    logger.info("MODEL BENCHMARK")
    logger.info("=" * 70 + "\n")
    
    try:
        import numpy as np
        from time import time
    except ImportError:
        logger.error("numpy required for benchmarks. Install with: pip install numpy")
        return
    
    # Check which models are available
    available_models = {}
    for num_classes in ['100', '500']:
        pkl_path = MODELS_DIR / f'msasl_{num_classes}_classes.pkl'
        if pkl_path.exists():
            available_models[num_classes] = pkl_path
    
    if not available_models:
        logger.warning("No models found to benchmark!")
        return
    
    logger.info("Running inference benchmarks...\n")
    
    for num_classes, model_path in available_models.items():
        logger.info(f"Benchmarking {num_classes}-class model:")
        logger.info(f"  Model: {model_path.name}")
        
        try:
            import pickle
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # Create dummy input
            batch_sizes = [1, 8, 32]
            num_warmup = 3
            num_iterations = 10
            
            W1 = np.array(model_data['W1'], dtype=np.float32)
            b1 = np.array(model_data['b1'], dtype=np.float32)
            W2 = np.array(model_data['W2'], dtype=np.float32)
            b2 = np.array(model_data['b2'], dtype=np.float32)
            
            for batch_size in batch_sizes:
                X = np.random.randn(batch_size, 63).astype(np.float32)
                
                # Warmup
                for _ in range(num_warmup):
                    _ = X @ W1 + b1
                
                # Benchmark
                times = []
                for _ in range(num_iterations):
                    start = time()
                    _ = X @ W1 + b1
                    z1_act = np.maximum(0, _)
                    _ = z1_act @ W2 + b2
                    times.append(time() - start)
                
                avg_time = np.mean(times) * 1000  # Convert to ms
                time_per_sample = (avg_time / batch_size) * 1000  # Convert to microseconds
                fps = 1000 / (avg_time / batch_size)
                
                logger.info(f"  Batch size {batch_size:2d}: {avg_time:.2f}ms total, {time_per_sample:.0f}µs/sample, ~{fps:.0f} FPS")
        
        except Exception as e:
            logger.error(f"  Error benchmarking: {e}")
    
    logger.info("\n" + "=" * 70 + "\n")

def main():
    """Main CLI interface."""
    parser = argparse.ArgumentParser(
        description='MS-ASL Training Setup & Helper Script'
    )
    parser.add_argument('--check', action='store_true',
                       help='Check if dependencies are installed')
    parser.add_argument('--install', action='store_true',
                       help='Install required dependencies')
    parser.add_argument('--status', action='store_true',
                       help='Show training status')
    parser.add_argument('--benchmark', action='store_true',
                       help='Run performance benchmarks')
    
    args = parser.parse_args()
    
    if not any([args.check, args.install, args.status, args.benchmark]):
        # Default: show status
        args.status = True
    
    try:
        if args.check:
            check_dependencies()
        
        if args.install:
            install_dependencies()
        
        if args.status:
            show_training_status()
        
        if args.benchmark:
            run_benchmarks()
    
    except KeyboardInterrupt:
        logger.info("\nInterrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    main()
