'use client';

import { motion } from 'framer-motion';
import { Hand, Moon, Sun, Settings, Github } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
  const theme = useSettingsStore((s) => s.theme);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    updateSetting('theme', theme === 'dark' ? 'light' : 'dark');
  }, [theme, updateSetting]);

  // Apply theme class to html element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass sticky top-0 z-50 px-6 py-3"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Hand className="w-5 h-5 text-accent" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full animate-pulse-glow" />
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            ASL<span className="text-accent">.ai</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/guide', label: 'ASL Guide' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-all focus-ring"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-text-inverse rounded-lg hover:bg-accent-hover transition-all glow-accent"
          >
            <Settings className="w-4 h-4" />
            Launch App
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}
