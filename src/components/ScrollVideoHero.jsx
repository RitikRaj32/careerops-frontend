import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import videoSrc from '../assets/landingvideo.mp4';

/*
 * STOP_POINTS: Time in seconds where the video should pause after each scroll.
 * You can edit these values to change where the video stops playing.
 * Part 1: 0s to STOP_POINTS[0]
 * Part 2: STOP_POINTS[0] to STOP_POINTS[1]
 * Part 3: STOP_POINTS[1] to STOP_POINTS[2]
 */
const STOP_POINTS = [3.33, 6.66, 10];

const ScrollVideoHero = () => {
  const videoRef = useRef(null);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      video.currentTime = STOP_POINTS[2];
      setIsFinished(true);
      return;
    }

    // Lock scroll initially
    document.body.style.overflow = 'hidden';

    // If user reloads while scrolled down, immediately unlock
    if (window.scrollY > 10) {
       document.body.style.overflow = '';
       video.currentTime = STOP_POINTS[2];
       stepRef.current = 3;
       setIsFinished(true);
       return;
    }

    const triggerNextPart = () => {
      if (isPlayingRef.current || stepRef.current >= 3) return;
      
      const nextStep = stepRef.current + 1;
      const targetTime = STOP_POINTS[nextStep - 1];
      
      isPlayingRef.current = true;
      
      // Define checkTime first to ensure it can be removed in catch block if needed
      const checkTime = () => {
        if (video.currentTime >= targetTime) {
          video.pause();
          video.currentTime = targetTime;
          isPlayingRef.current = false;
          stepRef.current = nextStep;

          if (nextStep === 3) {
            document.body.style.overflow = '';
            setIsFinished(true);
          }
          
          if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
            video.removeEventListener('timeupdate', checkTime);
          }
          return;
        }

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
          video.requestVideoFrameCallback(checkTime);
        }
      };

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Video play blocked:", error);
          video.currentTime = targetTime;
          isPlayingRef.current = false;
          stepRef.current = nextStep;
          if (nextStep === 3) {
            document.body.style.overflow = '';
            setIsFinished(true);
          }
          if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
            video.removeEventListener('timeupdate', checkTime);
          }
        });
      }

      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        video.requestVideoFrameCallback(checkTime);
      } else {
        video.addEventListener('timeupdate', checkTime);
      }
    };

    const handleWheel = (e) => {
      if (stepRef.current < 3 && !prefersReducedMotion) {
        e.preventDefault();
        if (e.deltaY > 0) {
          triggerNextPart();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (stepRef.current < 3 && !prefersReducedMotion) {
        if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
          e.preventDefault();
          triggerNextPart();
        } else if (['ArrowUp', 'PageUp'].includes(e.code)) {
          e.preventDefault();
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      if (stepRef.current < 3 && !prefersReducedMotion) {
        e.preventDefault();
        const touchEndY = e.touches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        
        // swipe up = forward
        if (deltaY > 30) {
          triggerNextPart();
          touchStartY = touchEndY;
        }
      }
    };

    const handleScroll = () => {
      if (stepRef.current === 3 && window.scrollY <= 10 && !prefersReducedMotion) {
        stepRef.current = 0;
        video.currentTime = 0;
        setIsFinished(false);
        document.body.style.overflow = 'hidden';
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black flex items-center justify-center pt-24 pb-8 px-4 sm:px-8">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain rounded-2xl shadow-2xl"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
      
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/70 pointer-events-none transition-opacity duration-500 ${isFinished ? 'opacity-0' : 'opacity-100 animate-bounce'}`}
      >
        <span className="text-xs uppercase tracking-widest font-medium mb-1">Scroll</span>
        <ChevronDown size={20} />
      </div>
    </div>
  );
};

export default ScrollVideoHero;
