import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, BarChart, FileCheck, PenTool, Download, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResumeOptimization = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('builder'); // Default to builder for now
  
  // Analyzer State
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);

  // Builder State & Accordion
  const [openSection, setOpenSection] = useState('experience');

  const [resumeData, setResumeData] = useState({
    name: user?.name || 'Jane Smith',
    email: user?.email || 'jane.smith@example.com',
    phone: user?.phone || '+91 9876543210',
    linkedin: 'linkedin.com/in/janesmith',
    github: 'github.com/janesmith',
    summary: 'A highly motivated Software Engineer with experience in building scalable web applications. Strong focus on modern JavaScript frameworks, API design, and creating responsive user experiences.',
    skills: user?.skillsList || 'React, Node.js, Express, MongoDB, Tailwind CSS, TypeScript, GraphQL, Git',
    experience: [
      {
        id: Date.now(),
        company: 'Tech Solutions Inc.',
        role: 'Frontend Developer',
        location: 'Remote',
        date: 'Jan 2022 - Present',
        bullets: 'Developed dynamic user interfaces using React and Redux, increasing user engagement by 15%.\nImproved page load speed by 20% through code splitting and lazy loading.\nCollaborated with backend teams to integrate complex RESTful APIs.'
      }
    ],
    projects: [
      {
        id: Date.now() + 1,
        title: 'Full-Stack E-commerce Platform',
        tech: 'React, Node.js, MongoDB',
        date: 'Oct 2023',
        bullets: 'Architected a full-stack e-commerce platform supporting 10,000+ daily active users.\nIntegrated Stripe API for secure payment processing.\nImplemented server-side rendering for improved SEO and initial load time.'
      }
    ],
    education: [
      {
        id: Date.now() + 2,
        degree: user?.course || 'B.Tech in Computer Science',
        institution: user?.collegeName || 'National Institute of Technology',
        location: 'City, State',
        date: '2019 - 2023'
      }
    ]
  });

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
       setFile(e.target.files[0]);
       analyzeResume(e.target.files[0]);
    }
  };

  const analyzeResume = async (uploadedFile) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', uploadedFile);
    if (user && user.phone) {
      formData.append('phone', user.phone);
    }

    try {
      const response = await fetch('https://good-files-lead.loca.lt/api/resume/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setAnalyzedData(data);
        setAnalyzed(true);
        // Dispatch event or update auth context if needed to update score globally
        const updatedUser = { ...user, resumeScore: data.score };
        localStorage.setItem('careerai_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage')); // trigger auth update if listening
      } else {
        alert("Failed to analyze: " + data.error);
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      alert("Error analyzing resume. Make sure backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = () => window.print();

  // Dynamic Array Handlers
  const addExperience = () => {
    setResumeData({ ...resumeData, experience: [...resumeData.experience, { id: Date.now(), company: '', role: '', location: '', date: '', bullets: '' }] });
  };
  const updateExperience = (id, field, value) => {
    setResumeData({ ...resumeData, experience: resumeData.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });
  };
  const removeExperience = (id) => {
    setResumeData({ ...resumeData, experience: resumeData.experience.filter(e => e.id !== id) });
  };

  const addProject = () => {
    setResumeData({ ...resumeData, projects: [...resumeData.projects, { id: Date.now(), title: '', tech: '', date: '', bullets: '' }] });
  };
  const updateProject = (id, field, value) => {
    setResumeData({ ...resumeData, projects: resumeData.projects.map(p => p.id === id ? { ...p, [field]: value } : p) });
  };
  const removeProject = (id) => {
    setResumeData({ ...resumeData, projects: resumeData.projects.filter(p => p.id !== id) });
  };

  const addEducation = () => {
    setResumeData({ ...resumeData, education: [...resumeData.education, { id: Date.now(), degree: '', institution: '', location: '', date: '' }] });
  };
  const updateEducation = (id, field, value) => {
    setResumeData({ ...resumeData, education: resumeData.education.map(e => e.id === id ? { ...e, [field]: value } : e) });
  };
  const removeEducation = (id) => {
    setResumeData({ ...resumeData, education: resumeData.education.filter(e => e.id !== id) });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <div className="animate-in fade-in pb-12 print:p-0 print:m-0">
      
      <div className="print:hidden">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-ink flex items-center gap-3">
            <FileText className="text-blue" size={32} />
            Resume Hub
          </h2>
          <p className="text-ink-soft mt-2 text-lg">Analyze your existing resume or build a brand new ATS-friendly one.</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-line pb-4">
          <button onClick={() => setActiveTab('analyzer')} className={`font-bold pb-2 border-b-2 transition-all ${activeTab === 'analyzer' ? 'border-blue text-blue' : 'border-transparent text-ink-soft hover:text-ink'}`}>
            <Sparkles size={18} className="inline mr-2 -mt-1"/> AI Analyzer
          </button>
          <button onClick={() => setActiveTab('builder')} className={`font-bold pb-2 border-b-2 transition-all ${activeTab === 'builder' ? 'border-blue text-blue' : 'border-transparent text-ink-soft hover:text-ink'}`}>
            <PenTool size={18} className="inline mr-2 -mt-1"/> Template Builder
          </button>
        </div>
      </div>

      {activeTab === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6 text-center relative overflow-hidden group">
               {!analyzed ? (
                  <>
                    <div className="w-16 h-16 bg-blue-soft text-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><UploadCloud size={32} /></div>
                    <h3 className="font-bold text-lg mb-2">Upload Resume</h3>
                    <p className="text-sm text-ink-soft mb-6">PDF only</p>
                    <input type="file" id="resume-upload" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    <label htmlFor="resume-upload" className="w-full block py-3 bg-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md">{isUploading ? 'Analyzing AI...' : 'Browse Files'}</label>
                  </>
               ) : (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="w-24 h-24 mx-auto relative mb-4">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-line" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (analyzedData?.score || 0)) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-ink">{analyzedData?.score || 0}%</span></div>
                    </div>
                    <h3 className="font-bold text-lg mb-1">ATS Match Score</h3>
                    <button onClick={() => { setFile(null); setAnalyzed(false); }} className="text-sm text-blue font-bold hover:underline mt-4">Upload a different file</button>
                  </>
               )}
            </div>

            {analyzed && (
               <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart size={18} className="text-blue" /> Key Metrics</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center"><span className="text-sm text-ink-soft flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Word Count</span><span className="font-bold text-sm">{analyzedData?.wordCount || 0} words</span></div>
                     <div className="flex justify-between items-center"><span className="text-sm text-ink-soft flex items-center gap-2"><AlertCircle size={16} className="text-amber"/> Action Verbs</span><span className="font-bold text-sm">{analyzedData?.actionVerbs || 'Needs Work'}</span></div>
                     <div className="flex justify-between items-center"><span className="text-sm text-ink-soft flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Measurable Results</span><span className="font-bold text-sm">{analyzedData?.measurableResults || 'Needs Work'}</span></div>
                  </div>
               </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
             <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-line pb-4">
                   <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Sparkles size={20} /></div>
                   <h3 className="font-bold text-xl">AI Strategic Recommendations</h3>
                </div>
                {!analyzed ? (
                   <div className="text-center py-12 text-ink-soft">
                      <FileCheck size={48} className="mx-auto mb-4 text-line" />
                      <p>Upload your resume to see AI-powered recommendations on how to make it better.</p>
                   </div>
                ) : (
                   <div className="space-y-4">
                      {analyzedData?.recommendations?.map((rec, idx) => (
                        <div key={idx} className="p-5 bg-card/80 dark:bg-card/40 rounded-xl border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                           <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold rounded uppercase tracking-wide">{rec.category}</span>
                           </div>
                           <p className="text-ink font-medium leading-relaxed">{rec.advice}</p>
                        </div>
                      ))}
                   </div>
                )}
             </div>

             {/* Mistral AI Real-Time Error Checking Section */}
             {analyzed && analyzedData?.errors && analyzedData.errors.length > 0 && (
                <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-rose/30 rounded-2xl shadow-glass p-6 animate-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-3 mb-6 border-b border-rose/10 pb-4">
                      <div className="p-2 bg-rose/10 rounded-lg text-rose"><AlertCircle size={20} /></div>
                      <h3 className="font-bold text-xl text-rose">Real-Time Error Checks</h3>
                   </div>
                   <div className="space-y-4">
                      {analyzedData.errors.map((error, idx) => (
                         <div key={idx} className="p-4 bg-rose/5 rounded-xl border border-rose/10">
                            <div className="flex items-center gap-2 mb-2">
                               <span className="px-2 py-1 bg-rose/10 text-rose text-xs font-bold rounded uppercase tracking-wide">{error.type}</span>
                               <span className="text-ink-soft text-sm font-medium line-through">"{error.context}"</span>
                            </div>
                            <p className="text-ink font-bold flex items-start gap-2">
                               <span className="text-emerald-500 mt-1"><CheckCircle2 size={16} /></span>
                               {error.suggestion}
                            </p>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[850px]">
          
          {/* Builder Editor Menu */}
          <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass overflow-hidden flex flex-col print:hidden">
            <div className="p-6 border-b border-line flex justify-between items-center bg-card/80 dark:bg-card/40 sticky top-0 z-10">
              <h3 className="font-bold text-xl">Resume Details</h3>
              <button onClick={handlePrint} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm">
                <Download size={16} /> Download PDF
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-4">
              
              {/* Personal Info Section */}
              <div className="bg-card/80 dark:bg-card/40 rounded-xl border border-line overflow-hidden">
                <button onClick={() => toggleSection('personal')} className="w-full p-4 flex justify-between items-center font-bold hover:bg-card/80 dark:bg-card/40 transition-colors">
                  Personal Information {openSection === 'personal' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
                {openSection === 'personal' && (
                  <div className="p-4 border-t border-line space-y-4">
                    <input type="text" placeholder="Full Name" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none" value={resumeData.name} onChange={e => setResumeData({...resumeData, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="email" placeholder="Email" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none" value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} />
                      <input type="text" placeholder="Phone" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none" value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="LinkedIn URL" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none" value={resumeData.linkedin} onChange={e => setResumeData({...resumeData, linkedin: e.target.value})} />
                      <input type="text" placeholder="GitHub URL" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none" value={resumeData.github} onChange={e => setResumeData({...resumeData, github: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary & Skills Section */}
              <div className="bg-card/80 dark:bg-card/40 rounded-xl border border-line overflow-hidden">
                <button onClick={() => toggleSection('summary')} className="w-full p-4 flex justify-between items-center font-bold hover:bg-card/80 dark:bg-card/40 transition-colors">
                  Summary & Skills {openSection === 'summary' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
                {openSection === 'summary' && (
                  <div className="p-4 border-t border-line space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1 uppercase tracking-wider">Professional Summary</label>
                      <textarea className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none h-24" value={resumeData.summary} onChange={e => setResumeData({...resumeData, summary: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1 uppercase tracking-wider">Top Skills (Comma Separated)</label>
                      <input type="text" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none" value={resumeData.skills} onChange={e => setResumeData({...resumeData, skills: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>

              {/* Experience Section */}
              <div className="bg-card/80 dark:bg-card/40 rounded-xl border border-line overflow-hidden">
                <button onClick={() => toggleSection('experience')} className="w-full p-4 flex justify-between items-center font-bold hover:bg-card/80 dark:bg-card/40 transition-colors">
                  Work Experience {openSection === 'experience' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
                {openSection === 'experience' && (
                  <div className="p-4 border-t border-line space-y-6">
                    {resumeData.experience.map((exp, idx) => (
                      <div key={exp.id} className="relative p-4 border border-line rounded-lg bg-card/80 dark:bg-card/40">
                        <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        <h4 className="font-bold text-sm mb-3">Experience {idx + 1}</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Role / Job Title" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Company Name" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Dates (e.g. Jan 2022 - Present)" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={exp.date} onChange={e => updateExperience(exp.id, 'date', e.target.value)} />
                          <input type="text" placeholder="Location (e.g. Remote, NY)" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} />
                        </div>
                        <textarea placeholder="Bullet points (Enter one per line)" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm h-24" value={exp.bullets} onChange={e => updateExperience(exp.id, 'bullets', e.target.value)} />
                      </div>
                    ))}
                    <button onClick={addExperience} className="w-full py-2 border-2 border-dashed border-blue text-blue font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                      <Plus size={18}/> Add Experience
                    </button>
                  </div>
                )}
              </div>

              {/* Projects Section */}
              <div className="bg-card/80 dark:bg-card/40 rounded-xl border border-line overflow-hidden">
                <button onClick={() => toggleSection('projects')} className="w-full p-4 flex justify-between items-center font-bold hover:bg-card/80 dark:bg-card/40 transition-colors">
                  Projects {openSection === 'projects' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
                {openSection === 'projects' && (
                  <div className="p-4 border-t border-line space-y-6">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={proj.id} className="relative p-4 border border-line rounded-lg bg-card/80 dark:bg-card/40">
                        <button onClick={() => removeProject(proj.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        <h4 className="font-bold text-sm mb-3">Project {idx + 1}</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Project Title" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={proj.title} onChange={e => updateProject(proj.id, 'title', e.target.value)} />
                          <input type="text" placeholder="Technologies Used" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={proj.tech} onChange={e => updateProject(proj.id, 'tech', e.target.value)} />
                        </div>
                        <input type="text" placeholder="Date / Year" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm mb-3" value={proj.date} onChange={e => updateProject(proj.id, 'date', e.target.value)} />
                        <textarea placeholder="Bullet points (Enter one per line)" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm h-24" value={proj.bullets} onChange={e => updateProject(proj.id, 'bullets', e.target.value)} />
                      </div>
                    ))}
                    <button onClick={addProject} className="w-full py-2 border-2 border-dashed border-blue text-blue font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                      <Plus size={18}/> Add Project
                    </button>
                  </div>
                )}
              </div>

              {/* Education Section */}
              <div className="bg-card/80 dark:bg-card/40 rounded-xl border border-line overflow-hidden">
                <button onClick={() => toggleSection('education')} className="w-full p-4 flex justify-between items-center font-bold hover:bg-card/80 dark:bg-card/40 transition-colors">
                  Education {openSection === 'education' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
                {openSection === 'education' && (
                  <div className="p-4 border-t border-line space-y-6">
                    {resumeData.education.map((edu, idx) => (
                      <div key={edu.id} className="relative p-4 border border-line rounded-lg bg-card/80 dark:bg-card/40">
                        <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        <h4 className="font-bold text-sm mb-3">Education {idx + 1}</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Degree / Major" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                          <input type="text" placeholder="Institution Name" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Dates (e.g. 2019 - 2023)" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={edu.date} onChange={e => updateEducation(edu.id, 'date', e.target.value)} />
                          <input type="text" placeholder="Location" className="w-full p-2 border border-line rounded-lg bg-transparent text-ink focus:border-blue focus:outline-none text-sm" value={edu.location} onChange={e => updateEducation(edu.id, 'location', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button onClick={addEducation} className="w-full py-2 border-2 border-dashed border-blue text-blue font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                      <Plus size={18}/> Add Education
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Live ATS Preview */}
          <div className="bg-white border border-line shadow-lg overflow-y-auto print:overflow-visible print:border-none print:shadow-none resume-preview">
             <div className="p-8 font-serif text-black min-h-full text-[13px] leading-relaxed">
                
                {/* Header */}
                <div className="text-center mb-5 border-b-2 border-black pb-4">
                   <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{resumeData.name || 'Your Name'}</h1>
                   <div className="flex justify-center gap-x-4 flex-wrap text-sm">
                      {resumeData.email && <span>{resumeData.email}</span>}
                      {resumeData.email && resumeData.phone && <span>•</span>}
                      {resumeData.phone && <span>{resumeData.phone}</span>}
                      {resumeData.phone && resumeData.linkedin && <span>•</span>}
                      {resumeData.linkedin && <span>{resumeData.linkedin}</span>}
                      {resumeData.linkedin && resumeData.github && <span>•</span>}
                      {resumeData.github && <span>{resumeData.github}</span>}
                   </div>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div className="mb-5">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-2 pb-1">Professional Summary</h2>
                     <p>{resumeData.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && (
                  <div className="mb-5">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-2 pb-1">Core Competencies</h2>
                     <p className="font-medium">{resumeData.skills}</p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="mb-5">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Professional Experience</h2>
                     {resumeData.experience.map((exp) => (
                       <div key={exp.id} className="mb-4">
                          <div className="flex justify-between items-baseline mb-0.5">
                             <h3 className="font-bold text-sm">{exp.role || 'Role Title'}</h3>
                             <span className="italic">{exp.date}</span>
                          </div>
                          <div className="flex justify-between items-baseline mb-2">
                            <div className="font-medium">{exp.company || 'Company Name'}</div>
                            <div className="italic text-gray-700">{exp.location}</div>
                          </div>
                          <ul className="list-disc pl-5 space-y-1">
                             {exp.bullets.split('\n').map((bullet, bIdx) => (
                               bullet.trim() ? <li key={bIdx} className="pl-1">{bullet.trim()}</li> : null
                             ))}
                          </ul>
                       </div>
                     ))}
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div className="mb-5">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Technical Projects</h2>
                     {resumeData.projects.map((proj) => (
                       <div key={proj.id} className="mb-4">
                          <div className="flex justify-between items-baseline mb-0.5">
                             <h3 className="font-bold text-sm">
                               {proj.title || 'Project Name'} 
                               {proj.tech && <span className="font-normal text-gray-700"> | {proj.tech}</span>}
                             </h3>
                             <span className="italic">{proj.date}</span>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 mt-1.5">
                             {proj.bullets.split('\n').map((bullet, bIdx) => (
                               bullet.trim() ? <li key={bIdx} className="pl-1">{bullet.trim()}</li> : null
                             ))}
                          </ul>
                       </div>
                     ))}
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="mb-5">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Education</h2>
                     {resumeData.education.map((edu) => (
                       <div key={edu.id} className="flex justify-between items-baseline mb-3">
                          <div>
                             <h3 className="font-bold text-sm">{edu.degree || 'Degree'}</h3>
                             <div>{edu.institution || 'Institution'}</div>
                          </div>
                          <div className="text-right">
                            <div className="italic">{edu.date}</div>
                            <div className="italic text-gray-700">{edu.location}</div>
                          </div>
                       </div>
                     ))}
                  </div>
                )}

             </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: letter; }
          body * { visibility: hidden; }
          .resume-preview, .resume-preview * { visibility: visible; }
          .resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 8.5in;
            height: 11in;
            background: white;
          }
        }
      `}} />
    </div>
  );
};

export default ResumeOptimization;
