'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { Sparkles, Hand, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

const FRAME_COUNT = 151;
// format is ezgif-frame-001.jpg to ezgif-frame-151.jpg
const currentFrame = (index: number) => 
  `/images/scroll-frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

export function HeroScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Apply spring physics for buttery smooth standard mouse wheel scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const frameIndex = useTransform(smoothProgress, [0, 0.65], [1, FRAME_COUNT]);
  
  // Parallax and fade out the hero text as we scroll down
  const textOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const textScale = useTransform(smoothProgress, [0, 0.1], [1, 0.95]);
  const textY = useTransform(smoothProgress, [0, 0.1], [0, -100]);
  
  // Cinematic Dolly Out / Step Backward Effect
  // The video wrapper starts exactly at 100vw/100vh so it IS the background
  // At 65% scroll, it shrinks down seamlessly to dashboard size
  const wrapperWidth = useTransform(smoothProgress, [0.65, 0.75], ["100vw", "1024px"]); // max-w-5xl
  const wrapperHeight = useTransform(smoothProgress, [0.65, 0.75], ["100vh", "576px"]); // 16:9
  const wrapperBorderRadius = useTransform(smoothProgress, [0.65, 0.75], ["0px", "24px"]); 
  
  // Play button and borders fade in as we step backward
  const uiOpacity = useTransform(smoothProgress, [0.65, 0.75], [0, 1]);
  
  // Background fades from black to dark gray to give environment depth when zooming out
  const bgEnvironmentOpacity = useTransform(smoothProgress, [0.65, 0.75], [1, 0.6]);

  // Preload images
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      // Use Promise.all to load in parallel for faster startup
      const promises = Array.from({ length: FRAME_COUNT }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.src = currentFrame(i + 1);
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
        });
      });

      const loaded = await Promise.all(promises);
      if (isMounted) {
        setImages(loaded);
        setImagesLoaded(true);
      }
    };
    
    loadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  // requestAnimationFrame render logic
  const renderFrame = (index: number) => {
    if (!canvasRef.current || !imagesLoaded || !images[index - 1]) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[index - 1];
    if (!img.complete || img.naturalWidth === 0) return;
    
    // Manual cover logic to keep aspect ratio and fill the canvas exactly
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (imagesLoaded) {
      const idx = Math.min(Math.max(1, Math.round(latest)), FRAME_COUNT);
      requestAnimationFrame(() => renderFrame(idx));
    }
  });

  // Since we are changing CSS width dynamically, the canvas pixel buffer 
  // needs to be at least window.innerWidth to not look blurry during the transition
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        // Always render at maximum possible size to keep quality high even when wrapper is 100vw
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        const idx = Math.min(Math.max(1, Math.round(frameIndex.get())), FRAME_COUNT);
        renderFrame(idx);
      }
    };

    window.addEventListener('resize', handleResize);
    if (imagesLoaded) {
      handleResize();
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]); 

  // Cleanup explicit canvas contexts
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-bg-primary">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
        
        {/* Environment background that reveals when Dolly-Out happens */}
        <motion.div 
          className="absolute inset-0 bg-bg-primary z-0" 
          style={{ opacity: useTransform(bgEnvironmentOpacity, v => 1 - v) }} 
        />

        {/* The Cinematic Video Wrapper */}
        <motion.div
          style={{ 
            width: wrapperWidth, 
            height: wrapperHeight,
            borderRadius: wrapperBorderRadius,
            maxWidth: '100%',
          }}
          className="relative z-10 flex items-center justify-center overflow-hidden bg-black shadow-2xl group"
          onMouseEnter={() => setIsVideoHovered(true)}
          onMouseLeave={() => setIsVideoHovered(false)}
        >
          {/* Canvas always fills exactly whatever size the wrapper dictates */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          
          {/* Fading UI elements that appear smoothly during zoom out */}
          <motion.div 
            className="absolute inset-0 border border-white/20 rounded-2xl pointer-events-none"
            style={{ opacity: uiOpacity }}
          />

          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
            style={{ opacity: uiOpacity }}
          >
            <motion.div 
              animate={{ scale: isVideoHovered ? 1.1 : 1 }}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-blue-500/20 text-white">
                  <Play fill="white" className="w-8 h-8 ml-1" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Content (Overlays the screen initially, fades out early) */}
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pointer-events-none"
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
        >
          <div className="max-w-[1200px] mx-auto text-center mt-20 pointer-events-auto">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 bg-white/5 backdrop-blur-md text-sm text-gray-300 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Powered by MediaPipe & TensorFlow.js</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white drop-shadow-xl"
            >
              <span>Sign Language</span>
              <br />
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Speaks Here
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md"
            >
              Real-time American Sign Language to speech translation. Just sign in front of your camera
              — our AI recognizes, transcribes, and speaks your gestures, all in your browser.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
              >
                <Hand className="w-5 h-5" />
                Launch App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/guide"
                className="flex items-center gap-2 px-7 py-3.5 border border-white/20 rounded-xl font-semibold text-base text-white hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Learn ASL Signs
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
