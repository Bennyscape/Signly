'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Hand, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const aslAlphabet = [
  { letter: 'A', description: 'Fist with thumb alongside' },
  { letter: 'B', description: 'Flat hand, fingers together, thumb across palm' },
  { letter: 'C', description: 'Curved hand forming a C shape' },
  { letter: 'D', description: 'Index up, other fingers curved to thumb' },
  { letter: 'E', description: 'Fingers curled, thumb tucked under' },
  { letter: 'F', description: 'Index & thumb circle, other fingers up' },
  { letter: 'G', description: 'Index & thumb pointing sideways' },
  { letter: 'H', description: 'Index & middle finger pointing sideways' },
  { letter: 'I', description: 'Fist with pinky up' },
  { letter: 'J', description: 'Pinky up then draw J in air' },
  { letter: 'K', description: 'Index up, middle angled, thumb between' },
  { letter: 'L', description: 'L-shape with index & thumb' },
  { letter: 'M', description: 'Three fingers over thumb in fist' },
  { letter: 'N', description: 'Two fingers over thumb in fist' },
  { letter: 'O', description: 'Fingers curved to touch thumb, making O' },
  { letter: 'P', description: 'Like K but pointing down' },
  { letter: 'Q', description: 'Like G but pointing down' },
  { letter: 'R', description: 'Index & middle crossed' },
  { letter: 'S', description: 'Fist with thumb over fingers' },
  { letter: 'T', description: 'Thumb between index & middle' },
  { letter: 'U', description: 'Index & middle up together' },
  { letter: 'V', description: 'Index & middle up in V-shape' },
  { letter: 'W', description: 'Index, middle & ring up spread' },
  { letter: 'X', description: 'Index finger hooked' },
  { letter: 'Y', description: 'Thumb & pinky out, other fingers down' },
  { letter: 'Z', description: 'Index finger traces Z in air' },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Hand className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">ASL Alphabet Guide</h1>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl">
            Learn the 26 letters of the American Manual Alphabet. Each letter is a unique hand shape — 
            practice these in front of the camera and our AI will recognize them.
          </p>
        </motion.div>

        {/* Alphabet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {aslAlphabet.map((item, i) => (
            <motion.div
              key={item.letter}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="group p-5 rounded-2xl border border-border bg-bg-surface hover:bg-bg-surface-hover hover:border-accent/20 transition-all cursor-default"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-3xl font-bold text-accent font-mono mb-3 group-hover:bg-accent/20 transition-colors">
                  {item.letter}
                </div>
                <p className="text-xs text-text-secondary leading-snug">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-2xl border border-border bg-bg-surface"
        >
          <h2 className="text-xl font-bold text-text-primary mb-4">📝 Tips for Better Recognition</h2>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-accent font-bold">•</span>
              Ensure good lighting — natural or warm light works best
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">•</span>
              Keep your hand within the camera frame and at a comfortable distance
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">•</span>
              Use a plain background to help the AI focus on your hand
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">•</span>
              Hold each sign steady for about 1 second for reliable detection
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">•</span>
              The letters J and Z involve motion — trace them slowly and clearly
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
}
