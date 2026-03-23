'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { CameraFeed } from '@/components/camera/CameraFeed';
import { PredictionBar } from '@/components/recognition/PredictionBar';
import { ConfidenceMeter } from '@/components/recognition/ConfidenceMeter';
import { TranscriptPanel } from '@/components/transcript/TranscriptPanel';
import { SpeechControls } from '@/components/speech/SpeechControls';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useModel } from '@/hooks/useModel';
import { useGestureBuffer } from '@/hooks/useGestureBuffer';
import { useRecognitionStore } from '@/stores/recognition-store';
import { useTranscriptStore } from '@/stores/transcript-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useSessionStore } from '@/stores/session-store';
import { normalizeLandmarks } from '@/lib/preprocessing';
import { isLetterLabel, isControlLabel } from '@/lib/gesture-map';
import type { HandData } from '@/types';

export default function DashboardPage() {
  const { isLoaded, isLoading, predict, loadModel, error: modelError } = useModel();
  const { processNewPrediction } = useGestureBuffer();
  const setPredictions = useRecognitionStore((s) => s.setPredictions);
  const setStablePrediction = useRecognitionStore((s) => s.setStablePrediction);
  const setModelLoaded = useRecognitionStore((s) => s.setModelLoaded);
  const setInferenceTime = useRecognitionStore((s) => s.setInferenceTime);
  const addLetter = useTranscriptStore((s) => s.addLetter);
  const addSpace = useTranscriptStore((s) => s.addSpace);
  const deleteLast = useTranscriptStore((s) => s.deleteLast);
  const confidenceThreshold = useSettingsStore((s) => s.confidenceThreshold);
  const stabilityFrames = useSettingsStore((s) => s.stabilityFrames);
  const showLandmarks = useSettingsStore((s) => s.showLandmarks);
  const showOnboarding = useSettingsStore((s) => s.showOnboarding);
  const startSession = useSessionStore((s) => s.startSession);
  const endSession = useSessionStore((s) => s.endSession);
  const incrementRecognition = useSessionStore((s) => s.incrementRecognition);

  const lastCommitRef = useRef<number>(0);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Show onboarding on first visit
  useEffect(() => {
    setShowOnboardingModal(showOnboarding);
  }, [showOnboarding]);

  // Start a recognition session on mount
  useEffect(() => {
    startSession();
    return () => {
      endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasAttemptedModelLoad = useRef(false);

  // Load model on mount
  useEffect(() => {
    if (!hasAttemptedModelLoad.current) {
      hasAttemptedModelLoad.current = true;
      loadModel('/models/alphabet/model.json')
        .then(() => {
          setModelLoaded(true);
        })
        .catch(() => {
          // Model may not exist yet — that's ok for development
          console.warn('Model not found. Running in demo mode.');
        });
    }
  }, [loadModel, setModelLoaded]);

  // Handle landmark data from camera
  const handleLandmarks = useCallback(
    async (handData: HandData | null) => {
      if (!handData || !isLoaded) {
        setPredictions([]);
        return;
      }

      const startTime = performance.now();
      const normalized = normalizeLandmarks(handData.landmarks);

      if (normalized.length === 0) {
        setPredictions([]);
        return;
      }

      const predictions = await predict(normalized);
      const endTime = performance.now();
      setInferenceTime(Math.round(endTime - startTime));

      if (predictions.length > 0) {
        setPredictions(predictions);

        // Process through stability buffer
        const stable = processNewPrediction(
          predictions,
          confidenceThreshold,
          stabilityFrames
        );

        if (stable) {
          setStablePrediction(stable);

          // Prevent rapid-fire commits (min 500ms between)
          const now = Date.now();
          if (now - lastCommitRef.current > 500) {
            lastCommitRef.current = now;
            incrementRecognition();

            // Apply the recognized gesture
            if (isLetterLabel(stable.label)) {
              addLetter(stable.label);
            } else if (isControlLabel(stable.label)) {
              if (stable.label === 'space') addSpace();
              if (stable.label === 'del') deleteLast();
            }
          }
        }
      }
    },
    [
      isLoaded,
      predict,
      processNewPrediction,
      setPredictions,
      setStablePrediction,
      setInferenceTime,
      confidenceThreshold,
      stabilityFrames,
      addLetter,
      addSpace,
      deleteLast,
      incrementRecognition,
    ]
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        {/* Model loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-soft border border-accent/10">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-accent font-medium">Loading AI model...</span>
          </div>
        )}

        {modelError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning-soft border border-warning/10">
            <span className="text-sm text-warning font-medium">
              ⚠️ Model not loaded — running in preview mode. Train & export the model to enable recognition.
            </span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">
          {/* Left — Camera Feed */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <CameraFeed onLandmarks={handleLandmarks} showLandmarks={showLandmarks} />
          </div>

          {/* Right — Predictions, Transcript, Speech */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Confidence Meter + Predictions */}
            <div className="flex gap-4">
              <div className="flex items-center justify-center">
                <ConfidenceMeter size={90} />
              </div>
              <div className="flex-1 min-w-0">
                <PredictionBar />
              </div>
            </div>
            <TranscriptPanel />
            <SpeechControls />
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />
      </main>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboardingModal && (
          <OnboardingModal onComplete={() => setShowOnboardingModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
