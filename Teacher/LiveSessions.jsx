import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SOCKET_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function LiveSessions() {
  const { user } = useAuth();
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [participants, setParticipants] = useState([]);
  const [input,       setInput]       = useState('');
  const [showCreate,  setShowCreate]  = useState(false);
  const [newSession,  setNewSession]  = useState({ title:'', scheduledAt:'', courseId:'' });
  const [courses,     setCourses]     = useState([]);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadCourses();
    const socket = io(SOCKET_URL, { transports:['websocket','polling'] });
    socketRef.current = socket;

    socket.on('live_chat_message', msg => {
      setMessages(prev => [...prev, msg]);
    });
    socket.on('user_joined', ({ name, participants: p }) => {
      setParticipants(p);
      setMessages(prev => [...prev, { id:Date.now(), text:`${name} joined the session`, system:true, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }]);
    });
    socket.on('user_left', ({ participants: p }) => setParticipants(p));
    socket.on('chat_history', msgs => setMessages(msgs));

    return () => socket.disconnect();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const loadSessions  = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teacher/live-sessions');
      setSessions(data.sessions || []);
    } catch { setSessions([]); }
    finally { setLoading(false); }
  };

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/teacher/courses');
      setCourses(data.courses || []);
    } catch { setCourses([]); }
  };

  const createSession = async () => {
    if (!newSession.title.trim()) { toast.error('Session title required'); return; }
    try {
      const { data } = await api.post('/teacher/live-sessions', newSession);
      setSessions(prev => [data.session, ...prev]);
      setShowCreate(false);
      setNewSession({ title:'', scheduledAt:'', courseId:'' });
      toast.success('Live session created! 📡');
    } catch { toast.error('Failed to create session'); }
  };

  const startSession = (session) => {
    setActiveSession(session);
    setMessages([]);
    setParticipants([]);
    socketRef.current?.emit('join_live_class', {
      sessionId: session._id,
      userId: user?._id,
      name: user?.name,
      role: 'teacher',
    });
    toast.success('Live session started! Students can now join. 📡');
  };

  const endSession = () => {
    if (activeSession) {
      socketRef.current?.emit('leave_live_class', {
        sessionId: activeSession._id,
        userId: user?._id,
      });
    }
    setActiveSession(null);
    setMessages([]);
    setParticipants([]);
    toast.success('Session ended');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;
    const msg = {
      id: Date.now(),
      text: input.trim(),
      name: user?.name,
      role: 'teacher',
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
    };
    socketRef.current?.emit('live_chat_message', {
      sessionId: activeSession._id,
      message: input.trim(),
      name: user?.name,
      role: 'teacher',
    });
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  /* ── Active Session View ──────────────────────────────────────────────── */
  if (activeSession) return (
    <TeacherLayout title={`🔴 LIVE: ${activeSession.title}`} subtitle="Session in progress">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:'1.25rem', height:'calc(100vh - 160px)' }}>

        {/* Chat */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', background:'rgba(239,68,68,0.08)', display:'flex', alignItems:'center', gap:'0.65rem' }}>
            <span style={{ width:8, height:8, background:'#ef4444', borderRadius:'50%', animation:'pulse 1s infinite', display:'inline-block' }} />
            <span style={{ fontWeight:700, color:'#f87171', fontSize:'0.9rem' }}>LIVE SESSION CHAT</span>
            <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--text-muted)' }}>{participants.length} online</span>
            <button onClick={endSession} className="btn btn-danger btn-sm">⏹ End Session</button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem', fontSize:'0.875rem' }}>
                Session started. Waiting for students to join...
              </div>
            )}
            {messages.map(msg => {
              if (msg.system) return (
                <div key={msg.id} style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--text-muted)', padding:'0.3rem' }}>
                  — {msg.text} —
                </div>
              );
              const isMe = msg.role === 'teacher';
              return (
                <div key={msg.id} style={{ display:'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap:'0.5rem', alignItems:'flex-end' }}>
                  <div style={{
                    width:26, height:26, borderRadius:'50%', flexShrink:0,
                    background: isMe ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'linear-gradient(135deg,#2a9dff,#0d67e1)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#fff', fontWeight:700,
                  }}>
                    {msg.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ maxWidth:'72%' }}>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'0.2rem', textAlign: isMe ? 'right' : 'left', paddingInline:'0.25rem' }}>
                      {isMe ? 'You (Teacher)' : msg.name} · {msg.time}
                    </div>
                    <div style={{
                      padding:'0.6rem 0.9rem',
                      borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMe ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-elevated)',
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      fontSize:'0.875rem', lineHeight:1.5,
                    }}>{msg.text}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding:'0.85rem 1.25rem', borderTop:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
            <form onSubmit={sendMessage} style={{ display:'flex', gap:'0.65rem' }}>
              <input className="form-input" placeholder="Send message to students..."
                value={input} onChange={e => setInput(e.target.value)} style={{ flex:1 }} />
              <button type="submit" className="btn btn-accent btn-sm" disabled={!input.trim()}>Send ➤</button>
            </form>
          </div>
        </div>

        {/* Participants panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'1.25rem', flex:1 }}>
            <h4 style={{ marginBottom:'0.85rem', fontSize:'0.9rem' }}>👥 Participants ({participants.length})</h4>
            {participants.length === 0 ? (
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>No students yet. Share the session link!</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {participants.map(p => (
                  <div key={p.userId} style={{ display:'flex', alignItems:'center', gap:'0.55rem', padding:'0.5rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)' }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background: p.role==='teacher' ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'linear-gradient(135deg,#2a9dff,#0d67e1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#fff', fontWeight:700, flexShrink:0 }}>
                      {p.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-primary)', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize:'0.67rem', color: p.role==='teacher' ? 'var(--accent-400)' : 'var(--text-muted)', textTransform:'capitalize' }}>{p.role}</div>
                    </div>
                    <span style={{ width:7, height:7, background:'#22c55e', borderRadius:'50%', display:'inline-block', flexShrink:0 }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:'var(--radius-lg)', padding:'1rem', fontSize:'0.78rem', color:'var(--text-muted)' }}>
            💡 Students can join via the Live Support section in their dashboard.
          </div>
        </div>
      </div>
    </TeacherLayout>
  );

  /* ── Sessions List View ──────────────────────────────────────────────── */
  return (
    <TeacherLayout title="Live Sessions" subtitle="Schedule and host live classes">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1.5rem' }}>
        <button onClick={() => setShowCreate(true)} className="btn btn-accent">
          ➕ Schedule Session
        </button>
      </div>

      {/* Create Session Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding:'2rem' }}>
            <h3 style={{ marginBottom:'1.5rem' }}>📡 Schedule Live Session</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Session Title *</label>
                <input className="form-input" placeholder="e.g. Physics Chapter 3 Live Class"
                  value={newSession.title} onChange={e => setNewSession(p => ({ ...p, title:e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-input form-select" value={newSession.courseId}
                  onChange={e => setNewSession(p => ({ ...p, courseId:e.target.value }))}>
                  <option value="">Select course (optional)</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input className="form-input" type="datetime-local"
                  value={newSession.scheduledAt} onChange={e => setNewSession(p => ({ ...p, scheduledAt:e.target.value }))} />
              </div>
              <div style={{ display:'flex', gap:'0.65rem', marginTop:'0.5rem' }}>
                <button onClick={createSession} className="btn btn-accent" style={{ flex:1 }}>📡 Create</button>
                <button onClick={() => setShowCreate(false)} className="btn btn-ghost" style={{ border:'1px solid var(--border)' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
      ) : sessions.length === 0 ? (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'4rem', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📡</div>
          <h3 style={{ marginBottom:'0.5rem' }}>No Live Sessions Yet</h3>
          <p style={{ marginBottom:'1.5rem', fontSize:'0.875rem' }}>Schedule a live class to teach students in real time.</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-accent">📡 Schedule First Session</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          {sessions.map((session, i) => (
            <div key={session._id} className="card animate-slide-up" style={{ animationDelay:`${i*0.05}s`, display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap' }}>
              <div style={{ width:46, height:46, borderRadius:'var(--radius-md)', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>📡</div>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.9rem', marginBottom:'0.2rem' }}>{session.title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                  {session.scheduledAt ? `🗓 ${new Date(session.scheduledAt).toLocaleString()}` : '🗓 Not scheduled'}
                  {session.course && ` · 📚 ${session.course.title}`}
                </div>
              </div>
              <span className={`badge ${session.isLive ? 'badge-red' : 'badge-blue'}`}>
                {session.isLive ? '🔴 LIVE' : '⏰ Scheduled'}
              </span>
              <button onClick={() => startSession(session)} className="btn btn-accent btn-sm">
                {session.isLive ? '🔴 Join Live' : '▶ Start'}
              </button>
            </div>
          ))}
        </div>
      )}
    </TeacherLayout>
  );
}