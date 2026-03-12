'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRecognitionStore } from '@/stores/recognition-store';
import { labelToDisplay } from '@/lib/gesture-map';

export function PredictionBar() {
  const predictions = useRecognitionStore((s) => s.currentPredictions);
  const stablePrediction = useRecognitionStore((s) => s.stablePrediction);
  const stabilityCount = useRecognitionStore((s) => s.stabilityCount);

  const topPrediction = predictions[0];
  const confidencePercent = topPrediction ? Math.round(topPrediction.confidence * 100) : 0;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-bg-surface p-5"
    >
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Predictions
      </h3>

      {/* Main Prediction */}
      <AnimatePresence mode="wait">
        {topPrediction ? (
          <motion.div
            key={topPrediction.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center mb-5"
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl font-bold font-mono transition-all ${
                stablePrediction
                  ? 'bg-success/10 text-success glow-success border border-success/20'
                  : 'bg-accent-soft text-accent border border-accent/10'
              }`}
            >
              {labelToDisplay(topPrediction.label)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono">
                {confidencePercent}%
              </span>
              {stablePrediction && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium"
                >
                  Committed
                </motion.span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-5"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-bg-surface-hover text-text-tertiary text-4xl font-mono border border-border">
              —
            </div>
            <p className="mt-3 text-sm text-text-tertiary">Show a sign to begin</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
          <span>Confidence</span>
          <span>{confidencePercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-surface-hover overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                confidencePercent >= 80
                  ? 'var(--success)'
                  : confidencePercent >= 50
                  ? 'var(--warning)'
                  : 'var(--error)',
            }}
            animate={{ width: `${confidencePercent}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Stability Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
          <span>Stability</span>
          <span>{Math.min(stabilityCount, 8)} / 8</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                i < stabilityCount
                  ? stablePrediction
                    ? 'bg-success'
                    : 'bg-accent'
                  : 'bg-bg-surface-hover'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Top-3 Predictions */}
      <div className="space-y-2">
        {predictions.slice(0, 3).map((pred, i) => (
          <div
            key={pred.label}
            className="flex items-center gap-3 text-sm"
          >
            <span className="w-6 text-center font-mono font-bold text-text-primary">
              {labelToDisplay(pred.label)}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-bg-surface-hover overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: i === 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                  opacity: i === 0 ? 1 : 0.5,
                }}
                animate={{ width: `${Math.round(pred.confidence * 100)}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            </div>
            <span className="text-xs text-text-tertiary font-mono w-10 text-right">
              {Math.round(pred.confidence * 100)}%
            </span>
          </div>
        ))}
        {predictions.length === 0 && (
          <p className="text-xs text-text-tertiary text-center py-2">No predictions yet</p>
        )}
      </div>
    </motion.div>
  );
}
