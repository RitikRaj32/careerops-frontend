import React, { useState } from 'react';
import { 
  BookOpen, Target, Settings, CheckCircle2, Play, Loader2, 
  MessageSquare, Code, LayoutDashboard, Building2, Briefcase, 
  FileText, Video, MapPin, Mail, Calendar, User, Search, 
  ListChecks, CheckSquare, Clock, Plus, Trash2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InterviewPrep = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('research'); 
  
  // Tab 1: Research State
  const [research, setResearch] = useState({
    companyProfile: '',
    whyThisCompany: '',
    jobBreakdown: [{ responsibility: '', experience: '' }],
    interviewers: [{ name: '', role: '', linkedin: '' }]
  });

  // Tab 2: Questions State
  const [prepData, setPrepData] = useState({
    role: user?.targetRole || 'Software Engineer',
    experience: 'Mid-Level',
    techStack: 'React, Node.js, AWS'
  });
  const [elevatorPitch, setElevatorPitch] = useState('');
  const [starStories, setStarStories] = useState([{ situation: '', task: '', action: '', result: '' }]);
  const [reverseQuestions, setReverseQuestions] = useState(['', '', '']);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  
  // Tab 3: Checklist State
  const [physicalChecks, setPhysicalChecks] = useState({ copies: false, notebook: false, pen: false, reference: false, id: false });
  const [virtualChecks, setVirtualChecks] = useState({ mic: false, camera: false, lighting: false, internet: false, software: false });
  const [transitInfo, setTransitInfo] = useState({ linkOrAddress: '', parking: '', contact: '' });

  // Tab 4: Post-Interview State
  const [postPrep, setPostPrep] = useState({
    thankYouDraft: '',
    debriefNotes: '',
    followUpDate: ''
  });

  const ROLES = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer',
    'Product Manager', 'Project Manager',
    'UI/UX Designer', 'DevOps Engineer', 'Cloud Architect', 'Marketing Specialist', 'Sales Representative'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://good-files-lead.loca.lt/api/interview/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prepData)
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
      } else {
        console.error('Failed to generate:', data.error);
        setQuestions({
          technical: [
            { q: 'Explain a complex concept in your core technology.', hint: 'Dive deep into internals.' },
            { q: 'How do you handle scaling and performance issues?', hint: 'Mention profiling and caching.' }
          ],
          behavioral: [
            { q: 'Tell me about a time you had a conflict with a team member.', hint: 'Use the STAR method.' }
          ],
          systemDesign: [
            { q: 'Design a high-availability system architecture.', hint: 'Discuss load balancing and DB replication.' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResearchUpdate = (field, idx, key, value) => {
    const list = [...research[field]];
    list[idx][key] = value;
    setResearch({ ...research, [field]: list });
  };

  const handleStarUpdate = (idx, key, value) => {
    const list = [...starStories];
    list[idx][key] = value;
    setStarStories(list);
  };

  const addResponsibility = () => setResearch({...research, jobBreakdown: [...research.jobBreakdown, { responsibility: '', experience: '' }]});
  const addInterviewer = () => setResearch({...research, interviewers: [...research.interviewers, { name: '', role: '', linkedin: '' }]});
  const addStarStory = () => setStarStories([...starStories, { situation: '', task: '', action: '', result: '' }]);

  const tabs = [
    { id: 'research', label: '1. Company & Role Research', icon: Search },
    { id: 'questions', label: '2. Question Banks & Frameworks', icon: MessageSquare },
    { id: 'checklist', label: '3. Logistical & Physical Checklist', icon: ListChecks },
    { id: 'post', label: '4. Post-Interview Pipeline', icon: Clock }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-ink">Interview Prep Hub</h2>
          <p className="text-ink-soft mt-2 text-lg">Your end-to-end framework to dissect, prepare, and conquer your next interview.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue to-teal flex items-center justify-center shadow-lg text-white">
          <BookOpen size={24} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-line shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                isActive 
                  ? 'bg-blue text-white shadow-md' 
                  : 'text-ink-soft hover:bg-paper dark:hover:bg-dark-glow hover:text-ink'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Company & Role Research */}
      {activeTab === 'research' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Building2 size={20} className="text-blue"/> Company Profile</h3>
              <p className="text-xs text-ink-soft mb-3">Store the company’s mission statement, core values, target audience, and main competitors.</p>
              <textarea 
                className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-4 text-ink focus:border-blue focus:outline-none min-h-[160px]"
                placeholder="Mission: ...&#10;Core Values: ...&#10;Competitors: ..."
                value={research.companyProfile}
                onChange={e => setResearch({...research, companyProfile: e.target.value})}
              />
            </div>
            <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target size={20} className="text-teal"/> "Why This Company?" Pitch</h3>
              <p className="text-xs text-ink-soft mb-3">A 2-minute written script explaining your specific motivation to work for this organization.</p>
              <textarea 
                className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-4 text-ink focus:border-teal focus:outline-none min-h-[160px]"
                placeholder="I have always admired [Company]'s approach to... and it aligns perfectly with my background in..."
                value={research.whyThisCompany}
                onChange={e => setResearch({...research, whyThisCompany: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase size={20} className="text-rose"/> Job Description Breakdown</h3>
            <p className="text-xs text-ink-soft mb-4">A side-by-side comparison table linking Key Responsibilities to your Past Experiences.</p>
            <div className="space-y-4">
              {research.jobBreakdown.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start relative">
                  <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm text-ink focus:border-rose focus:outline-none" rows="2" placeholder="Key Responsibility from JD" value={item.responsibility} onChange={e => handleResearchUpdate('jobBreakdown', idx, 'responsibility', e.target.value)} />
                  <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm text-ink focus:border-rose focus:outline-none" rows="2" placeholder="My Corresponding Past Experience" value={item.experience} onChange={e => handleResearchUpdate('jobBreakdown', idx, 'experience', e.target.value)} />
                </div>
              ))}
              <button onClick={addResponsibility} className="text-sm font-bold text-rose flex items-center gap-1 hover:opacity-70"><Plus size={16}/> Add Responsibility Mapping</button>
            </div>
          </div>

          <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} className="text-amber"/> Interviewer Dossier</h3>
            <p className="text-xs text-ink-soft mb-4">Note down the names, LinkedIn profiles, and roles of the people paneling your interview.</p>
            <div className="space-y-4">
              {research.interviewers.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <input type="text" className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm" placeholder="Name" value={item.name} onChange={e => handleResearchUpdate('interviewers', idx, 'name', e.target.value)} />
                  <input type="text" className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm" placeholder="Role / Title" value={item.role} onChange={e => handleResearchUpdate('interviewers', idx, 'role', e.target.value)} />
                  <input type="text" className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm" placeholder="LinkedIn URL" value={item.linkedin} onChange={e => handleResearchUpdate('interviewers', idx, 'linkedin', e.target.value)} />
                </div>
              ))}
              <button onClick={addInterviewer} className="text-sm font-bold text-amber flex items-center gap-1 hover:opacity-70"><Plus size={16}/> Add Interviewer</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Question Banks & Frameworks */}
      {activeTab === 'questions' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-blue"/> The Elevator Pitch</h3>
            <p className="text-xs text-ink-soft mb-4">Your 60-to-90-second "Tell me about yourself" master response.</p>
            <textarea 
              className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-4 text-ink focus:border-blue focus:outline-none min-h-[120px]"
              placeholder="Hi, I am... I have a background in... I am passionate about... and I am looking forward to..."
              value={elevatorPitch}
              onChange={e => setElevatorPitch(e.target.value)}
            />
          </div>

          <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><LayoutDashboard size={20} className="text-teal"/> STAR Template Framework</h3>
            <p className="text-xs text-ink-soft mb-4">Map out your success stories to effortlessly answer behavioral questions.</p>
            <div className="space-y-6">
              {starStories.map((story, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-line rounded-2xl bg-dark/5 dark:bg-white/5">
                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1 uppercase">Situation</label>
                    <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-teal h-24" placeholder="Context of what happened" value={story.situation} onChange={e => handleStarUpdate(idx, 'situation', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1 uppercase">Task</label>
                    <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-teal h-24" placeholder="Challenge/Goal to achieve" value={story.task} onChange={e => handleStarUpdate(idx, 'task', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1 uppercase">Action</label>
                    <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-teal h-24" placeholder="Exact steps you took" value={story.action} onChange={e => handleStarUpdate(idx, 'action', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1 uppercase">Result</label>
                    <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-teal h-24" placeholder="Quantifiable outcome" value={story.result} onChange={e => handleStarUpdate(idx, 'result', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addStarStory} className="text-sm font-bold text-teal flex items-center gap-1 hover:opacity-70"><Plus size={16}/> Add STAR Story</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Code size={20} className="text-purple-500" /> AI Question Bank
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-ink-soft mb-2 uppercase tracking-wider">Target Role</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 pl-4 pr-10 text-ink focus:border-purple-500 focus:outline-none appearance-none font-medium"
                        value={prepData.role}
                        onChange={(e) => setPrepData({...prepData, role: e.target.value})}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-ink-soft">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-ink-soft mb-2 uppercase tracking-wider">Experience Level</label>
                    <select 
                      className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-ink focus:border-purple-500 focus:outline-none appearance-none"
                      value={prepData.experience}
                      onChange={(e) => setPrepData({...prepData, experience: e.target.value})}
                    >
                      <option>Entry-Level</option>
                      <option>Mid-Level</option>
                      <option>Senior-Level</option>
                      <option>Lead / Staff</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-ink-soft mb-2 uppercase tracking-wider">Core Tech Stack</label>
                    <input 
                      type="text" 
                      className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-ink focus:border-purple-500 focus:outline-none transition-colors"
                      value={prepData.techStack}
                      placeholder="e.g. React, Python, AWS"
                      onChange={(e) => setPrepData({...prepData, techStack: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                  >
                    {isGenerating ? (
                      <>Generating <Loader2 size={18} className="animate-spin" /></>
                    ) : (
                      <>Generate Questions <Target size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {!questions && !isGenerating && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-card/40 border border-dashed border-line rounded-3xl text-ink-soft p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center shadow-sm mb-4">
                    <Play size={24} className="text-purple-500 opacity-50 ml-1" />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">Ready for the Bank?</h3>
                  <p className="max-w-md">Generate a high-probability question bank based on your specific role and stack.</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-card/40 border border-line rounded-3xl text-ink-soft p-8 text-center animate-pulse">
                  <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-ink">Analyzing Role Requirements...</h3>
                  <p>Curating the perfect question bank for {prepData.role}</p>
                </div>
              )}

              {questions && !isGenerating && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl rounded-3xl border border-line overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-line bg-dark/5 dark:bg-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue/20 flex items-center justify-center text-blue"><Code size={18} /></div>
                      <h3 className="font-bold text-lg">Technical Questions</h3>
                    </div>
                    <div className="p-2">
                      {questions.technical.map((q, i) => (
                        <div key={i} className="p-4 hover:bg-paper dark:hover:bg-dark-glow rounded-xl transition-colors group cursor-pointer flex gap-3">
                          <span className="font-bold text-blue mt-0.5">Q{i+1}.</span>
                          <div>
                            <p className="font-semibold text-ink group-hover:text-blue transition-colors">{q.q}</p>
                            <p className="text-sm text-ink-soft mt-2 italic flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber"></span> Hint: {q.hint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl rounded-3xl border border-line overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-line bg-dark/5 dark:bg-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center text-teal"><MessageSquare size={18} /></div>
                      <h3 className="font-bold text-lg">Behavioral & Cultural</h3>
                    </div>
                    <div className="p-2">
                      {questions.behavioral.map((q, i) => (
                        <div key={i} className="p-4 hover:bg-paper dark:hover:bg-dark-glow rounded-xl transition-colors group cursor-pointer flex gap-3">
                          <span className="font-bold text-teal mt-0.5">Q{i+1}.</span>
                          <div>
                            <p className="font-semibold text-ink group-hover:text-teal transition-colors">{q.q}</p>
                            <p className="text-sm text-ink-soft mt-2 italic flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber"></span> Hint: {q.hint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl rounded-3xl border border-line overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-line bg-dark/5 dark:bg-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose/20 flex items-center justify-center text-rose"><LayoutDashboard size={18} /></div>
                      <h3 className="font-bold text-lg">System Design</h3>
                    </div>
                    <div className="p-2">
                      {questions.systemDesign.map((q, i) => (
                        <div key={i} className="p-4 hover:bg-paper dark:hover:bg-dark-glow rounded-xl transition-colors group cursor-pointer flex gap-3">
                          <span className="font-bold text-rose mt-0.5">Q{i+1}.</span>
                          <div>
                            <p className="font-semibold text-ink group-hover:text-rose transition-colors">{q.q}</p>
                            <p className="text-sm text-ink-soft mt-2 italic flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber"></span> Hint: {q.hint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target size={20} className="text-rose"/> Reverse Interviewing</h3>
            <p className="text-xs text-ink-soft mb-4">Strategic questions to ask the interviewer about company culture, expectations, or team dynamics.</p>
            <div className="space-y-4">
              {reverseQuestions.map((q, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-full bg-rose/10 text-rose flex items-center justify-center font-bold flex-shrink-0">{idx+1}</div>
                  <input type="text" className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-rose focus:outline-none" placeholder="Question to ask..." value={q} onChange={e => {
                    const l = [...reverseQuestions]; l[idx] = e.target.value; setReverseQuestions(l);
                  }} />
                </div>
              ))}
              <button onClick={() => setReverseQuestions([...reverseQuestions, ''])} className="text-sm font-bold text-rose flex items-center gap-1 hover:opacity-70 ml-12"><Plus size={16}/> Add Question</button>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={20} className="text-blue"/> Physical Items</h3>
              <p className="text-xs text-ink-soft mb-5">For in-person interviews or keeping desk organized.</p>
              <div className="space-y-3">
                {[
                  { id: 'copies', label: '5 hard copies of your resume' },
                  { id: 'notebook', label: 'A notebook' },
                  { id: 'pen', label: 'A working pen' },
                  { id: 'reference', label: 'Reference lists' },
                  { id: 'id', label: 'An ID card' }
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${physicalChecks[item.id] ? 'bg-blue border-blue' : 'border-line group-hover:border-blue'}`}>
                      {physicalChecks[item.id] && <CheckSquare size={16} className="text-white" />}
                    </div>
                    <span className={`text-sm ${physicalChecks[item.id] ? 'text-ink-soft line-through' : 'text-ink'}`}>{item.label}</span>
                    <input type="checkbox" className="hidden" checked={physicalChecks[item.id]} onChange={() => setPhysicalChecks({...physicalChecks, [item.id]: !physicalChecks[item.id]})} />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Video size={20} className="text-teal"/> Virtual Tech Check</h3>
              <p className="text-xs text-ink-soft mb-5">A sub-checklist for remote interviews.</p>
              <div className="space-y-3">
                {[
                  { id: 'mic', label: 'Test microphone audio levels' },
                  { id: 'camera', label: 'Test camera positioning & clarity' },
                  { id: 'lighting', label: 'Check background lighting (face well lit)' },
                  { id: 'internet', label: 'Verify internet speed' },
                  { id: 'software', label: 'Update platform software (Zoom/Teams)' }
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${virtualChecks[item.id] ? 'bg-teal border-teal' : 'border-line group-hover:border-teal'}`}>
                      {virtualChecks[item.id] && <CheckSquare size={16} className="text-white" />}
                    </div>
                    <span className={`text-sm ${virtualChecks[item.id] ? 'text-ink-soft line-through' : 'text-ink'}`}>{item.label}</span>
                    <input type="checkbox" className="hidden" checked={virtualChecks[item.id]} onChange={() => setVirtualChecks({...virtualChecks, [item.id]: !virtualChecks[item.id]})} />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-amber"/> Transit / Format Info</h3>
            <p className="text-xs text-ink-soft mb-5">Precise logistical details.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-2 uppercase">Meeting Link / Address</label>
                <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-amber focus:outline-none h-20" placeholder="https://zoom.us/j/... or 123 Main St" value={transitInfo.linkOrAddress} onChange={e => setTransitInfo({...transitInfo, linkOrAddress: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-2 uppercase">Parking Instructions</label>
                <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-amber focus:outline-none h-20" placeholder="Park in visitor lot B..." value={transitInfo.parking} onChange={e => setTransitInfo({...transitInfo, parking: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-2 uppercase">Contact Details</label>
                <textarea className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-amber focus:outline-none h-20" placeholder="Recruiter Name: 555-0192" value={transitInfo.contact} onChange={e => setTransitInfo({...transitInfo, contact: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Post-Interview Pipeline */}
      {activeTab === 'post' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mail size={20} className="text-blue"/> Thank-You Email Template</h3>
              <p className="text-xs text-ink-soft mb-4">Ready-to-go drafts that you can quickly personalize and send within 24 hours.</p>
              <textarea 
                className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-4 text-sm text-ink focus:border-blue focus:outline-none min-h-[250px]"
                placeholder="Dear [Name],&#10;&#10;Thank you for taking the time to speak with me today about the [Role] position. I really enjoyed learning more about...&#10;&#10;Best,&#10;[My Name]"
                value={postPrep.thankYouDraft}
                onChange={e => setPostPrep({...postPrep, thankYouDraft: e.target.value})}
              />
            </div>
            
            <div className="space-y-6">
              <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={20} className="text-teal"/> Debrief Notes Log</h3>
                <p className="text-xs text-ink-soft mb-4">Jot down what went well, what tripped you up, and specific questions while fresh.</p>
                <textarea 
                  className="w-full bg-paper dark:bg-dark-glow border border-line rounded-xl p-4 text-sm text-ink focus:border-teal focus:outline-none h-32"
                  placeholder="I struggled with the system design question on caching. The behavioral part went well..."
                  value={postPrep.debriefNotes}
                  onChange={e => setPostPrep({...postPrep, debriefNotes: e.target.value})}
                />
              </div>

              <div className="bg-card/80 dark:bg-card/40 rounded-3xl border border-line p-6 shadow-sm flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar size={20} className="text-rose"/> Follow-Up Timeline</h3>
                <p className="text-xs text-ink-soft mb-4">Set a date to check back in if you haven't heard from them in 7-14 days.</p>
                <div className="flex gap-4 items-center">
                  <input type="date" className="bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-ink focus:border-rose focus:outline-none flex-1" value={postPrep.followUpDate} onChange={e => setPostPrep({...postPrep, followUpDate: e.target.value})} />
                  <button className="bg-rose hover:bg-rose/80 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all">Set Reminder</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewPrep;
