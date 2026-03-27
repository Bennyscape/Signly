#!/usr/bin/env python3
"""
MS-ASL Dataset Analysis Tool
============================
Analyzes the MS-ASL (Microsoft American Sign Language) dataset.
Uses only Python built-in libraries - no external dependencies required.

This tool:
1. Loads MS-ASL JSON metadata
2. Analyzes dataset structure and statistics
3. Identifies data distribution across classes
4. Generates a comprehensive analysis report
5. Prepares dataset for training

Usage:
    python analyze_msasl.py
    python analyze_msasl.py --output report.txt
    python analyze_msasl.py --subset 100
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Any
import argparse
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
MSASL_DIR = SCRIPT_DIR.parent / 'MS-ASL'

class MSASLAnalyzer:
    """Analyze MS-ASL dataset."""
    
    def __init__(self):
        self.classes = []
        self.train_data = []
        self.val_data = []
        self.test_data = []
        self.class_distribution = defaultdict(int)
    
    def load_data(self):
        """Load MS-ASL dataset files."""
        print("Loading MS-ASL Dataset...")
        
        # Load classes
        with open(MSASL_DIR / 'MSASL_classes.json', 'r') as f:
            self.classes = json.load(f)
        
        # Load datasets
        with open(MSASL_DIR / 'MSASL_train.json', 'r') as f:
            self.train_data = json.load(f)
        
        with open(MSASL_DIR / 'MSASL_val.json', 'r') as f:
            self.val_data = json.load(f)
        
        with open(MSASL_DIR / 'MSASL_test.json', 'r') as f:
            self.test_data = json.load(f)
        
        print(f"✓ Loaded {len(self.classes)} classes")
        print(f"✓ Loaded {len(self.train_data)} training samples")
        print(f"✓ Loaded {len(self.val_data)} validation samples")
        print(f"✓ Loaded {len(self.test_data)} test samples")
    
    def analyze_distribution(self):
        """Analyze class distribution in training set."""
        print("\nAnalyzing class distribution...")
        
        for sample in self.train_data:
            label = sample.get('label', -1)
            self.class_distribution[label] += 1
    
    def get_statistics(self) -> Dict[str, Any]:
        """Calculate dataset statistics."""
        stats = {
            'total_classes': len(self.classes),
            'train_samples': len(self.train_data),
            'val_samples': len(self.val_data),
            'test_samples': len(self.test_data),
            'total_samples': len(self.train_data) + len(self.val_data) + len(self.test_data),
            'classes_with_samples': len(self.class_distribution),
            'avg_samples_per_class': len(self.train_data) / len(self.class_distribution) if self.class_distribution else 0,
            'min_samples': min(self.class_distribution.values()) if self.class_distribution else 0,
            'max_samples': max(self.class_distribution.values()) if self.class_distribution else 0,
        }
        return stats
    
    def get_top_classes(self, n: int = 20) -> List[Tuple[str, int]]:
        """Get top N classes by sample count."""
        sorted_classes = sorted(
            self.class_distribution.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [(self.classes[class_id], count) for class_id, count in sorted_classes[:n]]
    
    def get_bottom_classes(self, n: int = 20) -> List[Tuple[str, int]]:
        """Get bottom N classes by sample count."""
        sorted_classes = sorted(
            self.class_distribution.items(),
            key=lambda x: x[1]
        )
        return [(self.classes[class_id], count) for class_id, count in sorted_classes[:n]]
    
    def get_subset_stats(self, num_classes: int) -> Dict[str, Any]:
        """Get statistics for a subset of classes."""
        subset_samples = [s for s in self.train_data if s.get('label', -1) < num_classes]
        
        return {
            'num_classes': num_classes,
            'num_samples': len(subset_samples),
            'coverage': f"{len(subset_samples) / len(self.train_data) * 100:.1f}%"
        }
    
    def sample_analysis(self):
        """Analyze a sample record."""
        if not self.train_data:
            return None
        
        sample = self.train_data[0]
        return {
            'fields': list(sample.keys()),
            'sample': sample
        }
    
    def generate_report(self, output_file: str = None) -> str:
        """Generate comprehensive analysis report."""
        report = []
        
        report.append("=" * 80)
        report.append("MS-ASL DATASET ANALYSIS REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Overview
        report.append("OVERVIEW")
        report.append("-" * 80)
        stats = self.get_statistics()
        report.append(f"Total Classes:                {stats['total_classes']}")
        report.append(f"Training Samples:             {stats['train_samples']:,}")
        report.append(f"Validation Samples:           {stats['val_samples']:,}")
        report.append(f"Test Samples:                 {stats['test_samples']:,}")
        report.append(f"Total Samples:                {stats['total_samples']:,}")
        report.append("")
        
        # Distribution Analysis
        report.append("DISTRIBUTION ANALYSIS")
        report.append("-" * 80)
        report.append(f"Classes with samples:         {stats['classes_with_samples']}")
        report.append(f"Average samples per class:    {stats['avg_samples_per_class']:.1f}")
        report.append(f"Min samples in a class:       {stats['min_samples']}")
        report.append(f"Max samples in a class:       {stats['max_samples']}")
        report.append("")
        
        # Top Classes
        report.append("TOP 20 CLASSES (by sample count)")
        report.append("-" * 80)
        for i, (class_name, count) in enumerate(self.get_top_classes(20), 1):
            bar_length = int(count / stats['max_samples'] * 30)
            bar = '█' * bar_length
            report.append(f"{i:2d}. {class_name:40s} {count:5d} {bar}")
        report.append("")
        
        # Bottom Classes
        report.append("BOTTOM 20 CLASSES (by sample count)")
        report.append("-" * 80)
        for i, (class_name, count) in enumerate(self.get_bottom_classes(20), 1):
            bar_length = int(count / stats['max_samples'] * 30) if stats['max_samples'] > 0 else 0
            bar = '█' * bar_length
            report.append(f"{i:2d}. {class_name:40s} {count:5d} {bar}")
        report.append("")
        
        # Subsets
        report.append("DATASET SUBSETS")
        report.append("-" * 80)
        for num_classes in [100, 200, 500, 1000]:
            subset_stats = self.get_subset_stats(num_classes)
            report.append(
                f"MS-ASL-{num_classes:4d}: {subset_stats['num_samples']:5d} samples "
                f"({subset_stats['coverage']})"
            )
        report.append("")
        
        # Sample Record
        report.append("SAMPLE RECORD STRUCTURE")
        report.append("-" * 80)
        sample_info = self.sample_analysis()
        if sample_info:
            report.append("Fields:")
            for field in sample_info['fields']:
                report.append(f"  - {field}")
            report.append("")
            report.append("Example record (first training sample):")
            for key, value in sample_info['sample'].items():
                if key != 'url':  # Skip long URLs
                    report.append(f"  {key}: {value}")
            report.append(f"  url: <YouTube video link>")
        
        report.append("")
        
        # Notes
        report.append("NOTES")
        report.append("-" * 80)
        report.append("1. Each sample contains metadata for a video clip on YouTube")
        report.append("2. To train a model, hand landmarks must be extracted from videos")
        report.append("3. MediaPipe Hands can extract 21 hand landmarks × 3 coords (x,y,z) = 63 features")
        report.append("4. The training pipeline would:")
        report.append("   a) Download videos from YouTube URLs")
        report.append("   b) Extract hand landmarks using MediaPipe")
        report.append("   c) Train a neural network on these features")
        report.append("   d) Export model for web deployment")
        report.append("")
        
        report_text = "\n".join(report)
        
        # Print to console
        print(report_text)
        
        # Save to file if requested
        if output_file:
            with open(output_file, 'w') as f:
                f.write(report_text)
            print(f"\nReport saved to: {output_file}")
        
        return report_text


def main():
    parser = argparse.ArgumentParser(
        description='Analyze MS-ASL dataset',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python analyze_msasl.py                      # Display analysis to console
  python analyze_msasl.py --output report.txt  # Save to file
  python analyze_msasl.py --subset 100         # Show subset info for 100 classes
        """
    )
    parser.add_argument('--output', '-o', help='Save report to file')
    parser.add_argument('--subset', type=int, help='Analyze specific subset size')
    
    args = parser.parse_args()
    
    # Create analyzer
    analyzer = MSASLAnalyzer()
    
    try:
        # Load and analyze data
        analyzer.load_data()
        analyzer.analyze_distribution()
        
        # Generate report
        analyzer.generate_report(output_file=args.output)
        
        # Show subset info if requested
        if args.subset:
            print(f"\nSUBSET ANALYSIS (First {args.subset} classes)")
            print("-" * 80)
            subset_stats = analyzer.get_subset_stats(args.subset)
            print(f"Classes: {subset_stats['num_classes']}")
            print(f"Samples: {subset_stats['num_samples']}")
            print(f"Coverage: {subset_stats['coverage']}")
        
        return 0
    
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print(f"Make sure MS-ASL folder exists at: {MSASL_DIR}")
        return 1
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
