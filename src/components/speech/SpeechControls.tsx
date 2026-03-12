'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play, Square, ChevronDown } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { useTranscriptStore } from '@/stores/transcript-store';
import { useState } from 'react';

export function SpeechControls() {
  const {
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
  } = useSpeech();

  const currentText = useTranscriptStore((s) => s.currentText);
  const [showVoices, setShowVoices] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(currentText);
    }
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-border bg-bg-surface p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Speech Output
        </h3>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={handleSpeak}
          disabled={!currentText}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            isSpeaking
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'bg-accent text-text-inverse hover:bg-accent-hover glow-accent'
          }`}
        >
          {isSpeaking && !isPaused ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Speak
            </>
          )}
        </button>

        {isSpeaking && (
          <button
            onClick={stop}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-error hover:bg-error-soft border border-border transition-all"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && !isPaused && (
          <div className="flex items-center gap-1 ml-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-accent rounded-full"
                animate={{
                  height: [4, 16, 4],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Voice Selector */}
      <div className="mb-4">
        <label className="text-xs text-text-tertiary mb-1.5 block">Voice</label>
        <div className="relative">
          <button
            onClick={() => setShowVoices(!showVoices)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-bg-primary text-sm text-text-primary hover:bg-bg-surface-hover transition-all"
          >
            <span className="truncate">
              {selectedVoice?.name || 'Default Voice'}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${showVoices ? 'rotate-180' : ''}`} />
          </button>
          {showVoices && (
            <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-bg-surface shadow-lg">
              {voices.filter((v) => v.lang.startsWith('en')).map((voice) => (
                <button
                  key={voice.voiceURI}
                  onClick={() => {
                    setVoice(voice);
                    setShowVoices(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-bg-surface-hover transition-colors ${
                    selectedVoice?.voiceURI === voice.voiceURI ? 'text-accent bg-accent-soft' : 'text-text-primary'
                  }`}
                >
                  <span className="block truncate">{voice.name}</span>
                  <span className="text-xs text-text-tertiary">{voice.lang}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Speed & Pitch Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
            <span>Speed</span>
            <span className="font-mono">{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full bg-bg-surface-hover appearance-none cursor-pointer accent-accent"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
            <span>Pitch</span>
            <span className="font-mono">{pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full bg-bg-surface-hover appearance-none cursor-pointer accent-accent"
          />
        </div>
      </div>

      {/* Mute indicator */}
      {!currentText && (
        <div className="flex items-center gap-2 mt-4 text-xs text-text-tertiary">
          <VolumeX className="w-3.5 h-3.5" />
          <span>Start signing to enable speech output</span>
        </div>
      )}
    </motion.div>
  );
}
