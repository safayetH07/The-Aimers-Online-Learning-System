import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { SOCKET_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function AdminLiveSessions() {
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [supportMsgs, setSupportMsgs] = useState([]);
  const [tab, setTab] = useState('sessions');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    load();

    const socket = io(SOCKET_URL, { transports:['websocket','polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join admin support monitor room
      socket.emit('join_support', { userId:'admin', name:'Admin', role:'admin' });
    });

    socket.on('support_message', (msg) => {
      setSupportMsgs(prev => [...prev, {
        ...msg,
        displayTime: new Date(msg.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      }]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [supportMsgs]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/live-sessions');
      setSessions(data.sessions || []);
      setOnlineCount(data.onlineUsers || 0);
    } catch { setSessions([]); }
    finally { setLoading(false); }
  };

  const endSession = async (sessionId) => {
    if (!window.confirm('Force-end this live session?')) return;
    try {
      await api.put(`/admin/live-sessions/${sessionId}/end`);
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, isLive: false } : s));
      toast.success('Session ended');
    } catch { toast.error('Action failed'); }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Delete this session record?')) return;
    try {
      await api.delete(`/admin/live-sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      toast.success('Session deleted');
    } catch { toast.error('Delete failed'); }
  };

  const liveSessions    = sessions.filter(s => s.isLive);
  const pastSessions    = sessions.filter(s => !s.isLive);
  const supportRequests = supportMsgs.filter(m => m.senderRole === 'student');

  return (
    <AdminLayout title="Live Sessions Monitor" subtitle="Platform-wide live session oversight">

      {/* ── Status Bar ────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { icon:'🔴', label:'Live Now',          value: liveSessions.length,   color:'#ef4444' },
          { icon:'📅', label:'Total Sessions',    value: sessions.length,        color:'#2a9dff' },
          { icon:'👥', label:'Online Users',      value: onlineCount,            color:'#22c55e' },
          { icon:'💬', label:'Support Requests',  value: supportRequests.length, color:'#f97316' },
        ].map((s, i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1rem', display:'flex', alignItems:'center', gap:'0.65rem' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="tab-bar" style={{ maxWidth:480, marginBottom:'1.5rem' }}>
        {[
          { key:'sessions', label:`📡 All Sessions (${sessions.length})` },
          { key:'live',     label:`🔴 Live Now (${liveSessions.length})` },
          { key:'support',  label:`💬 Support Chat (${supportRequests.length})` },
        ].map(t => (
          <button key={t.key} className={`tab-item ${tab===t.key?'active':''}`} onClick={() => setTab(t.key)}
            style={{ fontSize:'0.8rem', padding:'0.42rem 0.75rem', whiteSpace:'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── All Sessions Tab ──────────────────────────────────────────── */}
      {tab === 'sessions' && (
        <>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📡</div>
              <h3>No Sessions Yet</h3>
              <p style={{ fontSize:'0.875rem' }}>Live sessions created by teachers will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Session</th><th>Teacher</th><th>Course</th><th>Scheduled</th><th>Status</th><th>Participants</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s._id}>
                      <td style={{ color:'var(--text-primary)', fontWeight:600, fontSize:'0.875rem' }}>{s.title}</td>
                      <td style={{ fontSize:'0.8rem' }}>{s.teacher?.name || '—'}</td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.course?.title || '—'}</td>
                      <td style={{ fontSize:'0.75rem', whiteSpace:'nowrap' }}>
                        {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}
                      </td>
                      <td>
                        {s.isLive ? (
                          <span className="badge badge-red" style={{ display:'flex', alignItems:'center', gap:'0.3rem', width:'fit-content' }}>
                            <span style={{ width:6, height:6, background:'#ef4444', borderRadius:'50%', animation:'pulse 1s infinite', display:'inline-block' }} />
                            LIVE
                          </span>
                        ) : (
                          <span className="badge badge-blue">Scheduled</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-purple">{s.participantCount || 0}</span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'0.35rem' }}>
                          {s.isLive && (
                            <button onClick={() => endSession(s._id)} className="btn btn-danger btn-sm" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}>
                              ⏹ End
                            </button>
                          )}
                          <button onClick={() => deleteSession(s._id)} className="btn btn-ghost btn-sm" style={{ border:'1px solid var(--border)', padding:'0.3rem 0.6rem', fontSize:'0.75rem', color:'#f87171' }}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Live Now Tab ──────────────────────────────────────────────── */}
      {tab === 'live' && (
        liveSessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔴</div>
            <h3>No Active Sessions</h3>
            <p style={{ fontSize:'0.875rem' }}>No live classes running right now.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
            {liveSessions.map((s, i) => (
              <div key={s._id} className="card animate-slide-up" style={{ animationDelay:`${i*0.06}s`, border:'1px solid rgba(239,68,68,0.3)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.85rem' }}>
                  <span style={{ width:8, height:8, background:'#ef4444', borderRadius:'50%', animation:'pulse 1s infinite', display:'inline-block' }} />
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#f87171' }}>LIVE</span>
                </div>
                <h4 style={{ marginBottom:'0.3rem', fontSize:'0.95rem' }}>{s.title}</h4>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.85rem' }}>
                  👨‍🏫 {s.teacher?.name || '—'}
                  {s.course && <> &nbsp;•&nbsp; 📚 {s.course.title}</>}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span className="badge badge-purple">{s.participantCount||0} participants</span>
                  <button onClick={() => endSession(s._id)} className="btn btn-danger btn-sm">⏹ Force End</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Support Chat Monitor Tab ───────────────────────────────────── */}
      {tab === 'support' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.5rem' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', gap:'0.65rem' }}>
              <span>💬</span>
              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Live Support Monitor (Read-Only)</span>
              <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'var(--text-muted)' }}>
                {supportRequests.length} messages
              </span>
            </div>
            <div style={{ height:460, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {supportMsgs.length === 0 ? (
                <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'3rem', fontSize:'0.875rem' }}>
                  Monitoring support chat... Messages from students will appear here in real time.
                </div>
              ) : (
                supportMsgs.map((msg, i) => (
                  <div key={i} style={{
                    padding:'0.75rem 1rem',
                    background: msg.senderRole === 'student' ? 'rgba(42,157,255,0.06)' : 'rgba(249,115,22,0.06)',
                    border:`1px solid ${msg.senderRole === 'student' ? 'rgba(42,157,255,0.15)' : 'rgba(249,115,22,0.15)'}`,
                    borderRadius:'var(--radius-md)',
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                      <span style={{ fontSize:'0.78rem', fontWeight:600, color: msg.senderRole==='student' ? 'var(--brand-400)' : 'var(--accent-400)' }}>
                        {msg.senderRole === 'student' ? '👨‍🎓' : '👨‍🏫'} {msg.senderName}
                      </span>
                      <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{msg.displayTime}</span>
                    </div>
                    <p style={{ margin:0, fontSize:'0.85rem', lineHeight:1.5 }}>{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Info panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.25rem' }}>
              <h4 style={{ marginBottom:'0.85rem', fontSize:'0.9rem' }}>📊 Support Stats</h4>
              {[
                ['💬', 'Total Messages',      supportMsgs.length],
                ['👨‍🎓','Student Messages',    supportRequests.length],
                ['👨‍🏫','Teacher Replies',     supportMsgs.filter(m=>m.senderRole==='teacher').length],
                ['🤖', 'Bot Responses',       supportMsgs.filter(m=>m.isBot).length],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.55rem 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                  <span style={{ color:'var(--text-muted)' }}>{icon} {label}</span>
                  <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:'var(--radius-lg)', padding:'1rem', fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.6 }}>
              🛡️ As admin you can view all support conversations in real time. Teacher replies and xAI bot messages are all visible here.
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}