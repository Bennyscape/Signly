"""
MS-ASL Dataset Processor
========================
Processes the Microsoft American Sign Language (MS-ASL) dataset.
This script loads MS-ASL JSON files, prepares them for training,
and optionally downloads videos to extract hand landmarks.

Usage:
    python training/process_msasl_data.py --mode full    # Download and process videos
    python training/process_msasl_data.py --mode analyze # Just analyze dataset
    python training/process_msasl_data.py --mode subset  # Create small subset for testing
"""

import json
import os
import csv
import numpy as np
from pathlib import Path
import argparse
from typing import Dict, List, Tuple
import logging

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

class MSASLProcessor:
    """Process MS-ASL dataset for training."""
    
    def __init__(self):
        self.dataset_dir = MSASL_DIR
        self.output_dir = PROCESSED_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load classes
        self.classes = self._load_classes()
        self.class_to_id = {cls: idx for idx, cls in enumerate(self.classes)}
        
        # Load datasets
        self.train_data = self._load_json('MSASL_train.json')
        self.test_data = self._load_json('MSASL_test.json')
        self.val_data = self._load_json('MSASL_val.json')
        
    def _load_classes(self) -> List[str]:
        """Load list of ASL glosses/classes."""
        path = self.dataset_dir / 'MSASL_classes.json'
        with open(path, 'r') as f:
            return json.load(f)
    
    def _load_json(self, filename: str) -> List[Dict]:
        """Load JSON data file."""
        path = self.dataset_dir / filename
        if not path.exists():
            logger.warning(f"File not found: {path}")
            return []
        
        with open(path, 'r') as f:
            return json.load(f)
    
    def analyze_dataset(self):
        """Analyze and print dataset statistics."""
        logger.info("=" * 70)
        logger.info("MS-ASL DATASET ANALYSIS")
        logger.info("=" * 70)
        
        logger.info(f"Total Classes: {len(self.classes)}")
        logger.info(f"Training Samples: {len(self.train_data)}")
        logger.info(f"Validation Samples: {len(self.val_data)}")
        logger.info(f"Test Samples: {len(self.test_data)}")
        logger.info(f"Total Samples: {len(self.train_data) + len(self.val_data) + len(self.test_data)}")
        logger.info("")
        
        # Analyze class distribution
        logger.info("Class Distribution (Training Set):")
        class_counts = {}
        for sample in self.train_data:
            label = sample.get('label', -1)
            class_counts[label] = class_counts.get(label, 0) + 1
        
        sorted_counts = sorted(class_counts.items(), key=lambda x: x[1], reverse=True)
        
        logger.info(f"Classes with samples: {len(class_counts)}/{len(self.classes)}")
        logger.info("\nTop 10 classes (by sample count):")
        for label, count in sorted_counts[:10]:
            if 0 <= label < len(self.classes):
                logger.info(f"  {self.classes[label]:<30} (label {label}): {count} samples")
        
        logger.info("\nBottom 10 classes (by sample count):")
        for label, count in sorted_counts[-10:]:
            if 0 <= label < len(self.classes):
                logger.info(f"  {self.classes[label]:<30} (label {label}): {count} samples")
        
        # Sample analysis
        logger.info("\n" + "=" * 70)
        logger.info("Sample Analysis (First Training Sample):")
        logger.info("=" * 70)
        if self.train_data:
            sample = self.train_data[0]
            for key, value in sample.items():
                if key != 'url':  # Skip URL for logging
                    logger.info(f"  {key}: {value}")
    
    def create_metadata_csv(self, split: str = 'train') -> str:
        """
        Create a CSV file with dataset metadata.
        
        Args:
            split: 'train', 'val', or 'test'
            
        Returns:
            Path to created CSV file
        """
        if split == 'train':
            data = self.train_data
        elif split == 'val':
            data = self.val_data
        elif split == 'test':
            data = self.test_data
        else:
            raise ValueError(f"Unknown split: {split}")
        
        output_path = self.output_dir / f'msasl_{split}_metadata.csv'
        
        logger.info(f"Creating metadata CSV for {split} split ({len(data)} samples)")
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            # Get all unique keys from first sample
            if not data:
                logger.warning(f"No data for split {split}")
                return str(output_path)
            
            fieldnames = list(data[0].keys())
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            writer.writeheader()
            for row in data:
                writer.writerow(row)
        
        logger.info(f"Saved to: {output_path}")
        return str(output_path)
    
    def create_subset(self, num_classes: int = 100, samples_per_class: int = 50):
        """
        Create a smaller subset for testing.
        
        Args:
            num_classes: Number of classes to include
            samples_per_class: Number of samples per class (approximate)
        """
        logger.info(f"Creating subset with {num_classes} classes")
        
        subset_data = []
        class_samples = {}
        
        # Filter training data
        for sample in self.train_data:
            label = sample.get('label', -1)
            if label < num_classes:
                if label not in class_samples:
                    class_samples[label] = []
                
                if len(class_samples[label]) < samples_per_class:
                    class_samples[label].append(sample)
        
        # Combine into subset
        for class_id in sorted(class_samples.keys()):
            subset_data.extend(class_samples[class_id])
        
        logger.info(f"Subset contains {len(subset_data)} samples from {len(class_samples)} classes")
        
        # Save subset
        subset_path = self.output_dir / 'msasl_subset.json'
        with open(subset_path, 'w') as f:
            json.dump(subset_data, f, indent=2)
        
        logger.info(f"Saved subset to: {subset_path}")
        return str(subset_path)
    
    def create_class_mapping(self):
        """Create and save class ID to class name mapping."""
        output_path = self.output_dir / 'class_mapping.json'
        
        mapping = {
            str(idx): cls for idx, cls in enumerate(self.classes)
        }
        
        with open(output_path, 'w') as f:
            json.dump(mapping, f, indent=2)
        
        logger.info(f"Saved class mapping to: {output_path}")
        return str(output_path)
    
    def process(self, mode: str = 'analyze'):
        """
        Main processing pipeline.
        
        Args:
            mode: 'analyze', 'subset', or 'full'
        """
        logger.info(f"Starting MS-ASL processing in '{mode}' mode")
        
        # Always do analysis
        self.analyze_dataset()
        
        # Create metadata CSVs
        logger.info("\nCreating metadata CSV files...")
        self.create_metadata_csv('train')
        self.create_metadata_csv('val')
        self.create_metadata_csv('test')
        
        # Create class mapping
        logger.info("\nCreating class mapping...")
        self.create_class_mapping()
        
        if mode == 'subset':
            logger.info("\nCreating small subset for testing...")
            self.create_subset(num_classes=100, samples_per_class=50)
        
        elif mode == 'full':
            logger.info("\nFull mode requires video downloading and landmark extraction.")
            logger.info("This would require:")
            logger.info("  1. Downloading 16,054+ videos from YouTube")
            logger.info("  2. Extracting MediaPipe hand landmarks")
            logger.info("  3. Processing frames and saving landmarks")
            logger.info("\nConsider using a distributed processing approach or cloud service.")
        
        logger.info("\n" + "=" * 70)
        logger.info("Processing complete!")
        logger.info("=" * 70)


def main():
    parser = argparse.ArgumentParser(description='Process MS-ASL dataset')
    parser.add_argument(
        '--mode',
        choices=['analyze', 'subset', 'full'],
        default='analyze',
        help='Processing mode'
    )
    
    args = parser.parse_args()
    
    processor = MSASLProcessor()
    processor.process(mode=args.mode)


if __name__ == '__main__':
    main()
