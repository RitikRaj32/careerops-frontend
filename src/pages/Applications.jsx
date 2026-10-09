import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Briefcase, MapPin, Search, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
  const { user, deleteApplication } = useAuth();
  const navigate = useNavigate();
  const appliedJobs = user?.appliedJobs || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <CheckSquare className="text-primary" size={32} />
            Application Tracker
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Manage your active applications and track your interview progress.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card/80 dark:bg-card/40 backdrop-blur-md placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-all shadow-sm"
            placeholder="Search your applications..."
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-foreground">{appliedJobs.length}</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Applied</div>
        </div>
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Interviewing</div>
        </div>
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-warning">0</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">In Review</div>
        </div>
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-emerald-600">0</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Offers</div>
        </div>
      </div>

      {appliedJobs.length === 0 ? (
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-glass p-12 text-center">
           <div className="w-20 h-20 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={32} />
           </div>
           <h3 className="text-2xl font-bold text-foreground mb-2">No Applications Yet</h3>
           <p className="text-muted-foreground mb-8 max-w-md mx-auto">You haven't applied to any roles. Head over to Job Discovery to find perfectly matched opportunities.</p>
           <button onClick={() => navigate('/jobs')} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-md">
             Explore Jobs
           </button>
        </div>
      ) : (
        <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border rounded-2xl shadow-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card/80 dark:bg-card/40 border-b border-border text-sm uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-bold">Company & Role</th>
                  <th className="p-4 font-bold">Date Applied</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {appliedJobs.map((job, idx) => (
                  <tr key={idx} className="hover:bg-card/80 dark:bg-card/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-dark to-dark2 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                          {job.company.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{job.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            {job.company} <span className="mx-1">•</span> <MapPin size={12} /> {job.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm font-medium text-foreground">
                        {new Date(job.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider">
                        <CheckCircle2 size={12} /> {job.status || 'Applied'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-primary hover:text-primary-700 font-bold text-sm flex items-center gap-1">
                          View Details <ChevronRight size={16} />
                        </button>
                        <button 
                          onClick={() => deleteApplication(job.id)}
                          className="text-destructive/70 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Withdraw Application"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
