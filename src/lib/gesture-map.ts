// ASL Alphabet gesture labels (A-Z + special gestures)
export const ASL_ALPHABET_LABELS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
  'space', 'del', 'nothing',
] as const;

export type ASLAlphabetLabel = typeof ASL_ALPHABET_LABELS[number];

// Map prediction index to label
export function indexToLabel(index: number): ASLAlphabetLabel {
  return ASL_ALPHABET_LABELS[index] || 'nothing';
}

// Map label to display character
export function labelToDisplay(label: string): string {
  switch (label) {
    case 'space': return '␣';
    case 'del': return '⌫';
    case 'nothing': return '—';
    default: return label;
  }
}

// Check if a label is a letter
export function isLetterLabel(label: string): boolean {
  return /^[A-Z]$/.test(label);
}

// Check if a label is a control gesture
export function isControlLabel(label: string): boolean {
  return label === 'space' || label === 'del';
}

// ASL common words (Phase 2)
export const ASL_WORD_LABELS = [
  'hello', 'thank you', 'please', 'sorry', 'yes', 'no',
  'help', 'stop', 'go', 'come', 'eat', 'drink',
  'more', 'finished', 'good', 'bad', 'want', 'need',
  'like', 'love',
] as const;
