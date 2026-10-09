import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { SignInButton, SignOutButton, useUser } from '@clerk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import frame1 from '../assets/frame1.jpg';
import frame2 from '../assets/frame2.jpg';
import frame3 from '../assets/frame3.jpg';
import './LandingPage.css';

function useCinematicScroll() {
  const containerRef = useRef(null);
  const stateRef = useRef({
    cur: 0,
    px: 0,
    py: 0,
    tx: 0,
    ty: 0,
    mouseActive: false
  });
  
  const refs = {
    container: containerRef,
    photos: [useRef(null), useRef(null), useRef(null)],
    flash: useRef(null),
    rays: useRef(null),
    birds: useRef(null),
    wordmarkBox: useRef(null),
    slides: [useRef(null), useRef(null), useRef(null)],
    dots: [useRef(null), useRef(null), useRef(null)],
    scrollHint: useRef(null)
  };

  useEffect(() => {
    let rAF;
    let t = 0;
    const state = stateRef.current;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const smoothstep = (x) => x * x * (3 - 2 * x);
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    const onPointerMove = (e) => {
      if (isReducedMotion) return;
      state.mouseActive = true;
      state.tx = -(e.clientX / window.innerWidth - 0.5) * 2;
      state.ty = -(e.clientY / window.innerHeight - 0.5) * 1.6;
    };
    window.addEventListener('pointermove', onPointerMove);

    let startTime = performance.now();

    const loop = (time) => {
      t = time - startTime;
      
      const scrollerHeight = containerRef.current?.scrollHeight || 0;
      const maxScroll = scrollerHeight - window.innerHeight;
      const scrollY = window.scrollY;
      
      let target = maxScroll > 0 ? scrollY / maxScroll : 0;
      target = clamp(target, 0, 1);

      if (isReducedMotion) {
        state.cur = target;
      } else {
        state.cur += (target - state.cur) * 0.085;
      }

      if (state.mouseActive && !isReducedMotion) {
        state.px += (state.tx * 1.1 - state.px) * 0.05;
        state.py += (state.ty * 0.8 - state.py) * 0.05;
      }

      const f = state.cur * 2;
      const w = [
        smoothstep(clamp(1 - Math.abs(f - 0) * 1.7, 0, 1)),
        smoothstep(clamp(1 - Math.abs(f - 1) * 1.7, 0, 1)),
        smoothstep(clamp(1 - Math.abs(f - 2) * 1.7, 0, 1))
      ];
      
      const b = Math.pow(1 - Math.abs((f % 1) - 0.5) * 2, 2);
      const idle = isReducedMotion ? 0 : Math.sin(t * 0.0004) * 0.5;

      // Photos
      for (let i = 0; i < 3; i++) {
        const photo = refs.photos[i].current;
        if (!photo) continue;
        
        const opacity = i === 0 ? 1 : smoothstep(clamp((f - (i - 1) - 0.3) / 0.4, 0, 1));
        photo.style.opacity = opacity;
        photo.style.visibility = opacity <= 0 ? 'hidden' : 'visible';

        const clampF = clamp(f - i, -1, 1);
        const scale = 1.18 + 0.16 * clampF + b * 0.04;
        photo.style.transform = `translate(${(idle + state.px)}vw, ${state.py}vh) scale(${scale})`;
      }

      // Flash
      if (refs.flash.current) {
        refs.flash.current.style.opacity = b * 0.6;
      }

      // Rays
      if (refs.rays.current) {
        refs.rays.current.style.opacity = (0.3 + w[2] * 0.7) * (0.85 + 0.15 * Math.sin(t * 0.0014));
      }

      // Birds
      if (refs.birds.current) {
        refs.birds.current.style.opacity = clamp(w[1] * 1.3 + w[2] * 1.3, 0, 1);
      }

      // Wordmark
      if (refs.wordmarkBox.current) {
        refs.wordmarkBox.current.style.transform = `translateY(${state.cur * 30}%)`;
        refs.wordmarkBox.current.style.opacity = Math.max(0, 1 - f);
      }

      // Text Slides
      for (let i = 0; i < 3; i++) {
        const slide = refs.slides[i].current;
        if (slide) {
          slide.style.opacity = clamp(w[i] * 1.5, 0, 1);
          slide.style.transform = `translateY(${(i - f) * 34}px)`;
          slide.style.pointerEvents = w[i] > 0.5 ? 'auto' : 'none';
        }
        
        const dot = refs.dots[i].current;
        if (dot) {
          if (w[i] > 0.5) {
            dot.style.backgroundColor = '#f2ab34';
            dot.style.transform = 'scale(1.6)';
          } else {
            dot.style.backgroundColor = 'rgba(255,255,255,0.3)';
            dot.style.transform = 'scale(1)';
          }
        }
      }

      // Scroll hint
      if (refs.scrollHint.current) {
        refs.scrollHint.current.style.opacity = Math.max(0, 1 - state.cur * 12);
      }

      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rAF);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  const scrollToScene = (index) => {
    const scrollerHeight = containerRef.current?.scrollHeight || 0;
    const maxScroll = scrollerHeight - window.innerHeight;
    window.scrollTo({
      top: maxScroll * (index / 2),
      behavior: 'smooth'
    });
  };

  return { refs, scrollToScene };
}

const FogBlob = ({ className }) => (
  <div className={`absolute rounded-full mix-blend-screen bg-[radial-gradient(ellipse_at_center,rgba(255,236,208,0.3)_0%,transparent_70%)] blur-[16px] ${className}`} aria-hidden="true" />
);

export default function LandingPage() {
  const { refs, scrollToScene } = useCinematicScroll();
  const { user } = useAuth();
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (user?.isAuthenticated) {
      if (user?.role === 'INSTITUTION') {
        navigate('/institution/dashboard');
      } else if (user.isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user?.isAuthenticated, user?.isNewUser, user?.role, navigate]);

  return (
    <div ref={refs.container} className="h-[480vh] bg-[#050913] text-[#e6e5d4] selection:bg-[#2f6fed] selection:text-white">
      {/* Fixed UI */}
      <nav className="fixed top-[calc(12px+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[50] flex items-center gap-6 bg-[rgba(8,12,22,0.88)] backdrop-blur-md border border-[#e6e5d4]/20 rounded-full px-5 py-2">
        <span className="font-space font-bold text-[#e6e5d4] tracking-[0.06em] text-lg">CAREER OPS</span>
        {isSignedIn && !user?.isAuthenticated ? (
           <SignOutButton>
             <button className="bg-red-500 text-white px-4 py-1.5 rounded-full font-inter font-medium text-sm hover:opacity-90 transition-opacity">
               Sync Failed - Sign Out
             </button>
           </SignOutButton>
        ) : (
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
            <button className="bg-[#e6e5d4] text-[#0d1526] px-4 py-1.5 rounded-full font-inter font-medium text-sm hover:opacity-90 transition-opacity">
              Sign in
            </button>
          </SignInButton>
        )}
      </nav>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[50] flex flex-col gap-3">
        {[0, 1, 2].map(i => (
          <button 
            key={i} 
            ref={refs.dots[i]}
            onClick={() => scrollToScene(i)}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer border-none p-0 outline-none focus:ring-2 focus:ring-[#f2ab34] focus:ring-offset-2 focus:ring-offset-[#050913]"
            style={{ backgroundColor: i === 0 ? '#f2ab34' : 'rgba(255,255,255,0.3)', transform: i === 0 ? 'scale(1.6)' : 'scale(1)' }}
            aria-label={`Go to scene ${i + 1}`}
          />
        ))}
      </div>

      <div ref={refs.scrollHint} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-300">
        <span className="font-inter text-xs text-[#e6e5d4]/70 uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-[#e6e5d4]/50 to-transparent"></div>
      </div>

      {/* Sticky Stage */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#0d1526]">
        {/* Layer 1: Photos */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <img ref={refs.photos[0]} src={frame1} alt="" className="absolute inset-0 w-full h-full object-cover origin-[50%_45%] will-change-transform" />
          <img ref={refs.photos[1]} src={frame2} alt="" className="absolute inset-0 w-full h-full object-cover origin-[50%_45%] will-change-transform" />
          <img ref={refs.photos[2]} src={frame3} alt="" className="absolute inset-0 w-full h-full object-cover origin-[50%_45%] will-change-transform" />
        </div>

        {/* Layer 2: Rays */}
        <div 
          ref={refs.rays}
          className="absolute rounded-full mask-rays mix-blend-screen animate-spin-slow pointer-events-none z-[2] will-change-transform"
          style={{
            width: '150vw', height: '150vw', 
            right: '-30vw', bottom: '-60vh',
            background: 'repeating-conic-gradient(from 210deg, rgba(255,222,160,0.26) 0 3deg, transparent 3deg 9deg, rgba(255,222,160,0.12) 9deg 11deg, transparent 11deg 17deg)',
            opacity: 0.3
          }}
          aria-hidden="true"
        />

        {/* Layer 3: Fog Bands */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]" aria-hidden="true">
          <div className="absolute w-[160%] left-[-30%] h-[40%] bottom-[-8%] animate-fog-1 flex justify-around">
            <FogBlob className="w-[40%] h-full" />
            <FogBlob className="w-[50%] h-full" />
            <FogBlob className="w-[30%] h-[120%]" />
          </div>
          <div className="absolute w-[160%] left-[-30%] h-[30%] bottom-[20%] opacity-70 animate-fog-2 flex justify-around">
            <FogBlob className="w-[30%] h-full" />
            <FogBlob className="w-[60%] h-[150%]" />
            <FogBlob className="w-[40%] h-full" />
          </div>
          <div className="absolute w-[160%] left-[-30%] h-[20%] top-[4%] opacity-45 animate-fog-3 flex justify-around">
            <FogBlob className="w-[50%] h-full" />
            <FogBlob className="w-[30%] h-full" />
            <FogBlob className="w-[40%] h-full" />
          </div>
        </div>

        {/* Layer 4: Birds */}
        <div ref={refs.birds} className="absolute inset-0 pointer-events-none z-[4] will-change-opacity transition-opacity duration-200" style={{ opacity: 0 }} aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`absolute bird-fly-${i}`} style={{ top: `${15 + i * 8}%`, left: 0 }}>
               <svg width={16 + i * 2} viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="bird-flap">
                 <path d="M1 1L12 11L23 1" stroke="#1d2433" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          ))}
        </div>

        {/* Layer 5: Specks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => {
            const size = 2 + Math.random() * 3;
            const dur = 10 + Math.random() * 12;
            const del = -(Math.random() * 20);
            const left = Math.random() * 100;
            return (
              <div 
                key={i} 
                className="absolute rounded-full animate-speck"
                style={{
                  width: size, height: size,
                  left: `${left}%`,
                  backgroundColor: '#f2ab34',
                  boxShadow: '0 0 8px 2px rgba(242,171,52,0.6)',
                  '--dur': `${dur}s`,
                  '--del': `${del}s`
                }}
              />
            );
          })}
        </div>

        {/* Layer 6: Flash Overlay */}
        <div 
          ref={refs.flash}
          className="absolute inset-0 mix-blend-screen pointer-events-none z-[6] will-change-opacity"
          style={{ background: 'radial-gradient(ellipse at 50% 62%, rgba(255,240,215,0.8), transparent 72%)', opacity: 0 }}
          aria-hidden="true"
        />

        {/* Layer 7: Dark Scrim */}
        <div className="absolute inset-0 pointer-events-none z-[7]" style={{
          background: 'linear-gradient(to top, rgba(5,9,19,0.78), rgba(5,9,19,0.25) 42%, transparent 65%), radial-gradient(circle at center, transparent 40%, rgba(5,9,19,0.4) 100%)'
        }} aria-hidden="true" />

        {/* Layer 8: Film Grain */}
        <div className="absolute inset-0 landing-grain opacity-[0.14] mix-blend-overlay pointer-events-none z-[8]" aria-hidden="true" />

        {/* Layer 9: Wordmark */}
        <div ref={refs.wordmarkBox} className="absolute left-[3vw] bottom-[4vh] overflow-hidden z-[9] pointer-events-none will-change-transform">
          <div className="wordmark-text font-space font-bold text-[#e6e5d4] leading-[0.9] tracking-[-0.045em] whitespace-nowrap flex">
            {"CAREER OPS".split('').map((char, i) => (
              <span key={i} className="inline-block letter-intro" style={{ animationDelay: `${250 + i * 60}ms` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <span className="inline-block fade-in-asterisk">*</span>
          </div>
        </div>

        {/* Layer 10: Text Panel */}
        <div className="text-panel z-[10] pointer-events-none">
          <div className="grid w-full">
            {[
              { heading: "", body: "" },
              { heading: "", body: "" },
              { heading: "", body: "" }
            ].map((content, i) => (
              <div 
                key={i} 
                ref={refs.slides[i]}
                className="col-start-1 row-start-1 flex flex-col gap-4 transition-opacity will-change-transform"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {content.heading && <h2 className="font-space font-semibold text-[#e6e5d4] text-[clamp(22px,2.3vw,30px)] leading-[1.1]">{content.heading}</h2>}
                {content.body && <p className="font-inter text-[#d5d6d0] text-base leading-relaxed">{content.body}</p>}
              </div>
            ))}
          </div>
          
          
          {isSignedIn && !user?.isAuthenticated ? (
            <SignOutButton>
              <div className="mt-4 flex items-center justify-between bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/50 p-[5px] pl-6 w-full cursor-pointer hover:bg-red-500/30 transition-colors group pointer-events-auto">
                <span className="font-inter font-medium text-white">Sync Failed. Click to Sign Out & Retry</span>
              </div>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <div className="mt-4 flex items-center justify-between bg-[rgba(8,12,22,0.82)] backdrop-blur-md rounded-full border border-[#e6e5d4]/20 p-[5px] pl-6 w-full cursor-pointer hover:bg-[rgba(15,20,35,0.9)] transition-colors group pointer-events-auto">
                <span className="font-inter font-medium text-[#e6e5d4]">Candidate Sign In</span>
                <div className="w-[46px] h-[46px] rounded-full bg-[#e6e5d4] flex items-center justify-center text-[#0d1526]">
                   <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-[4px]" />
                </div>
              </div>
            </SignInButton>
          )}

          <div 
            onClick={() => navigate('/institution/login')} 
            className="mt-3 flex items-center justify-between bg-[rgba(13,116,112,0.2)] backdrop-blur-md rounded-full border border-teal/40 p-[5px] pl-6 w-full cursor-pointer hover:bg-[rgba(13,116,112,0.4)] transition-colors group pointer-events-auto shadow-[0_0_15px_rgba(45,212,191,0.15)]"
          >
            <span className="font-inter font-medium text-teal-light text-[#2dd4bf]">Institution Login</span>
            <div className="w-[46px] h-[46px] rounded-full bg-[#2dd4bf] flex items-center justify-center text-[#0d1526]">
               <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-[4px]" />
            </div>
          </div>
        </div>

        {/* Layer 11: Liquid Glass Dock */}
        <div className="absolute bottom-[4vh] right-[4vw] z-[11] pointer-events-auto">
           <motion.div 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
             className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] ring-1 ring-white/5 hover:bg-white/10 transition-all duration-300"
           >
              <a href="https://github.com/RitikRaj32" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors hover:scale-110 transform duration-200">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
              </a>
              <div className="w-px h-6 bg-white/10"></div>
              <a href="https://www.linkedin.com/in/ritik-kumar-bhoi-b3127642b" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#0077b5] transition-colors hover:scale-110 transform duration-200">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <div className="w-px h-6 bg-white/10"></div>
              <button onClick={() => setShowInfo(true)} className="text-white/60 hover:text-white transition-colors hover:scale-110 transform duration-200 outline-none">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </button>
           </motion.div>
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-[10vh] right-[4vw] z-[12] w-80 p-6 rounded-2xl bg-[rgba(15,20,35,0.7)] backdrop-blur-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] pointer-events-auto"
            >
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <h3 className="font-space font-semibold text-white text-lg mb-2">What is Career Ops?</h3>
              <p className="font-inter text-sm text-white/70 leading-relaxed">
                Career Ops is your ultimate cinematic co-pilot for navigating the professional universe. Seamlessly bridging the gap between talent and opportunity, it equips you with AI-driven mock interviews, interactive roadmaps, and actionable intel to conquer your career goals.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
