import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const InstitutionLogin = () => {
  const navigate = useNavigate();
  const { loginAsInstitution } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (formData.password !== 'admin123') {
        setError('Invalid credentials. Please use admin123 as the password.');
        setIsSubmitting(false);
        return;
      }
      
      loginAsInstitution({
        email: formData.email,
        name: formData.name
      });
      navigate('/institution/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0d1526] font-sans relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Logo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03] mix-blend-overlay pointer-events-none scale-150"
        style={{ backgroundImage: `url(${logoImg})` }}
      ></div>

      {/* Animated Liquid Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md animate-in slide-in-from-bottom-12 duration-700">
        <div className="bg-card/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex flex-col items-center mb-10 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-6">
              <Building2 size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-center">Institution Access</h2>
            <p className="text-white/60 text-center mt-2">Enter your credentials to access the analytics portal</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose/20 border border-rose/50 text-destructive-light text-sm font-semibold text-center relative z-10">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/80 ml-1">Institute Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-white/40 group-focus-within:text-teal transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all shadow-inner"
                  placeholder="admin@university.edu"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/80 ml-1">Institute Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-white/40 group-focus-within:text-teal transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all shadow-inner"
                  placeholder="e.g. Stanford University"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/80 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-white/40 group-focus-within:text-teal transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-[#20b2aa] text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70 disabled:hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]"
            >
              {isSubmitting ? (
                <>Authenticating <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div></>
              ) : (
                <>Login to Dashboard <ArrowRight size={20} /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
              <CheckCircle2 size={16} className="text-teal/70" /> Verify institution identity
            </div>
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
               <CheckCircle2 size={16} className="text-teal/70" /> End-to-end encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionLogin;
