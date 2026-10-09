import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Briefcase, Sparkles, Building2, ChevronRight, CheckCircle2, Loader2, ChevronDown, Send, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { companies } from '../data/companies';
import { motion, AnimatePresence } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.85 },
  show: (index) => ({
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 350, 
      damping: 18, 
      mass: 0.8,
      delay: index * 0.1 
    }
  }),
  hover: {
    y: -5,
    scale: 1.01,
    boxShadow: "0px 15px 40px rgba(var(--color-primary), 0.15)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const JobDiscovery = () => {
  const { user, applyJob } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [flyingIcon, setFlyingIcon] = useState(null);
  
  // Get skills array from user context
  const skillsArray = user?.skillsList ? user.skillsList.split(',').map(s => s.trim()) : ['React', 'JavaScript', 'Node.js'];
  const topSkill = skillsArray[0] || 'Software';

  useEffect(() => {
    // Generate dynamic mock jobs based on user profile and actual companies
    const generatePersonalizedJobs = () => {
      // Pick random companies
      const shuffledCompanies = [...companies].sort(() => 0.5 - Math.random());
      
      const roles = [
        `Junior ${topSkill} Developer`,
        `${topSkill} Engineer`,
        `Senior Full Stack Developer`,
        `Product Engineer (${topSkill})`,
        `Backend Developer`,
        `Frontend Architect`,
        `Systems Software Engineer`,
        `DevOps & ${topSkill} Engineer`
      ];

      const dynamicJobs = roles.map((role, i) => {
        const company = shuffledCompanies[i % shuffledCompanies.length];
        const score = Math.max(60, 95 - (i * 4) + Math.floor(Math.random() * 5));
        
        return {
          id: i + 1,
          title: role,
          company: company?.name || 'TechNova Corp',
          location: i % 2 === 0 ? (user?.currentCity || 'Remote') : 'Hybrid',
          type: 'Full-time',
          salary: `$${70 + (i * 10)}k - $${90 + (i * 15)}k`,
          matchScore: score,
          matchReason: `Strong overlap in ${skillsArray.slice(0, 2).join(' and ')} skills. Based on our AI semantic match against ${company?.name || 'this company'}'s tech stack.`,
          fitType: score > 85 ? 'safe fit' : score > 75 ? 'stretch' : 'reach',
          provenance: i % 3 === 0 ? 'Verified Employer' : '',
          description: `We are looking for a passionate developer to join our growing engineering team.\n\nRequirements:\n- Solid understanding of ${skillsArray.join(', ')}.\n- Strong problem-solving skills.\n- Degree in ${user?.branch || 'Computer Science'}.\n\nBenefits:\n- Flexible working hours\n- Health insurance\n- Learning and development budget.`
        };
      });
      
      setJobs(dynamicJobs);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(generatePersonalizedJobs, 800);
  }, [user, topSkill]); // Removed skillsArray to avoid infinite loop due to array recreation

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (activeFilter !== 'All') {
      if (activeFilter === 'Remote') result = result.filter(j => j.location.toLowerCase().includes('remote'));
      if (activeFilter === 'Hybrid') result = result.filter(j => j.location.toLowerCase().includes('hybrid'));
      if (activeFilter === 'Safe Fit') result = result.filter(j => j.fitType === 'safe fit');
      if (activeFilter === 'Verified') result = result.filter(j => j.provenance === 'Verified Employer');
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(lowerSearch) || 
        job.company.toLowerCase().includes(lowerSearch) || 
        job.location.toLowerCase().includes(lowerSearch) ||
        job.description.toLowerCase().includes(lowerSearch)
      );
    }
    
    return result;
  }, [jobs, searchTerm, activeFilter]);

  const renderFitBadge = (fitType) => {
    switch (fitType) {
      case 'safe fit': return <span className="px-3 py-1 bg-primary-soft text-teal text-xs font-bold rounded-full uppercase tracking-wider">Safe Fit</span>;
      case 'stretch': return <span className="px-3 py-1 bg-primary-soft text-primary text-xs font-bold rounded-full uppercase tracking-wider">Stretch</span>;
      case 'reach': return <span className="px-3 py-1 bg-rose-soft text-destructive text-xs font-bold rounded-full uppercase tracking-wider">Reach</span>;
      default: return null;
    }
  };

  const handleApply = (job, e) => {
    e.stopPropagation();
    
    // Find targets for animation
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const targetLink = document.getElementById('nav-applications');
    
    if (targetLink) {
      const targetRect = targetLink.getBoundingClientRect();
      
      // Calculate centers and a curved midpoint
      const startX = buttonRect.left + buttonRect.width / 2;
      const startY = buttonRect.top + buttonRect.height / 2;
      const endX = targetRect.left + 24; // approx icon center
      const endY = targetRect.top + targetRect.height / 2;
      
      // Arc upwards by subtracting from Y (since Y=0 is top of screen)
      // and offset X slightly to create a nice bezier feel
      const midX = startX - (startX - endX) * 0.3; 
      const midY = Math.min(startY, endY) - 150; 
      
      setFlyingIcon({ startX, startY, midX, midY, endX, endY });
      
      // Navigate and actually apply after animation completes
      setTimeout(() => {
        applyJob(job);
        setFlyingIcon(null);
        navigate('/applications');
      }, 1200);
    } else {
      // Fallback if sidebar is hidden
      applyJob(job);
      navigate('/applications');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold">AI-Powered Job Discovery</h2>
          <p className="text-muted-foreground mt-2">Roles matched semantically to your parsed resume and skills.</p>
        </div>
        <div className="flex gap-2 relative">
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`px-4 py-2 font-semibold rounded-lg border transition-colors flex items-center gap-2 ${showFilters || activeFilter !== 'All' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background text-foreground border-border hover:bg-card'}`}
           >
             Filters {activeFilter !== 'All' && <span className="w-2 h-2 rounded-full bg-primary"></span>}
           </button>
           
           {showFilters && (
             <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border shadow-xl rounded-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                {['All', 'Remote', 'Hybrid', 'Safe Fit', 'Verified'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setShowFilters(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeFilter === filter ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'}`}
                  >
                    {filter}
                  </button>
                ))}
             </div>
           )}

           <button 
             onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
             className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
           >
              <Sparkles size={16} /> Reset
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 shadow-sm">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by role, skill (like ${topSkill}), or company...`}
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card/80 dark:bg-card/40 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all shadow-glass"
        />
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-muted-foreground font-medium">Analyzing job market & calculating AI match scores for {user?.name || 'you'}...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
             <Briefcase size={48} className="mx-auto text-line mb-4" />
             <h3 className="text-xl font-bold text-foreground">No jobs found</h3>
             <p className="text-muted-foreground mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : filteredJobs.map((job, index) => (
          <motion.div 
            key={job.id} 
            custom={index}
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            whileHover="hover"
            onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
            className={`bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-glass hover:shadow-lg transition-colors group relative overflow-hidden cursor-pointer ${expandedJobId === job.id ? 'ring-2 ring-blue border-transparent' : 'hover:border-primary/50'}`}
          >
             
             {/* Match Score Indicator Line */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-line group-hover:bg-primary transition-colors"></div>

             <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left: Info */}
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <h3 className="text-xl font-display font-bold text-foreground">{job.title}</h3>
                     {renderFitBadge(job.fitType)}
                     {job.provenance === 'Verified Employer' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded-md">
                          <CheckCircle2 size={12} className="text-teal" /> Verified
                        </span>
                     )}
                   </div>
                   
                   <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-medium flex-wrap">
                     <span className="flex items-center gap-1"><Building2 size={16} /> {job.company}</span>
                     <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                     <span className="flex items-center gap-1"><Briefcase size={16} /> {job.type}</span>
                     {job.salary && <span>{job.salary}</span>}
                   </div>

                   {/* AI Reasoning (Always visible) */}
                   <div className="bg-background p-4 rounded-xl border border-border/50 mb-2">
                      <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={14} />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-foreground mb-1">Why it matched:</div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{job.matchReason}</p>
                         </div>
                      </div>
                   </div>

                   {/* Expanded Description */}
                   {expandedJobId === job.id && (
                     <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
                        <h4 className="font-bold text-foreground mb-2">Job Description</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed mb-6">
                           {job.description}
                        </div>
                        <div className="flex justify-end gap-3">
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate('/companies', { state: { search: job.company } }); }} 
                             className="px-4 py-2 border border-border text-foreground font-bold rounded-lg hover:bg-background transition-colors"
                           >
                             Company Intel
                           </button>
                           <button 
                             onClick={(e) => handleApply(job, e)}
                             className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center gap-2"
                           >
                             <Send size={16} /> Apply Now
                           </button>
                        </div>
                     </div>
                   )}
                </div>

                {/* Right: Score & Actions */}
                <div className="flex flex-col items-center justify-start md:border-l md:border-border md:pl-6 min-w-[140px] pt-2">
                   <div className="text-center mb-4">
                      <div className="text-4xl font-display font-bold text-primary group-hover:scale-110 transition-transform">
                         {job.matchScore}<span className="text-xl">%</span>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Match Score</div>
                   </div>
                   <div className="text-muted-foreground flex items-center justify-center gap-1 font-semibold text-sm mt-auto pb-4">
                      {expandedJobId === job.id ? (
                        <>Close <ChevronUp size={16} className="mt-0.5" /></>
                      ) : (
                        <>View Full Details <ChevronDown size={16} className="mt-0.5" /></>
                      )}
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Flying Icon Portal */}
      <AnimatePresence>
        {flyingIcon && (
          <motion.div
            initial={{ 
              x: flyingIcon.startX - 20, 
              y: flyingIcon.startY - 20, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{ 
              x: [flyingIcon.startX - 20, flyingIcon.midX - 20, flyingIcon.endX - 20], 
              y: [flyingIcon.startY - 20, flyingIcon.midY - 20, flyingIcon.endY - 20], 
              scale: [1, 1.3, 0.5],
              opacity: [1, 1, 0] // fade out at the very end
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.2,
              times: [0, 0.6, 1], // Wait slightly longer on the arc
              ease: "easeInOut"
            }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              zIndex: 9999,
              pointerEvents: 'none'
            }}
            className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/50"
          >
            <Send size={20} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Add a dummy ChevronUp component since it was missing from imports
const ChevronUp = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6"/></svg>
);

export default JobDiscovery;
