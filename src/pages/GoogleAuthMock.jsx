import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthMock = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAccountSelect = (email) => {
    setLoading(true);
    login(email);
    // Simulate network delay for OAuth
    setTimeout(() => {
      navigate('/onboarding');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-lg border border-line overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 text-center border-b border-line">
           {/* Mock Google Logo */}
           <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                 <span className="text-4xl font-bold text-[#4285F4]">G</span>
                 <span className="text-4xl font-bold text-[#EA4335]">o</span>
                 <span className="text-4xl font-bold text-[#FBBC05]">o</span>
                 <span className="text-4xl font-bold text-[#4285F4]">g</span>
                 <span className="text-4xl font-bold text-[#34A853]">l</span>
                 <span className="text-4xl font-bold text-[#EA4335]">e</span>
              </div>
           </div>
           <h2 className="text-2xl font-display font-medium text-ink">Sign in</h2>
           <p className="text-ink-soft mt-2">to continue to NODE</p>
        </div>
        
        {loading ? (
           <div className="p-8 flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-ink-soft">Authenticating...</p>
           </div>
        ) : (
          <div className="p-4 space-y-2">
            <button 
              onClick={() => handleAccountSelect('alex.candidate@gmail.com')}
              className="w-full text-left flex items-center gap-4 p-4 hover:bg-paper rounded-xl transition-colors cursor-pointer"
            >
               <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center font-bold text-lg">
                  A
               </div>
               <div>
                  <div className="font-bold text-ink">Alex Lin</div>
                  <div className="text-sm text-ink-soft">alex.candidate@gmail.com</div>
               </div>
            </button>
            
            <button 
              onClick={() => handleAccountSelect('sarah.j@gmail.com')}
              className="w-full text-left flex items-center gap-4 p-4 hover:bg-paper rounded-xl transition-colors cursor-pointer"
            >
               <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg">
                  S
               </div>
               <div>
                  <div className="font-bold text-ink">Sarah Jenkins</div>
                  <div className="text-sm text-ink-soft">sarah.j@gmail.com</div>
               </div>
            </button>

            <div className="border-t border-line mt-4 pt-4">
               <button className="w-full text-left flex items-center gap-4 p-4 hover:bg-paper rounded-xl transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-ink-soft">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div className="font-bold text-ink text-sm">Use another account</div>
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthMock;
