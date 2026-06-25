import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props { token: string; onLogout: () => void }

interface StatData { current: number; previous: number; change: number }
interface Stats { revenue: StatData; users: StatData; activeProjects: StatData; conversionRate: StatData; revenueByMonth: { month: string; revenue: number }[]; usersByPlan: { plan: string; count: number }[]; recentActivity: { action: string; time: string; type: string }[] }
interface OrgData { name?: string; plan?: string; members?: { email: string; role: string }[] }
interface SubData { plan?: string; status?: string; currentPeriodEnd?: number }
interface PlanData { id: string; name: string; price: number; features: string[] }

const COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#eab308'];

export default function Dashboard({ token, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'team' | 'settings'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [sub, setSub] = useState<SubData | null>(null);
  const [plans, setPlans] = useState<PlanData[]>([]);

  const api = useCallback(async <T = unknown>(path: string, opts?: RequestInit): Promise<T> => {
    try {
      const res = await fetch(`/api${path}`, {
        ...opts, headers: { ...opts?.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      return res.json();
    } catch (err) { console.error('API error:', path, err); throw err; }
  }, [token]);

  useEffect(() => {
    api<Stats>('/dashboard/stats').then(setStats).catch(console.error);
    api<OrgData>('/orgs').then(setOrg).catch(console.error);
    api<SubData>('/billing/subscription').then(setSub).catch(console.error);
    api<PlanData[]>('/billing/plans').then(setPlans).catch(console.error);
  }, [api]);

  const StatCard = ({ title, value, change, icon, color }: { title: string; value: string; change?: number; icon: string; color: string }) => (
    <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24, transition: '.3s', cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div><p style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: 8 }}>{title}</p><p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</p></div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={icon}></i></div>
      </div>
      {change !== undefined && <p style={{ color: change >= 0 ? '#22c55e' : '#ef4444', fontSize: '.85rem', marginTop: 8, fontWeight: 500 }}><i className={`fas fa-arrow-${change >= 0 ? 'up' : 'down'}`}></i> {Math.abs(change)}% vs last month</p>}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
    { id: 'billing', label: 'Billing', icon: 'fa-credit-card' },
    { id: 'team', label: 'Team', icon: 'fa-users' },
    { id: 'settings', label: 'Settings', icon: 'fa-gear' },
  ] as const;

  return (
    <div>
      <header style={{ background: '#131c31', borderBottom: '1px solid #1e293b', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SaaS Dashboard</span>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} role="tab" aria-selected={activeTab === t.id} style={{ background: 'none', border: 'none', color: activeTab === t.id ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '.9rem', padding: '20px 0', borderBottom: activeTab === t.id ? '2px solid #6366f1' : '2px solid transparent' }}><i className={`fas ${t.icon}`} aria-hidden="true"></i> {t.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {org && <span style={{ color: '#94a3b8', fontSize: '.85rem' }}>{org.name || 'My Org'}</span>}
            <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: '.85rem' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'overview' && stats && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 20, marginBottom: 32 }}>
              <StatCard title="Revenue" value={`$${stats.revenue.current.toLocaleString()}`} change={stats.revenue.change} icon="fa-dollar-sign" color="#22c55e" />
              <StatCard title="Active Users" value={stats.users.current.toLocaleString()} change={stats.users.change} icon="fa-users" color="#6366f1" />
              <StatCard title="Active Projects" value={String(stats.activeProjects.current)} change={stats.activeProjects.change} icon="fa-folder" color="#06b6d4" />
              <StatCard title="Conversion Rate" value={`${stats.conversionRate.current}%`} change={stats.conversionRate.change} icon="fa-percent" color="#eab308" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 20 }}>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.revenueByMonth}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: 8 }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 20 }}>Users by Plan</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.usersByPlan} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} label={({ plan, percent }) => `${plan} ${(percent * 100).toFixed(0)}%`}>
                      {stats.usersByPlan.map((_, i: number) => <Cell key={String(i)} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginTop: 24 }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Recent Activity</h3>
              {stats.recentActivity.map((a: { action: string; time: string; type: string }, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.recentActivity.length - 1 ? '1px solid #1e293b' : 'none' }}>
                  <span style={{ fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`fas fa-${a.type === 'user' ? 'user-plus' : a.type === 'billing' ? 'credit-card' : a.type === 'project' ? 'folder' : a.type === 'payment' ? 'dollar' : a.type === 'team' ? 'user-friends' : 'key'}`} style={{ color: '#6366f1', width: 16 }}></i>
                    {a.action}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '.8rem' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Billing & Plans</h2>
            <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: '.95rem' }}>Current plan: <strong style={{ color: '#6366f1' }}>{sub?.plan || 'Free'}</strong> {sub?.status === 'active' ? '(Active)' : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
              {plans.map((plan: PlanData) => (
                <div key={plan.id} style={{ background: '#131c31', border: sub?.plan === plan.id ? '2px solid #6366f1' : '1px solid #1e293b', borderRadius: 16, padding: 28, position: 'relative', transition: '.3s' }}>
                  {plan.price === 0 && <span style={{ position: 'absolute', top: 12, right: 12, padding: '2px 10px', borderRadius: 50, background: 'rgba(99,102,241,.1)', color: '#6366f1', fontSize: '.7rem', fontWeight: 600 }}>CURRENT</span>}
                  <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{plan.name}</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 20 }}>${plan.price}<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}>/mo</span></p>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                    {plan.features.map((f, i: number) => (
                      <li key={i} style={{ color: '#94a3b8', fontSize: '.85rem', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fas fa-check" style={{ color: '#22c55e', fontSize: '.8rem' }}></i> {f}
                      </li>
                    ))}
                  </ul>
                  <button disabled={sub?.plan === plan.id} onClick={async () => { await api('/billing/subscribe', { method: 'POST', body: JSON.stringify({ planId: plan.id }) }); const updated = await api<SubData>('/billing/subscription'); setSub(updated); }} style={{ width: '100%', padding: 12, borderRadius: 10, background: sub?.plan === plan.id ? '#1e293b' : '#6366f1', color: sub?.plan === plan.id ? '#64748b' : '#fff', fontWeight: 600, cursor: sub?.plan === plan.id ? 'default' : 'pointer', border: 'none', transition: '.3s' }}>{sub?.plan === plan.id ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Subscribe'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Team Management</h2>
            <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.05rem' }}>Members</h3>
                <button style={{ padding: '10px 20px', borderRadius: 10, background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}><i className="fas fa-plus" aria-hidden="true"></i> Invite</button>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { email: 'admin@example.com', role: 'Admin', initials: 'A' },
                  { email: 'member1@example.com', role: 'Member', initials: 'M' },
                  { email: 'member2@example.com', role: 'Member', initials: 'M' },
                  { email: 'viewer@example.com', role: 'Viewer', initials: 'V' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0b1120', borderRadius: 10, border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.85rem' }}>{m.initials}</div>
                      <div><span style={{ fontSize: '.9rem' }}>{m.email}</span></div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 6, background: m.role === 'Admin' ? 'rgba(99,102,241,.1)' : 'rgba(6,182,212,.1)', color: m.role === 'Admin' ? '#6366f1' : '#06b6d4', fontSize: '.8rem', fontWeight: 500 }}>{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Settings</h2>
            <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Profile</h3>
              <p style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: 20 }}>Update your account details</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.85rem', color: '#94a3b8', marginBottom: 6 }}>Display Name</label>
                <input type="text" defaultValue={org?.name || 'My Organization'} style={{ width: '100%', maxWidth: 400, padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#0b1120', color: '#f1f5f9', fontSize: '.9rem', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.85rem', color: '#94a3b8', marginBottom: 6 }}>Email</label>
                <input type="email" defaultValue="admin@example.com" style={{ width: '100%', maxWidth: 400, padding: '10px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#0b1120', color: '#f1f5f9', fontSize: '.9rem', outline: 'none' }} />
              </div>
              <button style={{ padding: '10px 24px', borderRadius: 8, background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}>Save Changes</button>
            </div>
            <div style={{ background: '#131c31', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Notifications</h3>
              <p style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: 16 }}>Manage your notification preferences</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', marginBottom: 12 }}><input type="checkbox" defaultChecked /> Email notifications</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', marginBottom: 12 }}><input type="checkbox" defaultChecked /> Push notifications</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem' }}><input type="checkbox" /> SMS alerts</label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
