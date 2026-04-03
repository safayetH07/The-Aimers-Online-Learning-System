import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import api from '../../services/api';
import { CATEGORIES, SUBJECT_ICONS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function CreateCourse() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    subject:     '',
    level:       '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'category') setForm(p => ({ ...p, category: value, subject:'', level:'' }));
    setErrors(p => ({ ...p, [name]:'' }));
  };

  const handleThumb = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setThumbFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Derive available subjects from selected category
  const activeCat     = CATEGORIES.find(c => c.id === form.category);
  const subjects      = activeCat?.courses || [];
  const subClasses    = activeCat?.subClasses || [];

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category)           errs.category    = 'Select a category';
    if (!form.subject)            errs.subject     = 'Select a subject';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (thumbFile) fd.append('image', thumbFile);

      const { data } = await api.post('/teacher/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Course created! Now add chapters & lessons 🎉');
      navigate(`/teacher/courses/${data.course._id}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout title="Create New Course" subtitle="Fill in details to publish your course">
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ── Thumbnail Upload ──────────────────────────────────────── */}
          <div style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-xl)', padding:'1.5rem',
          }}>
            <h3 style={{ marginBottom:'1.25rem', fontSize:'1rem' }}>🖼️ Course Thumbnail</h3>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                height:200, borderRadius:'var(--radius-lg)',
                border:`2px dashed ${preview ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
                background: preview ? 'transparent' : 'var(--bg-elevated)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', overflow:'hidden', transition:'all 0.2s',
                position:'relative',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(249,115,22,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor= preview ? 'rgba(249,115,22,0.4)' : 'var(--border)'}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Thumbnail preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{
                    position:'absolute', inset:0, background:'rgba(0,0,0,0.5)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    opacity:0, transition:'opacity 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity='1'}
                    onMouseLeave={e => e.currentTarget.style.opacity='0'}
                  >
                    <span style={{ color:'#fff', fontSize:'0.875rem', fontWeight:600 }}>Click to change</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', color:'var(--text-muted)' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>📷</div>
                  <div style={{ fontSize:'0.875rem', fontWeight:500 }}>Click to upload thumbnail</div>
                  <div style={{ fontSize:'0.75rem', marginTop:'0.25rem' }}>JPG, PNG, WEBP • Max 5MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleThumb} style={{ display:'none' }} />
          </div>

          {/* ── Basic Info ────────────────────────────────────────────── */}
          <div style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-xl)', padding:'1.5rem',
            display:'flex', flexDirection:'column', gap:'1.1rem',
          }}>
            <h3 style={{ margin:0, fontSize:'1rem' }}>📋 Basic Information</h3>

            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input className="form-input" name="title" placeholder="e.g. SSC Physics — Complete Course"
                value={form.title} onChange={handleChange} />
              {errors.title && <span className="form-error">⚠ {errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input form-textarea" name="description" rows={4}
                placeholder="Describe what students will learn in this course..."
                value={form.description} onChange={handleChange} />
              {errors.description && <span className="form-error">⚠ {errors.description}</span>}
            </div>
          </div>

          {/* ── Category & Subject ────────────────────────────────────── */}
          <div style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-xl)', padding:'1.5rem',
            display:'flex', flexDirection:'column', gap:'1.1rem',
          }}>
            <h3 style={{ margin:0, fontSize:'1rem' }}>🗂️ Category & Subject</h3>

            {/* Category cards */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'0.65rem', marginTop:'0.25rem' }}>
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => handleChange({ target:{ name:'category', value: cat.id } })}
                    style={{
                      padding:'0.9rem', borderRadius:'var(--radius-md)',
                      border:`1px solid ${form.category===cat.id ? cat.color : 'var(--border)'}`,
                      background: form.category===cat.id ? `${cat.color}12` : 'var(--bg-elevated)',
                      cursor:'pointer', transition:'all 0.18s', textAlign:'center',
                    }}
                  >
                    <div style={{ fontSize:'1.5rem', marginBottom:'0.3rem' }}>{cat.icon}</div>
                    <div style={{ fontSize:'0.8rem', fontWeight:600, color: form.category===cat.id ? cat.color : 'var(--text-secondary)' }}>
                      {cat.label}
                    </div>
                  </div>
                ))}
              </div>
              {errors.category && <span className="form-error">⚠ {errors.category}</span>}
            </div>

            {/* Sub-class (only for Class 6-8) */}
            {subClasses.length > 0 && (
              <div className="form-group">
                <label className="form-label">Class Level</label>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {subClasses.map(sc => (
                    <button
                      key={sc.id} type="button"
                      onClick={() => setForm(p => ({ ...p, level: sc.id }))}
                      className="btn btn-sm"
                      style={{
                        border:`1px solid ${form.level===sc.id ? 'var(--brand-500)' : 'var(--border)'}`,
                        background: form.level===sc.id ? 'rgba(42,157,255,0.1)' : 'transparent',
                        color: form.level===sc.id ? 'var(--brand-400)' : 'var(--text-muted)',
                      }}
                    >{sc.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject */}
            {subjects.length > 0 && (
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'0.5rem', marginTop:'0.25rem' }}>
                  {subjects.map(sub => (
                    <div
                      key={sub}
                      onClick={() => setForm(p => ({ ...p, subject: sub }))}
                      style={{
                        padding:'0.65rem 0.85rem',
                        borderRadius:'var(--radius-md)',
                        border:`1px solid ${form.subject===sub ? 'var(--brand-500)' : 'var(--border)'}`,
                        background: form.subject===sub ? 'rgba(42,157,255,0.1)' : 'var(--bg-elevated)',
                        cursor:'pointer', transition:'all 0.18s',
                        display:'flex', alignItems:'center', gap:'0.5rem',
                        fontSize:'0.82rem', fontWeight:500,
                        color: form.subject===sub ? 'var(--brand-400)' : 'var(--text-secondary)',
                      }}
                    >
                      <span>{SUBJECT_ICONS[sub] || '📖'}</span> {sub}
                    </div>
                  ))}
                </div>
                {errors.subject && <span className="form-error">⚠ {errors.subject}</span>}
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <div style={{ display:'flex', gap:'0.85rem' }}>
            <button type="button" onClick={() => navigate('/teacher/courses')} className="btn btn-ghost" style={{ border:'1px solid var(--border)' }}>
              ← Cancel
            </button>
            <button type="submit" className="btn btn-accent btn-lg" style={{ flex:1 }} disabled={saving}>
              {saving
                ? <><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} /> Creating...</>
                : '🚀 Create Course'}
            </button>
          </div>

        </form>
      </div>
    </TeacherLayout>
  );
}