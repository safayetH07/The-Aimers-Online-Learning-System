import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import api from '../../services/api';
import { EXAM_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function TeacherExams() {
  const navigate = useNavigate();
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teacher/exams');
      setExams(data.exams || []);
    } catch { setExams([]); }
    finally { setLoading(false); }
  };

  const deleteExam = async (examId) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await api.delete(`/teacher/exams/${examId}`);
      setExams(prev => prev.filter(e => e._id !== examId));
      toast.success('Exam deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = exams.filter(e =>
    !search || e.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TeacherLayout title="Exams" subtitle="Manage MCQ exams for your courses">

      {/* Top Bar */}
      <div style={{ display:'flex', gap:'0.85rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <div className="search-box" style={{ flex:1, minWidth:200 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search exams..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'2.5rem' }} />
        </div>
        <Link to="/teacher/exams/create" className="btn btn-accent btn-sm">➕ Create Exam</Link>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[
          { icon:'📝', label:'Total Exams',   value: exams.length,                                        color:'#2a9dff' },
          { icon:'📋', label:'Chapter Exams', value: exams.filter(e=>e.type==='chapter').length,           color:'#f97316' },
          { icon:'📚', label:'Full Course',   value: exams.filter(e=>e.type==='full_course').length,       color:'#a855f7' },
          { icon:'👥', label:'Total Attempts',value: exams.reduce((s,e) => s+(e.totalAttempts||0),0),      color:'#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{
            flex:1, minWidth:140,
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-lg)', padding:'1rem',
            display:'flex', alignItems:'center', gap:'0.75rem',
          }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:700, color:'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Exam List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)', padding:'4rem', textAlign:'center',
        }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📝</div>
          <h3 style={{ marginBottom:'0.5rem' }}>No Exams Yet</h3>
          <p style={{ marginBottom:'1.5rem', fontSize:'0.875rem' }}>Create MCQ exams for your courses to help students prepare.</p>
          <Link to="/teacher/exams/create" className="btn btn-accent">➕ Create First Exam</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          {filtered.map((exam, i) => {
            const qCount = exam.type === 'chapter'
              ? EXAM_CONFIG.CHAPTER_MCQ_COUNT
              : EXAM_CONFIG.FULL_COURSE_MCQ_COUNT;
            const typeColor = exam.type === 'chapter' ? '#2a9dff' : '#f97316';
            const typeBg    = exam.type === 'chapter' ? 'rgba(42,157,255,0.1)' : 'rgba(249,115,22,0.1)';
            return (
              <div key={exam._id} className="card animate-slide-up" style={{ animationDelay:`${i*0.05}s`, display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap' }}>
                <div style={{
                  width:48, height:48, borderRadius:'var(--radius-md)', flexShrink:0,
                  background: typeBg, border:`1px solid ${typeColor}30`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem',
                }}>📝</div>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.9rem', marginBottom:'0.25rem' }}>
                    {exam.title}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', gap:'0.85rem', flexWrap:'wrap' }}>
                    <span>📚 {exam.course?.title || '—'}</span>
                    <span style={{ color: typeColor }}>
                      {exam.type === 'chapter' ? '📋 Chapter Exam' : '📚 Full Course'}
                    </span>
                    <span>❓ {exam.questions?.length || qCount} questions</span>
                    <span>👥 {exam.totalAttempts || 0} attempts</span>
                  </div>
                </div>

                {exam.avgScore > 0 && (
                  <div style={{ textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'#fbbf24' }}>
                      {exam.avgScore?.toFixed(0)}%
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Avg Score</div>
                  </div>
                )}

                <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                  <button
                    onClick={() => navigate(`/teacher/exams/create?examId=${exam._id}`)}
                    className="btn btn-secondary btn-sm"
                  >✏️ Edit</button>
                  <button onClick={() => deleteExam(exam._id)} className="btn btn-danger btn-sm">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </TeacherLayout>
  );
}