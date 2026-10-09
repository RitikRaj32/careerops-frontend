import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Video, Settings, PlayCircle, MessageSquare, AlertCircle, BarChart3, TrendingUp, Send, Loader2, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

const MockInterview = () => {
  const { user } = useAuth();
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const [messages, setMessages] = useState([
    { role: 'system', content: `AI Interviewer initialized. Target field: ${user?.course || 'Engineering'} in ${user?.branch || 'Tech'}.` },
    { role: 'ai', content: `Hi ${user?.firstName || 'there'}! I'm ready to start our mock interview. To begin, could you walk me through your background and interest in ${user?.branch || 'this field'}?` }
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices.find(v => v.lang.includes('en'));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!SpeechRecognition) {
         alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
         return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
             finalTranscript += event.results[i][0].transcript + ' ';
          } else {
             currentInterim += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript);
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInputText(prev => prev + interimText);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const newUserMsg = { role: 'user', content: text };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInputText('');
    setInterimText('');
    setIsAiTyping(true);

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + '/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          userProfile: user
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
        speakText(data.reply);
        if (data.feedback) {
          setFeedbacks(prev => [{ text: data.feedback, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'system', content: 'Error: Failed to connect to AI (Check API Key).' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Network error communicating with AI.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
      
      {/* Main Interview Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex-1 flex flex-col h-full bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-glass overflow-hidden relative"
      >
         
         {/* Top Bar */}
         <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
               <span className="font-semibold text-foreground">Live Interview Simulation</span>
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-muted-foreground hover:bg-card rounded-lg transition-colors"><Settings size={20} /></button>
            </div>
         </div>

         {/* Chat/Transcript Area */}
         <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                     <div className="w-full text-center text-xs font-bold text-muted-foreground uppercase tracking-wider my-4">
                       {msg.content}
                     </div>
                  ) : (
                    <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'ai' ? 'bg-white shadow-primary/20 p-1.5 border border-border/50' : 'bg-primary text-white'}`}>
                         {msg.role === 'ai' ? (
                            <img src={logoImg} alt="AI" className="w-full h-full object-contain" />
                         ) : (
                            <User size={18} strokeWidth={2.5} />
                         )}
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'ai' ? 'bg-background dark:bg-card/80 text-foreground rounded-tl-[4px] border border-border' : 'bg-gradient-to-br from-primary to-blue text-white rounded-tr-[4px]'}`}>
                         <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isAiTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] flex gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-white shadow-sm shadow-primary/20 flex items-center justify-center flex-shrink-0 p-1.5 border border-border/50">
                        <img src={logoImg} alt="AI" className="w-full h-full object-contain grayscale opacity-50" />
                      </div>
                      <div className="p-4 rounded-2xl bg-background dark:bg-card/80 text-foreground shadow-sm rounded-tl-[4px] border border-border flex items-center gap-3">
                         <div className="flex gap-1">
                           <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-primary/60"></motion.div>
                           <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary/60"></motion.div>
                           <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary/60"></motion.div>
                         </div>
                         <span className="text-sm font-bold text-muted-foreground tracking-wide">Processing...</span>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         {/* Controls & Input */}
         <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleListening}
                 disabled={isAiTyping}
                 className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center min-w-[44px] ${
                    isListening 
                      ? 'bg-rose-500 text-white shadow-rose-500/30' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                 }`}
                 title={isListening ? "Stop Recording" : "Talk using Microphone"}
               >
                  {isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Square size={20} className="fill-current" />
                    </motion.div>
                  ) : <Mic size={20} />}
               </motion.button>

               <input
                 type="text"
                 value={inputText + interimText}
                 onChange={(e) => {
                    setInputText(e.target.value);
                    setInterimText('');
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') handleSendMessage(inputText + interimText);
                 }}
                 placeholder="Type your answer here..."
                 className="flex-1 bg-transparent border-none focus:outline-none px-2 text-foreground"
                 disabled={isAiTyping}
               />
               
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => handleSendMessage(inputText + interimText)}
                 disabled={!(inputText + interimText).trim() || isAiTyping}
                 className="p-3 rounded-xl bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
               >
                  <Send size={20} className={isAiTyping ? 'animate-pulse' : ''} />
               </motion.button>
            </div>
         </div>
      </motion.div>

      {/* Right Sidebar - Real-time Feedback & Metrics */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
        className="w-full lg:w-80 flex flex-col gap-6"
      >
         
         {/* Live Signals */}
         <motion.div 
           whileHover={{ y: -4, boxShadow: "0px 10px 40px rgba(0,0,0,0.1)" }}
           className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-glass relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 pointer-events-none"></div>
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
               <BarChart3 size={20} className="text-teal" /> Real-time Signals
            </h3>
            
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                   <span>STAR Method Adherence</span>
                   <span>Good</span>
                 </div>
                 <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[75%] rounded-full"></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                   <span>Confidence (Text Sentiment)</span>
                   <span>High</span>
                 </div>
                 <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[85%] rounded-full"></div>
                 </div>
               </div>
            </div>
         </motion.div>

         {/* AI Coach Notes */}
         <motion.div 
           whileHover={{ y: -4, boxShadow: "0px 10px 40px rgba(0,0,0,0.1)" }}
           className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-glass flex-1 flex flex-col relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 pointer-events-none"></div>
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
               <Sparkles size={20} className="text-warning" /> AI Coach Notes
            </h3>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
               {feedbacks.length === 0 ? (
                 <div className="p-3 bg-background rounded-lg border border-border text-sm text-foreground flex items-start gap-2">
                    <TrendingUp size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Your interview is being analyzed. AI feedback will appear here as you answer questions.</span>
                 </div>
               ) : (
                 feedbacks.map((fb, idx) => (
                   <div key={idx} className="p-3 bg-background rounded-lg border border-border text-sm text-foreground animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-warning" />
                        <span className="text-xs font-bold text-muted-foreground">{fb.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{fb.text}</p>
                   </div>
                 ))
               )}
            </div>
            
            <div className="mt-auto pt-6">
               <p className="text-xs text-muted-foreground italic text-center">Feedback is generated by Gemini API and is not a certified assessment.</p>
            </div>
         </motion.div>
      </motion.div>

    </div>
  );
};

export default MockInterview;
