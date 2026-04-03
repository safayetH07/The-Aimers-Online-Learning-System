import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function TeacherDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: res } = await api.get('/teacher/dashboard');
      setData(res);
    } catch {
      setData({
        stats: { totalCourses:0, totalStudents:0, totalLessons:0, avgRating:0, totalExams:0 },
        recentCourses: [],
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};

  const statCards = [
    { icon:'📚', label:'Total Courses',   value: stats.totalCourses  ?? 0, color:'#2a9dff', bg:'rgba(42,157,255,0.1)',  to:'/teacher/courses'  },
    { icon:'👨‍🎓',label:'Total Students',  value: stats.totalStudents ?? 0, color:'#22c55e', bg:'rgba(34,197,94,0.1)',   to:null                },
    { icon:'📹', label:'Total Lessons',   value: stats.totalLessons  ?? 0, color:'#f97316', bg:'rgba(249,115,22,0.1)',  to:null                },
    { icon:'⭐', label:'Avg Rating',      value: (stats.avgRating||0).toFixed(1), color:'#fbbf24', bg:'rgba(251,191,36,0.1)', to:null           },
    { icon:'📝', label:'Total Exams',     value: stats.totalExams    ?? 0, color:'#a855f7', bg:'rgba(168,85,247,0.1)',  to:'/teacher/exams'    },
  ];

  return (
    <TeacherLayout
      title={`Hello, ${user?.name?.split(' ')[0] || 'Teacher'}! 👋`}
      subtitle="Here's your teaching overview"
    >
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'5rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div className="grid-stats">
            {statCards.map((s, i) => (
              <div
                key={i}
                className="stat-card animate-slide-up"
                style={{ animationDelay:`${i*0.08}s`, cursor: s.to ? 'pointer' : 'default' }}
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

          {/* ── Quick Actions ─────────────────────────────────────────── */}
          <div>
            <div className="section-header">
              <h3 className="section-title">Quick Actions</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:'0.85rem' }}>
              {[
                { icon:'➕', label:'Create Course',      to:'/teacher/courses/create',  color:'#f97316', bg:'rgba(249,115,22,0.08)'  },
                { icon:'📝', label:'Create Exam',        to:'/teacher/exams/create',    color:'#2a9dff', bg:'rgba(42,157,255,0.08)'  },
                { icon:'📡', label:'Start Live Session', to:'/teacher/live-sessions',   color:'#22c55e', bg:'rgba(34,197,94,0.08)'   },
                { icon:'📊', label:'View Analytics',     to:'/teacher/analytics',       color:'#a855f7', bg:'rgba(168,85,247,0.08)'  },
              ].map((q, i) => (
                <Link key={i} to={q.to} style={{ textDecoration:'none' }}>
                  <div
                    style={{
                      background: q.bg,
                      border:`1px solid ${q.color}25`,
                      borderRadius:'var(--radius-lg)',
                      padding:'1.25rem',
                      display:'flex', flexDirection:'column', alignItems:'center',
                      gap:'0.6rem', textAlign:'center',
                      cursor:'pointer', transition:'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=q.color+'60'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=q.color+'25'; }}
                  >
                    <span style={{ fontSize:'1.75rem' }}>{q.icon}</span>
                    <span style={{ fontSize:'0.8rem', fontWeight:600, color:q.color }}>{q.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recent Courses ────────────────────────────────────────── */}
          <div>
            <div className="section-header">
              <h3 className="section-title">My Courses</h3>
              <Link to="/teacher/courses" className="btn btn-secondary btn-sm">View All →</Link>
            </div>

            {(data?.recentCourses || []).length === 0 ? (
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-xl)', padding:'3rem', textAlign:'center',
              }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📚</div>
                <h3 style={{ marginBottom:'0.5rem' }}>No Courses Yet</h3>
                <p style={{ marginBottom:'1.5rem', fontSize:'0.875rem' }}>
                  Create your first course to start teaching students.
                </p>
                <Link to="/teacher/courses/create" className="btn btn-accent">
                  ➕ Create Your First Course
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                {(data?.recentCourses || []).slice(0,5).map((course, i) => (
                  <div key={course._id} className="card animate-slide-up" style={{ animationDelay:`${i*0.06}s`, display:'flex', alignItems:'center', gap:'1.25rem' }}>
                    <div style={{
                      width:52, height:52, borderRadius:'var(--radius-md)',
                      background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0,
                    }}>📚</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.9rem', marginBottom:'0.2rem',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {course.title}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', gap:'1rem' }}>
                        <span>👥 {course.totalEnrolled || 0} students</span>
                        <span>📹 {course.totalLessons || 0} lessons</span>
                        <span>⭐ {(course.avgRating||0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                      <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-yellow'}`}>
                        {course.isPublished ? '✅ Published' : '⏳ Draft'}
                      </span>
                      <button
                        onClick={() => navigate(`/teacher/courses/${course._id}/manage`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent Activity ───────────────────────────────────────── */}
          {(data?.recentActivity || []).length > 0 && (
            <div>
              <div className="section-header">
                <h3 className="section-title">Recent Activity</h3>
              </div>
              <div style={{
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-xl)', overflow:'hidden',
              }}>
                {data.recentActivity.map((act, i) => (
                  <div key={i} style={{
                    padding:'0.9rem 1.25rem',
                    borderBottom: i < data.recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                    display:'flex', alignItems:'center', gap:'0.75rem',
                  }}>
                    <span style={{ fontSize:'1.1rem' }}>{act.icon || '📌'}</span>
                    <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)', flex:1 }}>{act.text}</span>
                    <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </TeacherLayout>
  );
}