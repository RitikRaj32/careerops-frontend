import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, Settings, PlayCircle, Square, MessageSquare, AlertCircle, BarChart3, TrendingUp, Send, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MockInterview = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: 'system', content: `AI Interviewer initialized. Target field: ${user?.course || 'Engineering'} in ${user?.branch || 'Tech'}.` },
    { role: 'ai', content: `Hi ${user?.firstName || 'there'}! I'm ready to start our mock interview. To begin, could you walk me through your background and interest in ${user?.branch || 'this field'}?` }
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiTyping, isRecording]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const newUserMsg = { role: 'user', content: text };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInputText('');
    setIsAiTyping(true);

    try {
      const res = await fetch('https://good-files-lead.loca.lt/api/interview/chat', {
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
      <div className="flex-1 flex flex-col h-full bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass overflow-hidden relative">
         
         {/* Top Bar */}
         <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-paper/50">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
               <span className="font-semibold text-ink">Live Interview Simulation</span>
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-ink-soft hover:bg-card rounded-lg transition-colors"><Settings size={20} /></button>
            </div>
         </div>

         {/* Chat/Transcript Area */}
         <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'system' ? (
                   <div className="w-full text-center text-xs font-bold text-ink-soft uppercase tracking-wider my-4">
                     {msg.content}
                   </div>
                ) : (
                  <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-dark text-white' : 'bg-teal text-white'}`}>
                       {msg.role === 'ai' ? 'AI' : 'You'}
                    </div>
                    <div className={`p-4 rounded-2xl ${msg.role === 'ai' ? 'bg-paper dark:bg-card/80 text-ink shadow-sm rounded-tl-none border border-line' : 'bg-blue text-white rounded-tr-none'}`}>
                       <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center flex-shrink-0">AI</div>
                    <div className="p-4 rounded-2xl bg-paper dark:bg-card/80 text-ink shadow-sm rounded-tl-none border border-line flex items-center gap-2">
                       <Loader2 size={16} className="animate-spin text-ink-soft" />
                       <span className="text-sm text-ink-soft">Thinking...</span>
                    </div>
                </div>
              </div>
            )}
            
            {isRecording && (
              <div className="flex justify-end">
                <div className="max-w-[80%] flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center flex-shrink-0">You</div>
                    <div className="p-4 rounded-2xl bg-blue text-white rounded-tr-none flex items-center gap-2">
                       <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-card rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-card rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-card rounded-full animate-bounce delay-200"></span>
                       </div>
                    </div>
                </div>
              </div>
            )}
         </div>

         {/* Controls & Input */}
         <div className="p-4 bg-paper border-t border-line">
            <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-line focus-within:border-blue focus-within:shadow-sm transition-all">
               <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-rose/10 text-rose animate-pulse' : 'bg-card text-ink-soft hover:bg-blue/10 hover:text-blue'}`}
               >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
               </button>
               
               <input
                 type="text"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') handleSendMessage(inputText);
                 }}
                 placeholder="Type your answer here..."
                 className="flex-1 bg-transparent border-none focus:outline-none px-2 text-ink"
                 disabled={isAiTyping}
               />
               
               <button 
                 onClick={() => handleSendMessage(inputText)}
                 disabled={!inputText.trim() || isAiTyping}
                 className="p-3 rounded-xl bg-blue text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue/90 transition-all shadow-sm"
               >
                  <Send size={20} className={isAiTyping ? 'animate-pulse' : ''} />
               </button>
            </div>
         </div>
      </div>

      {/* Right Sidebar - Real-time Feedback & Metrics */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
         
         {/* Live Signals */}
         <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl p-6 shadow-glass">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
               <BarChart3 size={20} className="text-teal" /> Real-time Signals
            </h3>
            
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs font-semibold text-ink-soft mb-1">
                   <span>STAR Method Adherence</span>
                   <span>Good</span>
                 </div>
                 <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                   <div className="h-full bg-teal w-[75%] rounded-full"></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs font-semibold text-ink-soft mb-1">
                   <span>Confidence (Text Sentiment)</span>
                   <span>High</span>
                 </div>
                 <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                   <div className="h-full bg-blue w-[85%] rounded-full"></div>
                 </div>
               </div>
            </div>
         </div>

         {/* AI Coach Notes */}
         <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl p-6 shadow-glass flex-1">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
               <Sparkles size={20} className="text-amber" /> AI Coach Notes
            </h3>
            
            <div className="space-y-3">
               <div className="p-3 bg-paper rounded-lg border border-line text-sm text-ink flex items-start gap-2">
                  <TrendingUp size={16} className="text-teal mt-0.5 flex-shrink-0" />
                  <span>Your interview is being analyzed. AI feedback will appear here as the conversation progresses.</span>
               </div>
            </div>
            
            <div className="mt-auto pt-6">
               <p className="text-xs text-ink-soft italic text-center">Feedback is generated by Gemini API and is not a certified assessment.</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default MockInterview;
