/**
 * Speech synthesis wrapper using the Web Speech API.
 */

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function speak(
  text: string,
  options?: {
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onStart?: () => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  if (options?.voice) utterance.voice = options.voice;
  if (options?.rate !== undefined) utterance.rate = options.rate;
  if (options?.pitch !== undefined) utterance.pitch = options.pitch;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onStart) utterance.onstart = options.onStart;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function pauseSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.pause();
}

export function resumeSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.resume();
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
