'use client';

import { motion } from 'framer-motion';
import { Type, Trash2, Copy, Check } from 'lucide-react';
import { useTranscriptStore } from '@/stores/transcript-store';
import { useState, useCallback } from 'react';

export function TranscriptPanel() {
  const currentText = useTranscriptStore((s) => s.currentText);
  const clearAll = useTranscriptStore((s) => s.clearAll);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!currentText) return;
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API failed
    }
  }, [currentText]);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border bg-bg-surface p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Transcript
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!currentText}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-all disabled:opacity-30"
            title="Copy transcript"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={clearAll}
            disabled={!currentText}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error-soft transition-all disabled:opacity-30"
            title="Clear transcript"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 min-h-[120px] max-h-[200px] overflow-y-auto rounded-xl bg-bg-primary border border-border p-4">
        {currentText ? (
          <p className="text-lg font-medium text-text-primary leading-relaxed">
            {currentText}
            <span className="inline-block w-0.5 h-5 bg-accent ml-0.5 animate-pulse" />
          </p>
        ) : (
          <p className="text-text-tertiary text-sm italic">
            Your recognized signs will appear here...
          </p>
        )}
      </div>

      {/* Character Count */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-tertiary">
          {currentText.length} characters · {currentText.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </motion.div>
  );
}
