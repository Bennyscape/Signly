'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  isActive: boolean;
  barCount?: number;
}

export function WaveformVisualizer({
  isActive,
  barCount = 12,
}: WaveformVisualizerProps) {
  const [bars, setBars] = useState<{ heightAmp: number; dur: number }[]>([]);

  useEffect(() => {x
    const timer = setTimeout(() => {
      setBars(
        Array.from({ length: barCount }).map(() => ({
          heightAmp: 8 + Math.random() * 20,
          dur: 0.4 + Math.random() * 0.4,
        }))
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [barCount]);

  // Use a fallback render while generating bars to prevent layout shift
  if (bars.length === 0) {
    return (
      <div className="flex items-end justify-center gap-[3px] h-8">
        {Array.from({ length: barCount }).map((_, i) => (
          <div key={i} className="w-[3px] rounded-full bg-accent opacity-20" style={{ height: '4px' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-[3px] h-8">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-accent"
          animate={
            isActive
              ? {
                  height: [4, bar.heightAmp, 4],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: 4, opacity: 0.2 }
          }
          transition={
            isActive
              ? {
                  duration: bar.dur,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
