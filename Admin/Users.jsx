import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null); // user detail modal
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 15;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  /* ── Actions ─────────────────────────────────────────────────────────── */
  const banUser = async (userId, isBanned) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { isActive: isBanned });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: isBanned } : u));
      toast.success(isBanned ? 'User activated ✅' : 'User banned 🚫');
      if (selected?._id === userId) setSelected(p => ({ ...p, isActive: isBanned }));
    } catch { toast.error('Action failed'); }
  };

  const changeRole = async (userId, role) => {
    if (!window.confirm(`Change this user's role to "${role}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success(`Role updated to ${role} ✅`);
      if (selected?._id === userId) setSelected(p => ({ ...p, role }));
    } catch { toast.error('Role change failed'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
      if (selected?._id === userId) setSelected(null);
    } catch { toast.error('Delete failed'); }
  };

  /* ── Filter & Paginate ───────────────────────────────────────────────── */
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter   === 'all' || u.role   === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const roleColor = (r) => r === 'admin' ? '#a855f7' : r === 'teacher' ? '#f97316' : '#2a9dff';
  const roleBg    = (r) => r === 'admin' ? 'rgba(168,85,247,0.1)' : r === 'teacher' ? 'rgba(249,115,22,0.1)' : 'rgba(42,157,255,0.1)';
  const roleBadge = (r) => r === 'admin' ? 'badge-purple' : r === 'teacher' ? 'badge-orange' : 'badge-blue';

  const counts = {
    all:     users.length,
    student: users.filter(u => u.role==='student').length,
    teacher: users.filter(u => u.role==='teacher').length,
    admin:   users.filter(u => u.role==='admin').length,
  };

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} registered users`}>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { icon:'👥', label:'All Users',  value:counts.all,     color:'#2a9dff' },
          { icon:'👨‍🎓',label:'Students',   value:counts.student,  color:'#22c55e' },
          { icon:'👨‍🏫',label:'Teachers',   value:counts.teacher,  color:'#f97316' },
          { icon:'🛡️', label:'Admins',     value:counts.admin,    color:'#a855f7' },
          { icon:'🚫', label:'Banned',     value:users.filter(u=>!u.isActive).length, color:'#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-lg)', padding:'1rem',
            display:'flex', alignItems:'center', gap:'0.65rem',
          }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
        <div className="search-box" style={{ flex:1, minWidth:220 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft:'2.5rem' }} />
        </div>
        <div className="tab-bar" style={{ flexShrink:0 }}>
          {['all','student','teacher','admin'].map(r => (
            <button key={r} className={`tab-item ${roleFilter===r?'active':''}`}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              style={{ textTransform:'capitalize', padding:'0.42rem 0.75rem', fontSize:'0.78rem' }}>
              {r === 'all' ? `All (${counts.all})` : `${r} (${counts[r]||0})`}
            </button>
          ))}
        </div>
        <select className="form-input form-select" style={{ width:140, flexShrink:0 }}
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* ── User Table ────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
      ) : paginated.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Users Found</h3>
          <p style={{ fontSize:'0.875rem' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Level / Subject</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(u => (
                  <tr key={u._id}>
                    {/* User */}
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                        <div className="avatar avatar-sm avatar-placeholder" style={{
                          fontSize:'0.7rem', flexShrink:0,
                          background:`linear-gradient(135deg,${roleColor(u.role)},${roleColor(u.role)}cc)`,
                        }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{u.name}</div>
                          {u.mobile && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{u.mobile}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'0.82rem' }}>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => changeRole(u._id, e.target.value)}
                        style={{
                          background: roleBg(u.role),
                          border:`1px solid ${roleColor(u.role)}40`,
                          borderRadius:'var(--radius-sm)',
                          padding:'0.25rem 0.5rem',
                          fontSize:'0.75rem', fontWeight:600,
                          color: roleColor(u.role),
                          cursor:'pointer', outline:'none',
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      {u.level || u.subject || '—'}
                    </td>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize:'0.68rem' }}>
                        {u.isActive ? '✅ Active' : '🚫 Banned'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.35rem' }}>
                        <button
                          onClick={() => setSelected(u)}
                          className="btn btn-ghost btn-sm"
                          style={{ border:'1px solid var(--border)', padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                          title="View details"
                        >👁</button>
                        <button
                          onClick={() => banUser(u._id, !u.isActive)}
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                          title={u.isActive ? 'Ban user' : 'Unban user'}
                        >
                          {u.isActive ? '🚫' : '✅'}
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                          title="Delete user"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', gap:'0.4rem', justifyContent:'center', marginTop:'1.25rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="btn btn-ghost btn-sm" style={{ border:'1px solid var(--border)' }}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`btn btn-sm ${page===n?'btn-primary':'btn-ghost'}`}
                  style={{ border:'1px solid var(--border)', minWidth:36 }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="btn btn-ghost btn-sm" style={{ border:'1px solid var(--border)' }}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* ── User Detail Modal ──────────────────────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding:'2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3>👤 User Details</h3>
              <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-lg)' }}>
              <div className="avatar avatar-lg avatar-placeholder" style={{
                fontSize:'1.2rem',
                background:`linear-gradient(135deg,${roleColor(selected.role)},${roleColor(selected.role)}cc)`,
              }}>
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)' }}>{selected.name}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{selected.email}</div>
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.4rem' }}>
                  <span className={`badge ${roleBadge(selected.role)}`}>{selected.role}</span>
                  <span className={`badge ${selected.isActive ? 'badge-green' : 'badge-red'}`}>
                    {selected.isActive ? 'Active' : 'Banned'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem', marginBottom:'1.5rem' }}>
              {[
                ['📱', 'Mobile',     selected.mobile    || '—'],
                ['⚥',  'Gender',     selected.gender    || '—'],
                ['🎂', 'Age',        selected.age ? `${selected.age} yrs` : '—'],
                ['🎓', 'Level',      selected.level     || selected.subject || '—'],
                ['📅', 'Joined',     selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'}) : '—'],
                ['🔐', 'Account ID', selected._id?.slice(-8) || '—'],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'0.65rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'1rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-primary)', fontWeight:500 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'0.65rem' }}>
              <button onClick={() => banUser(selected._id, !selected.isActive)}
                className={`btn ${selected.isActive ? 'btn-danger' : 'btn-primary'}`} style={{ flex:1 }}>
                {selected.isActive ? '🚫 Ban User' : '✅ Unban User'}
              </button>
              <button onClick={() => { deleteUser(selected._id); setSelected(null); }}
                className="btn btn-danger">🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}