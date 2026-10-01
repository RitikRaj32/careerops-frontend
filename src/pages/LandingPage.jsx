import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, User, Building2, Sparkles, ArrowRight, Phone, ShieldCheck, Loader2, Menu, X, Sun, Moon, CheckCircle2, ChevronRight, BarChart3, Briefcase, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const ParticleBackground = ({ isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    let isVisible = true;
    let mouseX = 0;
    let mouseY = 0;
    let mouseScreenX = -1000;
    let mouseScreenY = -1000;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseScreenX = e.clientX;
      mouseScreenY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Floating particles (dust)
    const dustParticles = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
    }));

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      if (!prefersReducedMotion) {
        time += 0.005;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw dust
      ctx.fillStyle = isDark ? 'rgba(79, 163, 255, 0.4)' : 'rgba(29, 78, 216, 0.3)';
      dustParticles.forEach(p => {
        p.x += p.speedX * (prefersReducedMotion ? 0 : 1);
        p.y += p.speedY * (prefersReducedMotion ? 0 : 1);
        if (p.x > 1) p.x = -1; if (p.x < -1) p.x = 1;
        if (p.y > 1) p.y = -1; if (p.y < -1) p.y = 1;
        
        ctx.beginPath();
        ctx.arc(cx + p.x * cx, cy + p.y * cy, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const isMobile = canvas.width < 768;
      const fov = 400;
      const cols = isMobile ? 50 : 90;
      const rows = isMobile ? 40 : 60;
      const spacingX = isMobile ? 20 : 35;
      const spacingZ = isMobile ? 20 : 25;

      const points = [];

      for (let i = 0; i < cols; i++) {
        points[i] = [];
        for (let j = 0; j < rows; j++) {
          const ci = i - Math.floor(cols / 2);
          
          let x = ci * spacingX;
          let z = j * spacingZ + 50; 

          // Mountain shape: steep on sides, valley in middle
          const dist = Math.abs(ci) / (cols / 2); 
          let yBase = (isMobile ? 120 : 80) - (Math.pow(dist, 2.5) * (isMobile ? 500 : 700)); 
          
          // Waves
          const wave1 = Math.sin(ci * (isMobile ? 0.2 : 0.15) + time) * 15;
          const wave2 = Math.cos(j * (isMobile ? 0.2 : 0.15) - time) * 15;
          
          let y = yBase + wave1 + wave2;
          
          // Parallax
          x -= mouseX * (isMobile ? 30 : 60);
          y += mouseY * (isMobile ? 20 : 40);
          
          // Projection
          const scale = fov / (fov + z);
          const projX = cx + x * scale;
          const projY = cy - y * scale + 150; 
          
          points[i][j] = { x: projX, y: projY, scale };
        }
      }

      // Draw point cloud (dots only)
      ctx.fillStyle = isDark ? 'rgba(79, 163, 255, 0.9)' : 'rgba(29, 78, 216, 0.8)';
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const p = points[i][j];
          
          // Mouse interaction (repulsion)
          let px = p.x;
          let py = p.y;
          const dx = px - mouseScreenX;
          const dy = py - mouseScreenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;
          
          if (dist < maxDist && dist > 0) {
             const force = Math.pow((maxDist - dist) / maxDist, 2);
             px += (dx / dist) * force * 30; 
             py += (dy / dist) * force * 30;
          }

          ctx.beginPath();
          // Scale size of dot based on perspective
          const dotSize = Math.max(0.6, 2.2 * p.scale);
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, magicLogin, loginAsInstitution } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'otp' | 'verifying'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    if (authStep === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [authStep]);

  const formatPhone = (value) => value;

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone.includes('@') || phone.length < 5) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsSending(true);
    try {
      if (isLoginMode) {
        await magicLogin(phone);
        navigate('/dashboard');
      } else {
        const result = await sendOtp(phone);
        if (result.skipOtp) {
           navigate('/dashboard');
        } else {
           setAuthStep('otp');
           setResendTimer(30);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(d => d === '');
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpCode) => {
    setAuthStep('verifying');
    setError('');
    try {
      const result = await verifyOtp(phone, otpCode);
      if (result.isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setAuthStep('otp');
      otpRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsSending(true);
    setError('');
    try {
      await sendOtp(phone);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCandidateLogin = () => {
    setShowAuthModal(true);
    setAuthStep('phone');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setAuthStep('phone');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <div className="font-landing min-h-screen bg-[#F6F8FB] dark:bg-[#05070B] text-[#0B1220] dark:text-[#FFFFFF] transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F6F8FB]/80 dark:bg-[#05070B]/80 backdrop-blur-md border-b border-[#0B1220]/10 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NODE Logo" className="w-8 h-8" />
            <span className="text-xl font-medium tracking-tight">NODE</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {/* Links removed */}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full text-[#5B6575] dark:text-[#9AA3B2] hover:bg-[#0B1220]/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] dark:focus:ring-[#4FA3FF]"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={handleCandidateLogin}
              className="px-4 py-2 sm:px-5 text-sm font-medium rounded-full bg-[#0B1220] text-white dark:bg-white dark:text-[#0B1220] hover:opacity-90 transition-opacity"
            >
              Get access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <ParticleBackground isDark={isDark} />
        
        {/* Soft Dark/Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F6F8FB]/50 to-[#F6F8FB] dark:via-[#05070B]/50 dark:to-[#05070B] pointer-events-none" />

        <div className="relative z-10 text-center px-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pt-20">
          <h1 className="text-[clamp(28px,7vw,64px)] leading-[1.1] font-light tracking-tight text-[#0B1220] dark:text-white mb-6">
            NETWORK FOR OCCUPATIONAL <br className="hidden sm:block" />
            DISCOVERY AND EMPLOYMENT
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#5B6575] dark:text-[#9AA3B2] mb-10 max-w-2xl mx-auto font-light">
            Unifying job discovery, interview preparation, and placement analytics into one elegant, AI-driven ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0">
            <button 
              onClick={handleCandidateLogin}
              className="w-full sm:w-auto group relative px-8 py-3.5 rounded-full bg-[#0B1220] text-white dark:bg-white dark:text-[#0B1220] font-medium text-base hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Join as Candidate
            </button>
            <button 
              onClick={() => navigate('/institution/login')}
              className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-transparent border border-[#0B1220]/15 dark:border-white/15 text-[#0B1220] dark:text-white font-medium text-base hover:bg-[#0B1220]/5 dark:hover:bg-white/5 hover:-translate-y-0.5 transition-all"
            >
              Institution Access 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#0B1220]/10 dark:border-white/10 text-center text-sm text-[#5B6575] dark:text-[#9AA3B2]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="NODE Logo" className="w-5 h-5 opacity-50 grayscale" />
            <span>&copy; {new Date().getFullYear()} NODE. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#0B1220] dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#0B1220] dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-[#0B1220] dark:hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal (kept with matching aesthetics) */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1220]/50 dark:bg-[#05070B]/80 backdrop-blur-md p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-[#F6F8FB] dark:bg-[#05070B] border border-[#0B1220]/10 dark:border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1D4ED8]/10 dark:bg-[#4FA3FF]/10 text-[#1D4ED8] dark:text-[#4FA3FF] mb-4">
                {authStep === 'otp' || authStep === 'verifying' ? <ShieldCheck size={24} /> : <Phone size={24} />}
              </div>
              
              {authStep === 'phone' ? (
                <div className="flex justify-center gap-6 border-b border-[#0B1220]/10 dark:border-white/10 pb-2 mb-4">
                  <button 
                    className={`text-lg font-medium transition-all ${isLoginMode ? 'text-[#0B1220] dark:text-white border-b-2 border-[#1D4ED8] dark:border-[#4FA3FF] -mb-[10px]' : 'text-[#5B6575] dark:text-[#9AA3B2]'}`}
                    onClick={() => {setIsLoginMode(true); setError('');}}
                  >
                    Login
                  </button>
                  <button 
                    className={`text-lg font-medium transition-all ${!isLoginMode ? 'text-[#0B1220] dark:text-white border-b-2 border-[#1D4ED8] dark:border-[#4FA3FF] -mb-[10px]' : 'text-[#5B6575] dark:text-[#9AA3B2]'}`}
                    onClick={() => {setIsLoginMode(false); setError('');}}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <h2 className="text-2xl font-light tracking-tight mb-2">
                  {authStep === 'otp' ? 'Verify Code' : 'Verifying...'}
                </h2>
              )}
              
              <p className="text-sm text-[#5B6575] dark:text-[#9AA3B2]">
                {authStep === 'phone' && (isLoginMode ? "Enter your email to securely log in." : "We'll send a code to verify your email.")}
                {authStep === 'otp' && <>Code sent to <span className="font-medium text-[#0B1220] dark:text-white">{phone}</span></>}
                {authStep === 'verifying' && 'Just a moment...'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-8 pb-8">
              {authStep === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      autoFocus
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(''); }}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#0B1220]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] dark:focus:ring-[#4FA3FF] transition-all text-base"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={phone.length < 5 || isSending}
                    className="w-full py-3.5 bg-[#0B1220] text-white dark:bg-white dark:text-[#0B1220] font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2 transition-all"
                  >
                    {isSending ? <><Loader2 size={18} className="animate-spin" /> Please wait...</> : (isLoginMode ? 'Continue' : 'Send Code')}
                  </button>
                </form>
              )}

              {authStep === 'otp' && (
                <div className="space-y-6">
                  <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-medium rounded-xl border transition-all focus:outline-none ${digit ? 'border-[#1D4ED8] dark:border-[#4FA3FF] bg-[#1D4ED8]/5 dark:bg-[#4FA3FF]/10' : 'border-[#0B1220]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#1D4ED8] dark:focus:border-[#4FA3FF]'}`}
                      />
                    ))}
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  
                  <div className="text-center text-sm">
                    <span className="text-[#5B6575] dark:text-[#9AA3B2]">Didn't receive it? </span>
                    {resendTimer > 0 ? (
                      <span className="font-medium">Resend in {resendTimer}s</span>
                    ) : (
                      <button onClick={handleResend} disabled={isSending} className="font-medium text-[#1D4ED8] dark:text-[#4FA3FF] hover:underline">
                        {isSending ? 'Sending...' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                  
                  <button onClick={() => { setAuthStep('phone'); setOtp(Array(6).fill('')); setError(''); }} className="w-full text-sm text-[#5B6575] dark:text-[#9AA3B2] hover:text-[#0B1220] dark:hover:text-white transition-colors">
                    ← Use a different email
                  </button>
                </div>
              )}

              {authStep === 'verifying' && (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-10 h-10 border-2 border-[#1D4ED8] dark:border-[#4FA3FF] border-t-transparent rounded-full animate-spin mb-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
