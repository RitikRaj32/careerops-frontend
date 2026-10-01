import React from 'react';
import { Target, CheckCircle2, AlertCircle, FileText, ChevronRight, TrendingUp, User, MapPin, GraduationCap, Briefcase, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState([]);
  
  // Format skills as an array if it's a comma-separated string
  const skillsArray = user.skillsList ? user.skillsList.split(',').map(s => s.trim()) : [];

  React.useEffect(() => {
    const fetchNotifications = () => {
      const stored = JSON.parse(localStorage.getItem('node_notifications') || '[]');
      const dismissed = JSON.parse(localStorage.getItem(`dismissed_${user.id}`) || '[]');
      const relevant = stored.filter(n => 
        (n.target === 'ALL' || n.target === user.id || n.target === user.phone || n.target === user.email) &&
        !dismissed.includes(n.id)
      );
      setNotifications(relevant);
    };

    fetchNotifications();

    const handleStorageChange = (e) => {
      if (e.key === 'node_notifications' || e.type === 'storage') {
        fetchNotifications();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user.id, user.phone, user.email]);

  const handleClearNotification = (id) => {
    const dismissed = JSON.parse(localStorage.getItem(`dismissed_${user.id}`) || '[]');
    dismissed.push(id);
    localStorage.setItem(`dismissed_${user.id}`, JSON.stringify(dismissed));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    const dismissed = JSON.parse(localStorage.getItem(`dismissed_${user.id}`) || '[]');
    const newDismissed = [...dismissed, ...notifications.map(n => n.id)];
    localStorage.setItem(`dismissed_${user.id}`, JSON.stringify(newDismissed));
    setNotifications([]);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-ink">Welcome back, {user.firstName || 'Candidate'}! 👋</h2>
        <p className="text-ink-soft mt-1">Here is your personalized career intelligence dashboard.</p>
      </div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-display font-bold text-ink flex items-center gap-2">
               <Bell size={20} className="text-blue" /> Notifications
            </h3>
            <button 
              onClick={handleClearAllNotifications}
              className="text-sm font-semibold text-ink-soft hover:text-rose hover:underline transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className="bg-blue/10 border border-blue/20 p-4 rounded-xl flex items-start gap-4 relative group">
                 <button 
                   onClick={() => handleClearNotification(notif.id)}
                   className="absolute top-2 right-2 p-1 text-ink-soft hover:text-rose hover:bg-rose/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                   title="Clear notification"
                 >
                   <X size={16} />
                 </button>
               <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center flex-shrink-0">
                 <Bell size={18} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-ink">Message from Institution</h4>
                   <span className="text-xs text-ink-soft">{new Date(notif.timestamp).toLocaleString()}</span>
                 </div>
                 <p className="text-sm text-ink-soft pr-4">{notif.message}</p>
               </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Metrics / Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-blue to-teal text-white p-6 rounded-2xl shadow-glass border border-white/20 relative overflow-hidden group col-span-1 md:col-span-2 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-card/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-xl"></div>
          <div className="relative z-10 flex gap-4 items-start">
             <div className="w-16 h-16 rounded-full bg-card/20 border border-line flex items-center justify-center text-xl font-bold backdrop-blur-md">
                {user.firstName ? user.firstName.charAt(0) : <User />}
             </div>
             <div>
                <h3 className="text-2xl font-bold">{user.name || 'Candidate'}</h3>
                <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                   <GraduationCap size={16} /> 
                   <span>{user.course || 'Course'} in {user.branch || 'Branch'} • {user.collegeYear || 'Year'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                   <Briefcase size={16} /> 
                   <span>{user.collegeName || 'College/University'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                   <MapPin size={16} /> 
                   <span>{user.currentCity || 'Location not specified'}</span>
                </div>
             </div>
          </div>
          
          <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
             <p className="text-sm font-semibold mb-2 text-white/90">Your Skills:</p>
             <div className="flex flex-wrap gap-2">
                {skillsArray.length > 0 ? skillsArray.map((skill, index) => (
                   <span key={index} className="px-3 py-1 bg-card/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/30">
                     {skill}
                   </span>
                )) : (
                   <span className="text-white/60 text-sm italic">No skills added yet</span>
                )}
             </div>
          </div>
        </div>

        {/* AI Stats Card */}
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl p-6 rounded-2xl shadow-glass border border-line relative overflow-hidden group flex flex-col justify-center items-center text-center">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-soft rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 w-full">
            <div className="w-12 h-12 rounded-xl bg-amber mx-auto text-white flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-ink-soft font-semibold mb-2">Resume Score</h3>
            <div className="text-5xl font-display font-bold text-ink">
              {user.resumeScore ? user.resumeScore + '%' : '--'}
            </div>
            {user.resumeScore ? (
               <p className="text-sm text-emerald-500 mt-3 font-medium flex items-center justify-center gap-1">
                 <CheckCircle2 size={16} /> Successfully Analyzed
               </p>
            ) : (
               <p className="text-sm text-amber mt-3 font-medium">Please upload resume</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Action Items */}
          <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6">
            <h3 className="text-xl font-display font-bold mb-4">Recommended Next Steps</h3>
            <div className="space-y-4">
              
              <div 
                onClick={() => navigate('/mock-interview')} 
                className="flex items-start gap-4 p-4 rounded-xl border border-line hover:border-blue transition-colors cursor-pointer group bg-card/80 dark:bg-card/40"
              >
                <div className="w-12 h-12 rounded-full bg-blue-soft text-blue flex items-center justify-center flex-shrink-0">
                  <Target size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-ink group-hover:text-blue transition-colors">Practice an AI Mock Interview</h4>
                  <p className="text-sm text-ink-soft mt-1">Based on your {user.branch || 'profile'}, practicing core concepts can boost your match rate by 20%.</p>
                </div>
                <ChevronRight className="text-ink-soft group-hover:text-blue transition-colors mt-2" />
              </div>

              {!user.resumeUrl && (
                <div className="flex items-start gap-4 p-4 rounded-xl border border-line hover:border-amber transition-colors cursor-pointer group bg-card/80 dark:bg-card/40">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-amber flex items-center justify-center flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-ink group-hover:text-amber transition-colors">Upload Your Resume</h4>
                    <p className="text-sm text-ink-soft mt-1">We noticed you skipped the resume upload. Adding it helps AI match you with better jobs.</p>
                  </div>
                  <ChevronRight className="text-ink-soft group-hover:text-amber transition-colors mt-2" />
                </div>
              )}

            </div>
          </div>

          {/* Job Matches */}
          <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-display font-bold">Top Job Matches for You</h3>
               <button className="text-sm font-semibold text-blue hover:underline">View All</button>
             </div>
             
             <div className="space-y-4">
               {/* Mock Job 1 */}
               <div className="p-4 border border-line rounded-xl hover:shadow-md transition-shadow bg-card/80 dark:bg-card/40">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <h4 className="font-bold text-ink text-lg">Software Engineer - Entry Level</h4>
                        <p className="text-sm text-ink-soft">TechNova Corp • {user.currentCity || 'Remote'}</p>
                     </div>
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">92% Match</span>
                  </div>
                  <p className="text-sm text-ink-soft mt-3 line-clamp-2">Looking for a fresh graduate with skills in {skillsArray[0] || 'programming'} and a strong foundation in computer science principles.</p>
               </div>

               {/* Mock Job 2 */}
               <div className="p-4 border border-line rounded-xl hover:shadow-md transition-shadow bg-card/80 dark:bg-card/40">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <h4 className="font-bold text-ink text-lg">Junior Developer</h4>
                        <p className="text-sm text-ink-soft">DataSys • Remote</p>
                     </div>
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">85% Match</span>
                  </div>
                  <p className="text-sm text-ink-soft mt-3 line-clamp-2">Join our dynamic team building scalable web applications. Perfect for someone pursuing their degree in {user.course || 'B.Tech'}.</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-dark to-dark2 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-dark-glow rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
             <h3 className="text-lg font-display font-bold mb-2 relative z-10">AI Mock Interview</h3>
             <p className="text-sm text-blue-soft mb-6 relative z-10">Simulate a realistic tech interview with our conversational AI agent tailored for {user.branch || 'your field'}.</p>
             <button 
                onClick={() => navigate('/mock-interview')}
                className="w-full py-3 bg-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all hover:shadow-lg relative z-10 flex justify-center items-center gap-2"
             >
               Start Session <ChevronRight size={18} />
             </button>
          </div>

          <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-line rounded-2xl shadow-glass p-6">
            <h3 className="text-lg font-display font-bold mb-4">Application Status</h3>
            
            {(!user.appliedJobs || user.appliedJobs.length === 0) ? (
              <div className="text-center py-6 text-ink-soft">
                 <CheckCircle2 size={40} className="mx-auto mb-3 text-line" />
                 <p className="text-sm font-medium">You haven't applied to any jobs yet.</p>
                 <button onClick={() => navigate('/jobs')} className="text-blue text-sm font-bold mt-2 hover:underline">Browse Jobs</button>
              </div>
            ) : (
              <div className="space-y-4">
                {user.appliedJobs.map((job, idx) => (
                  <div key={idx} className="p-4 border border-line rounded-xl bg-card/80 dark:bg-card/40 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h4 className="font-bold text-ink text-sm">{job.title}</h4>
                          <p className="text-xs text-ink-soft font-medium">{job.company}</p>
                       </div>
                       <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded uppercase tracking-wider">
                          {job.status || 'Applied'}
                       </span>
                    </div>
                    <p className="text-xs text-ink-soft mt-2">
                      Applied on: {new Date(job.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <button onClick={() => navigate('/jobs')} className="w-full text-center text-blue text-sm font-bold mt-2 hover:underline">Apply to more jobs</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
