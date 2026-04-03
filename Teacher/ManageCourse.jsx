import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [course,   setCourse]   = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // Chapter form
  const [newChapTitle, setNewChapTitle] = useState('');
  const [addingChap,   setAddingChap]   = useState(false);
  const [savingChap,   setSavingChap]   = useState(false);

  // Lesson form state: { [chapterId]: { open, form } }
  const [lessonForms, setLessonForms] = useState({});

  useEffect(() => { load(); }, [courseId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/teacher/courses/${courseId}`);
      setCourse(data.course);
      setChapters(data.chapters || []);
    } catch {
      toast.error('Course not found');
      navigate('/teacher/courses');
    } finally { setLoading(false); }
  };

  /* ── Add Chapter ─────────────────────────────────────────────────────────── */
  const addChapter = async () => {
    if (!newChapTitle.trim()) { toast.error('Chapter title required'); return; }
    setSavingChap(true);
    try {
      const { data } = await api.post(`/teacher/courses/${courseId}/chapters`, { title: newChapTitle });
      setChapters(prev => [...prev, { ...data.chapter, lessons: [] }]);
      setNewChapTitle('');
      setAddingChap(false);
      toast.success('Chapter added ✅');
    } catch { toast.error('Failed to add chapter'); }
    finally { setSavingChap(false); }
  };

  const deleteChapter = async (chapId) => {
    if (!window.confirm('Delete this chapter and all its lessons?')) return;
    try {
      await api.delete(`/teacher/courses/${courseId}/chapters/${chapId}`);
      setChapters(prev => prev.filter(c => c._id !== chapId));
      toast.success('Chapter deleted');
    } catch { toast.error('Delete failed'); }
  };

  /* ── Lesson form helpers ─────────────────────────────────────────────────── */
  const openLessonForm = (chapId) => {
    setLessonForms(prev => ({
      ...prev,
      [chapId]: { open: true, form: { title:'', videoUrl:'', description:'', duration:'', instructor:'' } },
    }));
  };

  const closeLessonForm = (chapId) => {
    setLessonForms(prev => ({ ...prev, [chapId]: { open: false, form:{} } }));
  };

  const updateLessonField = (chapId, field, value) => {
    setLessonForms(prev => ({
      ...prev,
      [chapId]: { ...prev[chapId], form: { ...prev[chapId].form, [field]: value } },
    }));
  };

  const addLesson = async (chapId) => {
    const lf = lessonForms[chapId]?.form;
    if (!lf?.title?.trim())    { toast.error('Lesson title required');    return; }
    if (!lf?.videoUrl?.trim()) { toast.error('YouTube video URL required'); return; }
    try {
      const { data } = await api.post(
        `/teacher/courses/${courseId}/chapters/${chapId}/lessons`,
        lf
      );
      setChapters(prev => prev.map(ch =>
        ch._id === chapId
          ? { ...ch, lessons: [...(ch.lessons || []), data.lesson] }
          : ch
      ));
      closeLessonForm(chapId);
      toast.success('Lesson added 🎬');
    } catch { toast.error('Failed to add lesson'); }
  };

  const deleteLesson = async (chapId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/teacher/courses/${courseId}/chapters/${chapId}/lessons/${lessonId}`);
      setChapters(prev => prev.map(ch =>
        ch._id === chapId
          ? { ...ch, lessons: ch.lessons.filter(l => l._id !== lessonId) }
          : ch
      ));
      toast.success('Lesson deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <TeacherLayout title="Manage Course">
      <div style={{ display:'flex', justifyContent:'center', padding:'5rem' }}><div className="spinner" /></div>
    </TeacherLayout>
  );

  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

  return (
    <TeacherLayout title={course?.title || 'Manage Course'} subtitle="Add chapters and video lessons">
      <div style={{ maxWidth:820, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* ── Course Summary ────────────────────────────────────────────── */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-xl)', padding:'1.25rem',
          display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap',
        }}>
          <div style={{
            width:52, height:52, borderRadius:'var(--radius-md)',
            background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0,
          }}>📚</div>
          <div style={{ flex:1, minWidth:160 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text-primary)', marginBottom:'0.2rem' }}>
              {course?.title}
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', display:'flex', gap:'1rem' }}>
              <span>📂 {course?.category}</span>
              <span>📚 {course?.subject}</span>
              <span>📋 {chapters.length} chapters</span>
              <span>📹 {totalLessons} lessons</span>
            </div>
          </div>
          <span className={`badge ${course?.isPublished ? 'badge-green' : 'badge-yellow'}`}>
            {course?.isPublished ? '✅ Published' : '⏳ Draft'}
          </span>
        </div>

        {/* ── Chapters ──────────────────────────────────────────────────── */}
        <div>
          <div className="section-header">
            <h3 className="section-title">📋 Chapters & Lessons</h3>
            <button onClick={() => setAddingChap(true)} className="btn btn-accent btn-sm">
              ➕ Add Chapter
            </button>
          </div>

          {/* Add Chapter Form */}
          {addingChap && (
            <div style={{
              background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.25)',
              borderRadius:'var(--radius-lg)', padding:'1.25rem',
              marginBottom:'1rem', display:'flex', gap:'0.65rem', alignItems:'center',
            }}>
              <input
                className="form-input"
                placeholder="Chapter title (e.g. Chapter 1: Introduction)"
                value={newChapTitle}
                onChange={e => setNewChapTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChapter()}
                style={{ flex:1 }}
                autoFocus
              />
              <button onClick={addChapter} className="btn btn-accent btn-sm" disabled={savingChap}>
                {savingChap ? '...' : 'Add'}
              </button>
              <button onClick={() => { setAddingChap(false); setNewChapTitle(''); }} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          )}

          {chapters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No Chapters Yet</h3>
              <p style={{ fontSize:'0.875rem' }}>Add a chapter to start organizing your lessons.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {chapters.map((chap, ci) => {
                const lf = lessonForms[chap._id];
                return (
                  <div key={chap._id} style={{
                    background:'var(--bg-card)', border:'1px solid var(--border)',
                    borderRadius:'var(--radius-xl)', overflow:'hidden',
                  }}>
                    {/* Chapter Header */}
                    <div style={{
                      padding:'1rem 1.25rem',
                      background:'var(--bg-elevated)',
                      display:'flex', alignItems:'center', gap:'0.75rem',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width:28, height:28, borderRadius:8,
                        background:'rgba(249,115,22,0.2)', border:'1px solid rgba(249,115,22,0.3)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.75rem', fontWeight:700, color:'var(--accent-400)', flexShrink:0,
                      }}>{ci+1}</div>
                      <div style={{ flex:1, fontWeight:700, color:'var(--text-primary)', fontSize:'0.95rem' }}>
                        {chap.title}
                      </div>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                        {chap.lessons?.length || 0} lessons
                      </span>
                      <button onClick={() => deleteChapter(chap._id)} className="btn btn-danger btn-sm">
                        🗑️
                      </button>
                    </div>

                    {/* Lessons List */}
                    <div style={{ padding:'0.75rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                      {(chap.lessons || []).map((lesson, li) => (
                        <div key={lesson._id} style={{
                          display:'flex', alignItems:'center', gap:'0.75rem',
                          padding:'0.65rem 0.85rem',
                          background:'var(--bg-elevated)', borderRadius:'var(--radius-md)',
                          border:'1px solid var(--border)',
                        }}>
                          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', flexShrink:0, width:20, textAlign:'center' }}>
                            {li+1}
                          </span>
                          <span style={{ fontSize:'1rem', flexShrink:0 }}>▶️</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'0.875rem', fontWeight:500, color:'var(--text-primary)',
                              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {lesson.title}
                            </div>
                            {lesson.instructor && (
                              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                                👨‍🏫 {lesson.instructor}
                              </div>
                            )}
                          </div>
                          {lesson.duration && (
                            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', flexShrink:0 }}>
                              ⏱ {lesson.duration}
                            </span>
                          )}
                          <button
                            onClick={() => deleteLesson(chap._id, lesson._id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color:'#f87171', padding:'0.2rem 0.5rem', flexShrink:0 }}
                          >🗑</button>
                        </div>
                      ))}

                      {/* Add Lesson Form */}
                      {lf?.open ? (
                        <div style={{
                          background:'rgba(42,157,255,0.04)', border:'1px solid rgba(42,157,255,0.2)',
                          borderRadius:'var(--radius-lg)', padding:'1.1rem',
                          display:'flex', flexDirection:'column', gap:'0.75rem',
                          marginTop:'0.25rem',
                        }}>
                          <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--brand-400)', marginBottom:'0.1rem' }}>
                            ➕ New Lesson
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>
                            <div className="form-group">
                              <label className="form-label">Lesson Title *</label>
                              <input className="form-input" placeholder="e.g. Introduction to Atoms"
                                value={lf.form.title || ''} onChange={e => updateLessonField(chap._id,'title',e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Instructor Name</label>
                              <input className="form-input" placeholder="Teacher name"
                                value={lf.form.instructor || ''} onChange={e => updateLessonField(chap._id,'instructor',e.target.value)} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">YouTube Video URL *</label>
                            <input className="form-input" placeholder="https://www.youtube.com/watch?v=..."
                              value={lf.form.videoUrl || ''} onChange={e => updateLessonField(chap._id,'videoUrl',e.target.value)} />
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:'0.65rem' }}>
                            <div className="form-group">
                              <label className="form-label">Description</label>
                              <input className="form-input" placeholder="Brief description of the lesson"
                                value={lf.form.description || ''} onChange={e => updateLessonField(chap._id,'description',e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Duration</label>
                              <input className="form-input" placeholder="e.g. 12:30"
                                value={lf.form.duration || ''} onChange={e => updateLessonField(chap._id,'duration',e.target.value)} />
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:'0.5rem' }}>
                            <button onClick={() => addLesson(chap._id)} className="btn btn-primary btn-sm">
                              🎬 Add Lesson
                            </button>
                            <button onClick={() => closeLessonForm(chap._id)} className="btn btn-ghost btn-sm">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openLessonForm(chap._id)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            border:'1px dashed var(--border)', borderRadius:'var(--radius-md)',
                            marginTop:'0.25rem', color:'var(--text-muted)',
                            justifyContent:'center', padding:'0.6rem',
                          }}
                        >
                          ➕ Add Lesson
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Done Button ───────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button onClick={() => navigate('/teacher/courses')} className="btn btn-ghost" style={{ border:'1px solid var(--border)' }}>
            ← Back to Courses
          </button>
          {totalLessons > 0 && (
            <button
              onClick={async () => {
                try {
                  await api.put(`/teacher/courses/${courseId}/publish`, { isPublished: true });
                  toast.success('Course published! 🎉');
                  navigate('/teacher/courses');
                } catch { toast.error('Publish failed'); }
              }}
              className="btn btn-accent"
              style={{ flex:1 }}
            >
              📢 Publish Course
            </button>
          )}
        </div>

      </div>
    </TeacherLayout>
  );
}