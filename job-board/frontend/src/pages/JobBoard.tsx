import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  salary: string;
  description: string;
  requirements: string[];
  postedBy: number;
  createdAt: string;
}

interface Application {
  id: number;
  jobId: number;
  userName: string;
  userEmail: string;
  coverLetter: string;
  appliedAt: string;
}

interface Props {
  user: { id: number; name: string; email: string; role: 'employer' | 'candidate' };
  onLogout: () => void;
}

const typeColors: Record<string, string> = {
  remote: '#10b981',
  onsite: '#3b82f6',
  hybrid: '#f59e0b',
};

const btn: React.CSSProperties = {
  padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
  fontWeight: 600, fontSize: '14px',
};

export default function JobBoard({ user, onLogout }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAppModal, setShowAppModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [appMsg, setAppMsg] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'remote' as Job['type'], salary: '', description: '', requirements: '' });
  const [appError, setAppError] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter !== 'all') params.type = typeFilter;
      const res = await api.get('/api/jobs', { params });
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  }, [search, typeFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const selectJob = async (job: Job) => {
    setSelectedJob(job);
    setShowAppModal(false);
    setApplications([]);
    setAppMsg('');
    if (user.role === 'employer') {
      try {
        const res = await api.get(`/api/applications/${job.id}`);
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      }
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setAppError('');
    try {
      await api.post(`/api/applications/${selectedJob.id}/apply`, { coverLetter });
      setAppMsg('Application submitted successfully!');
      setCoverLetter('');
    } catch (err) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response: { data: { error?: string } } }).response?.data?.error
        : 'Failed to apply';
      setAppError(msg || 'Failed to apply');
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/jobs', {
        ...form,
        requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
      });
      setJobs(prev => [res.data, ...prev]);
      setShowPostForm(false);
      setForm({ title: '', company: '', location: '', type: 'remote', salary: '', description: '', requirements: '' });
    } catch (err) {
      console.error('Failed to post job', err);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', marginBottom: '10px',
    background: '#0b1120', border: '1px solid #1e293b', borderRadius: '6px',
    color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box',
  };

  const typeBadge = (type: string) => (
    <span style={{
      background: typeColors[type] + '20', color: typeColors[type],
      padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
    }}>
      {type}
    </span>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: '380px', borderRight: '1px solid #1e293b', padding: '20px', overflowY: 'auto', background: '#131c31', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', margin: 0, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Job Board</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{user.name} ({user.role})</span>
            <button onClick={onLogout} style={{ ...btn, background: '#ef4444', color: '#fff' }}>Logout</button>
          </div>
        </div>

        <input
          style={{ ...inputStyle, marginBottom: '12px' }}
          placeholder="Search jobs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'remote', 'onsite', 'hybrid'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                ...btn, flex: 1, textTransform: 'capitalize',
                background: typeFilter === t ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : '#1e293b',
                color: '#fff',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {user.role === 'employer' && (
          <button onClick={() => setShowPostForm(true)} style={{ ...btn, width: '100%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff', marginBottom: '16px' }}>
            + Post New Job
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => selectJob(job)}
              style={{
                background: selectedJob?.id === job.id ? '#1e293b' : '#0b1120',
                border: '1px solid #1e293b', borderRadius: '10px', padding: '14px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#e2e8f0' }}>{job.title}</h3>
                {typeBadge(job.type)}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                {job.company} &middot; {job.location}
              </div>
              <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 600, marginBottom: '6px' }}>{job.salary}</div>
              <div style={{ fontSize: '13px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {job.description}
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No jobs found</div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#0b1120' }}>
        {showPostForm ? (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Post a New Job</h2>
            <form onSubmit={handlePostJob} style={{ maxWidth: '600px' }}>
              <label htmlFor="job-title" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Title</label>
              <input id="job-title" style={inputStyle} placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <label htmlFor="job-company" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Company</label>
              <input id="job-company" style={inputStyle} placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required />
              <label htmlFor="job-location" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Location</label>
              <input id="job-location" style={inputStyle} placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
              <label htmlFor="job-type" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Work Type</label>
              <select id="job-type" style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Job['type'] })}>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <label htmlFor="job-salary" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Salary</label>
              <input id="job-salary" style={inputStyle} placeholder="Salary" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} required />
              <label htmlFor="job-desc" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Description</label>
              <textarea id="job-desc" style={{ ...inputStyle, minHeight: '80px' }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              <label htmlFor="job-reqs" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Requirements (comma separated)</label>
              <input id="job-reqs" style={inputStyle} placeholder="Requirements (comma separated)" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ ...btn, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff' }}>Post Job</button>
                <button type="button" onClick={() => setShowPostForm(false)} style={{ ...btn, background: '#1e293b', color: '#fff' }}>Cancel</button>
              </div>
            </form>
          </div>
        ) : selectedJob ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '26px', margin: '0 0 6px' }}>{selectedJob.title}</h1>
                <div style={{ color: '#94a3b8', fontSize: '15px' }}>
                  {selectedJob.company} &middot; {selectedJob.location}
                </div>
              </div>
              {typeBadge(selectedJob.type)}
            </div>
            <div style={{ fontSize: '20px', color: '#3b82f6', fontWeight: 700, marginBottom: '20px' }}>{selectedJob.salary}</div>
            <p style={{ lineHeight: 1.7, color: '#cbd5e1', marginBottom: '20px' }}>{selectedJob.description}</p>
            {selectedJob.requirements.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Requirements</h3>
                <ul style={{ paddingLeft: '20px', color: '#94a3b8', lineHeight: 1.8 }}>
                  {selectedJob.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {user.role === 'candidate' && (
              <div>
                {appMsg ? (
                  <div style={{ color: '#10b981', marginBottom: '12px' }}>{appMsg}</div>
                ) : (
                  <>
                    {appError && <div style={{ color: '#ef4444', marginBottom: '8px' }}>{appError}</div>}
                    {!showAppModal ? (
                      <button onClick={() => setShowAppModal(true)} style={{ ...btn, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff' }}>
                        Apply Now
                      </button>
                    ) : (
                      <div>
                        <label htmlFor="cover-letter" style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '13px' }}>Cover Letter (optional)</label>
                        <textarea
                          id="cover-letter"
                          style={{ ...inputStyle, minHeight: '100px' }}
                          placeholder="Cover letter (optional)"
                          value={coverLetter}
                          onChange={e => setCoverLetter(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={handleApply} style={{ ...btn, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff' }}>Submit Application</button>
                          <button onClick={() => setShowAppModal(false)} style={{ ...btn, background: '#1e293b', color: '#fff' }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {user.role === 'employer' && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Applicants ({applications.length})</h3>
                {applications.length === 0 ? (
                  <div style={{ color: '#64748b' }}>No applications yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {applications.map(app => (
                      <div key={app.id} style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{app.userName}</div>
                        <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>{app.userEmail}</div>
                        {app.coverLetter && <div style={{ color: '#cbd5e1', fontSize: '14px' }}>{app.coverLetter}</div>}
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
            Select a job to view details
          </div>
        )}
      </div>
    </div>
  );
}
