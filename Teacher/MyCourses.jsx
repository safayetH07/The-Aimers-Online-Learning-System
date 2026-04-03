import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TeacherMyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teacher/courses');
      setCourses(data.courses || []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const togglePublish = async (courseId, current) => {
    try {
      await api.put(`/teacher/courses/${courseId}/publish`, { isPublished: !current });
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isPublished: !current } : c));
      toast.success(current ? 'Course unpublished' : 'Course published! 🎉');
    } catch { toast.error('Failed to update'); }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/teacher/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c._id !== courseId));
      toast.success('Course deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = courses.filter(c => {
    const matchFilter = filter === 'all' || (filter === 'published' ? c.isPublished : !c.isPublished);
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <TeacherLayout title="My Courses" subtitle="Manage your courses and content">

      {/* ── Top Bar ───────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.85rem', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <div className="search-box" style={{ flex:1, minWidth:200 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search courses..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'2.5rem' }} />
        </div>
        <div className="tab-bar" style={{ flexShrink:0 }}>
          {['all','published','draft'].map(f => (
            <button key={f} className={`tab-item ${filter===f?'active':''}`} onClick={() => setFilter(f)}
              style={{ textTransform:'capitalize', padding:'0.45rem 0.85rem', fontSize:'0.8rem' }}>
              {f}
            </button>
          ))}
        </div>
        <Link to="/teacher/courses/create" className="btn btn-accent btn-sm">➕ New Course</Link>
      </div>

      {/* ── Course Table ──────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)', padding:'4rem', textAlign:'center',
        }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📚</div>
          <h3 style={{ marginBottom:'0.5rem' }}>No Courses Found</h3>
          <p style={{ marginBottom:'1.5rem', fontSize:'0.875rem' }}>
            {filter === 'all' ? 'Create your first course to get started.' : `No ${filter} courses yet.`}
          </p>
          <Link to="/teacher/courses/create" className="btn btn-accent">➕ Create Course</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {filtered.map((course, i) => (
            <div key={course._id} className="card animate-slide-up" style={{ animationDelay:`${i*0.05}s` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap' }}>

                {/* Thumbnail */}
                <div style={{
                  width:80, height:62, borderRadius:'var(--radius-md)', flexShrink:0,
                  background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', overflow:'hidden',
                }}>
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : '📚'}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'0.3rem' }}>
                    {course.title}
                  </div>
                  <div style={{ display:'flex', gap:'0.85rem', fontSize:'0.75rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
                    <span>📂 {course.category}</span>
                    <span>📚 {course.subject}</span>
                    <span>📹 {course.totalLessons || 0} lessons</span>
                    <span>👥 {course.totalEnrolled || 0} students</span>
                    <span>⭐ {(course.avgRating||0).toFixed(1)}</span>
                  </div>
                </div>

                {/* Status */}
                <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-yellow'}`}>
                  {course.isPublished ? '✅ Published' : '⏳ Draft'}
                </span>

                {/* Actions */}
                <div style={{ display:'flex', gap:'0.5rem', flexShrink:0, flexWrap:'wrap' }}>
                  <button
                    onClick={() => navigate(`/teacher/courses/${course._id}/manage`)}
                    className="btn btn-secondary btn-sm"
                  >✏️ Manage</button>
                  <button
                    onClick={() => togglePublish(course._id, course.isPublished)}
                    className={`btn btn-sm ${course.isPublished ? 'btn-ghost' : 'btn-primary'}`}
                    style={{ border:'1px solid var(--border)' }}
                  >
                    {course.isPublished ? '📤 Unpublish' : '📢 Publish'}
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/analytics`)}
                    className="btn btn-ghost btn-sm"
                    style={{ border:'1px solid var(--border)' }}
                  >📊</button>
                  <button
                    onClick={() => deleteCourse(course._id)}
                    className="btn btn-danger btn-sm"
                  >🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TeacherLayout>
  );
}