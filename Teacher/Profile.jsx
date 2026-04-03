import { useState, useRef } from 'react';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GENDER_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function TeacherProfile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwOpen,    setPwOpen]    = useState(false);
  const [pw,        setPw]        = useState({ current:'', newPw:'', confirm:'' });
  const [savingPw,  setSavingPw]  = useState(false);

  const [form, setForm] = useState({
    name:        user?.name        || '',
    email:       user?.email       || '',
    mobile:      user?.mobile      || '',
    gender:      user?.gender      || '',
    age:         user?.age         || '',
    bio:         user?.bio         || '',
    subject:     user?.subject     || '',
    qualification: user?.qualification || '',
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : 'T';

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/teacher/profile', form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.put('/teacher/profile/picture', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      updateUser({ profilePicture: data.profilePicture });
      toast.success('Photo updated! 📸');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handlePwSave = async () => {
    if (pw.newPw !== pw.confirm) { toast.error('Passwords do not match'); return; }
    if (pw.newPw.length < 6)     { toast.error('Minimum 6 characters');   return; }
    setSavingPw(true);
    try {
      await api.put('/teacher/profile/password', { currentPassword: pw.current, newPassword: pw.newPw });
      toast.success('Password changed! 🔐');
      setPwOpen(false);
      setPw({ current:'', newPw:'', confirm:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSavingPw(false); }
  };

  const infoItems = [
    { icon:'📧', label:'Email',         val: user?.email         || '—' },
    { icon:'📱', label:'Mobile',        val: user?.mobile        || '—' },
    { icon:'⚥',  label:'Gender',        val: user?.gender        || '—' },
    { icon:'🎂', label:'Age',           val: user?.age ? `${user.age} yrs` : '—' },
    { icon:'📚', label:'Subject',       val: user?.subject       || '—' },
    { icon:'🎓', label:'Qualification', val: user?.qualification || '—' },
    { icon:'📅', label:'Joined',        val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'}) : '—' },
  ];

  return (
    <TeacherLayout title="My Profile" subtitle="Manage your teacher profile">
      <div style={{ maxWidth:820, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* ── Profile Header ─────────────────────────────────────────── */}
        <div style={{
          background:'var(--bg-card)',
          border:'1px solid rgba(249,115,22,0.2)',
          borderRadius:'var(--radius-2xl)', padding:'2rem',
          display:'flex', alignItems:'center', gap:'1.75rem', flexWrap:'wrap',
        }}>
          <div style={{ position:'relative' }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="avatar avatar-2xl"
                style={{ border:'3px solid rgba(249,115,22,0.35)' }} />
            ) : (
              <div className="avatar avatar-2xl avatar-placeholder"
                style={{ fontSize:'2rem', background:'linear-gradient(135deg,#f97316,#ea580c)', border:'3px solid rgba(249,115,22,0.35)' }}>
                {initials}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ position:'absolute', bottom:4, right:4, width:30, height:30, borderRadius:'50%',
                background:'#f97316', border:'2px solid var(--bg-card)', color:'#fff',
                cursor:'pointer', fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {uploading ? '⏳' : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:'none' }} />
          </div>

          <div style={{ flex:1, minWidth:200 }}>
            <h2 style={{ marginBottom:'0.3rem' }}>{user?.name}</h2>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.65rem' }}>
              <span className="badge badge-orange">👨‍🏫 Teacher</span>
              {user?.subject && <span className="badge badge-blue">{user.subject}</span>}
            </div>
            {user?.bio && <p style={{ fontSize:'0.875rem', margin:0, maxWidth:420 }}>{user.bio}</p>}
          </div>

          <button
            onClick={() => setEditing(p => !p)}
            className={editing ? 'btn btn-ghost btn-sm' : 'btn btn-sm'}
            style={{ border:'1px solid rgba(249,115,22,0.3)', color: editing ? 'var(--text-muted)' : 'var(--accent-400)', background: editing ? 'transparent' : 'rgba(249,115,22,0.08)' }}
          >
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* ── Edit Form ──────────────────────────────────────────────── */}
        {editing && (
          <div style={{ background:'var(--bg-card)', border:'1px solid rgba(249,115,22,0.25)', borderRadius:'var(--radius-2xl)', padding:'2rem' }}>
            <h3 style={{ marginBottom:'1.5rem', color:'var(--accent-400)' }}>✏️ Edit Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                { name:'name',          label:'Full Name *',      type:'text',  placeholder:'Your full name'          },
                { name:'email',         label:'Email *',          type:'email', placeholder:'your@email.com'          },
                { name:'mobile',        label:'Mobile',           type:'tel',   placeholder:'01XXXXXXXXX'             },
                { name:'age',           label:'Age',              type:'number',placeholder:'Your age'                },
                { name:'subject',       label:'Teaching Subject', type:'text',  placeholder:'e.g. Physics, Chemistry' },
                { name:'qualification', label:'Qualification',    type:'text',  placeholder:'e.g. BSc in Physics'     },
              ].map(f => (
                <div key={f.name} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" name={f.name} type={f.type}
                    placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input form-select" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input form-textarea" name="bio" rows={3}
                  placeholder="Tell students about yourself, your experience, and teaching style..."
                  value={form.bio} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.25rem' }}>
              <button onClick={handleSave} className="btn btn-accent" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        )}

        {/* ── Info Grid ──────────────────────────────────────────────── */}
        {!editing && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-2xl)', padding:'2rem' }}>
            <h3 style={{ marginBottom:'1.5rem' }}>📋 Profile Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
              {infoItems.map(item => (
                <div key={item.label} style={{
                  background:'var(--bg-elevated)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)', padding:'1rem',
                  display:'flex', alignItems:'center', gap:'0.75rem',
                }}>
                  <span style={{ fontSize:'1.3rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize:'0.9rem', color:'var(--text-primary)', fontWeight:500 }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Change Password ────────────────────────────────────────── */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-2xl)', padding:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: pwOpen ? '1.5rem' : 0 }}>
            <div>
              <h3 style={{ margin:0 }}>🔐 Change Password</h3>
              <p style={{ margin:0, fontSize:'0.8rem', marginTop:'0.25rem' }}>Keep your account secure</p>
            </div>
            <button onClick={() => setPwOpen(p => !p)} className="btn btn-sm"
              style={{ border:'1px solid rgba(249,115,22,0.3)', color:'var(--accent-400)', background:'rgba(249,115,22,0.08)' }}>
              {pwOpen ? 'Cancel' : 'Change'}
            </button>
          </div>
          {pwOpen && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { key:'current', label:'Current Password', ph:'Current password'       },
                { key:'newPw',   label:'New Password',     ph:'Minimum 6 characters'  },
                { key:'confirm', label:'Confirm New',      ph:'Re-enter new password' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type="password" placeholder={f.ph}
                    value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]:e.target.value }))} />
                </div>
              ))}
              <button onClick={handlePwSave} className="btn btn-accent btn-sm" style={{ alignSelf:'flex-start' }} disabled={savingPw}>
                {savingPw ? 'Saving...' : '💾 Update Password'}
              </button>
            </div>
          )}
        </div>

      </div>
    </TeacherLayout>
  );
}