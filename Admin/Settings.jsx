import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();

  const [tab,     setTab]     = useState('profile');
  const [saving,  setSaving]  = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  });

  // Password form
  const [pw,      setPw]      = useState({ current:'', newPw:'', confirm:'' });
  const [savingPw,setSavingPw]= useState(false);

  // Platform settings
  const [platform, setPlatform] = useState({
    platformName:       "The Aimer's",
    platformTagline:    'Free Online Learning System with Live Support using xAI',
    allowRegistrations: true,
    maintenanceMode:    false,
    maxFileSize:        '5',
    supportEmail:       'support@theaimers.com',
  });
  const [savingPlatform, setSavingPlatform] = useState(false);

  /* ── Profile Save ────────────────────────────────────────────────────── */
  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) { toast.error('Name and email required'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/admin/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated ✅');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  /* ── Password Save ───────────────────────────────────────────────────── */
  const savePw = async () => {
    if (pw.newPw !== pw.confirm)  { toast.error('Passwords do not match'); return; }
    if (pw.newPw.length < 6)      { toast.error('Minimum 6 characters');   return; }
    setSavingPw(true);
    try {
      await api.put('/admin/profile/password', { currentPassword: pw.current, newPassword: pw.newPw });
      toast.success('Password changed 🔐');
      setPw({ current:'', newPw:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  /* ── Platform Save ───────────────────────────────────────────────────── */
  const savePlatform = async () => {
    setSavingPlatform(true);
    try {
      await api.put('/admin/settings', platform);
      toast.success('Platform settings saved ✅');
    } catch { toast.error('Failed to save settings'); }
    finally { setSavingPlatform(false); }
  };

  /* ── Seed Admin ──────────────────────────────────────────────────────── */
  const seedAdmin = async () => {
    if (!window.confirm('This will create/reset the default admin account. Continue?')) return;
    try {
      const { data } = await api.post('/admin/seed');
      toast.success(`Admin seeded! Email: ${data.email}`);
    } catch { toast.error('Seed failed'); }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : 'A';

  const tabs = [
    { key:'profile',  label:'👤 My Profile'       },
    { key:'platform', label:'⚙️ Platform Settings' },
    { key:'system',   label:'🛠️ System Tools'      },
  ];

  return (
    <AdminLayout title="Settings" subtitle="Manage your profile and platform configuration">
      <div style={{ maxWidth:780, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* Admin Profile Header */}
        <div style={{
          background:'linear-gradient(135deg,rgba(168,85,247,0.1),rgba(168,85,247,0.04))',
          border:'1px solid rgba(168,85,247,0.25)',
          borderRadius:'var(--radius-2xl)', padding:'1.75rem',
          display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap',
        }}>
          <div className="avatar avatar-lg avatar-placeholder" style={{ fontSize:'1.2rem', background:'linear-gradient(135deg,#a855f7,#7c3aed)', border:'3px solid rgba(168,85,247,0.4)' }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ marginBottom:'0.25rem' }}>{user?.name}</h2>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <span className="badge badge-purple">🛡️ Administrator</span>
              <span className="badge badge-green">✅ Full Access</span>
            </div>
          </div>
          <div style={{ textAlign:'right', fontSize:'0.78rem', color:'var(--text-muted)' }}>
            <div>{user?.email}</div>
            <div style={{ marginTop:'0.2rem' }}>
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB',{year:'numeric',month:'long'}) : '—'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.key} className={`tab-item ${tab===t.key?'active':''}`}
              onClick={() => setTab(t.key)} style={{ fontSize:'0.85rem' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ──────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Edit Profile */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-2xl)', padding:'2rem' }}>
              <h3 style={{ marginBottom:'1.5rem' }}>✏️ Edit Profile</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name:e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email:e.target.value }))} />
                </div>
              </div>
              <button onClick={saveProfile} className="btn btn-sm" disabled={saving}
                style={{ marginTop:'1.25rem', background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)', color:'#c084fc' }}>
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
            </div>

            {/* Change Password */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-2xl)', padding:'2rem' }}>
              <h3 style={{ marginBottom:'1.5rem' }}>🔐 Change Password</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {[
                  { key:'current', label:'Current Password', ph:'Current password'      },
                  { key:'newPw',   label:'New Password',     ph:'Minimum 6 characters'  },
                  { key:'confirm', label:'Confirm New',      ph:'Re-enter new password' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="password" placeholder={f.ph}
                      value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]:e.target.value }))} />
                  </div>
                ))}
                <button onClick={savePw} className="btn btn-sm" disabled={savingPw}
                  style={{ alignSelf:'flex-start', background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)', color:'#c084fc' }}>
                  {savingPw ? 'Updating...' : '🔐 Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Platform Settings Tab ─────────────────────────────────────── */}
        {tab === 'platform' && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-2xl)', padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <h3>⚙️ Platform Configuration</h3>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Platform Name</label>
                <input className="form-input" value={platform.platformName}
                  onChange={e => setPlatform(p => ({ ...p, platformName:e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Support Email</label>
                <input className="form-input" type="email" value={platform.supportEmail}
                  onChange={e => setPlatform(p => ({ ...p, supportEmail:e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Platform Tagline</label>
                <input className="form-input" value={platform.platformTagline}
                  onChange={e => setPlatform(p => ({ ...p, platformTagline:e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max File Size (MB)</label>
                <input className="form-input" type="number" min={1} max={50} value={platform.maxFileSize}
                  onChange={e => setPlatform(p => ({ ...p, maxFileSize:e.target.value }))} />
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              {[
                { key:'allowRegistrations', label:'Allow New Registrations', desc:'Students and teachers can create new accounts', color:'#22c55e' },
                { key:'maintenanceMode',    label:'Maintenance Mode',        desc:'Temporarily take the platform offline for updates', color:'#ef4444' },
              ].map(t => (
                <div key={t.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text-primary)', marginBottom:'0.2rem' }}>{t.label}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                  <button
                    onClick={() => setPlatform(p => ({ ...p, [t.key]: !p[t.key] }))}
                    style={{
                      width:44, height:24, borderRadius:99,
                      background: platform[t.key] ? t.color : 'var(--bg-card)',
                      border:`1px solid ${platform[t.key] ? t.color : 'var(--border)'}`,
                      cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0,
                    }}
                  >
                    <span style={{
                      position:'absolute', top:2,
                      left: platform[t.key] ? 22 : 2,
                      width:18, height:18, borderRadius:'50%',
                      background:'#fff', transition:'left 0.2s',
                      boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={savePlatform} className="btn btn-sm" disabled={savingPlatform}
              style={{ alignSelf:'flex-start', background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)', color:'#c084fc' }}>
              {savingPlatform ? 'Saving...' : '💾 Save Platform Settings'}
            </button>
          </div>
        )}

        {/* ── System Tools Tab ──────────────────────────────────────────── */}
        {tab === 'system' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Seed Admin */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)', marginBottom:'0.25rem' }}>🌱 Seed Default Admin</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                  Creates admin@theaimers.com with password admin123. Use on fresh setup.
                </div>
              </div>
              <button onClick={seedAdmin} className="btn btn-sm" style={{ background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.25)', color:'#c084fc', flexShrink:0 }}>
                🌱 Seed Admin
              </button>
            </div>

            {/* System Info */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.5rem' }}>
              <h4 style={{ marginBottom:'1.25rem', fontSize:'0.9rem' }}>🖥️ System Information</h4>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>
                {[
                  ['🌐', 'Platform',    "The Aimer's v1.0.0"     ],
                  ['⚛️', 'Frontend',   'React 18 + Vite + Tailwind'],
                  ['🟢', 'Backend',    'Node.js + Express 4'     ],
                  ['🗄️', 'Database',   'MongoDB + Mongoose 8'    ],
                  ['📡', 'Real-time',  'Socket.IO 4'             ],
                  ['☁️', 'Storage',    'Cloudinary / Local'      ],
                  ['🔐', 'Auth',       'JWT + bcryptjs'          ],
                  ['🤖', 'AI Support', 'xAI Integration'         ],
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'0.7rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <span style={{ fontSize:'1rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--text-primary)', fontWeight:500 }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'var(--radius-xl)', padding:'1.5rem' }}>
              <h4 style={{ marginBottom:'0.5rem', fontSize:'0.9rem', color:'#f87171' }}>⚠️ Danger Zone</h4>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
                These actions are irreversible. Proceed with extreme caution.
              </p>
              <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap' }}>
                <button
                  onClick={() => toast.error('Clear cache feature coming soon')}
                  className="btn btn-sm"
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}
                >
                  🗑️ Clear Cache
                </button>
                <button
                  onClick={() => toast.error('Export feature coming soon')}
                  className="btn btn-sm"
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}
                >
                  📤 Export All Data
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}