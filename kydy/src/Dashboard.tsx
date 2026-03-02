import { useState, CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem { id: string; icon: string; label: string }
interface StatCardData { icon: string; label: string; value: string; sub: string; color: string }
interface CourseProgress {
  title: string; icon: string; color: string
  progress: number; lessons: number; lessonsTotal: number; tag: string
}

// ─── Liquid Glass Button ──────────────────────────────────────────────────────
interface LGBtnProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'enroll'
  onClick?: () => void
  style?: CSSProperties
}
function LGBtn({ children, variant = 'ghost', onClick, style }: LGBtnProps) {
  const cls = { primary: 'lg-primary', ghost: 'lg-ghost', enroll: 'lg-enroll' }[variant]
  return (
    <button className={`lg-btn ${cls}`} onClick={onClick} style={style}>
      <span className="lg-shine" />
      <span className="lg-inner">{children}</span>
    </button>
  )
}

// ─── Orb ─────────────────────────────────────────────────────────────────────
function Orb({ style, color = '#7c3aed', size = 400 }: { style?: CSSProperties; color?: string; size?: number }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
      width: size, height: size,
      background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
      ...style,
    }} />
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`, borderRadius: 3,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        boxShadow: `0 0 8px ${color}55`,
      }} />
    </div>
  )
}

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
  { id: 'courses',   icon: '◈',  label: 'Courses'   },
  { id: 'lessons',   icon: '▶',  label: 'Lessons'   },
  { id: 'notes',     icon: '✦',  label: 'Notes'     },
  { id: 'settings',  icon: '⚙',  label: 'Settings'  },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <aside style={{
      width: 240, minHeight: '100vh', flexShrink: 0,
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column',
      padding: '28px 14px',
      position: 'sticky', top: 0, height: '100vh',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, paddingLeft: 8 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Orbitron',sans-serif", fontWeight: 900, color: '#fff', fontSize: 18,
          boxShadow: '0 0 20px rgba(124,58,237,0.3)',
        }}>K</div>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 15, fontWeight: 700, color: '#1f2937', letterSpacing: 2 }}>KYDY</div>
          <div style={{ fontSize: 8, color: '#7c3aed', letterSpacing: 3, fontFamily: 'monospace' }}>EDTECH</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 3, fontFamily: 'monospace', marginBottom: 10, paddingLeft: 10 }}>NAVIGATION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 12px', borderRadius: 11, border: 'none', cursor: 'pointer',
                  fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 600,
                  letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', width: '100%',
                  background: isActive
                    ? 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(168,85,247,0.05))'
                    : 'transparent',
                  color: isActive ? '#7c3aed' : '#6b7280',
                  borderLeft: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                  boxShadow: isActive ? '0 0 18px rgba(124,58,237,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151' }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}}
              >
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.4)', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#e5e7eb,transparent)', margin: '16px 0' }} />

      {/* User card */}
      <div style={{
        background: '#f9fafb', border: '1px solid #e5e7eb',
        borderRadius: 13, padding: '13px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            boxShadow: '0 0 10px rgba(124,58,237,0.3)',
          }}>👤</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: '#1f2937', fontSize: 11, fontWeight: 700, fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ridhan</div>
            <div style={{ color: '#6b7280', fontSize: 10, fontFamily: "'Exo 2',sans-serif" }}>Pro Learner</div>
          </div>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: StatCardData) {
  return (
    <div
      style={{
        background: '#ffffff', border: '1px solid #e5e7eb',
        borderRadius: 18, padding: '22px',
        position: 'relative', overflow: 'hidden', transition: 'all 0.3s', cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 40px rgba(0,0,0,0.08), 0 0 22px ${color}18` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ width: 40, height: 40, borderRadius: 11, marginBottom: 14, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#1f2937', fontFamily: "'Orbitron',sans-serif", marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Exo 2',sans-serif" }}>{sub}</div>
    </div>
  )
}

