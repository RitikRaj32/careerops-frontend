import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  FileText, 
  BookOpen, 
  Target, 
  CheckSquare, 
  User,
  Users,
  Moon,
  Sun,
  LogOut,
  Trash2,
  Menu,
  X
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import JobDiscovery from './pages/JobDiscovery';
import MockInterview from './pages/MockInterview';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InstitutionLogin from './pages/InstitutionLogin';
import InterviewPrep from './pages/InterviewPrep';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import CompanyIntel from './pages/CompanyIntel';
import ResumeOptimization from './pages/ResumeOptimization';
import Applications from './pages/Applications';
import SkillGaps from './pages/SkillGaps';
import { AuthProvider, useAuth } from './context/AuthContext';
import logoImg from './assets/logo.png';

const SidebarLink = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue text-white shadow-md shadow-blue/20' 
          : 'text-ink-soft hover:bg-dark-glow hover:text-white'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{children}</span>
  </NavLink>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || false;
  });
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your profile and all your data? This cannot be undone.")) return;
    
    try {
      const response = await fetch('https://good-files-lead.loca.lt/api/users/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, email: user.email })
      });
      if (response.ok) {
        alert("Your profile has been deleted.");
        handleLogout();
      } else {
        alert("Failed to delete profile.");
      }
    } catch (error) {
      console.error("Delete profile error", error);
      alert("Error deleting profile.");
    }
  };
  
  return (
  <div className="flex h-screen bg-paper font-sans relative overflow-hidden">
    {/* Animated Liquid Background Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue/30 blur-[100px] animate-blob pointer-events-none"></div>
    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[600px] rounded-full bg-teal/20 blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
    <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[500px] rounded-full bg-rose/20 blur-[120px] animate-blob animation-delay-4000 pointer-events-none"></div>

    {/* Mobile Overlay */}
    {isMobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-dark/95 backdrop-blur-xl border-r border-white/10 text-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 relative overflow-hidden flex justify-between items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-dark-glow opacity-50 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <h1 className="text-2xl font-display font-bold relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg p-1">
             <img src={logoImg} alt="NODE Logo" className="w-full h-full object-contain" />
          </div>
          NODE
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden relative z-10 p-2 text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>
      
      {user?.role !== 'INSTITUTION' && (
        <>
          <div className="px-4 py-2 mt-2 text-xs font-bold text-ink-soft uppercase tracking-wider">
            Candidate
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/jobs" icon={Briefcase}>Job Discovery</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/companies" icon={Building2}>Company Intel</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/resume" icon={FileText}>Resume AI</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/interview-prep" icon={BookOpen}>Interview Prep</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/mock-interview" icon={User}>Mock Interviews</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/skill-gaps" icon={Target}>Skill Roadmaps</SidebarLink>
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/applications" icon={CheckSquare}>Applications</SidebarLink>
          </nav>
        </>
      )}

      {user?.role === 'INSTITUTION' && (
        <>
          <div className="px-4 py-2 mt-4 text-xs font-bold text-ink-soft uppercase tracking-wider border-t border-white/5 pt-4">
            Institution
          </div>
          <nav className="px-4 pb-6 space-y-1">
            <SidebarLink onClick={() => setIsMobileMenuOpen(false)} to="/institution/dashboard" icon={Users}>Employability</SidebarLink>
          </nav>
        </>
      )}
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
      <header className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border-b border-line shadow-sm px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-ink hover:bg-paper rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="text-ink font-semibold text-base md:text-lg flex items-center gap-1 md:gap-2">
             <span className="hidden sm:inline">Good morning,</span> <span className="font-display font-bold text-blue truncate max-w-[120px] sm:max-w-none">{user.name || 'Candidate'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-ink-soft hover:bg-paper rounded-full transition-colors"
          >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="relative p-2 text-ink-soft hover:bg-paper rounded-full transition-colors">
             <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose rounded-full border-2 border-white"></div>
             <FileText size={20} />
          </button>
          <div className="relative">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:ring-2 hover:ring-teal/50 transition-all"
            >
              {(user.name && user.name.charAt(0).toUpperCase()) || 'U'}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-dark-glow border border-line rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-sm text-ink font-bold truncate">{user.name}</p>
                  <p className="text-xs text-ink-soft truncate">{user.email || user.phone}</p>
                </div>
                <div className="py-1">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-paper dark:hover:bg-white/5 flex items-center gap-2">
                    <LogOut size={16} className="text-ink-soft" /> Logout
                  </button>
                  {user?.role !== 'INSTITUTION' && (
                    <button onClick={handleDeleteProfile} className="w-full text-left px-4 py-2 text-sm text-rose hover:bg-rose/10 flex items-center gap-2">
                      <Trash2 size={16} /> Delete Account
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 bg-card/80 dark:bg-card/40 backdrop-blur-[2px] pointer-events-none z-[-1]"></div>
        <Outlet />
      </div>
    </main>
  </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/institution/login" element={<InstitutionLogin />} />
        
        {/* App Layout Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobDiscovery />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          
          {/* Placeholders for other routes to prevent errors */}
          <Route path="/companies" element={<CompanyIntel />} />
          <Route path="/resume" element={<ResumeOptimization />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/skill-gaps" element={<SkillGaps />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
