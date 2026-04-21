import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { SUBJECT_ICONS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page,    setPage]      = useState(1);
  const PER_PAGE = 12;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/courses');
      setCourses(data.courses || []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const togglePublish = async (courseId, current) => {
    try {
      await api.put(`/admin/courses/${courseId}/publish`, { isPublished: !current });
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isPublished: !current } : c));
      toast.success(current ? 'Course unpublished' : 'Course published ✅');
      if (selected?._id === courseId) setSelected(p => ({ ...p, isPublished: !current }));
    } catch { toast.error('Action failed'); }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Permanently delete this course and all its content?')) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c._id !== courseId));
      toast.success('Course deleted');
      if (selected?._id === courseId) setSelected(null);
    } catch { toast.error('Delete failed'); }
  };

  /* ── Filter ───────────────────────────────────────────────────────────── */
  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];

  const filtered = courses.filter(c => {
    const matchSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter    === 'all' || c.category === catFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'published' ? c.isPublished : !c.isPublished);
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const counts = {
    total:     courses.length,
    published: courses.filter(c => c.isPublished).length,
    draft:     courses.filter(c => !c.isPublished).length,
  };

  return (
    <AdminLayout title="Course Management" subtitle={`${courses.length} total courses`}>

      {/* ── Summary ───────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { icon:'📚', label:'Total Courses',  value:counts.total,     color:'#a855f7' },
          { icon:'✅', label:'Published',      value:counts.published, color:'#22c55e' },
          { icon:'⏳', label:'Drafts',         value:counts.draft,     color:'#f59e0b' },
          { icon:'🎯', label:'Total Enrollments', value: courses.reduce((s,c) => s+(c.totalEnrolled||0),0), color:'#2a9dff' },
        ].map((s, i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1rem', display:'flex', alignItems:'center', gap:'0.65rem' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
        <div className="search-box" style={{ flex:1, minWidth:220 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by title or teacher..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft:'2.5rem' }} />
        </div>
        <select className="form-input form-select" style={{ width:150, flexShrink:0 }}
          value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <div className="tab-bar" style={{ flexShrink:0 }}>
          {[['all','All'],['published','Published'],['draft','Drafts']].map(([v,l]) => (
            <button key={v} className={`tab-item ${statusFilter===v?'active':''}`}
              onClick={() => { setStatusFilter(v); setPage(1); }}
              style={{ padding:'0.42rem 0.75rem', fontSize:'0.78rem' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Course Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
      ) : paginated.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No Courses Found</h3>
          <p style={{ fontSize:'0.875rem' }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
            {paginated.map((course, i) => (
              <div key={course._id} className="card animate-slide-up" style={{ animationDelay:`${i*0.04}s`, display:'flex', flexDirection:'column', gap:'1rem' }}>

                {/* Thumb */}
                <div style={{
                  height:140, borderRadius:'var(--radius-md)', overflow:'hidden',
                  background:'linear-gradient(135deg,rgba(168,85,247,0.08),var(--bg-elevated))',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem',
                  position:'relative', flexShrink:0,
                }}>
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span>{SUBJECT_ICONS[course.subject] || '📖'}</span>
                  }
                  <div style={{ position:'absolute', top:'0.5rem', right:'0.5rem' }}>
                    <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize:'0.65rem' }}>
                      {course.isPublished ? '✅ Live' : '⏳ Draft'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex:1 }}>
                  <h4 style={{ fontSize:'0.9rem', marginBottom:'0.3rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {course.title}
                  </h4>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.65rem' }}>
                    👨‍🏫 {course.teacher?.name || '—'} &nbsp;•&nbsp; 📂 {course.category}
                  </div>
                  <div style={{ display:'flex', gap:'0.65rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    <span>📹 {course.totalLessons||0} lessons</span>
                    <span>👥 {course.totalEnrolled||0} students</span>
                    <span>⭐ {(course.avgRating||0).toFixed(1)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:'0.45rem', flexWrap:'wrap' }}>
                  <button onClick={() => setSelected(course)} className="btn btn-ghost btn-sm" style={{ border:'1px solid var(--border)', flex:1 }}>
                    👁 View
                  </button>
                  <button
                    onClick={() => togglePublish(course._id, course.isPublished)}
                    className={`btn btn-sm ${course.isPublished ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ flex:1 }}
                  >
                    {course.isPublished ? '📤 Unpublish' : '📢 Publish'}
                  </button>
                  <button onClick={() => deleteCourse(course._id)} className="btn btn-danger btn-sm">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', gap:'0.4rem', justifyContent:'center', marginTop:'1.5rem' }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn btn-ghost btn-sm" style={{ border:'1px solid var(--border)' }}>← Prev</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`btn btn-sm ${page===n?'btn-primary':'btn-ghost'}`}
                  style={{ border:'1px solid var(--border)', minWidth:36 }}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn btn-ghost btn-sm" style={{ border:'1px solid var(--border)' }}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* ── Course Detail Modal ────────────────────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding:'2rem', maxWidth:560 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3>📚 Course Details</h3>
              <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-lg)' }}>
              <div style={{ width:60, height:60, borderRadius:'var(--radius-md)', background:'rgba(168,85,247,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>
                {SUBJECT_ICONS[selected.subject] || '📖'}
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem', color:'var(--text-primary)', marginBottom:'0.3rem' }}>{selected.title}</div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                  <span className="badge badge-purple" style={{ fontSize:'0.68rem' }}>{selected.category}</span>
                  <span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{selected.subject}</span>
                  <span className={`badge ${selected.isPublished?'badge-green':'badge-yellow'}`} style={{ fontSize:'0.68rem' }}>
                    {selected.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem', marginBottom:'1.5rem' }}>
              {[
                ['👨‍🏫','Teacher',   selected.teacher?.name || '—'],
                ['📹', 'Lessons',   selected.totalLessons  || 0],
                ['👥', 'Students',  selected.totalEnrolled || 0],
                ['⭐', 'Rating',    (selected.avgRating||0).toFixed(1)],
                ['📝', 'Ratings',   selected.totalRatings  || 0],
                ['📅', 'Created',   selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-GB') : '—'],
              ].map(([icon,label,val]) => (
                <div key={label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'0.65rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'1rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.05em' }}>{label}</div>
                    <div style={{ fontSize:'0.875rem', color:'var(--text-primary)', fontWeight:600 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {selected.description && (
              <p style={{ fontSize:'0.85rem', lineHeight:1.6, marginBottom:'1.5rem', color:'var(--text-secondary)', background:'var(--bg-elevated)', padding:'0.85rem', borderRadius:'var(--radius-md)' }}>
                {selected.description}
              </p>
            )}

            <div style={{ display:'flex', gap:'0.65rem' }}>
              <button onClick={() => togglePublish(selected._id, selected.isPublished)}
                className={`btn ${selected.isPublished ? 'btn-secondary' : 'btn-primary'}`} style={{ flex:1 }}>
                {selected.isPublished ? '📤 Unpublish' : '📢 Publish'}
              </button>
              <button onClick={() => { deleteCourse(selected._id); setSelected(null); }} className="btn btn-danger">🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}