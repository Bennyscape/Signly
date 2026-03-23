'use client';

import { motion } from 'framer-motion';
import { useRecognitionStore } from '@/stores/recognition-store';

interface ConfidenceMeterProps {
  size?: number;
}

export function ConfidenceMeter({ size = 100 }: ConfidenceMeterProps) {
  const predictions = useRecognitionStore((s) => s.currentPredictions);
  const topPrediction = predictions[0];
  const confidence = topPrediction ? topPrediction.confidence : 0;
  const percent = Math.round(confidence * 100);

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - confidence);

  const getColor = () => {
    if (percent >= 80) return 'var(--success)';
    if (percent >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  const getGlowClass = () => {
    if (percent >= 80) return 'glow-success';
    if (percent >= 50) return '';
    return '';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${getGlowClass()}`} style={{ borderRadius: '50%' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth="6"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={percent}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold font-mono text-text-primary"
        >
          {percent}
        </motion.span>
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
          conf
        </span>
      </div>
    </div>
  );
}
