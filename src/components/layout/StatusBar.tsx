'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Eye, Wifi, Clock } from 'lucide-react';
import { useRecognitionStore } from '@/stores/recognition-store';

export function StatusBar() {
  const isModelLoaded = useRecognitionStore((s) => s.isModelLoaded);
  const isDetecting = useRecognitionStore((s) => s.isDetecting);
  const numHands = useRecognitionStore((s) => s.numHands);
  const fps = useRecognitionStore((s) => s.fps);
  const inferenceTime = useRecognitionStore((s) => s.inferenceTime);

  const items = [
    {
      icon: Cpu,
      label: 'Model',
      value: isModelLoaded ? 'Loaded' : 'Not loaded',
      status: isModelLoaded ? 'success' : 'warning',
    },
    {
      icon: Eye,
      label: 'Detection',
      value: isDetecting ? `${numHands} hand${numHands !== 1 ? 's' : ''}` : 'Inactive',
      status: isDetecting && numHands > 0 ? 'success' : isDetecting ? 'warning' : 'error',
    },
    {
      icon: Activity,
      label: 'FPS',
      value: `${fps}`,
      status: fps >= 24 ? 'success' : fps >= 15 ? 'warning' : 'error',
    },
    {
      icon: Clock,
      label: 'Latency',
      value: `${inferenceTime}ms`,
      status: inferenceTime < 100 ? 'success' : inferenceTime < 200 ? 'warning' : 'error',
    },
    {
      icon: Wifi,
      label: 'Status',
      value: 'Online',
      status: 'success' as const,
    },
  ];

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl px-4 py-2.5"
    >
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 min-w-fit">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                item.status === 'success'
                  ? 'bg-success'
                  : item.status === 'warning'
                  ? 'bg-warning'
                  : 'bg-error'
              }`}
            />
            <item.icon className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-xs text-text-tertiary">{item.label}:</span>
            <span className="text-xs font-medium text-text-primary font-mono">
              {item.value}
            </span>
          </div>
        ))}
        <span className="text-xs text-text-tertiary ml-auto">v1.0.0</span>
      </div>
    </motion.div>
  );
}