// ─── In Progress Courses ──────────────────────────────────────────────────────
const IN_PROGRESS: CourseProgress[] = [
  { title: 'Web Development',  icon: '⚡', color: '#6366f1', progress: 68, lessons: 17, lessonsTotal: 25, tag: 'In Progress'  },
  { title: 'Machine Learning', icon: '🤖', color: '#7c3aed', progress: 35, lessons: 8,  lessonsTotal: 23, tag: 'In Progress'  },
  { title: 'UI/UX Design',     icon: '🎨', color: '#a855f7', progress: 82, lessons: 21, lessonsTotal: 26, tag: 'Almost Done'  },
]

// ─── Main Content ─────────────────────────────────────────────────────────────
function DashboardContent({ onNav }: { onNav: (id: string) => void }) {
  const stats: StatCardData[] = [
    { icon: '⏱', label: 'Study Time',  value: '24h', sub: '+3h this week',    color: '#6366f1' },
    { icon: '🔥', label: 'Streak',      value: '12',  sub: 'Days in a row',    color: '#f59e0b' },
    { icon: '📖', label: 'In Progress', value: '3',   sub: 'Active courses',   color: '#7c3aed' },
    { icon: '🏆', label: 'Completed',   value: '7',   sub: 'Courses finished', color: '#22c55e' },
  ]

  const activity = [
    { day: 'MON', hrs: 2.5, color: '#6366f1' },
    { day: 'TUE', hrs: 1.0, color: '#6366f1' },
    { day: 'WED', hrs: 3.5, color: '#7c3aed' },
    { day: 'THU', hrs: 2.0, color: '#6366f1' },
    { day: 'FRI', hrs: 4.0, color: '#a855f7' },
    { day: 'SAT', hrs: 1.5, color: '#6366f1' },
    { day: 'SUN', hrs: 3.0, color: '#7c3aed' },
  ]

  return (
    <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', position: 'relative', background: '#f3f4f6' }}>
      <Orb style={{ top: '-5%', right: '5%' }}   color="#c4b5fd" size={500} />
      <Orb style={{ bottom: '10%', left: '10%' }} color="#ddd6fe" size={350} />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ color: '#7c3aed', fontSize: 10, fontFamily: "'Orbitron',sans-serif", letterSpacing: 3, marginBottom: 5 }}>OVERVIEW</div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: '1.75rem', color: '#1f2937', letterSpacing: -1 }}>DASHBOARD</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: `rgba(124,58,237,0.1)`, border: '1px solid rgba(124,58,237,0.22)', borderRadius: 10, padding: '8px 16px', color: '#7c3aed', fontSize: 12, fontFamily: "'Exo 2',sans-serif" }}>
            📅 Feb 27, 2026
          </div>
          <LGBtn variant="primary" style={{ padding: '9px 20px', borderRadius: 10, fontFamily: "'Orbitron',sans-serif", fontSize: 10, letterSpacing: 1, fontWeight: 700, color: '#fff' }}>
            + ENROLL
          </LGBtn>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 34, position: 'relative', zIndex: 2 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── My Courses ── */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ color: '#7c3aed', fontSize: 10, fontFamily: "'Orbitron',sans-serif", letterSpacing: 3, marginBottom: 4 }}>CURRENTLY STUDYING</div>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#1f2937', letterSpacing: -0.5 }}>MY COURSES</h2>
          </div>
          <button
            onClick={() => onNav('courses')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: 11, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
            onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}
          >VIEW ALL →</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {IN_PROGRESS.map((c, i) => (
            <div key={i}
              style={{
                background: '#ffffff', border: '1px solid #e5e7eb',
                borderRadius: 16, padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: 18,
                transition: 'all 0.3s', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}44`; e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.08), 0 0 14px ${c.color}10` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0, background: `${c.color}18`, border: `1px solid ${c.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#1f2937', fontSize: 13, fontWeight: 700, fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.3 }}>{c.title}</span>
                  <span style={{ background: `${c.color}22`, border: `1px solid ${c.color}44`, borderRadius: 20, padding: '2px 10px', color: c.color, fontSize: 9, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1 }}>{c.tag}</span>
                </div>
                <ProgressBar value={c.progress} color={c.color} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ color: '#6b7280', fontSize: 11, fontFamily: "'Exo 2',sans-serif" }}>{c.lessons}/{c.lessonsTotal} lessons</span>
                  <span style={{ color: c.color, fontSize: 11, fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>{c.progress}%</span>
                </div>
              </div>
              <LGBtn variant="enroll" onClick={() => onNav('lessons')} style={{ padding: '8px 16px', borderRadius: 9, flexShrink: 0, fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#fff' }}>
                CONTINUE
              </LGBtn>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly Activity ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ color: '#7c3aed', fontSize: 10, fontFamily: "'Orbitron',sans-serif", letterSpacing: 3, marginBottom: 4 }}>THIS WEEK</div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#1f2937', letterSpacing: -0.5, marginBottom: 16 }}>ACTIVITY</h2>
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 18, padding: '22px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {activity.map(({ day, hrs, color }) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ color: '#6b7280', fontSize: 9, fontFamily: 'monospace' }}>{hrs}h</span>
                <div style={{ width: '100%', borderRadius: 5, height: `${(hrs / 4) * 68}px`, background: `linear-gradient(180deg,${color},${color}55)`, boxShadow: `0 0 10px ${color}33` }} />
                <span style={{ color: '#9ca3af', fontSize: 8, fontFamily: 'monospace', letterSpacing: 1 }}>{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [active, setActive] = useState('dashboard')

  const handleNav = (id: string) => {
    if (id === 'courses' && onNavigate) { 
      onNavigate('courses')
      return 
    }
    if (id === 'lessons' && onNavigate) { 
      onNavigate('lessons')
      return 
    }
    if (id === 'notes' && onNavigate) { 
      onNavigate('notes')
      return 
    }
    setActive(id)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Exo+2:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { background: #f3f4f6; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }

        .lg-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; outline: none; overflow: hidden; isolation: isolate; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
        .lg-btn::before { content: ''; position: absolute; inset: 0; backdrop-filter: blur(16px) saturate(200%) brightness(1.25); -webkit-backdrop-filter: blur(16px) saturate(200%) brightness(1.25); z-index: 0; border-radius: inherit; }
        .lg-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.04) 40%,rgba(0,0,0,0) 60%,rgba(255,255,255,0.08) 100%); z-index: 1; pointer-events: none; border-radius: inherit; }
        .lg-btn .lg-inner { position: relative; z-index: 3; display: flex; align-items: center; gap: 6px; }
        .lg-btn .lg-shine { position: absolute; top: -60%; left: -80%; width: 45%; height: 220%; background: linear-gradient(105deg,transparent 15%,rgba(255,255,255,0.28) 50%,transparent 85%); transform: skewX(-18deg); z-index: 4; pointer-events: none; }
        .lg-btn:hover .lg-shine { animation: shineSlide 0.55s ease forwards; }
        .lg-btn:hover { transform: translateY(-2px) scale(1.01); }
        .lg-btn:active { transform: translateY(0) scale(0.98); }
        @keyframes shineSlide { 0% { left:-80% } 100% { left:130% } }

        .lg-primary { background: linear-gradient(145deg,rgba(124,58,237,0.55),rgba(168,85,247,0.38),rgba(99,102,241,0.45)); border: 1px solid rgba(196,149,255,0.45) !important; box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 0 28px rgba(124,58,237,0.35), 0 4px 18px rgba(0,0,0,0.4); }
        .lg-primary:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.24) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 0 48px rgba(124,58,237,0.6), 0 6px 26px rgba(0,0,0,0.45); }
        .lg-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15) !important; box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 4px 14px rgba(0,0,0,0.3); }
        .lg-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.26) !important; }
        .lg-enroll { background: linear-gradient(145deg,rgba(99,102,241,0.45),rgba(168,85,247,0.32)); border: 1px solid rgba(168,85,247,0.4) !important; box-shadow: 0 1px 0 rgba(255,255,255,0.13) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 0 16px rgba(99,102,241,0.2); }
        .lg-enroll:hover { box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 0 32px rgba(99,102,241,0.46); }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', color: '#1f2937', overflow: 'hidden', position: 'relative' }}>
        <Orb style={{ top: '20%', left: '25%' }} color="#ddd6fe" size={700} />
        <Sidebar active={active} onNav={handleNav} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <DashboardContent onNav={handleNav} />
        </div>
      </div>
    </>
  )
}