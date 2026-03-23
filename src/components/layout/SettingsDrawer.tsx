'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Brain,
  Volume2,
  Palette,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { useCallback } from 'react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const handleReset = useCallback(() => {
    resetSettings();
  }, [resetSettings]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-bg-surface border-l border-border z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-bold text-text-primary">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Camera Section */}
              <SettingsSection icon={Camera} title="Camera">
                <ToggleRow
                  label="Show Landmarks"
                  description="Display hand skeleton overlay on camera"
                  checked={settings.showLandmarks}
                  onChange={(v) => updateSetting('showLandmarks', v)}
                />
                <ToggleRow
                  label="Show FPS Counter"
                  description="Display frame rate in status bar"
                  checked={settings.showFPS}
                  onChange={(v) => updateSetting('showFPS', v)}
                />
              </SettingsSection>

              {/* Recognition Section */}
              <SettingsSection icon={Brain} title="Recognition">
                <SliderRow
                  label="Confidence Threshold"
                  value={settings.confidenceThreshold}
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(v) => updateSetting('confidenceThreshold', v)}
                />
                <SliderRow
                  label="Stability Frames"
                  value={settings.stabilityFrames}
                  min={3}
                  max={20}
                  step={1}
                  format={(v) => `${v} frames`}
                  onChange={(v) => updateSetting('stabilityFrames', v)}
                />
              </SettingsSection>

              {/* Speech Section */}
              <SettingsSection icon={Volume2} title="Speech">
                <ToggleRow
                  label="Auto-Speak"
                  description="Automatically speak recognized text"
                  checked={settings.autoSpeak}
                  onChange={(v) => updateSetting('autoSpeak', v)}
                />
                {settings.autoSpeak && (
                  <div className="pl-1">
                    <label className="text-xs text-text-tertiary mb-2 block">
                      Speak On
                    </label>
                    <div className="flex gap-2">
                      {(['word', 'sentence'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateSetting('autoSpeakMode', mode)}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            settings.autoSpeakMode === mode
                              ? 'bg-accent text-text-inverse'
                              : 'bg-bg-primary border border-border text-text-secondary hover:bg-bg-surface-hover'
                          }`}
                        >
                          {mode === 'word' ? 'Each Word' : 'Full Sentence'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </SettingsSection>

              {/* Appearance Section */}
              <SettingsSection icon={Palette} title="Appearance">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    {(['dark', 'light'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => updateSetting('theme', t)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                          settings.theme === t
                            ? 'bg-accent text-text-inverse'
                            : 'bg-bg-primary border border-border text-text-secondary hover:bg-bg-surface-hover'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:text-error hover:border-error/20 hover:bg-error-soft transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Sub-components ────────────────────────────────── */

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="space-y-4 pl-6">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 mt-0.5 ${
          checked ? 'bg-accent' : 'bg-bg-surface-hover border border-border'
        }`}
        style={{ height: '22px' }}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-mono font-medium">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full bg-bg-surface-hover appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
}
