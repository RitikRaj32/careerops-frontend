import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Briefcase, Sparkles, Building2, ChevronRight, CheckCircle2, Loader2, ChevronDown, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { companies } from '../data/companies';

const JobDiscovery = () => {
  const { user, applyJob } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get skills array from user context
  const skillsArray = user?.skillsList ? user.skillsList.split(',').map(s => s.trim()) : ['React', 'JavaScript', 'Node.js'];
  const topSkill = skillsArray[0] || 'Software';

  useEffect(() => {
    // Generate dynamic mock jobs based on user profile and actual companies
    const generatePersonalizedJobs = () => {
      // Pick 3 random companies or top matching companies
      const shuffledCompanies = [...companies].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const dynamicJobs = [
        {
          id: 1,
          title: `Junior ${topSkill} Developer`,
          company: shuffledCompanies[0]?.name || 'TechNova Corp',
          location: user?.currentCity || 'Remote',
          type: 'Full-time',
          salary: '$70k - $90k',
          matchScore: 92,
          matchReason: `Strong overlap in ${skillsArray.slice(0, 2).join(' and ')} skills based on your profile. Great entry-level fit for a ${user?.branch || 'Computer Science'} graduate.`,
          fitType: 'safe fit',
          provenance: 'Verified Employer',
          description: `We are looking for a passionate Junior Developer to join our growing engineering team. You will be working directly with senior engineers to build scalable web applications using ${topSkill}.\n\nRequirements:\n- Basic understanding of ${skillsArray.join(', ')}.\n- Strong problem-solving skills.\n- Degree in ${user?.branch || 'Computer Science'}.\n\nBenefits:\n- Flexible working hours\n- Health insurance\n- Learning and development budget.`
        },
        {
          id: 2,
          title: `${topSkill} Engineer`,
          company: shuffledCompanies[1]?.name || 'DataSys',
          location: 'Hybrid',
          type: 'Full-time',
          salary: '$85k - $110k',
          matchScore: 85,
          matchReason: `Good experience in core concepts. Requires slightly more experience with system design, but still a strong match.`,
          fitType: 'stretch',
          provenance: 'Verified Employer',
          description: `We are seeking an innovative Engineer to help build our next-generation data platform.\n\nRequirements:\n- 1-2 years of experience with ${topSkill} or similar technologies.\n- Understanding of RESTful APIs and databases.\n- Familiarity with agile methodologies.\n\nWe offer competitive equity packages and a great work-life balance.`
        },
        {
          id: 3,
          title: `Senior Full Stack Developer`,
          company: shuffledCompanies[2]?.name || 'Innovate AI',
          location: 'Remote',
          type: 'Full-time',
          salary: '$120k - $150k',
          matchScore: 65,
          matchReason: `Missing 3+ years of leadership experience, but your technical skills in ${topSkill} are a perfect match. Worth a shot!`,
          fitType: 'reach',
          provenance: '',
          description: `Lead our frontend and backend efforts to build AI-powered tools.\n\nRequirements:\n- 3+ years of experience leading projects.\n- Deep expertise in ${skillsArray[0] || 'React'} and backend systems.\n- Mentorship skills.\n\nThis is a high-impact role with significant ownership.`
        }
      ];
      
      setJobs(dynamicJobs);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(generatePersonalizedJobs, 800);
  }, [user, topSkill]); // Removed skillsArray to avoid infinite loop due to array recreation

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const lowerSearch = searchTerm.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(lowerSearch) || 
      job.company.toLowerCase().includes(lowerSearch) || 
      job.location.toLowerCase().includes(lowerSearch) ||
      job.description.toLowerCase().includes(lowerSearch)
    );
  }, [jobs, searchTerm]);

  const renderFitBadge = (fitType) => {
    switch (fitType) {
      case 'safe fit': return <span className="px-3 py-1 bg-teal-soft text-teal text-xs font-bold rounded-full uppercase tracking-wider">Safe Fit</span>;
      case 'stretch': return <span className="px-3 py-1 bg-blue-soft text-blue text-xs font-bold rounded-full uppercase tracking-wider">Stretch</span>;
      case 'reach': return <span className="px-3 py-1 bg-rose-soft text-rose text-xs font-bold rounded-full uppercase tracking-wider">Reach</span>;
      default: return null;
    }
  };

  const handleApply = (job, e) => {
    e.stopPropagation();
    applyJob(job);
    alert(`Successfully applied to ${job.title} at ${job.company}! Check your Dashboard.`);
    navigate('/dashboard');
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold">AI-Powered Job Discovery</h2>
          <p className="text-ink-soft mt-2">Roles matched semantically to your parsed resume and skills.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-paper text-ink font-semibold rounded-lg border border-line hover:bg-card transition-colors">Filters</button>
           <button className="px-4 py-2 bg-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Sparkles size={16} /> Auto-Match
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 shadow-sm">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-soft" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by role, skill (like ${topSkill}), or company...`}
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-line bg-card/80 dark:bg-card/40 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all shadow-glass"
        />
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue mb-4" size={32} />
            <p className="text-ink-soft font-medium">Analyzing job market & calculating AI match scores for {user?.name || 'you'}...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
             <Briefcase size={48} className="mx-auto text-line mb-4" />
             <h3 className="text-xl font-bold text-ink">No jobs found</h3>
             <p className="text-ink-soft mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : filteredJobs.map(job => (
          <div 
            key={job.id} 
            onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
            className={`bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl p-6 shadow-glass hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer ${expandedJobId === job.id ? 'ring-2 ring-blue border-transparent' : ''}`}
          >
             
             {/* Match Score Indicator Line */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-line group-hover:bg-blue transition-colors"></div>

             <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left: Info */}
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <h3 className="text-xl font-display font-bold text-ink">{job.title}</h3>
                     {renderFitBadge(job.fitType)}
                     {job.provenance === 'Verified Employer' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-ink-soft bg-paper px-2 py-1 rounded-md">
                          <CheckCircle2 size={12} className="text-teal" /> Verified
                        </span>
                     )}
                   </div>
                   
                   <div className="flex items-center gap-4 text-sm text-ink-soft mb-4 font-medium flex-wrap">
                     <span className="flex items-center gap-1"><Building2 size={16} /> {job.company}</span>
                     <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                     <span className="flex items-center gap-1"><Briefcase size={16} /> {job.type}</span>
                     {job.salary && <span>{job.salary}</span>}
                   </div>

                   {/* AI Reasoning (Always visible) */}
                   <div className="bg-paper p-4 rounded-xl border border-line/50 mb-2">
                      <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-soft text-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={14} />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-ink mb-1">Why it matched:</div>
                            <p className="text-sm text-ink-soft leading-relaxed">{job.matchReason}</p>
                         </div>
                      </div>
                   </div>

                   {/* Expanded Description */}
                   {expandedJobId === job.id && (
                     <div className="mt-4 pt-4 border-t border-line animate-in slide-in-from-top-2 duration-300">
                        <h4 className="font-bold text-ink mb-2">Job Description</h4>
                        <div className="text-sm text-ink-soft whitespace-pre-line leading-relaxed mb-6">
                           {job.description}
                        </div>
                        <div className="flex justify-end gap-3">
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate('/companies', { state: { search: job.company } }); }} 
                             className="px-4 py-2 border border-line text-ink font-bold rounded-lg hover:bg-paper transition-colors"
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
                <div className="flex flex-col items-center justify-start md:border-l md:border-line md:pl-6 min-w-[140px] pt-2">
                   <div className="text-center mb-4">
                      <div className="text-4xl font-display font-bold text-blue group-hover:scale-110 transition-transform">
                         {job.matchScore}<span className="text-xl">%</span>
                      </div>
                      <div className="text-xs font-bold text-ink-soft uppercase tracking-wider mt-1">Match Score</div>
                   </div>
                   <div className="text-ink-soft flex items-center justify-center gap-1 font-semibold text-sm mt-auto pb-4">
                      {expandedJobId === job.id ? (
                        <>Close <ChevronUp size={16} className="mt-0.5" /></>
                      ) : (
                        <>View Full Details <ChevronDown size={16} className="mt-0.5" /></>
                      )}
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add a dummy ChevronUp component since it was missing from imports
const ChevronUp = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6"/></svg>
);

export default JobDiscovery;
