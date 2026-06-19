'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc?: string;
  bgColor?: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  bgColor = '#0a0f0a',
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent]       = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [isMobileState, setIsMobileState]   = useState<boolean>(false);

  const heroRef    = useRef<HTMLDivElement | null>(null);
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const touchY0    = useRef<number>(0);
  const progressRef = useRef<number>(0);   // rendered (smoothed) progress
  const targetRef   = useRef<number>(0);   // where the scroll wants progress to be
  const rafRef      = useRef<number>(0);   // smoothing-loop frame id

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
    progressRef.current = 0;
    targetRef.current = 0;
  }, [mediaType]);

  // Autoplay: fire play() as soon as the browser has buffered enough data
  useEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return;
    const video = videoRef.current;
    const tryPlay = () => { if (video.paused) video.play().catch(() => {}); };
    video.addEventListener('canplay',    tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    tryPlay();
    return () => {
      video.removeEventListener('canplay',    tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [mediaType]);

  useEffect(() => {
    const check = () => setIsMobileState(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

    // Scroll/touch sets a TARGET; a single rAF loop eases the rendered
    // progress toward it each frame. This is the only smoothing — there are
    // NO CSS transitions on the hero (those trailed behind input = the lag).
    const SMOOTH = 0.16;        // ease factor per frame (higher = snappier)

    const tick = () => {
      const target = targetRef.current;
      const cur    = progressRef.current;
      const diff   = target - cur;
      // settled → write the exact target once and stop the loop
      if (Math.abs(diff) < 0.0006) {
        if (cur !== target) {
          progressRef.current = target;
          setScrollProgress(target);
          if (target >= 1)        { setMediaFullyExpanded(true); setShowContent(true); }
          else if (target < 0.75) { setShowContent(false); }
        }
        rafRef.current = 0;
        return;
      }
      const next = cur + diff * SMOOTH;   // glide a fraction of the way each frame
      progressRef.current = next;
      setScrollProgress(next);
      if (next >= 0.999)      { setMediaFullyExpanded(true); setShowContent(true); }
      else if (next < 0.75)   { setShowContent(false); }
      rafRef.current = requestAnimationFrame(tick);
    };
    const wake = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(tick); };

    // ── Wheel (desktop) ──
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        targetRef.current = progressRef.current;
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        targetRef.current = clamp(targetRef.current + e.deltaY * 0.0005);
        wake();
      }
    };

    // ── Touch (mobile) ──
    // touch-action:none on the hero blocks native scroll during the animation,
    // so all touch listeners stay passive.
    const handleTouchStart = (e: TouchEvent) => { touchY0.current = e.touches[0].clientY; };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchY0.current || mediaFullyExpanded) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchY0.current - touchY;          // + = swipe up
      const factor = deltaY < 0 ? 0.005 : 0.0032;
      targetRef.current = clamp(targetRef.current + deltaY * factor);
      touchY0.current = touchY;                          // frame-to-frame delta
      wake();
    };

    const handleTouchEnd = () => { touchY0.current = 0; };

    // Safety-net: keep scroll locked at 0 while animating (keyboard, etc.)
    const handleScroll = () => { if (!mediaFullyExpanded) window.scrollTo(0, 0); };

    // Wheel needs passive:false to call preventDefault
    window.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: true });
    window.addEventListener('touchmove',  handleTouchMove  as unknown as EventListener, { passive: true });
    window.addEventListener('touchend',   handleTouchEnd,                               { passive: true });

    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      window.removeEventListener('wheel',      handleWheel as unknown as EventListener);
      window.removeEventListener('scroll',     handleScroll);
      window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      window.removeEventListener('touchmove',  handleTouchMove  as unknown as EventListener);
      window.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [mediaFullyExpanded]);

  const mediaWidth     = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight    = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);
  const borderRadius   = Math.round((1 - scrollProgress) * 16);

  // Smoothing is done in the rAF lerp above, so the hero elements render with
  // NO CSS transition — CSS transitions trailed behind the input and caused lag.
  const sizeTransition  = 'none';
  const moveTransition  = 'none';

  const firstWord   = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div className='relative'>
      <div
        ref={heroRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 0,
          overflow: 'hidden',
          // Blocks native scroll/zoom on touch during animation without passive:false
          touchAction: mediaFullyExpanded ? 'auto' : 'none',
        }}
      >
        {/* ── Background ── */}
        <motion.div
          className='absolute inset-0 z-0'
          initial={{ opacity: 1 }}
          animate={{ opacity: Math.max(0, 1 - scrollProgress * 1.5) }}
          transition={{ duration: 0 }}
        >
          {bgImageSrc ? (
            <>
              <Image
                src={bgImageSrc}
                alt='Background'
                width={1920}
                height={1080}
                className='w-full h-full'
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                priority
              />
              <div className='absolute inset-0 bg-black/30' />
            </>
          ) : (
            <div style={{ background: bgColor, position: 'absolute', inset: 0 }} />
          )}
        </motion.div>

        {/* ── Expanding media ── */}
        <div
          className='absolute z-10'
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${mediaWidth}px`,
            height: `${mediaHeight}px`,
            maxWidth: '100vw',
            maxHeight: '100vh',
            boxShadow: scrollProgress < 1
              ? `0 0 ${Math.round(60 * (1 - scrollProgress))}px rgba(0,0,0,0.6)`
              : 'none',
            transition: sizeTransition,
          }}
        >
          {mediaType === 'video' ? (
            <div
              className='relative w-full h-full pointer-events-none'
              style={{ overflow: 'hidden', borderRadius: `${borderRadius}px` }}
            >
              <video
                ref={videoRef}
                src={mediaSrc}
                poster={posterSrc}
                autoPlay
                muted
                loop
                playsInline
                preload='auto'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  // Scale up as it expands so the video's baked-in rounded
                  // corners get pushed past the container edge and clipped
                  transform: `scale(${1 + scrollProgress * 0.06})`,
                  transition: moveTransition,
                }}
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: `${borderRadius}px`,
                  background: `rgba(0,0,0,${Math.max(0, 0.35 - scrollProgress * 0.35)})`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : (
            <div className='relative w-full h-full'>
              <Image
                src={mediaSrc}
                alt={title || 'Media content'}
                width={1280}
                height={720}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: `${borderRadius}px`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: `${borderRadius}px`,
                  background: `rgba(0,0,0,${Math.max(0, 0.5 - scrollProgress * 0.3)})`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Title ── */}
        <div className='absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none'>
          <div className='flex items-center justify-center text-center gap-4 w-full'>
            <h2
              className='text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl'
              style={{ transform: `translateX(-${textTranslateX}vw)`, transition: moveTransition }}
            >
              {firstWord}
            </h2>

            {restOfTitle && (
              <h2
                className='text-5xl md:text-7xl lg:text-8xl font-black text-center drop-shadow-2xl'
                style={{
                  transform: `translateX(${textTranslateX}vw)`,
                  transition: moveTransition,
                  background: 'linear-gradient(135deg, #d9f99d 0%, #86efac 20%, #4ade80 45%, #22c55e 68%, #0d9488 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {restOfTitle}
              </h2>
            )}
          </div>

          <div
            className='absolute bottom-12 left-0 right-0 flex flex-col items-center gap-1'
            style={{ opacity: Math.max(0, 1 - scrollProgress * 4) }}
          >
            {date && (
              <p className='text-sm font-semibold text-green-300 tracking-widest uppercase'>
                {date}
              </p>
            )}
            {scrollToExpand && (
              <p className='text-white/60 font-medium text-sm'>{scrollToExpand}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Children scroll over sticky hero ── */}
      <motion.div
        style={{ position: 'relative', zIndex: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollExpandMedia;
