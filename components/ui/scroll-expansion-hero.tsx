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
  const progressRef = useRef<number>(0);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
    progressRef.current = 0;
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
    // ── Wheel (desktop) ──────────────────────────────────────────────────────
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const next = Math.min(Math.max(progressRef.current + e.deltaY * 0.0005, 0), 1);
        progressRef.current = next;
        setScrollProgress(next);
        if (next >= 1)      { setMediaFullyExpanded(true); setShowContent(true); }
        else if (next < 0.75) { setShowContent(false); }
      }
    };

    // ── Touch (mobile) ───────────────────────────────────────────────────────
    // touch-action:none on the hero element (set below via CSS) already blocks
    // native scroll during the animation — so we can keep ALL listeners passive.
    const handleTouchStart = (e: TouchEvent) => {
      touchY0.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchY0.current || mediaFullyExpanded) return;
      const touchY  = e.touches[0].clientY;
      const deltaY  = touchY0.current - touchY;          // + = swipe up
      const factor  = deltaY < 0 ? 0.005 : 0.0032;      // lower = slower, more visible expansion
      const next    = Math.min(Math.max(progressRef.current + deltaY * factor, 0), 1);
      progressRef.current = next;
      touchY0.current = touchY;                          // frame-to-frame delta
      setScrollProgress(next);
      if (next >= 1)       { setMediaFullyExpanded(true); setShowContent(true); }
      else if (next < 0.75) { setShowContent(false); }
    };

    const handleTouchEnd = () => { touchY0.current = 0; };

    // Safety-net: keep scroll locked at 0 while animating (keyboard, etc.)
    const handleScroll = () => { if (!mediaFullyExpanded) window.scrollTo(0, 0); };

    // Wheel needs passive:false to call preventDefault
    window.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    window.addEventListener('scroll', handleScroll);
    // Touch listeners are ALL passive — touch-action:none handles scroll blocking
    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: true });
    window.addEventListener('touchmove',  handleTouchMove  as unknown as EventListener, { passive: true });
    window.addEventListener('touchend',   handleTouchEnd,                               { passive: true });

    return () => {
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

  // Smooth easing so the expansion + title slide are clearly visible even
  // on a fast swipe — each value eases toward its scroll-driven target.
  const EASE            = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const sizeTransition  = `width 0.55s ${EASE}, height 0.55s ${EASE}, box-shadow 0.55s ${EASE}`;
  const moveTransition  = `transform 0.7s ${EASE}`;

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
                  transition: `background 0.55s ${EASE}`,
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
            style={{ opacity: Math.max(0, 1 - scrollProgress * 4), transition: `opacity 0.4s ${EASE}` }}
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
