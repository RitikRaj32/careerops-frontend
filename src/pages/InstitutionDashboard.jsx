import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Search, FileText, Trash2, Send, Bell } from 'lucide-react';

const InstitutionDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('ALL');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('https://2e49c2b81cc2c9.lhr.life/api/institution/students');
        const data = await response.json();
        if (data.success) {
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete candidate ${name}?`)) return;
    try {
      const response = await fetch(`https://2e49c2b81cc2c9.lhr.life/api/institution/students/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setStudents(prev => prev.filter(s => s.id !== id));
      } else {
        alert("Failed to delete user: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Make sure backend is running.");
    }
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notificationMessage.trim()) return;

    // Simulate sending notification
    const targetName = notificationTarget === 'ALL' 
      ? 'All Candidates' 
      : students.find(s => s.id === notificationTarget)?.name || 'Selected Candidate';
    
    const newNotification = {
      id: Date.now(),
      message: notificationMessage,
      target: notificationTarget,
      timestamp: new Date().toISOString(),
      sender: 'Institution Admin'
    };
    
    const existing = JSON.parse(localStorage.getItem('node_notifications') || '[]');
    localStorage.setItem('node_notifications', JSON.stringify([newNotification, ...existing]));
    window.dispatchEvent(new Event('storage'));

    alert(`Notification Sent to ${targetName}!\n\nMessage: ${notificationMessage}`);
    setNotificationMessage('');
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-display font-bold text-ink">Employability Dashboard</h2>
        <p className="text-ink-soft mt-1">Real-time view of candidate readiness and resumes.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl p-6 rounded-2xl shadow-glass border border-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-dark text-white flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="text-ink-soft font-semibold">Total Candidates</h3>
          </div>
          <div className="text-4xl font-display font-bold text-ink">{students.length}</div>
        </div>

        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl p-6 rounded-2xl shadow-glass border border-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal text-white flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-ink-soft font-semibold">Avg Resume Score</h3>
          </div>
          <div className="text-4xl font-display font-bold text-ink">
            {students.length > 0 
              ? Math.round(students.reduce((acc, curr) => acc + (curr.resumeScore || 0), 0) / students.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* Notification Sender Panel */}
      <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl p-6 rounded-2xl shadow-glass border border-line">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Bell size={20} className="text-blue" /> Send Notification
        </h3>
        <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={notificationTarget} 
              onChange={(e) => setNotificationTarget(e.target.value)}
              className="bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-blue focus:outline-none w-full sm:w-64 appearance-none font-semibold"
            >
              <option value="ALL">Broadcast to All Candidates</option>
              <optgroup label="Specific Candidates">
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.phone}</option>
                ))}
              </optgroup>
            </select>
            
            <input 
              type="text" 
              placeholder="Type your notification message..." 
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="bg-paper dark:bg-dark-glow border border-line rounded-xl p-3 text-sm focus:border-blue focus:outline-none flex-1"
            />
            
            <button 
              type="submit"
              disabled={!notificationMessage.trim()}
              className="bg-blue hover:bg-blue-light text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Send <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Student Readiness List */}
      <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl rounded-2xl shadow-glass border border-line overflow-hidden">
         <div className="p-6 border-b border-line flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-display font-bold">Candidate Database</h3>
            
            <div className="flex gap-3 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input 
                     type="text" 
                     placeholder="Search students..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-9 pr-3 py-2 bg-paper border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                  />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-ink-soft">Loading candidate data...</div>
            ) : (
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-paper text-ink-soft text-xs uppercase tracking-wider">
                     <th className="p-4 font-semibold border-b border-line">Student</th>
                     <th className="p-4 font-semibold border-b border-line">Branch & Year</th>
                     <th className="p-4 font-semibold border-b border-line">Resume Score</th>
                     <th className="p-4 font-semibold border-b border-line">Applications</th>
                     <th className="p-4 font-semibold border-b border-line text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-ink-soft">No candidates found in the database.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-paper/50 border-b border-line transition-colors">
                         <td className="p-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center font-bold">
                                 {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                               </div>
                               <div>
                                  <div className="font-bold text-ink">{student.name || 'Unknown User'}</div>
                                  <div className="text-ink-soft text-xs">{student.email || student.phone}</div>
                               </div>
                            </div>
                         </td>
                         <td className="p-4 text-ink font-medium">
                           {student.branch || 'N/A'} {student.collegeYear ? `(${student.collegeYear})` : ''}
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-2">
                               <div className="w-16 h-2 bg-line rounded-full overflow-hidden">
                                  <div className="bg-teal h-full" style={{ width: `${student.resumeScore || 0}%`}}></div>
                               </div>
                               <span className="font-bold">{student.resumeScore || 0}%</span>
                            </div>
                         </td>
                         <td className="p-4 text-ink-soft font-medium">{student.applications?.length || 0} Submitted</td>
                         <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {student.resumeUrl ? (
                                <a href={`https://2e49c2b81cc2c9.lhr.life${student.resumeUrl}`} target="_blank" rel="noreferrer" className="text-blue hover:underline text-sm font-semibold flex items-center gap-1">
                                   <FileText size={14} /> View
                                </a>
                              ) : (
                                <span className="text-ink-soft text-xs italic">No PDF</span>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(student.id, student.name || student.phone)}
                                className="text-rose hover:bg-rose-soft p-2 rounded-lg transition-colors"
                                title="Block / Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
            )}
         </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
