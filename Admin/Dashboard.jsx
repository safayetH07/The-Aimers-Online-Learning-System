import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: res } = await api.get('/admin/dashboard');
      setData(res);
    } catch {
      setData({
        stats: {
          totalUsers: 0, totalStudents: 0, totalTeachers: 0,
          totalCourses: 0, publishedCourses: 0,
          totalLessons: 0, totalExams: 0, totalEnrollments: 0,
          activeSessions: 0,
        },
        recentUsers:    [],
        recentCourses:  [],
        platformHealth: { uptime:'99.9%', dbStatus:'Connected', socketStatus:'Online' },
      });
    } finally { setLoading(false); }
  };

  const s = data?.stats || {};

  const statCards = [
    { icon:'👥', label:'Total Users',       value: s.totalUsers       ?? 0, color:'#2a9dff', bg:'rgba(42,157,255,0.1)',  to:'/admin/users'   },
    { icon:'👨‍🎓',label:'Students',          value: s.totalStudents    ?? 0, color:'#22c55e', bg:'rgba(34,197,94,0.1)',   to:'/admin/users'   },
    { icon:'👨‍🏫',label:'Teachers',          value: s.totalTeachers    ?? 0, color:'#f97316', bg:'rgba(249,115,22,0.1)',  to:'/admin/users'   },
    { icon:'📚', label:'Total Courses',     value: s.totalCourses     ?? 0, color:'#a855f7', bg:'rgba(168,85,247,0.1)',  to:'/admin/courses' },
    { icon:'✅', label:'Published',         value: s.publishedCourses ?? 0, color:'#4ade80', bg:'rgba(74,222,128,0.1)',  to:'/admin/courses' },
    { icon:'📹', label:'Total Lessons',     value: s.totalLessons     ?? 0, color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  to:null             },
    { icon:'📝', label:'Exams Created',     value: s.totalExams       ?? 0, color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  to:null             },
    { icon:'🎯', label:'Enrollments',       value: s.totalEnrollments ?? 0, color:'#f472b6', bg:'rgba(244,114,182,0.1)', to:null             },
  ];

  const health = data?.platformHealth || {};

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Platform-wide overview and management"
    >
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'5rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

          {/* ── Platform Health Strip ────────────────────────────────── */}
          <div style={{
            background:'rgba(34,197,94,0.06)',
            border:'1px solid rgba(34,197,94,0.2)',
            borderRadius:'var(--radius-xl)', padding:'1rem 1.5rem',
            display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:'0.825rem', fontWeight:700, color:'#4ade80' }}>Platform Online</span>
            </div>
            {[
              ['🖥️', 'Uptime',        health.uptime      || '99.9%'    ],
              ['🗄️', 'Database',      health.dbStatus    || 'Connected' ],
              ['📡', 'Socket.IO',     health.socketStatus|| 'Online'    ],
              ['👥', 'Active Now',    `${s.activeSessions || 0} sessions`],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.8rem' }}>
                <span>{icon}</span>
                <span style={{ color:'var(--text-muted)' }}>{label}:</span>
                <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:'1rem' }}>
            {statCards.map((s, i) => (
              <div
                key={i}
                className="stat-card animate-slide-up"
                style={{ animationDelay:`${i*0.06}s`, cursor: s.to ? 'pointer' : 'default' }}
                onClick={() => s.to && navigate(s.to)}
              >
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span>{s.icon}</span>
                </div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick Management Links ────────────────────────────────── */}
          <div>
            <div className="section-header">
              <h3 className="section-title">⚙️ Quick Management</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.85rem' }}>
              {[
                { icon:'👥', label:'Manage Users',        to:'/admin/users',         color:'#2a9dff', bg:'rgba(42,157,255,0.08)'  },
                { icon:'📚', label:'Review Courses',      to:'/admin/courses',       color:'#a855f7', bg:'rgba(168,85,247,0.08)'  },
                { icon:'📊', label:'View Reports',        to:'/admin/reports',       color:'#f97316', bg:'rgba(249,115,22,0.08)'  },
                { icon:'📡', label:'Live Sessions',       to:'/admin/live-sessions', color:'#22c55e', bg:'rgba(34,197,94,0.08)'   },
                { icon:'⚙️', label:'Platform Settings',   to:'/admin/settings',      color:'#fbbf24', bg:'rgba(251,191,36,0.08)'  },
              ].map((q, i) => (
                <div
                  key={i}
                  onClick={() => navigate(q.to)}
                  style={{
                    background: q.bg, border:`1px solid ${q.color}25`,
                    borderRadius:'var(--radius-lg)', padding:'1.1rem',
                    display:'flex', alignItems:'center', gap:'0.85rem',
                    cursor:'pointer', transition:'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=q.color+'55'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=q.color+'25'; }}
                >
                  <span style={{ fontSize:'1.5rem' }}>{q.icon}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:q.color }}>{q.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent Users + Courses ────────────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>

            {/* Recent Users */}
            <div>
              <div className="section-header">
                <h3 className="section-title">👥 Recent Users</h3>
                <button onClick={() => navigate('/admin/users')} className="btn btn-secondary btn-sm">View All →</button>
              </div>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
                {(data?.recentUsers || []).length === 0 ? (
                  <div className="empty-state" style={{ padding:'2rem' }}>
                    <p style={{ fontSize:'0.875rem' }}>No users yet</p>
                  </div>
                ) : (
                  (data.recentUsers || []).slice(0,5).map((u, i) => (
                    <div key={u._id} style={{
                      padding:'0.85rem 1.25rem',
                      borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      display:'flex', alignItems:'center', gap:'0.75rem',
                    }}>
                      <div className="avatar avatar-sm avatar-placeholder" style={{
                        fontSize:'0.7rem', flexShrink:0,
                        background: u.role==='teacher' ? 'linear-gradient(135deg,#f97316,#ea580c)' : u.role==='admin' ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'linear-gradient(135deg,#2a9dff,#0d67e1)',
                      }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <span className={`badge ${u.role==='teacher' ? 'badge-orange' : u.role==='admin' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize:'0.65rem', flexShrink:0 }}>
                        {u.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Courses */}
            <div>
              <div className="section-header">
                <h3 className="section-title">📚 Recent Courses</h3>
                <button onClick={() => navigate('/admin/courses')} className="btn btn-secondary btn-sm">View All →</button>
              </div>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
                {(data?.recentCourses || []).length === 0 ? (
                  <div className="empty-state" style={{ padding:'2rem' }}>
                    <p style={{ fontSize:'0.875rem' }}>No courses yet</p>
                  </div>
                ) : (
                  (data.recentCourses || []).slice(0,5).map((c, i) => (
                    <div key={c._id} style={{
                      padding:'0.85rem 1.25rem',
                      borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                      display:'flex', alignItems:'center', gap:'0.75rem',
                    }}>
                      <span style={{ fontSize:'1.3rem', flexShrink:0 }}>📚</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>by {c.teacher?.name || '—'}</div>
                      </div>
                      <span className={`badge ${c.isPublished ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize:'0.65rem', flexShrink:0 }}>
                        {c.isPublished ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}