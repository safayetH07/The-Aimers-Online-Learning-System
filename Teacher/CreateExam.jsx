import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import api from '../../services/api';
import { EXAM_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

const emptyQuestion = () => ({
  question: '', options: ['', '', '', ''], correctAnswer: 0,
});

export default function CreateExam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('examId');

  const [courses,  setCourses]  = useState([]);
  const [chapters, setChapters] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  const [form, setForm] = useState({
    title:    '',
    course:   '',
    chapter:  '',
    type:     'chapter', // chapter | full_course
  });

  const [questions, setQuestions] = useState([emptyQuestion()]);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (form.course) loadChapters(form.course); }, [form.course]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teacher/courses');
      setCourses(data.courses || []);
      if (editId) loadExam();
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const loadChapters = async (courseId) => {
    try {
      const { data } = await api.get(`/teacher/courses/${courseId}`);
      setChapters(data.chapters || []);
    } catch { setChapters([]); }
  };

  const loadExam = async () => {
    try {
      const { data } = await api.get(`/teacher/exams/${editId}`);
      const e = data.exam;
      setForm({ title: e.title, course: e.course?._id||e.course, chapter: e.chapter?._id||e.chapter||'', type: e.type });
      setQuestions(e.questions?.length ? e.questions : [emptyQuestion()]);
    } catch { toast.error('Failed to load exam'); }
  };

  /* ── Question helpers ──────────────────────────────────────────────────── */
  const updateQuestion = (qi, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi, oi, value) => {
    setQuestions(prev => prev.map((q, i) =>
      i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? value : o) } : q
    ));
  };

  const addQuestion = () => {
    const maxQ = form.type === 'chapter'
      ? EXAM_CONFIG.CHAPTER_MCQ_COUNT
      : EXAM_CONFIG.FULL_COURSE_MCQ_COUNT;
    if (questions.length >= maxQ) {
      toast.error(`Max ${maxQ} questions for this exam type`);
      return;
    }
    setQuestions(prev => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (qi) => {
    if (questions.length <= 1) { toast.error('At least 1 question required'); return; }
    setQuestions(prev => prev.filter((_, i) => i !== qi));
  };

  const duplicateQuestion = (qi) => {
    const q = { ...questions[qi], options: [...questions[qi].options] };
    setQuestions(prev => [...prev.slice(0, qi+1), q, ...prev.slice(qi+1)]);
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Exam title required'); return; }
    if (!form.course)        { toast.error('Select a course');    return; }
    if (form.type === 'chapter' && !form.chapter) { toast.error('Select a chapter for chapter exam'); return; }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { toast.error(`Question ${i+1}: question text required`); return; }
      if (q.options.some(o => !o.trim())) { toast.error(`Question ${i+1}: all 4 options required`); return; }
    }

    setSaving(true);
    try {
      const payload = { ...form, questions };
      if (editId) {
        await api.put(`/teacher/exams/${editId}`, payload);
        toast.success('Exam updated! ✅');
      } else {
        await api.post('/teacher/exams', payload);
        toast.success('Exam created! 🎉');
      }
      navigate('/teacher/exams');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const expectedCount = form.type === 'chapter'
    ? EXAM_CONFIG.CHAPTER_MCQ_COUNT
    : EXAM_CONFIG.FULL_COURSE_MCQ_COUNT;

  if (loading) return (
    <TeacherLayout title="Create Exam">
      <div style={{ display:'flex', justifyContent:'center', padding:'5rem' }}><div className="spinner" /></div>
    </TeacherLayout>
  );

  return (
    <TeacherLayout
      title={editId ? 'Edit Exam' : 'Create Exam'}
      subtitle="Build MCQ questions for your students"
    >
      <div style={{ maxWidth:820, margin:'0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ── Exam Settings ──────────────────────────────────────────── */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
            <h3 style={{ margin:0, fontSize:'1rem' }}>⚙️ Exam Settings</h3>

            <div className="form-group">
              <label className="form-label">Exam Title *</label>
              <input className="form-input" placeholder="e.g. Chapter 1 MCQ — Atoms and Molecules"
                value={form.title} onChange={e => setForm(p => ({ ...p, title:e.target.value }))} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Course *</label>
                <select className="form-input form-select" value={form.course}
                  onChange={e => setForm(p => ({ ...p, course:e.target.value, chapter:'' }))}>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Exam Type *</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  {[
                    { val:'chapter',     label:`Chapter (${EXAM_CONFIG.CHAPTER_MCQ_COUNT} Qs)`,          color:'#2a9dff' },
                    { val:'full_course', label:`Full Course (${EXAM_CONFIG.FULL_COURSE_MCQ_COUNT} Qs)`,  color:'#f97316' },
                  ].map(t => (
                    <button
                      key={t.val} type="button"
                      onClick={() => setForm(p => ({ ...p, type:t.val, chapter:'' }))}
                      style={{
                        flex:1, padding:'0.65rem 0.5rem',
                        borderRadius:'var(--radius-md)',
                        border:`1px solid ${form.type===t.val ? t.color : 'var(--border)'}`,
                        background: form.type===t.val ? `${t.color}15` : 'var(--bg-elevated)',
                        color: form.type===t.val ? t.color : 'var(--text-muted)',
                        cursor:'pointer', fontSize:'0.78rem', fontWeight:600, transition:'all 0.18s',
                      }}
                    >{t.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {form.type === 'chapter' && chapters.length > 0 && (
              <div className="form-group">
                <label className="form-label">Chapter *</label>
                <select className="form-input form-select" value={form.chapter}
                  onChange={e => setForm(p => ({ ...p, chapter:e.target.value }))}>
                  <option value="">Select chapter</option>
                  {chapters.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
            )}

            <div className="alert alert-info">
              ℹ️ This exam will have <strong>{expectedCount} MCQ questions</strong>.
              You have added <strong>{questions.length}</strong> so far.
            </div>
          </div>

          {/* ── Questions ─────────────────────────────────────────────── */}
          <div>
            <div className="section-header">
              <h3 className="section-title">❓ Questions ({questions.length}/{expectedCount})</h3>
              <button type="button" onClick={addQuestion} className="btn btn-secondary btn-sm">
                ➕ Add Question
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              {questions.map((q, qi) => (
                <div key={qi} style={{
                  background:'var(--bg-card)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-xl)', overflow:'hidden',
                }}>
                  {/* Question header */}
                  <div style={{
                    padding:'0.75rem 1.25rem', background:'var(--bg-elevated)',
                    borderBottom:'1px solid var(--border)',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                  }}>
                    <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)' }}>
                      Question {qi + 1}
                    </span>
                    <div style={{ display:'flex', gap:'0.4rem' }}>
                      <button type="button" onClick={() => duplicateQuestion(qi)}
                        className="btn btn-ghost btn-sm" style={{ fontSize:'0.75rem' }}>Copy</button>
                      <button type="button" onClick={() => removeQuestion(qi)}
                        className="btn btn-danger btn-sm" style={{ fontSize:'0.75rem' }}>🗑️</button>
                    </div>
                  </div>

                  <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {/* Question text */}
                    <div className="form-group">
                      <label className="form-label">Question Text *</label>
                      <textarea className="form-input" rows={2}
                        placeholder="Enter the question..."
                        value={q.question}
                        onChange={e => updateQuestion(qi,'question',e.target.value)}
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <label className="form-label" style={{ marginBottom:'0.5rem', display:'block' }}>
                        Options * &nbsp;
                        <span style={{ fontWeight:400, color:'var(--text-muted)', fontSize:'0.72rem' }}>
                          (Click radio to mark correct answer)
                        </span>
                      </label>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                            <button
                              type="button"
                              onClick={() => updateQuestion(qi,'correctAnswer',oi)}
                              style={{
                                width:22, height:22, borderRadius:'50%',
                                border:`2px solid ${q.correctAnswer===oi ? '#22c55e' : 'var(--border)'}`,
                                background: q.correctAnswer===oi ? '#22c55e' : 'transparent',
                                cursor:'pointer', flexShrink:0, padding:0,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                transition:'all 0.15s',
                              }}
                            >
                              {q.correctAnswer === oi && (
                                <span style={{ color:'#fff', fontSize:'0.65rem', fontWeight:700 }}>✓</span>
                              )}
                            </button>
                            <div style={{
                              width:24, height:24, borderRadius:6, flexShrink:0,
                              background: q.correctAnswer===oi ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
                              border:`1px solid ${q.correctAnswer===oi ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:'0.72rem', fontWeight:700,
                              color: q.correctAnswer===oi ? '#4ade80' : 'var(--text-muted)',
                            }}>
                              {String.fromCharCode(65+oi)}
                            </div>
                            <input
                              className="form-input"
                              placeholder={`Option ${String.fromCharCode(65+oi)}`}
                              value={opt}
                              onChange={e => updateOption(qi, oi, e.target.value)}
                              style={{
                                flex:1,
                                borderColor: q.correctAnswer===oi ? 'rgba(34,197,94,0.3)' : undefined,
                                background:  q.correctAnswer===oi ? 'rgba(34,197,94,0.05)' : undefined,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {questions.length < expectedCount && (
              <button type="button" onClick={addQuestion}
                className="btn btn-ghost"
                style={{
                  width:'100%', marginTop:'0.85rem',
                  border:'1px dashed var(--border)', borderRadius:'var(--radius-lg)',
                  color:'var(--text-muted)', padding:'0.85rem',
                  justifyContent:'center',
                }}
              >
                ➕ Add Another Question ({questions.length}/{expectedCount})
              </button>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <div style={{ display:'flex', gap:'0.85rem' }}>
            <button type="button" onClick={() => navigate('/teacher/exams')} className="btn btn-ghost" style={{ border:'1px solid var(--border)' }}>
              ← Cancel
            </button>
            <button type="submit" className="btn btn-accent btn-lg" style={{ flex:1 }} disabled={saving}>
              {saving ? 'Saving...' : editId ? '💾 Update Exam' : '🚀 Create Exam'}
            </button>
          </div>

        </form>
      </div>
    </TeacherLayout>
  );
}