import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
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
  X,
  ChevronLeft,
  ChevronRight
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

const SidebarLink = ({ to, icon: Icon, children, onClick, collapsed, id }) => (
  <NavLink
    id={id}
    to={to}
    onClick={onClick}
    title={collapsed ? children : undefined}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 overflow-hidden hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] ${
        isActive 
          ? 'bg-primary/20 text-white shadow-sm' 
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    <Icon size={collapsed ? 24 : 22} className="shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:text-primary" />
    <span className={`font-medium text-base whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{children}</span>
  </NavLink>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || false;
  });
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleSidebar = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  React.useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn && user?.role !== 'INSTITUTION') {
        navigate('/');
      } else if (user?.isAuthenticated && user?.isNewUser) {
        navigate('/onboarding');
      }
    }
  }, [isLoaded, isSignedIn, user?.isAuthenticated, user?.isNewUser, user?.role, navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good evening';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (!isLoaded || (isSignedIn && !user?.isAuthenticated)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your profile and all your data? This cannot be undone.")) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
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
  <div className="flex h-screen bg-background font-sans relative overflow-hidden">
    {/* Animated Liquid Background Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/30 blur-[100px] animate-blob pointer-events-none"></div>
    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[600px] rounded-full bg-primary/20 blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
    <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[500px] rounded-full bg-accent/30 blur-[120px] animate-blob animation-delay-4000 pointer-events-none"></div>

    {/* Mobile Overlay */}
    {isMobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Sidebar */}
    <aside 
      className={`fixed md:relative top-0 left-0 h-full bg-slate-900 dark:bg-slate-950 backdrop-blur-xl border-r border-white/10 text-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-50 transform md:translate-x-0 overflow-hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ width: isSidebarCollapsed ? '68px' : '200px', transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Logo Area */}
      <div className="px-3 py-3 relative overflow-hidden flex justify-between items-center border-b border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-primary/10 p-1 shrink-0">
             <img src={logoImg} alt="CAREER OPS Logo" className="w-full h-full object-contain" />
          </div>
          <span className={`text-base font-display font-bold tracking-tight text-white whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'}`}>CAREER OPS</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden relative z-10 p-1.5 text-white/70 hover:text-white shrink-0"
        >
          <X size={20} />
        </button>
      </div>
      
      {user?.role !== 'INSTITUTION' && (
        <>
          <div className={`px-4 py-2 mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'opacity-0 h-0 py-0 mt-0' : 'opacity-100 h-auto'}`}>
            Candidate
          </div>
          <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2 pt-3' : 'px-3'} space-y-0.5 overflow-y-auto custom-scrollbar`}>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/jobs" icon={Briefcase}>Job Discovery</SidebarLink>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/companies" icon={Building2}>Company Intel</SidebarLink>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/resume" icon={FileText}>Resume AI</SidebarLink>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/interview-prep" icon={BookOpen}>Interview Prep</SidebarLink>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/mock-interview" icon={User}>Mock Interviews</SidebarLink>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/skill-gaps" icon={Target}>Skill Roadmaps</SidebarLink>
            <SidebarLink id="nav-applications" collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/applications" icon={CheckSquare}>Applications</SidebarLink>
          </nav>
        </>
      )}

      {user?.role === 'INSTITUTION' && (
        <>
          <div className={`px-4 py-2 mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-white/5 pt-3 whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'opacity-0 h-0 py-0 mt-0' : 'opacity-100 h-auto'}`}>
            Institution
          </div>
          <nav className={`${isSidebarCollapsed ? 'px-2' : 'px-3'} pb-4 space-y-0.5`}>
            <SidebarLink collapsed={isSidebarCollapsed} onClick={() => setIsMobileMenuOpen(false)} to="/institution/dashboard" icon={Users}>Employability</SidebarLink>
          </nav>
        </>
      )}

      {/* Collapse/Expand Toggle */}
      <div className={`hidden md:flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end px-3'} py-3 border-t border-white/10`}>
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={22} strokeWidth={2.5} /> : <ChevronLeft size={22} strokeWidth={2.5} />}
        </button>
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
      <header className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border-b border-border shadow-sm px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-foreground hover:bg-background rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="text-foreground font-semibold text-base md:text-lg flex items-center gap-1 md:gap-2">
             <span className="hidden sm:inline">{getGreeting()},</span> <span className="font-display font-bold text-primary truncate max-w-[120px] sm:max-w-none">{user.name || 'Candidate'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-muted-foreground hover:bg-background rounded-full transition-colors"
          >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="relative p-2 text-muted-foreground hover:bg-background rounded-full transition-colors">
             <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></div>
             <FileText size={20} />
          </button>
          <div className="relative">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md cursor-pointer hover:ring-2 hover:ring-ring/50 transition-all"
            >
              {(user.name && user.name.charAt(0).toUpperCase()) || 'U'}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-secondary-glow border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-foreground font-bold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email || user.phone}</p>
                </div>
                <div className="py-1">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background dark:hover:bg-white/5 flex items-center gap-2">
                    <LogOut size={16} className="text-muted-foreground" /> Logout
                  </button>
                  {user?.role !== 'INSTITUTION' && (
                    <button onClick={handleDeleteProfile} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2">
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-white h-screen overflow-auto">
          <h1 className="text-2xl font-bold mb-4">React App Crashed!</h1>
          <p className="font-bold">{this.state.error && this.state.error.toString()}</p>
          <pre className="mt-4 text-xs whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
