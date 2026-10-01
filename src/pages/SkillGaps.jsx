import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, BookOpen, ExternalLink, Zap, Lock, Sparkles, Loader2, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedQuiz from '../components/AnimatedQuiz';

const SkillGaps = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gaps, setGaps] = useState([]);
  const [targetRole, setTargetRole] = useState('Software Developer / Engineer');
  const [activeQuizSkill, setActiveQuizSkill] = useState(null);
  
  // Parse user skills
  const currentSkills = user?.skillsList ? user.skillsList.split(',').map(s => s.trim()) : ['React', 'JavaScript', 'HTML/CSS'];

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://2e49c2b81cc2c9.lhr.life/api/roadmap/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetRole,
            currentSkills
          })
        });
        
        const data = await response.json();
        
        if (data.success && data.gaps) {
          setGaps(data.gaps);
        } else {
          console.error("Failed to fetch roadmap:", data.error);
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [targetRole, user?.skillsList]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Verified': return <span className="flex items-center gap-1 px-3 py-1 bg-teal-soft text-teal text-xs font-bold rounded-full uppercase tracking-wider"><CheckCircle2 size={14} /> Mastered</span>;
      case 'Learning': return <span className="flex items-center gap-1 px-3 py-1 bg-blue-soft text-blue text-xs font-bold rounded-full uppercase tracking-wider"><TrendingUp size={14} /> In Progress</span>;
      case 'Missing': return <span className="flex items-center gap-1 px-3 py-1 bg-rose-soft text-rose text-xs font-bold rounded-full uppercase tracking-wider"><AlertTriangle size={14} /> Gap Identified</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold flex items-center gap-3">
            Skill Gap Analysis <Sparkles className="text-blue" size={24} />
          </h2>
          <p className="text-ink-soft mt-2">AI-driven roadmap based on your current profile and target career.</p>
        </div>
        
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-xl p-2 flex items-center shadow-sm">
          <span className="text-sm font-semibold text-ink-soft px-3">Target Role:</span>
          <select 
            className="bg-transparent border-none text-ink font-bold focus:ring-0 cursor-pointer outline-none"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            <optgroup label="CSE (Computer Science)">
              <option value="Software Developer / Engineer">Software Developer / Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Machine Learning / AI Engineer">Machine Learning / AI Engineer</option>
              <option value="Full Stack Developer (MERN)">Full Stack Developer (MERN)</option>
              <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
              <option value="Cloud Computing Engineer">Cloud Computing Engineer</option>
              <option value="AI ML Engineer">AI ML Engineer</option>
            </optgroup>
            
            <optgroup label="Electrical Engineering">
              <option value="Core Electrical & Power">Core Electrical & Power</option>
              <option value="Automation & Embedded">Automation & Embedded</option>
            </optgroup>
            
            <optgroup label="ECE (Electronics & Communication)">
              <option value="VLSI Design Engineer">VLSI Design Engineer</option>
              <option value="Embedded Software Engineer">Embedded Software Engineer</option>
              <option value="Hardware Design Engineer">Hardware Design Engineer</option>
              <option value="Testing & QA Engineer">Testing & QA Engineer</option>
              <option value="IoT Developer">IoT Developer</option>
              <option value="Automation Test Engineer">Automation Test Engineer</option>
              <option value="Telecom Field Engineer">Telecom Field Engineer</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue/20 to-blue-soft border border-blue/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-blue/10">
            <Target size={100} />
          </div>
          <h3 className="text-lg font-bold text-ink mb-1 relative z-10">Match Score</h3>
          <div className="text-4xl font-display font-bold text-blue mt-2 relative z-10">68%</div>
          <p className="text-sm text-ink-soft mt-2 font-medium relative z-10">You are 3 critical skills away from strong alignment.</p>
        </div>
        
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl p-6 shadow-glass md:col-span-2">
           <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2"><Zap size={20} className="text-teal" /> AI Recommendation</h3>
           <p className="text-ink-soft leading-relaxed">
             Your frontend foundation is very strong. To successfully transition into a <strong>{targetRole}</strong> role, prioritize learning backend architectures and deployment basics. Focusing on <strong>System Design</strong> will yield the highest return on investment for your career progression over the next 3 months.
           </p>
        </div>
      </div>

      <h3 className="text-xl font-display font-bold text-ink mb-4 border-b border-line pb-2">Your Personalized Roadmap</h3>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card/50 rounded-2xl border border-line">
          <Loader2 className="animate-spin text-blue mb-4" size={32} />
          <p className="text-ink-soft font-medium">Decomposing {targetRole} requirements & analyzing your profile...</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue before:via-line before:to-transparent">
          {gaps.map((gap, index) => (
            <div key={gap.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-paper bg-blue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {index + 1}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl p-5 shadow-glass hover:shadow-lg transition-all hover:border-blue/50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold text-ink">{gap.skill}</h4>
                  <div className="flex items-center gap-3">
                    {renderStatusBadge(gap.status)}
                    <button 
                      onClick={() => setActiveQuizSkill(gap.skill)}
                      className="px-3 py-1 bg-gradient-to-r from-blue to-teal text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      title="Take a quick quiz to test your knowledge"
                    >
                      <Gamepad2 size={14} /> Test Skill
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-ink-soft mb-4">{gap.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-ink-soft mb-4">
                  <span className="bg-paper px-2 py-1 rounded">Required: {gap.levelRequired}</span>
                  <span className="bg-paper px-2 py-1 rounded">Priority: {gap.importance}</span>
                </div>

                {gap.resources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-line/50">
                    <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={14} /> Curated Learning</h5>
                    <ul className="space-y-2">
                      {gap.resources.map((res, i) => (
                        <li key={i}>
                          <a href={res.link} className="flex items-center justify-between p-2 rounded-lg hover:bg-paper border border-transparent hover:border-line transition-all group/link">
                             <span className="text-sm font-medium text-ink group-hover/link:text-blue transition-colors">{res.title}</span>
                             <span className="flex items-center gap-2">
                               <span className="text-[10px] uppercase font-bold text-ink-soft bg-card px-2 py-0.5 rounded">{res.type}</span>
                               <ExternalLink size={14} className="text-ink-soft group-hover/link:text-blue" />
                             </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Locked future step */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-50">
             <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-paper bg-line text-ink-soft shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Lock size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card/50 backdrop-blur-sm border border-line border-dashed rounded-2xl p-5 text-center">
                 <p className="text-sm font-bold text-ink-soft">Master previous skills to unlock advanced specializations.</p>
              </div>
          </div>
        </div>
      )}
      {activeQuizSkill && (
        <AnimatedQuiz 
          skill={activeQuizSkill} 
          onClose={() => setActiveQuizSkill(null)} 
        />
      )}
    </div>
  );
};

export default SkillGaps;
