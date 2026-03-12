'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    function loadVoices() {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Prefer English voices
        const englishVoice = availableVoices.find(
          (v) => v.lang.startsWith('en') && v.localService
        );
        setSelectedVoice(englishVoice || availableVoices[0]);
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis || !text.trim()) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, rate, pitch]
  );

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setVoice,
    rate,
    setRate,
    pitch,
    setPitch,
  };
}
