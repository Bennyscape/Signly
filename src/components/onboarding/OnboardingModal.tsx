'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Hand,
  Volume2,
  X,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';

interface OnboardingModalProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Camera,
    title: 'Enable Your Camera',
    description:
      'We need camera access to see your hand signs. All processing happens locally in your browser — no video is ever sent to a server.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Hand,
    title: 'Show ASL Signs',
    description:
      'Position your hand clearly in front of the camera. Hold each sign steady for about 1 second. Our AI will detect and track 21 hand landmarks in real-time.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Volume2,
    title: 'Hear Your Words',
    description:
      'Recognized letters build into words and sentences. Hit the Speak button or enable auto-speak to hear your message out loud using text-to-speech.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      updateSetting('showOnboarding', false);
    }
    onComplete();
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl border border-border bg-bg-surface shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <span className="text-xs text-text-tertiary font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleComplete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-6 py-8 text-center"
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bg} mb-5`}
            >
              <step.icon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              {step.title}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-accent'
                  : i < currentStep
                  ? 'w-1.5 bg-accent/50'
                  : 'w-1.5 bg-border-strong'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 space-y-3">
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent text-text-inverse rounded-xl font-semibold text-sm hover:bg-accent-hover transition-all glow-accent"
          >
            {isLast ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <label className="flex items-center justify-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-accent"
            />
            <span className="text-xs text-text-tertiary">
              Don&apos;t show this again
            </span>
          </label>
        </div>
      </motion.div>
    </motion.div>
  );
}
