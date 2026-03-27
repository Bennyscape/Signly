'use client';

import { motion } from 'framer-motion';
import {
  Hand,
  Mic,
  Brain,
  Zap,
  Eye,
  Volume2,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

const features = [
  {
    icon: Eye,
    title: 'Real-Time Detection',
    description: 'MediaPipe tracks 21 hand landmarks per hand at 30+ FPS with sub-15ms latency.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Brain,
    title: 'AI Recognition',
    description: 'Deep learning model classifies ASL alphabet signs with 95%+ accuracy in-browser.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Volume2,
    title: 'Instant Speech',
    description: 'Text-to-speech converts recognized signs to natural voice output in real-time.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Shield,
    title: '100% Private',
    description: 'All processing happens in your browser. No video data is ever sent to a server.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Zap,
    title: 'Zero Latency',
    description: 'Client-side inference means instant results — no server round-trips needed.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
  {
    icon: Globe,
    title: 'Cross-Platform',
    description: 'Works in Chrome, Edge, and Firefox. No downloads, installations, or plugins.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
];

const steps = [
  {
    num: '01',
    title: 'Enable Camera',
    description: 'Grant camera access so we can see your hand signs.',
    icon: Eye,
  },
  {
    num: '02',
    title: 'Sign Letters',
    description: 'Perform ASL alphabet signs in front of the camera.',
    icon: Hand,
  },
  {
    num: '03',
    title: 'AI Recognizes',
    description: 'Our model detects and classifies your gestures instantly.',
    icon: Brain,
  },
  {
    num: '04',
    title: 'Hear Speech',
    description: 'Recognized text is converted to natural speech output.',
    icon: Mic,
  },
];

import { HeroScrollAnimation } from '@/components/HeroScrollAnimation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary ">
      <Header />

      {/* Hero Section */}
      <HeroScrollAnimation />

      {/* Features Section */}
      <section className="py-24 px-6 flex flex-col items-center justify-center">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Built for the Future of Accessibility
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Cutting-edge AI running entirely in your browser. No servers, no latency, no compromise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-border bg-bg-surface hover:bg-bg-surface-hover transition-all hover:shadow-lg"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-bg-surface/50 flex flex-col items-center justify-center">
        <div className="max-w-[1200px] mx-auto  ">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Four simple steps from sign to speech.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}

                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 relative">
                  <step.icon className="w-7 h-7 text-accent" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-text-inverse text-xs font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 flex flex-col items-center justify-center">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Ready to Break Communication Barriers?
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              Start translating ASL to speech right now. No sign-up, no downloads, completely free.
            </p>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-text-inverse rounded-xl font-semibold text-lg hover:bg-accent-hover transition-all glow-accent"
            >
              <Hand className="w-5 h-5" />
              Launch App Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 ">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">
              ASL<span className="text-accent">.ai</span>
            </span>
          </div>
          <p className="text-xs text-text-tertiary">
            Built with ♥ for accessibility · Open Source
          </p>
        </div>
      </footer>
    </div>
  );
}
