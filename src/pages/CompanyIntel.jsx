import React, { useState, useMemo, useEffect } from 'react';
import { Building2, Search, Star, Users, BrainCircuit, ChevronRight, TrendingUp } from 'lucide-react';
import { companies } from '../data/companies';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const CompanyIntel = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');

  // If the location state changes, update the search term
  useEffect(() => {
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state?.search]);

  // Extract user skills and convert to lowercase for easy comparison
  const userSkills = useMemo(() => {
    if (!user?.skillsList) return [];
    return user.skillsList.split(',').map(s => s.trim().toLowerCase());
  }, [user]);

  // Dynamically calculate match score based on skills overlap and filter
  const personalizedCompanies = useMemo(() => {
    return companies.map(company => {
      let score = company.matchScore || 70; // Base default
      if (userSkills.length > 0) {
         const companySkillsLower = company.topSkills.map(s => s.toLowerCase());
         const matchCount = companySkillsLower.filter(s => userSkills.includes(s)).length;
         const overlapPercentage = matchCount / companySkillsLower.length;
         
         // Base score on overlap (e.g. 50% overlap = ~75 score, 100% overlap = 98 score)
         score = Math.min(99, Math.round(50 + (overlapPercentage * 48)));
         
         // If course matches industry roughly, boost it
         if (user?.course && (company.industry.toLowerCase().includes('tech') && user.course.toLowerCase().includes('computer'))) {
           score = Math.min(99, score + 5);
         }
      }
      return { ...company, calculatedScore: score };
    })
    .filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.calculatedScore - a.calculatedScore); // Sort by highest match first
  }, [searchTerm, userSkills, user]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-ink flex items-center gap-3">
            <Building2 className="text-blue" size={32} />
            Company Intelligence
          </h2>
          <p className="text-ink-soft mt-2 text-lg">AI-synthesized profiles, culture insights, and interview blueprints.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-ink-soft" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-line rounded-xl leading-5 bg-card/80 dark:bg-card/40 backdrop-blur-md placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-all shadow-sm"
            placeholder="Search companies (e.g., Google, Amazon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {personalizedCompanies.map((company, index) => (
          <div key={index} className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6 group hover:shadow-lg transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue/5 to-teal/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-line pb-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-dark to-dark2 flex items-center justify-center text-white font-display font-bold text-2xl shadow-md">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-ink flex items-center gap-2">
                    {company.name}
                    <span className="flex items-center text-amber text-sm font-semibold bg-amber/10 px-2 py-1 rounded-lg">
                      <Star size={14} className="fill-amber mr-1" /> {company.rating}
                    </span>
                  </h3>
                  <p className="text-ink-soft font-medium mt-1">{company.industry}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="text-ink-soft">Your Match Score</span>
                  <span className={`px-3 py-1 rounded-full ${company.calculatedScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {company.calculatedScore}%
                  </span>
                </div>
                <button className="mt-3 flex items-center gap-1 text-sm font-bold text-blue hover:text-blue-700 transition-colors">
                  View Full Profile <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <Users size={18} className="text-purple-500" />
                  Culture & Vibe
                </div>
                <p className="text-sm text-ink-soft">{company.culture}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <BrainCircuit size={18} className="text-teal" />
                  Interview Format
                </div>
                <ul className="text-sm text-ink-soft space-y-2">
                  {company.interviewProcess.map((step, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal/50"></div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <TrendingUp size={18} className="text-rose" />
                  Top Skills Evaluated
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.topSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-card/80 dark:bg-card/40 border border-line rounded-lg text-xs font-semibold text-ink-soft">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        ))}
        {personalizedCompanies.length === 0 && (
          <div className="text-center py-12">
             <Building2 size={48} className="mx-auto text-line mb-4" />
             <h3 className="text-xl font-bold text-ink">No companies found</h3>
             <p className="text-ink-soft mt-2">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyIntel;
