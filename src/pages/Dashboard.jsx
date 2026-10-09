import React from 'react';
import { Target, CheckCircle2, AlertCircle, FileText, ChevronRight, TrendingUp, User, MapPin, GraduationCap, Briefcase, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      mass: 0.8
    }
  }
};

const cardHover = {
  rest: { scale: 1, boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  tap: { scale: 0.98 }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState([]);
  const [isUploadingResume, setIsUploadingResume] = React.useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);
    if (user && user.phone) formData.append('phone', user.phone);
    if (user && user.email) formData.append('email', user.email);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || "") + '/api/resume/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, resumeScore: data.score, resumeUrl: data.resumeUrl || user.resumeUrl };
        localStorage.setItem('careerai_user', JSON.stringify(updatedUser));
        alert("Resume uploaded and analyzed successfully!");
        window.location.reload();
      } else {
        alert("Failed to upload: " + data.error);
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      alert("Error uploading resume.");
    } finally {
      setIsUploadingResume(false);
    }
  };
  
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
        >
          Welcome back, {user.firstName || 'Candidate'}! 
          <motion.span 
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-block origin-bottom-right"
          >
            👋
          </motion.span>
        </motion.h2>
        <p className="text-muted-foreground mt-1">Here is your personalized career intelligence dashboard.</p>
      </motion.div>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-20px" }} className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
               <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                 <Bell size={20} className="text-primary" /> 
               </motion.div>
               Notifications
            </h3>
            <button 
              onClick={handleClearAllNotifications}
              className="text-sm font-semibold text-muted-foreground hover:text-destructive hover:underline transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {notifications.map(notif => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.01 }}
                className="bg-primary/10 border border-blue/20 p-4 rounded-xl flex items-start gap-4 relative group"
              >
                 <button 
                   onClick={() => handleClearNotification(notif.id)}
                   className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                   title="Clear notification"
                 >
                   <X size={16} />
                 </button>
               <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--color-primary),0.5)]">
                 <Bell size={18} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-foreground">Message from Institution</h4>
                   <span className="text-xs text-muted-foreground">{new Date(notif.timestamp).toLocaleString()}</span>
                 </div>
                 <p className="text-sm text-muted-foreground pr-4">{notif.message}</p>
               </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Metrics / Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ scale: 1.01, boxShadow: "0px 10px 40px rgba(0,0,0,0.1)" }}

          className="bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-glass relative overflow-hidden col-span-1 md:col-span-2 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
             <motion.div 
               whileHover={{ rotate: 10, scale: 1.1 }}
               className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl font-bold backdrop-blur-md text-primary shadow-inner"
             >
                {user.firstName ? user.firstName.charAt(0) : <User size={32} />}
             </motion.div>
             <div className="flex-1">
                <h3 className="text-3xl font-display font-bold tracking-tight">{user.name || 'Candidate'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                     <div className="p-1.5 rounded-md bg-card border border-border/50"><GraduationCap size={14} className="text-primary"/></div> 
                     <span className="truncate">{user.course || 'Course'} • {user.branch || 'Branch'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                     <div className="p-1.5 rounded-md bg-card border border-border/50"><Briefcase size={14} className="text-primary"/></div> 
                     <span className="truncate">{user.collegeName || 'University'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                     <div className="p-1.5 rounded-md bg-card border border-border/50"><MapPin size={14} className="text-primary"/></div> 
                     <span className="truncate">{user.currentCity || 'Location'}</span>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="relative z-10 mt-6 pt-5 border-t border-border/50">
             <p className="text-sm font-bold tracking-wide uppercase text-muted-foreground mb-3 flex items-center gap-2">
               <TrendingUp size={14} /> Core Competencies
             </p>
             <div className="flex flex-wrap gap-2">
                {skillsArray.length > 0 ? skillsArray.map((skill, index) => (
                   <motion.span 
                     key={index} 
                     whileHover={{ scale: 1.05, y: -2 }}
                     className="px-4 py-1.5 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors rounded-full text-sm font-semibold border border-border/50 shadow-sm"
                   >
                     {skill}
                   </motion.span>
                )) : (
                   <span className="text-muted-foreground text-sm italic">No skills added yet. Complete your profile!</span>
                )}
             </div>
          </div>
        </motion.div>

        {/* AI Stats Card */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: "0px 15px 40px rgba(var(--color-primary), 0.15)" }}
          className="bg-gradient-to-br from-card to-card/50 p-6 rounded-3xl border border-border/50 shadow-glass relative overflow-hidden flex flex-col justify-center items-center text-center"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <motion.div 
            animate={{ 
              boxShadow: ["0px 0px 0px rgba(var(--color-primary), 0)", "0px 0px 30px rgba(var(--color-primary), 0.3)", "0px 0px 0px rgba(var(--color-primary), 0)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative z-10 w-16 h-16 rounded-2xl bg-background border border-border/50 text-primary flex items-center justify-center mb-5 mx-auto"
          >
            <FileText size={28} />
          </motion.div>
          <h3 className="text-muted-foreground font-bold tracking-widest uppercase text-xs mb-2">ATS Match Score</h3>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            className="text-6xl font-display font-black text-foreground tracking-tighter"
          >
            {user.resumeScore ? user.resumeScore + '%' : '--'}
          </motion.div>
          {user.resumeScore ? (
             <motion.p 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
               className="text-sm text-emerald-500 mt-4 font-bold flex items-center justify-center gap-1.5"
             >
               <CheckCircle2 size={16} /> Ready for Applications
             </motion.p>
          ) : (
             <motion.p 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
               className="text-sm text-warning mt-4 font-bold bg-warning/10 px-3 py-1 rounded-full"
             >
               Missing Resume
             </motion.p>
          )}
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Action Items */}
          <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-glass p-6 sm:p-8 hover:border-primary/30 transition-colors">
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full inline-block"></span> Recommended Quests
            </h3>
            <div className="space-y-4">
              
              <motion.div 
                whileHover="hover" whileTap="tap" variants={cardHover}
                onClick={() => navigate('/mock-interview')} 
                className="flex items-start gap-5 p-5 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors cursor-pointer bg-background/50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Target size={28} />
                </div>
                <div className="flex-1 relative z-10">
                  <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">Conquer the AI Interview</h4>
                  <p className="text-sm text-muted-foreground mt-1">Simulate a high-pressure tech interview. Candidates who practice see a 40% higher pass rate.</p>
                </div>
                <div className="h-full flex items-center justify-center relative z-10 pt-2">
                  <motion.div 
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ChevronRight className="text-primary opacity-50 group-hover:opacity-100" size={24} />
                  </motion.div>
                </div>
              </motion.div>

                <div className="relative">
                  <input 
                    type="file" 
                    id="dashboard-resume-upload" 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleResumeUpload} 
                    disabled={isUploadingResume}
                  />
                  <label htmlFor="dashboard-resume-upload">
                    <motion.div 
                      whileHover="hover" whileTap="tap" variants={cardHover}
                      className={`flex items-start gap-5 p-5 rounded-2xl border ${!user.resumeUrl ? 'border-border/50 hover:border-warning/50 bg-background/50' : 'border-border/50 hover:border-primary/50 bg-card/80'} transition-colors cursor-pointer relative overflow-hidden group ${isUploadingResume ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${!user.resumeUrl ? 'from-warning/5' : 'from-primary/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${!user.resumeUrl ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                        {user.resumeUrl ? <FileText size={28} className={isUploadingResume ? "animate-pulse" : ""} /> : <AlertCircle size={28} className={isUploadingResume ? "animate-pulse" : ""} />}
                      </div>
                      <div className="flex-1 relative z-10">
                        <h4 className={`font-bold text-lg transition-colors ${!user.resumeUrl ? 'text-foreground group-hover:text-warning' : 'text-foreground group-hover:text-primary'}`}>
                          {isUploadingResume ? 'Uploading & Analyzing...' : (user.resumeUrl ? 'Update Your Resume' : 'Upload Your Arsenal (Resume)')}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user.resumeUrl ? 'Keep your profile fresh for better matching and interview prep.' : "We can't match you to top-tier jobs without your resume. Let our AI analyze it now."}
                        </p>
                      </div>
                      <div className="h-full flex items-center justify-center relative z-10 pt-2">
                         <ChevronRight className={`${!user.resumeUrl ? 'text-warning' : 'text-primary'} opacity-50 group-hover:opacity-100`} size={24} />
                      </div>
                    </motion.div>
                  </label>
                </div>

            </div>
          </motion.div>

          {/* Job Matches */}
          <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-glass p-6 sm:p-8 hover:border-emerald-500/30 transition-colors">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                 <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span> Top Job Matches
               </h3>
               <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full">View All</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Mock Job 1 */}
               <motion.div 
                 whileHover={{ y: -4, boxShadow: "0px 10px 30px rgba(0,0,0,0.08)" }}
                 className="p-5 border border-border/50 rounded-2xl bg-background/50 group cursor-pointer transition-colors hover:border-emerald-500/30"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-lg">T</div>
                     <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-full border border-emerald-500/20">92% Match</span>
                  </div>
                  <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">Frontend Developer</h4>
                  <p className="text-sm text-muted-foreground font-medium mb-3">TechNova Corp • Remote</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">Seeking a {user.course || 'B.Tech'} student with strong {skillsArray[0] || 'React'} skills to build modern user interfaces.</p>
               </motion.div>

               {/* Mock Job 2 */}
               <motion.div 
                 whileHover={{ y: -4, boxShadow: "0px 10px 30px rgba(0,0,0,0.08)" }}
                 className="p-5 border border-border/50 rounded-2xl bg-background/50 group cursor-pointer transition-colors hover:border-emerald-500/30"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-lg">D</div>
                     <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-full border border-emerald-500/20">85% Match</span>
                  </div>
                  <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">Junior Engineer</h4>
                  <p className="text-sm text-muted-foreground font-medium mb-3">DataSys • Hybrid</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">Join our core platform team to scale microservices. Perfect for ambitious new grads.</p>
               </motion.div>
             </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ scale: 1.03, rotate: 1, boxShadow: "0px 20px 40px rgba(var(--color-primary), 0.3)" }}
            className="bg-gradient-to-br from-primary to-blue text-primary-foreground rounded-3xl p-8 shadow-xl relative overflow-hidden group"
          >
             {/* Animated Background Elements */}
             <motion.div 
               animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl mix-blend-overlay"
             />
             <motion.div 
               animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl mix-blend-overlay"
             />
             
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
               <Target size={24} className="text-white" />
             </div>
             <h3 className="text-2xl font-display font-bold mb-3 relative z-10 text-white leading-tight">Master the Interview</h3>
             <p className="text-sm text-primary-foreground/90 mb-8 relative z-10 font-medium leading-relaxed">
               Face our ruthless AI interviewer, specifically tuned to grill you on {user.branch || 'your domain'}.
             </p>
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/mock-interview')}
                className="w-full py-4 bg-white text-primary font-black rounded-xl transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] relative z-10 flex justify-center items-center gap-2 hover:bg-neutral-50"
             >
               Launch Simulator <ChevronRight size={20} strokeWidth={3} />
             </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-glass p-6 hover:border-purple-500/30 transition-colors">
            <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
              <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span> Active Applications
            </h3>
            
            {(!user.appliedJobs || user.appliedJobs.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                   <Briefcase size={24} className="text-line" />
                 </div>
                 <p className="text-sm font-bold text-foreground">Zero Active Ops</p>
                 <p className="text-xs mt-1 px-4">Start applying to see your pipeline grow here.</p>
                 <button onClick={() => navigate('/jobs')} className="text-primary text-sm font-bold mt-4 hover:underline px-4 py-2 bg-primary/10 rounded-full">Explore Jobs</button>
              </div>
            ) : (
              <div className="space-y-3">
                {user.appliedJobs.map((job, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ x: 4 }}
                    className="p-4 border border-border/50 rounded-2xl bg-background/50 relative overflow-hidden group cursor-default"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-2xl"></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                       <div>
                          <h4 className="font-bold text-foreground text-sm truncate pr-2">{job.title}</h4>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{job.company}</p>
                       </div>
                       <span className="px-2 py-1 bg-purple-500/10 text-purple-500 font-black text-[10px] rounded uppercase tracking-wider border border-purple-500/20">
                          {job.status || 'Applied'}
                       </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 pl-2 font-medium uppercase tracking-wider">
                      {new Date(job.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </motion.div>
                ))}
                <button onClick={() => navigate('/jobs')} className="w-full text-center text-primary text-sm font-bold mt-4 hover:underline">View Pipeline</button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
