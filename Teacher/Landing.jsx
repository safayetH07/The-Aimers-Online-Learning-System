import { Link } from 'react-router-dom';
import { CATEGORIES, SUBJECT_ICONS } from '../utils/constants';

const stats = [
  { value: '10,000+', label: 'Students Enrolled',  icon: '👨‍🎓' },
  { value: '200+',    label: 'Video Lessons',       icon: '🎬' },
  { value: '50+',     label: 'Expert Teachers',     icon: '👨‍🏫' },
  { value: '100%',    label: 'Free Forever',        icon: '🆓' },
];

const features = [
  { icon: '🎯', title: 'Structured Courses',  desc: 'Chapter-wise video lessons for SSC, HSC and Class 6–8 curricula.' },
  { icon: '🤖', title: 'xAI Live Support',    desc: 'Get instant help from AI-powered tutors available 24/7.' },
  { icon: '📝', title: 'Practice Exams',      desc: 'Chapter MCQs (10 Qs) or full-course mock exams (40 Qs) with timer.' },
  { icon: '📊', title: 'Track Progress',      desc: 'Dashboard analytics to monitor your learning journey.' },
  { icon: '⭐', title: 'Rate & Review',       desc: 'Rate courses and instructors after completing content.' },
  { icon: '📡', title: 'Live Classes',        desc: 'Join scheduled live sessions with teachers in real time.' },
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,14,26,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg,#2a9dff,#0d67e1)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(42,157,255,0.35)',
          }}>🎯</div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)' }}>
              The Aimer's
            </div>
            <div style={{ fontSize:'0.65rem', color:'var(--brand-400)', fontWeight:500 }}>Free Online Learning</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <Link to="/login"    className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary  btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 1.5rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)',
          width:800, height:600,
          background:'radial-gradient(ellipse, rgba(42,157,255,0.12) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />
        <div style={{
          position:'absolute', bottom:'10%', right:'10%',
          width:400, height:400,
          background:'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />

        <div style={{ position:'relative', maxWidth:780 }} className="animate-slide-up">
          <div className="badge badge-blue" style={{ marginBottom:'1.5rem', fontSize:'0.8rem' }}>
            🚀 Powered by xAI — Completely Free
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            Learn Smarter,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #2a9dff, #52bcff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Aim Higher</span>
            <br />Education Free for All
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: 600, margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            The Aimer's is Bangladesh's first free online learning platform with live xAI support —
            built for SSC 2026, HSC 2026, and Class 6–8 students.
          </p>

          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl">
              🎯 Start Learning Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-xl">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section style={{ padding:'4rem 1.5rem', background:'var(--bg-surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'2rem', textAlign:'center' }}>
          {stats.map((s) => (
            <div key={s.label} className="animate-fade-in">
              <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{s.icon}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:'0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ marginBottom:'0.75rem' }}>Courses By Level</h2>
            <p>Structured content aligned with the Bangladesh national curriculum</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem' }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="card" style={{ cursor:'default' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{
                    width:46, height:46,
                    background:`${cat.color}20`,
                    border:`1px solid ${cat.color}40`,
                    borderRadius:12,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.4rem',
                  }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text-primary)' }}>{cat.label}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{cat.courses.length} subjects</div>
                  </div>
                </div>
                <p style={{ fontSize:'0.85rem', marginBottom:'1rem' }}>{cat.description}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                  {cat.courses.map(c => (
                    <span key={c} className="badge badge-blue" style={{ fontSize:'0.7rem' }}>
                      {SUBJECT_ICONS[c] || '📖'} {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1.5rem', background:'var(--bg-surface)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ marginBottom:'0.75rem' }}>Everything You Need to Succeed</h2>
            <p>Powerful tools designed for Bangladeshi students</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card animate-slide-up" style={{ animationDelay:`${i*0.1}s` }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>{f.icon}</div>
                <h4 style={{ marginBottom:'0.5rem' }}>{f.title}</h4>
                <p style={{ fontSize:'0.875rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(42,157,255,0.08), rgba(249,115,22,0.05))',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ marginBottom:'1rem' }}>Ready to Start Your Journey?</h2>
          <p style={{ marginBottom:'2rem', fontSize:'1rem' }}>
            Join thousands of students already learning on The Aimer's — completely free, forever.
          </p>
          <Link to="/register" className="btn btn-primary btn-xl">
            🎯 Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        background:'var(--bg-surface)',
        borderTop:'1px solid var(--border)',
        padding:'2rem 1.5rem',
        textAlign:'center',
        color:'var(--text-muted)',
        fontSize:'0.85rem',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
          <span>🎯</span>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text-secondary)' }}>The Aimer's</span>
        </div>
        <p>© {new Date().getFullYear()} The Aimer's — Free Online Learning System. Making education free for all.</p>
      </footer>

    </div>
  );
}