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
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        // User scrolled back to top — collapse
        setMediaFullyExpanded(false);
        setShowContent(false);
        setScrollProgress(1); // keep at 1, let them scroll down to trigger collapse
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1);
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1);
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel as unknown as EventListener, { passive: false });
    window.addEventListener('scroll', handleScroll as EventListener);
    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: false });
    window.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false });
    window.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      window.removeEventListener('wheel', handleWheel as unknown as EventListener);
      window.removeEventListener('scroll', handleScroll as EventListener);
      window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      window.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth  = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);
  // Border radius: 16px when small, smoothly goes to 0 when fully expanded
  const borderRadius = Math.round((1 - scrollProgress) * 16);

  const firstWord   = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div className='relative'>
      {/*
        STICKY HERO — stays pinned to the top of the viewport throughout
        the entire scroll through the children content below.
        This keeps the video element always in the viewport so the
        browser never suspends/resets it.
      */}
      <div
        ref={heroRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 0,
          overflow: 'hidden',
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
              <div className='absolute inset-0 bg-black/50' />
            </>
          ) : (
            <div style={{ background: bgColor, position: 'absolute', inset: 0 }} />
          )}
        </motion.div>

        {/* ── Expanding media container ── */}
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
          }}
        >
          {mediaType === 'video' ? (
            <div className='relative w-full h-full pointer-events-none'>
              <video
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
                  borderRadius: `${borderRadius}px`,
                  display: 'block',
                }}
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
              />
              {/* Darkening overlay fades as video expands */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: `${borderRadius}px`,
                  background: `rgba(0,0,0,${Math.max(0, 0.45 - scrollProgress * 0.45)})`,
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

        {/* ── Title words (split apart as scroll progresses) ── */}
        <div
          className='absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none'
        >
          <div className='flex items-center justify-center text-center gap-4 w-full'>
            <h2
              className='text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl'
              style={{ transform: `translateX(-${textTranslateX}vw)` }}
            >
              {firstWord}
            </h2>
            {restOfTitle && (
              <h2
                className='text-5xl md:text-7xl lg:text-8xl font-black text-center drop-shadow-2xl'
                style={{
                  transform: `translateX(${textTranslateX}vw)`,
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

          {/* Scroll hint + date — fade out fast as scroll starts */}
          <div
            className='flex flex-col items-center gap-1 mt-6'
            style={{ opacity: Math.max(0, 1 - scrollProgress * 4) }}
          >
            {date && (
              <p className='text-sm font-semibold text-green-300 tracking-widest uppercase'>
                {date}
              </p>
            )}
            {scrollToExpand && (
              <p className='text-gray-500 font-medium text-sm'>
                {scrollToExpand}
              </p>
            )}
          </div>
        </div>
      </div>

      {/*
        CHILDREN — positioned after the sticky hero in normal flow.
        As the user scrolls, these sections slide up OVER the sticky video.
        Each child section should have its own background so it visually
        covers the hero beneath it.
      */}
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
