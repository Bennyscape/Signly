import type { HandLandmark } from '@/types';

/**
 * Normalize hand landmarks to be position- and scale-invariant.
 * Centers landmarks on the wrist and normalizes by the max distance from wrist.
 */
export function normalizeLandmarks(landmarks: HandLandmark[]): number[] {
  if (landmarks.length !== 21) return [];

  const wrist = landmarks[0];
  const centered = landmarks.map((lm) => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }));

  // Find max distance from wrist for scale normalization
  let maxDist = 0;
  for (const lm of centered) {
    const dist = Math.sqrt(lm.x * lm.x + lm.y * lm.y + lm.z * lm.z);
    if (dist > maxDist) maxDist = dist;
  }

  if (maxDist === 0) maxDist = 1;

  // Flatten to array: [x0, y0, z0, x1, y1, z1, ...]
  const normalized: number[] = [];
  for (const lm of centered) {
    normalized.push(lm.x / maxDist, lm.y / maxDist, lm.z / maxDist);
  }

  return normalized;
}

/**
 * Extract angles between key finger joints for additional features.
 */
export function extractFingerAngles(landmarks: HandLandmark[]): number[] {
  const angles: number[] = [];
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerPIPs = [3, 6, 10, 14, 18];
  const fingerMCPs = [2, 5, 9, 13, 17];

  for (let i = 0; i < 5; i++) {
    const tip = landmarks[fingerTips[i]];
    const pip = landmarks[fingerPIPs[i]];
    const mcp = landmarks[fingerMCPs[i]];

    const angle = calculateAngle(mcp, pip, tip);
    angles.push(angle / Math.PI); // Normalize to [0, 1]
  }

  return angles;
}

function calculateAngle(
  a: HandLandmark,
  b: HandLandmark,
  c: HandLandmark
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  if (magBA === 0 || magBC === 0) return 0;
  return Math.acos(Math.min(Math.max(dot / (magBA * magBC), -1), 1));
}
