import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

export default function AdminReports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('month');
  const [tab,     setTab]     = useState('overview');

  useEffect(() => { load(); }, [period]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/admin/reports?period=${period}`);
      setData(res);
    } catch {
      setData({
        overview: { newUsers:0, newEnrollments:0, lessonsWatched:0, examsTaken:0, avgExamScore:0 },
        topCourses:  [],
        topTeachers: [],
        topStudents: [],
        examStats:   [],
        categoryBreakdown: [],
      });
    } finally { setLoading(false); }
  };

  const ov   = data?.overview          || {};
  const tc   = data?.topCourses        || [];
  const tt   = data?.topTeachers       || [];
  const ts   = data?.topStudents       || [];
  const es   = data?.examStats         || [];
  const cb   = data?.categoryBreakdown || [];
  const maxCb = Math.max(...cb.map(c => c.count || 0), 1);

  const tabs = [
    { key:'overview',  label:'📊 Overview'      },
    { key:'courses',   label:'📚 Top Courses'   },
    { key:'teachers',  label:'👨‍🏫 Top Teachers' },
    { key:'students',  label:'👨‍🎓 Top Students' },
    { key:'exams',     label:'📝 Exam Stats'    },
    { key:'category',  label:'🗂 Categories'    },
  ];

  return (
    <AdminLayout title="Reports & Analytics" subtitle="Platform performance and insights">

      {/* Period + Tab controls */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div className="tab-bar" style={{ flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} className={`tab-item ${tab===t.key?'active':''}`}
              onClick={() => setTab(t.key)}
              style={{ padding:'0.42rem 0.85rem', fontSize:'0.8rem', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.4rem' }}>
          {['week','month','year','all'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`btn btn-sm ${period===p?'btn-primary':'btn-ghost'}`}
              style={{ border:'1px solid var(--border)', fontSize:'0.75rem' }}>
              {p === 'all' ? 'All Time' : `This ${p.charAt(0).toUpperCase()+p.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
      ) : (
        <>
          {/* ── Overview Tab ────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'1rem' }}>
                {[
                  { icon:'👥', label:'New Users',         value: ov.newUsers          ?? 0, color:'#2a9dff' },
                  { icon:'🎯', label:'New Enrollments',   value: ov.newEnrollments    ?? 0, color:'#22c55e' },
                  { icon:'▶️', label:'Lessons Watched',   value: ov.lessonsWatched    ?? 0, color:'#f97316' },
                  { icon:'📝', label:'Exams Taken',       value: ov.examsTaken        ?? 0, color:'#a855f7' },
                  { icon:'⭐', label:'Avg Exam Score',    value:`${ov.avgExamScore??0}%`, color:'#fbbf24' },
                ].map((s, i) => (
                  <div key={i} className="stat-card animate-slide-up" style={{ animationDelay:`${i*0.07}s` }}>
                    <div className="stat-icon" style={{ background:`${s.color}15` }}><span>{s.icon}</span></div>
                    <div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Breakdown quick view */}
              {cb.length > 0 && (
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.5rem' }}>
                  <h3 style={{ marginBottom:'1.25rem', fontSize:'1rem' }}>🗂 Enrollments by Category</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                    {cb.map(cat => (
                      <div key={cat.category} style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
                        <div style={{ width:100, fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:500, flexShrink:0 }}>{cat.category}</div>
                        <div className="progress-bar" style={{ flex:1 }}>
                          <div className="progress-fill" style={{ width:`${(cat.count/maxCb)*100}%`, background:'linear-gradient(90deg,#a855f7,#c084fc)' }} />
                        </div>
                        <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', flexShrink:0, width:36, textAlign:'right' }}>{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Top Courses Tab ──────────────────────────────────────── */}
          {tab === 'courses' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>#</th><th>Course</th><th>Teacher</th><th>Category</th><th>Enrollments</th><th>Lessons</th><th>Rating</th><th>Completion</th></tr>
                </thead>
                <tbody>
                  {tc.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No data available</td></tr>
                    : tc.map((c, i) => (
                      <tr key={c._id}>
                        <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
                          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color: i<3 ? ['#fbbf24','#94a3b8','#f97316'][i] : 'var(--text-muted)', fontSize: i<3 ? '1rem' : '0.8rem' }}>
                            {i<3 ? ['🥇','🥈','🥉'][i] : i+1}
                          </span>
                        </td>
                        <td style={{ color:'var(--text-primary)', fontWeight:600, fontSize:'0.875rem', maxWidth:200 }}>{c.title}</td>
                        <td style={{ fontSize:'0.8rem' }}>{c.teacher?.name || '—'}</td>
                        <td><span className="badge badge-purple" style={{ fontSize:'0.65rem' }}>{c.category}</span></td>
                        <td><span className="badge badge-blue">{c.totalEnrolled||0}</span></td>
                        <td style={{ fontSize:'0.8rem' }}>{c.totalLessons||0}</td>
                        <td style={{ color:'#fbbf24', fontWeight:600 }}>⭐ {(c.avgRating||0).toFixed(1)}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                            <div className="progress-bar" style={{ width:60 }}>
                              <div className="progress-fill" style={{ width:`${c.completionRate||0}%` }} />
                            </div>
                            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{c.completionRate||0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* ── Top Teachers Tab ─────────────────────────────────────── */}
          {tab === 'teachers' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>#</th><th>Teacher</th><th>Email</th><th>Courses</th><th>Students</th><th>Avg Rating</th><th>Total Lessons</th></tr>
                </thead>
                <tbody>
                  {tt.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No data available</td></tr>
                    : tt.map((t, i) => (
                      <tr key={t._id}>
                        <td style={{ fontFamily:'var(--font-display)', fontWeight:700, color: i<3 ? ['#fbbf24','#94a3b8','#f97316'][i] : 'var(--text-muted)', fontSize: i<3 ? '1rem' : '0.8rem' }}>
                          {i<3 ? ['🥇','🥈','🥉'][i] : i+1}
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                            <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize:'0.7rem', background:'linear-gradient(135deg,#f97316,#ea580c)', flexShrink:0 }}>
                              {t.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>{t.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{t.email}</td>
                        <td><span className="badge badge-orange">{t.totalCourses||0}</span></td>
                        <td><span className="badge badge-blue">{t.totalStudents||0}</span></td>
                        <td style={{ color:'#fbbf24', fontWeight:600 }}>⭐ {(t.avgRating||0).toFixed(1)}</td>
                        <td style={{ fontSize:'0.8rem' }}>{t.totalLessons||0}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* ── Top Students Tab ─────────────────────────────────────── */}
          {tab === 'students' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>Level</th><th>Enrolled</th><th>Completed</th><th>Exams Taken</th><th>Avg Score</th></tr>
                </thead>
                <tbody>
                  {ts.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No data available</td></tr>
                    : ts.map((s, i) => (
                      <tr key={s._id}>
                        <td style={{ fontFamily:'var(--font-display)', fontWeight:700, color: i<3 ? ['#fbbf24','#94a3b8','#f97316'][i] : 'var(--text-muted)' }}>
                          {i<3 ? ['🥇','🥈','🥉'][i] : i+1}
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                            <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize:'0.7rem', flexShrink:0 }}>
                              {s.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{s.level || '—'}</td>
                        <td><span className="badge badge-blue">{s.enrolled||0}</span></td>
                        <td><span className="badge badge-green">{s.completed||0}</span></td>
                        <td><span className="badge badge-purple">{s.examsTaken||0}</span></td>
                        <td style={{ fontWeight:700, color: (s.avgScore||0) >= 50 ? '#4ade80' : '#f87171' }}>
                          {(s.avgScore||0).toFixed(0)}%
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* ── Exam Stats Tab ───────────────────────────────────────── */}
          {tab === 'exams' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Exam</th><th>Course</th><th>Type</th><th>Attempts</th><th>Avg Score</th><th>Pass Rate</th></tr>
                </thead>
                <tbody>
                  {es.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No exam data yet</td></tr>
                    : es.map(e => {
                        const passColor = (e.passRate||0) >= 50 ? '#4ade80' : '#f87171';
                        return (
                          <tr key={e._id}>
                            <td style={{ color:'var(--text-primary)', fontWeight:500, fontSize:'0.875rem' }}>{e.title}</td>
                            <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{e.course?.title || '—'}</td>
                            <td>
                              <span className={`badge ${e.type==='chapter' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize:'0.68rem' }}>
                                {e.type === 'chapter' ? 'Chapter' : 'Full Course'}
                              </span>
                            </td>
                            <td><span className="badge badge-purple">{e.totalAttempts||0}</span></td>
                            <td style={{ fontWeight:700, color:'#fbbf24' }}>{(e.avgScore||0).toFixed(0)}%</td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                <div className="progress-bar" style={{ width:60 }}>
                                  <div className="progress-fill" style={{ width:`${e.passRate||0}%`, background:`linear-gradient(90deg,${passColor},${passColor}cc)` }} />
                                </div>
                                <span style={{ fontSize:'0.75rem', color: passColor, fontWeight:700 }}>{(e.passRate||0).toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* ── Category Tab ─────────────────────────────────────────── */}
          {tab === 'category' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
              {cb.length === 0 ? (
                <div className="empty-state" style={{ gridColumn:'1/-1' }}>
                  <div className="empty-state-icon">🗂</div>
                  <h3>No Category Data</h3>
                </div>
              ) : cb.map((cat, i) => (
                <div key={i} className="card animate-slide-up" style={{ animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                    <div style={{ width:42, height:42, borderRadius:12, background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
                      {cat.category?.includes('SSC') ? '📘' : cat.category?.includes('HSC') ? '🎓' : '📚'}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{cat.category || 'Unknown'}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{cat.courses||0} courses</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Enrollments</span>
                    <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-primary)' }}>{cat.count||0}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${(cat.count/maxCb)*100}%`, background:'linear-gradient(90deg,#a855f7,#c084fc)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}