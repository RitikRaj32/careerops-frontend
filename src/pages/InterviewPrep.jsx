import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Settings, PlayCircle, Square, MessageSquare, AlertCircle, BarChart3, 
  TrendingUp, Send, Loader2, Sparkles, BookOpen, Target, CheckCircle2, 
  LayoutDashboard, Building2, Briefcase, FileText, User, Search, Bookmark, 
  BookmarkCheck, Plus, Check, Play, MicOff, Star, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const InterviewPrep = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mock'); 

  // --- Mock Interview State ---
  const [mockRole, setMockRole] = useState(user?.targetRole || 'Frontend Developer');
  const [mockLevel, setMockLevel] = useState('Mid-Level');
  const [mockType, setMockType] = useState('Technical');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Question Bank State ---
  const [qbRole, setQbRole] = useState('Frontend Developer');
  const [qbSkill, setQbSkill] = useState('JavaScript');
  const [qbCompany, setQbCompany] = useState('Startup');
  const [bankQuestions, setBankQuestions] = useState([]);
  const [isGeneratingQb, setIsGeneratingQb] = useState(false);

  // --- Resume & Skill Gap State ---
  const [resumeQuestions, setResumeQuestions] = useState([]);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  
  const [skillGaps, setSkillGaps] = useState([]);
  const [selectedGap, setSelectedGap] = useState(null);
  const [gapQuestions, setGapQuestions] = useState([]);
  const [isGeneratingGaps, setIsGeneratingGaps] = useState(false);
  const [isGeneratingGapQs, setIsGeneratingGapQs] = useState(false);

  useEffect(() => {
    if (activeTab === 'skillgap' && skillGaps.length === 0) {
      const fetchGaps = async () => {
        setIsGeneratingGaps(true);
        try {
          const res = await fetch('http://localhost:5000/api/roadmap/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              targetRole: user?.targetRole || qbRole || 'Software Engineer', 
              currentSkills: user?.skillsList ? user.skillsList.split(',') : ['HTML', 'CSS']
            })
          });
          const data = await res.json();
          if (data.success && data.gaps) {
            const gaps = data.gaps.map(g => g.skill);
            setSkillGaps(gaps);
            if (gaps.length > 0) setSelectedGap(gaps[0]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsGeneratingGaps(false);
        }
      };
      fetchGaps();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedGap) {
      const fetchGapQuestions = async () => {
        setIsGeneratingGapQs(true);
        try {
          const res = await fetch('http://localhost:5000/api/interview/gap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gap: selectedGap, role: user?.targetRole || qbRole || 'Software Engineer' })
          });
          const data = await res.json();
          if (data.success && data.questions) {
            setGapQuestions(data.questions);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsGeneratingGapQs(false);
        }
      };
      fetchGapQuestions();
    }
  }, [selectedGap]);

  // Voice removed, using manual text input now.

  // --- Mock Interview Actions ---
  const startMockInterview = () => {
    setMockQuestions([
      { q: `Based on your role as a ${mockLevel} ${mockRole}, can you explain a complex problem you solved recently?` },
      { q: `How do you ensure your code is maintainable and scalable?` },
      { q: `Tell me about a time you disagreed with a senior team member.` }
    ]);
    setIsInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setTranscript('');
  };

  const submitAnswer = async () => {
     setIsAnalyzing(true);
     
     try {
       const res = await fetch('http://localhost:5000/api/interview/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           messages: [
             { role: 'assistant', content: mockQuestions[currentQuestionIndex].q },
             { role: 'user', content: transcript }
           ],
           userProfile: user
         })
       });
       const data = await res.json();
       if (res.ok) {
         setFeedback({
           overall: data.scores?.overall || 8.5,
           content: data.scores?.content || 9, 
           clarity: data.scores?.clarity || 8, 
           confidence: data.scores?.confidence || 9, 
           relevance: data.scores?.relevance || 8,
           sampleAnswer: data.sampleAnswer || "Sample ideal response was not provided.",
           missedPoints: data.missedPoints || [data.feedback || "No specific points missed."]
         });

         // Dynamically inject the AI's conversational reply as the NEXT question in the interview!
         if (data.reply) {
            setMockQuestions(prev => {
               const newQs = [...prev];
               if (currentQuestionIndex + 1 < newQs.length) {
                  // Override the next placeholder question with the AI's contextual follow-up
                  newQs[currentQuestionIndex + 1].q = data.reply;
               } else {
                  // If we're at the end, append it so the interview continues
                  newQs.push({ q: data.reply });
               }
               return newQs;
            });
         }
       } else {
         throw new Error("No feedback");
       }
     } catch (err) {
       console.error("AI Error:", err);
       setFeedback({
         overall: 5.0,
         content: 5, clarity: 5, confidence: 5, relevance: 5,
         sampleAnswer: "Network Error: Could not connect to AI. Please ensure the backend is running and Groq API is reachable.",
         missedPoints: ["Failed to fetch real AI response"]
       });
     } finally {
       setIsAnalyzing(false);
     }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
       setCurrentQuestionIndex(prev => prev + 1);
       setFeedback(null);
       setTranscript('');
    } else {
       setIsInterviewStarted(false);
    }
  };

  const resetAnswer = () => {
    setFeedback(null);
    setTranscript('');
  };

  // --- Question Bank Actions ---
  const generateNewBankQuestions = async () => {
     setIsGeneratingQb(true);
     try {
       const res = await fetch('http://localhost:5000/api/interview/prep', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           role: qbRole,
           experience: qbCompany,
           techStack: qbSkill
         })
       });
       const data = await res.json();
       if (data.success && data.questions) {
         const newQuestions = [];
         
         if (data.questions.technical) {
            data.questions.technical.forEach(q => newQuestions.push({ id: Date.now() + Math.random(), q: q.q, bookmarked: false, role: qbRole, skill: qbSkill, company: qbCompany }));
         }
         if (data.questions.behavioral) {
            data.questions.behavioral.forEach(q => newQuestions.push({ id: Date.now() + Math.random(), q: q.q, bookmarked: false, role: qbRole, skill: qbSkill, company: qbCompany }));
         }
         if (data.questions.systemDesign) {
            data.questions.systemDesign.forEach(q => newQuestions.push({ id: Date.now() + Math.random(), q: q.q, bookmarked: false, role: qbRole, skill: qbSkill, company: qbCompany }));
         }

         setBankQuestions(prev => [...newQuestions, ...prev]);
       } else {
         throw new Error("Failed to generate");
       }
     } catch (err) {
       console.error("Generate questions error:", err);
       setBankQuestions(prev => [
          { id: Date.now(), q: `New generated question for ${qbSkill} in a ${qbCompany} environment.`, bookmarked: false, role: qbRole, skill: qbSkill, company: qbCompany },
          ...prev
       ]);
     } finally {
       setIsGeneratingQb(false);
     }
  };

  const toggleBookmark = (id) => {
     setBankQuestions(prev => prev.map(q => q.id === id ? { ...q, bookmarked: !q.bookmarked } : q));
  };

  const toggleSolved = (id) => {
     setBankQuestions(prev => prev.map(q => q.id === id ? { ...q, solved: !q.solved } : q));
  };

  const removeQuestion = (id) => {
     setBankQuestions(prev => prev.filter(q => q.id !== id));
  };

  const removeAllQuestions = () => {
     setBankQuestions([]);
  };

  // --- Resume Based Actions ---
  const generateResumeQuestions = async () => {
     if (!user?.resumeUrl) {
       alert("Your resume not found. Please upload your resume in your dashboard first.");
       setResumeQuestions(["Your resume not found. Please upload it in your dashboard first."]);
       return;
     }

     setIsGeneratingResume(true);
     try {
       const res = await fetch('http://localhost:5000/api/resume/questions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ resumeUrl: user.resumeUrl })
       });
       const data = await res.json();
       if (data.success && data.questions) {
         setResumeQuestions(data.questions);
       } else {
         throw new Error(data.error || "Failed to generate resume questions");
       }
     } catch (err) {
       console.error("Resume questions error:", err);
       alert(err.message || "Something went wrong.");
     } finally {
       setIsGeneratingResume(false);
     }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
           <Target className="text-primary" size={32} />
           Interview Intelligence
        </h2>
        <p className="text-muted-foreground mt-1">Master your interviews with AI mock sessions, personalized question banks, and resume analysis.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-background p-1.5 rounded-xl border border-border inline-flex">
        {[
          { id: 'mock', icon: PlayCircle, label: 'AI Mock Interview' },
          { id: 'bank', icon: BookOpen, label: 'Question Bank' },
          { id: 'resume', icon: FileText, label: 'Resume-Based' },
          { id: 'skillgap', icon: AlertCircle, label: 'Skill-Gap Prep' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-card text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB: AI Mock Interview --- */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
           {!isInterviewStarted ? (
              <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-glass p-6 md:p-8 text-center max-w-2xl mx-auto">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Configure Your Interview</h3>
                 <p className="text-muted-foreground mb-8">Customize the AI interviewer to match your upcoming real-world interview.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                    <div>
                       <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Role</label>
                       <input 
                         type="text" 
                         value={mockRole} 
                         onChange={(e) => setMockRole(e.target.value)}
                         className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Level</label>
                       <select 
                         value={mockLevel}
                         onChange={(e) => setMockLevel(e.target.value)}
                         className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all"
                       >
                          <option>Intern</option>
                          <option>Entry-Level</option>
                          <option>Mid-Level</option>
                          <option>Senior</option>
                          <option>Lead/Manager</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Type</label>
                       <select 
                         value={mockType}
                         onChange={(e) => setMockType(e.target.value)}
                         className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all"
                       >
                          <option>Technical</option>
                          <option>Behavioral</option>
                          <option>HR / Cultural</option>
                          <option>System Design</option>
                       </select>
                    </div>
                 </div>

                 <button 
                   onClick={startMockInterview}
                   className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-blue/30 flex items-center justify-center gap-2 mx-auto"
                 >
                    <Play size={20} fill="currentColor" /> Start AI Interview
                 </button>
              </div>
           ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Interviewer Panel */}
                 <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-muted/50">
                       <div className="flex justify-between items-center mb-4">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
                          <span className="text-muted-foreground text-sm flex items-center gap-2">
                             <Target size={14} /> {mockRole} • {mockType}
                          </span>
                       </div>
                       <h3 className="text-2xl font-bold leading-tight text-foreground">
                          "{mockQuestions[currentQuestionIndex].q}"
                       </h3>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                       <div className="flex-1 mb-4">
                          <textarea
                             value={transcript}
                             onChange={(e) => setTranscript(e.target.value)}
                             disabled={feedback !== null || isAnalyzing}
                             placeholder="Type your answer here..."
                             className="w-full h-full min-h-[150px] bg-background/50 rounded-xl border border-border p-4 text-foreground text-lg leading-relaxed resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          />
                       </div>

                       {!feedback && (
                          <div className="flex flex-wrap items-center justify-end gap-4">

                             <button 
                               onClick={submitAnswer}
                               disabled={!transcript.trim() || isAnalyzing}
                               className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-line disabled:text-muted-foreground text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                             >
                                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                {isAnalyzing ? 'Analyzing...' : 'Submit Answer'}
                             </button>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Feedback Panel */}
                 <div className="lg:col-span-1">
                    {feedback ? (
                       <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-glass p-6 animate-in fade-in slide-in-from-right-4">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-display font-bold text-xl shadow-lg shadow-emerald-500/20">
                                {feedback.overall}
                             </div>
                             <div>
                                <h3 className="font-bold text-foreground text-lg">AI Feedback</h3>
                                <p className="text-sm text-muted-foreground">Score out of 10</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6">
                             <div className="bg-background p-3 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Content</p>
                                <p className="font-bold text-lg text-foreground">{feedback.content}/10</p>
                             </div>
                             <div className="bg-background p-3 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Clarity</p>
                                <p className="font-bold text-lg text-foreground">{feedback.clarity}/10</p>
                             </div>
                             <div className="bg-background p-3 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Confidence</p>
                                <p className="font-bold text-lg text-foreground">{feedback.confidence}/10</p>
                             </div>
                             <div className="bg-background p-3 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Relevance</p>
                                <p className="font-bold text-lg text-foreground">{feedback.relevance}/10</p>
                             </div>
                          </div>

                          <div className="mb-6">
                             <h4 className="font-bold text-foreground mb-2 flex items-center gap-2"><AlertCircle size={16} className="text-warning" /> Points Missed</h4>
                             <ul className="space-y-2">
                                {feedback.missedPoints.map((pt, i) => (
                                   <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-destructive mt-0.5">•</span> {pt}
                                   </li>
                                ))}
                             </ul>
                          </div>

                          <div className="mb-6 bg-primary/5 border border-blue/20 p-4 rounded-xl">
                             <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Star size={16} /> Sample Improved Answer</h4>
                             <p className="text-sm text-muted-foreground italic leading-relaxed">"{feedback.sampleAnswer}"</p>
                          </div>

                          <div className="flex gap-3">
                             <button 
                               onClick={resetAnswer}
                               className="w-1/3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 rounded-xl transition-all"
                             >
                                Retry
                             </button>
                             <button 
                               onClick={nextQuestion}
                               className="w-2/3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-sm"
                             >
                                {currentQuestionIndex < mockQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
                             </button>
                           </div>
                       </div>
                    ) : (
                       <div className="h-full bg-background/30 border border-border border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                          <BarChart3 size={48} className="mb-4 opacity-50" />
                          <p className="font-semibold">Awaiting Your Answer</p>
                          <p className="text-sm mt-2">Submit your spoken response to receive instant, multi-dimensional AI feedback.</p>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      )}

      {/* --- TAB: Question Bank --- */}
      {activeTab === 'bank' && (
         <div className="space-y-6">
            <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-glass p-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                     <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Role</label>
                     <input type="text" value={qbRole} onChange={e => setQbRole(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-blue outline-none" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Specific Skill</label>
                     <select value={qbSkill} onChange={e => setQbSkill(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-blue outline-none">
                        <option value="JavaScript">JavaScript</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="HTML/CSS">HTML/CSS</option>
                        <option value="Python">Python</option>
                        <option value="SQL">SQL</option>
                        <option value="R">R</option>
                        <option value="Java">Java</option>
                        <option value="C#">C#</option>
                        <option value="C++">C++</option>
                        <option value="Go (Golang)">Go (Golang)</option>
                        <option value="Rust">Rust</option>
                        <option value="Swift">Swift</option>
                        <option value="Kotlin">Kotlin</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Company Type</label>
                     <select value={qbCompany} onChange={e => setQbCompany(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-blue outline-none">
                        <option>Startup</option>
                        <option>FAANG / Big Tech</option>
                        <option>Government</option>
                        <option>Agency / Consult</option>
                     </select>
                  </div>
                  <button 
                     onClick={generateNewBankQuestions}
                     disabled={isGeneratingQb}
                     className="bg-primary hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 h-[42px]"
                  >
                     {isGeneratingQb ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                     Generate More
                  </button>
               </div>
            </div>

            {bankQuestions.length > 0 && (
               <div className="flex justify-end">
                  <button 
                     onClick={removeAllQuestions}
                     className="text-sm font-semibold text-destructive hover:text-rose-600 transition-colors flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/20"
                  >
                     <Trash2 size={16} /> Clear All Questions
                  </button>
               </div>
            )}

            <div className="grid grid-cols-1 gap-4">
               {bankQuestions.map(q => (
                  <div key={q.id} className={`bg-card/80 dark:bg-card/40 backdrop-blur-xl border ${q.solved ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border'} rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-all duration-300 group ${q.solved ? 'scale-[0.99] opacity-80' : ''}`}>
                     <button 
                        onClick={() => toggleBookmark(q.id)}
                        className={`mt-1 p-1 rounded-md transition-colors ${q.bookmarked ? 'text-warning bg-amber/10' : 'text-muted-foreground hover:bg-background'}`}
                     >
                        {q.bookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
                     </button>
                     <div className="flex-1">
                        <h4 className={`text-foreground font-semibold text-lg transition-colors ${q.solved ? 'text-muted-foreground line-through decoration-emerald-500/50' : ''}`}>{q.q}</h4>
                        <div className="flex gap-2 mt-3">
                           <span className="px-2 py-1 bg-background border border-border rounded text-xs text-muted-foreground font-semibold">{q.role}</span>
                           <span className="px-2 py-1 bg-primary/10 border border-blue/20 rounded text-xs text-primary font-semibold">{q.skill}</span>
                           <span className="px-2 py-1 bg-background border border-border rounded text-xs text-muted-foreground font-semibold">{q.company}</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                           onClick={() => toggleSolved(q.id)}
                           className={`p-2 rounded-xl transition-all duration-300 ${q.solved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' : 'bg-background border border-border text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-500'}`}
                           title={q.solved ? "Mark as Unsolved" : "Mark as Solved"}
                        >
                           <CheckCircle2 size={20} />
                        </button>
                        <button 
                           onClick={() => removeQuestion(q.id)}
                           className="p-2 rounded-xl bg-background border border-border text-muted-foreground transition-all duration-300 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/10"
                           title="Remove Question"
                        >
                           <Trash2 size={20} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* --- TAB: Resume-Based --- */}
      {activeTab === 'resume' && (
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="relative z-10 max-w-2xl">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><FileText /> Project Deep Dive</h3>
                  <p className="text-white/80 mb-6">Using semantic search and embeddings on your uploaded resume, AI will generate highly specific questions about your past projects, just like a real hiring manager would.</p>
                  
                  <button 
                     onClick={generateResumeQuestions}
                     disabled={isGeneratingResume}
                     className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg"
                  >
                     {isGeneratingResume ? <Loader2 size={20} className="animate-spin" /> : <Settings size={20} />}
                     {isGeneratingResume ? 'Analyzing Resume via pgvector...' : 'Generate Resume Questions'}
                  </button>
               </div>
            </div>

            {resumeQuestions.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resumeQuestions.map((q, idx) => (
                     <div key={idx} className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-sm border-l-4 border-l-indigo-500">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-4">
                           {idx + 1}
                        </div>
                        <p className="text-foreground font-medium text-lg leading-relaxed">{q}</p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      )}

      {/* --- TAB: Skill-Gap Prep --- */}
      {activeTab === 'skillgap' && (
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
               <h3 className="font-bold text-foreground uppercase tracking-wider text-sm mb-4">Identified Skill Gaps</h3>
               {isGeneratingGaps ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground">
                     <Loader2 size={24} className="animate-spin text-destructive" />
                     <p className="text-sm">Analyzing gaps...</p>
                  </div>
               ) : (
                  <>
                     <div className="space-y-3">
                        {skillGaps.map((gap, idx) => (
                           <button
                              key={gap}
                              onClick={() => setSelectedGap(gap)}
                              className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${
                                 selectedGap === gap 
                                    ? 'bg-gradient-to-r from-destructive to-rose-600 text-white shadow-lg shadow-destructive/20 border-transparent scale-[1.02]'
                                    : 'bg-background border-border text-muted-foreground hover:bg-card hover:border-destructive/40 hover:text-foreground hover:scale-[1.01]'
                              }`}
                              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                           >
                              <div className="flex justify-between items-center">
                                 <span className="font-bold">{gap}</span>
                                 {selectedGap === gap && <Target size={18} className="animate-pulse" />}
                              </div>
                           </button>
                        ))}
                     </div>
                     {skillGaps.length === 0 && <p className="text-sm text-muted-foreground italic">No gaps identified yet.</p>}
                  </>
               )}
               <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  These gaps were automatically identified from your career analysis. Preparing for them shows initiative.
               </p>
            </div>
            
            <div className="lg:col-span-3">
               {selectedGap ? (
                  <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-rose/20 rounded-2xl shadow-glass p-6">
                     <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-destructive" size={24} />
                        <h3 className="text-xl font-bold text-foreground">Interview Questions for: <span className="text-destructive">{selectedGap}</span></h3>
                     </div>

                     {isGeneratingGapQs ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground animate-in fade-in zoom-in duration-500">
                           <div className="relative">
                              <Loader2 size={40} className="animate-spin text-destructive relative z-10" />
                              <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full animate-pulse"></div>
                           </div>
                           <p className="font-medium animate-pulse">Generating targeted questions...</p>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {gapQuestions.map((q, idx) => (
                              <div 
                                 key={q.id} 
                                 className="p-6 bg-background/80 rounded-xl border border-border hover:border-destructive/40 hover:shadow-xl hover:shadow-destructive/5 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 group"
                                 style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                              >
                                 <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold flex-shrink-0 mt-1 transition-colors group-hover:bg-destructive group-hover:text-white">
                                       {idx + 1}
                                    </div>
                                    <div>
                                       <p className="font-semibold text-foreground text-lg leading-relaxed">{q.q}</p>
                                       <button className="text-sm font-bold text-primary mt-4 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                          <Sparkles size={16} className="text-primary animate-pulse" /> 
                                          View AI Strategy
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 text-center">
                     <p className="text-muted-foreground font-medium">Select a skill gap from the left to generate specific interview questions.</p>
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
};

export default InterviewPrep;
