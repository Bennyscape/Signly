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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary ">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-[1200px] mx-auto px-6 mt-20 pb-28">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-text-secondary mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Powered by MediaPipe & TensorFlow.js</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="text-text-primary">Sign Language</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Speaks Here
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Real-time American Sign Language to speech translation. Just sign in front of your camera
              — our AI recognizes, transcribes, and speaks your gestures, all in your browser.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-7 py-3.5 bg-accent text-text-inverse rounded-xl font-semibold text-base hover:bg-accent-hover transition-all glow-accent"
              >
                <Hand className="w-5 h-5" />
                Launch App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/guide"
                className="flex items-center gap-2 px-7 py-3.5 border border-border rounded-xl font-semibold text-base text-text-primary hover:bg-bg-surface-hover transition-all"
              >
                Learn ASL Signs
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl border border-border bg-bg-surface overflow-hidden shadow-xl">
              {/* Mock Dashboard Preview */}
              <div className="p-1">
                {/* Mock titlebar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-lg bg-bg-primary text-xs text-text-tertiary">
                      asl.ai/dashboard
                    </div>
                  </div>
                </div>

                {/* Mock content */}
                <div className="grid grid-cols-5 gap-4 p-6">
                  {/* Camera mock */}
                  <div className="col-span-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="relative text-center">
                      <Hand className="w-16 h-16 text-blue-400/40 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">Camera Feed</p>
                    </div>
                    {/* Landmark dots */}
                    {[
                      { top: '35%', left: '45%' },
                      { top: '30%', left: '50%' },
                      { top: '28%', left: '55%' },
                      { top: '32%', left: '60%' },
                      { top: '38%', left: '62%' },
                      { top: '42%', left: '48%' },
                      { top: '45%', left: '52%' },
                      { top: '48%', left: '56%' },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                        style={pos}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>

                  {/* Right panel mock */}
                  <div className="col-span-2 space-y-4">
                    {/* Prediction mock */}
                    <div className="rounded-xl border border-border/50 p-4 bg-bg-primary/50">
                      <div className="text-xs text-text-tertiary mb-3 uppercase tracking-wider">Prediction</div>
                      <div className="text-center">
                        <div className="inline-flex w-14 h-14 rounded-xl bg-blue-400/10 items-center justify-center text-2xl font-bold text-blue-400 font-mono mb-2">
                          H
                        </div>
                        <div className="text-lg font-bold text-text-primary font-mono">94%</div>
                      </div>
                    </div>

                    {/* Transcript mock */}
                    <div className="rounded-xl border border-border/50 p-4 bg-bg-primary/50">
                      <div className="text-xs text-text-tertiary mb-2 uppercase tracking-wider">Transcript</div>
                      <p className="text-sm text-text-primary font-medium">
                        Hello
                        <span className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse" />
                      </p>
                    </div>

                    {/* Speech mock */}
                    <div className="rounded-xl border border-border/50 p-4 bg-bg-primary/50">
                      <div className="text-xs text-text-tertiary mb-2 uppercase tracking-wider">Speech</div>
                      <div className="flex gap-1 items-end h-5">
                        {[4, 8, 12, 6, 14, 8, 4, 10, 6].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-blue-400/60 rounded-full"
                            animate={{ height: [h, h * 1.5, h] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.08,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
