export interface AppSettings {
  // Camera
  cameraFacing: 'user' | 'environment';
  showLandmarks: boolean;
  showFPS: boolean;

  // Recognition
  confidenceThreshold: number;
  stabilityFrames: number;
  recognitionMode: 'alphabet' | 'word' | 'auto';

  // Speech
  voiceURI: string | null;
  speechRate: number;
  speechPitch: number;
  autoSpeak: boolean;
  autoSpeakMode: 'word' | 'sentence';

  // UI
  theme: 'dark' | 'light' | 'system';
  showOnboarding: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  cameraFacing: 'user',
  showLandmarks: true,
  showFPS: true,
  confidenceThreshold: 0.8,
  stabilityFrames: 8,
  recognitionMode: 'alphabet',
  voiceURI: null,
  speechRate: 1.0,
  speechPitch: 1.0,
  autoSpeak: false,
  autoSpeakMode: 'word',
  theme: 'dark',
  showOnboarding: true,
};
