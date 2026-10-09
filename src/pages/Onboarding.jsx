import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, UploadCloud, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/react';
import { useAuth } from '../context/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { completeProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    gender: '',
    currentCity: '',
    collegeName: '',
    course: '',
    branch: '',
    skillsList: '',
    collegeYear: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let resumeUrl = null;
    if (resumeFile) {
      try {
        const formData = new FormData();
        formData.append('file', resumeFile);
        
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          resumeUrl = uploadData.url;
        } else {
          console.error("Upload failed:", uploadData.error);
        }
      } catch (err) {
        console.error("Failed to upload resume:", err);
      }
    }
    
    await completeProfile({ ...formData, resumeUrl });
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background font-sans relative overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Animated Liquid Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/30 blur-[100px] animate-blob pointer-events-none fixed"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-blob animation-delay-2000 pointer-events-none fixed"></div>

      <div className="w-full max-w-3xl bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-glass relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-10 mb-10">
         <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue to-teal flex items-center justify-center shadow-lg">
               <Target size={28} className="text-white" />
            </div>
         </div>
         
         <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground">Tell us about yourself to personalize your dashboard and get better matches.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1 & 2: Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">First Name</label>
                 <input 
                   type="text" 
                   name="firstName"
                   required
                   value={formData.firstName}
                   onChange={handleChange}
                   placeholder="e.g. Alex" 
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                 <input 
                   type="text" 
                   name="lastName"
                   required
                   value={formData.lastName}
                   onChange={handleChange}
                   placeholder="e.g. Lin" 
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 />
              </div>
            </div>

            {/* 3 & 4: Contact & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">Contact Number</label>
                 <input 
                   type="tel" 
                   name="contactNumber"
                   required
                   value={formData.contactNumber}
                   onChange={handleChange}
                   placeholder="e.g. 9876543210" 
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">Gender</label>
                 <select 
                   name="gender"
                   required
                   value={formData.gender}
                   onChange={handleChange}
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                 </select>
              </div>
            </div>

            {/* 5: Current City */}
            <div>
               <label className="block text-sm font-bold text-foreground mb-2">Current City / Location</label>
               <input 
                 type="text" 
                 name="currentCity"
                 required
                 value={formData.currentCity}
                 onChange={handleChange}
                 placeholder="e.g. Bangalore, India" 
                 className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
               />
            </div>

            <div className="h-px w-full bg-card/80 dark:bg-card/40 my-6"></div>

            {/* 6: College Name & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">College Name</label>
                 <input 
                   type="text" 
                   name="collegeName"
                   required
                   value={formData.collegeName}
                   onChange={handleChange}
                   placeholder="e.g. IIT Delhi" 
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">Course (Pursuing or Completed)</label>
                 <select 
                   name="course"
                   required
                   value={formData.course}
                   onChange={handleChange}
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 >
                    <option value="" disabled>Select Course</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="BE">BE</option>
                    <option value="B.COM">B.COM</option>
                    <option value="MBA">MBA</option>
                    <option value="B.A">B.A</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="M.Com">M.Com</option>
                    <option value="MCA">MCA</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Integrated B.Tech & M.Tech">Integrated B.Tech & M.Tech</option>
                 </select>
              </div>
            </div>

            {/* 7 & 9: Branch & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">Branch / Specialization</label>
                 <input 
                   type="text" 
                   name="branch"
                   required
                   value={formData.branch}
                   onChange={handleChange}
                   placeholder="e.g. CSE, ME, Civil" 
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-foreground mb-2">College Year</label>
                 <select 
                   name="collegeYear"
                   required
                   value={formData.collegeYear}
                   onChange={handleChange}
                   className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
                 >
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Graduated (Looking for Job)">Graduated (Looking for Job)</option>
                    <option value="Working Professional">Working Professional</option>
                 </select>
              </div>
            </div>

            {/* 8: Skills */}
            <div>
               <label className="block text-sm font-bold text-foreground mb-2">Skills you've learned (comma separated)</label>
               <input 
                 type="text" 
                 name="skillsList"
                 required
                 value={formData.skillsList}
                 onChange={handleChange}
                 placeholder="e.g. React, Node.js, Python, UI/UX" 
                 className="w-full px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue transition-all"
               />
            </div>

            {/* 10: Resume Upload */}
            <div>
               <label className="block text-sm font-bold text-foreground mb-2">Upload Resume (Optional)</label>
               <div className="relative group">
                 <input 
                   type="file" 
                   accept=".pdf,.doc,.docx"
                   onChange={handleFileChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-blue/40 bg-card/80 dark:bg-card/40 backdrop-blur-md flex flex-col items-center justify-center gap-2 group-hover:bg-card/70 group-hover:border-blue transition-all">
                    <UploadCloud className="text-primary" size={32} />
                    <span className="text-muted-foreground text-sm font-medium">
                      {resumeFile ? resumeFile.name : "Drag & drop or click to upload PDF/DOC"}
                    </span>
                 </div>
               </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:bg-dark2 transition-all shadow-md flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 {loading ? "Saving Profile..." : "Complete Setup"} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <SignOutButton>
                <button type="button" onClick={() => window.location.href = '/'} className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors flex items-center gap-1">
                  <LogOut size={16} /> Cancel and Sign out
                </button>
              </SignOutButton>
            </div>
         </form>
      </div>
    </div>
  );
};

export default Onboarding;
