import { useState, CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem { id: string; icon: string; label: string }
interface CourseItem {
  id: number; title: string; instructor: string; icon: string; color: string
  tag: string; students: string; rating: string; lessons: number
  duration: string; level: string; progress?: number; enrolled: boolean
  desc: string; topics: string[]
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
function Orb({ style, color = '#7c3aed', size = '30vw' }: { style?: CSSProperties; color?: string; size?: string }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
      width: size, height: size,
      background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
      ...style,
    }} />
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: '0.35rem', background: '#e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, borderRadius: '1rem', background: `linear-gradient(90deg,${color},${color}88)`, boxShadow: `0 0 0.5rem ${color}55` }} />
    </div>
  )
}

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
  { id: 'courses',   icon: '◈', label: 'Courses'   },
  { id: 'lessons',   icon: '▶', label: 'Lessons'   },
  { id: 'notes',     icon: '✦', label: 'Notes'     },
  { id: 'settings',  icon: '⚙', label: 'Settings'  },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onNav }: { onNav: (id: string) => void }) {
  return (
    <aside style={{
      width: '15%', minWidth: '12rem', minHeight: '100vh', flexShrink: 0,
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column',
      padding: '2% 1%',
      position: 'sticky', top: 0, height: '100vh',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3%', marginBottom: '12%', paddingLeft: '5%' }}>
        <div style={{
          width: '2.4rem', height: '2.4rem', borderRadius: '0.6rem', flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Orbitron',sans-serif", fontWeight: 900, color: '#fff', fontSize: '1.1rem',
          boxShadow: '0 0 1.2rem rgba(124,58,237,0.3)',
        }}>K</div>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', letterSpacing: '0.12em' }}>KYDY</div>
          <div style={{ fontSize: '0.5rem', color: '#7c3aed', letterSpacing: '0.2em', fontFamily: 'monospace' }}>EDTECH</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '0.55rem', color: '#9ca3af', letterSpacing: '0.2em', fontFamily: 'monospace', marginBottom: '4%', paddingLeft: '6%' }}>NAVIGATION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1%' }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.id === 'courses'
            return (
              <button key={item.id} onClick={() => onNav(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: '8%',
                padding: '4% 5%', borderRadius: '0.7rem', border: 'none', cursor: 'pointer',
                fontFamily: "'Orbitron',sans-serif", fontSize: '0.65rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'left', width: '100%',
                background: isActive ? 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(168,85,247,0.05))' : 'transparent',
                color: isActive ? '#7c3aed' : '#6b7280',
                borderLeft: isActive ? '0.12rem solid #7c3aed' : '0.12rem solid transparent',
                boxShadow: isActive ? '0 0 1rem rgba(124,58,237,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151' }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 0.5rem rgba(124,58,237,0.4)', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e5e7eb,transparent)', margin: '5% 0' }} />

      {/* User */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.8rem', padding: '5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8%' }}>
          <div style={{ width: '2.1rem', height: '2.1rem', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 0 0.6rem rgba(124,58,237,0.3)' }}>👤</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: '#1f2937', fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Orbitron',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ridhan</div>
            <div style={{ color: '#6b7280', fontSize: '0.6rem', fontFamily: "'Exo 2',sans-serif" }}>Pro Learner</div>
          </div>
          <div style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0.4rem #22c55e', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  )
}

// ─── Course Data ──────────────────────────────────────────────────────────────
const ALL_COURSES: CourseItem[] = [
  { id: 1, title: 'Web Development', instructor: 'Alex Turner', icon: '⚡', color: '#6366f1', tag: 'Bestseller', students: '12,450', rating: '4.8', lessons: 25, duration: '32h', level: 'Beginner', progress: 68, enrolled: true, desc: 'Master modern web development with HTML, CSS, JavaScript, React and Node.js from scratch to advanced.', topics: ['HTML & CSS', 'JavaScript', 'React', 'Node.js', 'APIs'] },
  { id: 2, title: 'Data Science', instructor: 'Maya Patel', icon: '🔬', color: '#7c3aed', tag: 'Top Rated', students: '8,320', rating: '4.9', lessons: 23, duration: '28h', level: 'Intermediate', progress: 35, enrolled: true, desc: 'Dive deep into data analysis, visualization, and machine learning using Python and industry tools.', topics: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn'] },
  { id: 3, title: 'UI/UX Design', instructor: 'Sara Kim', icon: '🎨', color: '#a855f7', tag: 'Popular', students: '6,780', rating: '4.7', lessons: 26, duration: '22h', level: 'Beginner', progress: 82, enrolled: true, desc: 'Create beautiful, user-centered digital experiences with Figma, design systems, and UX principles.', topics: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Wireframing'] },
  { id: 4, title: 'Mobile Development', instructor: 'James Lee', icon: '📱', color: '#6366f1', tag: 'New', students: '5,640', rating: '4.6', lessons: 30, duration: '38h', level: 'Intermediate', progress: undefined, enrolled: false, desc: 'Build cross-platform mobile apps for iOS and Android using React Native and Expo.', topics: ['React Native', 'Expo', 'Navigation', 'APIs', 'App Store'] },
  { id: 5, title: 'Machine Learning', instructor: 'Dr. Chen', icon: '🤖', color: '#7c3aed', tag: 'Hot', students: '9,230', rating: '4.8', lessons: 28, duration: '40h', level: 'Advanced', progress: undefined, enrolled: false, desc: 'Go deep into ML algorithms, neural networks, and model deployment with TensorFlow and PyTorch.', topics: ['TensorFlow', 'PyTorch', 'Neural Networks', 'Deep Learning', 'Deployment'] },
  { id: 6, title: 'Digital Marketing', instructor: 'Lisa Chen', icon: '📊', color: '#a855f7', tag: 'Trending', students: '7,890', rating: '4.5', lessons: 18, duration: '16h', level: 'Beginner', progress: undefined, enrolled: false, desc: 'Master SEO, social media, email campaigns, and paid ads to grow any business online.', topics: ['SEO', 'Social Media', 'Email Marketing', 'PPC', 'Analytics'] },
]

const FILTERS = ['All', 'Enrolled', 'In Progress', 'Beginner', 'Intermediate', 'Advanced']

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onClick, selected }: { course: CourseItem; onClick: () => void; selected: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? '#ffffff' : hov ? '#ffffff' : '#f9fafb',
        border: selected ? `2px solid ${course.color}` : hov ? `1px solid ${course.color}55` : '1px solid #e5e7eb',
        borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
        transform: hov && !selected ? 'translateY(-0.3rem)' : 'translateY(0)',
        boxShadow: selected
          ? `0 0 0 3px ${course.color}22, 0 0.8rem 2rem rgba(0,0,0,0.1)`
          : hov ? `0 0.5rem 1.5rem rgba(0,0,0,0.08)` : '0 0.1rem 0.3rem rgba(0,0,0,0.05)',
      }}
    >
      {/* Banner */}
      <div style={{ height: '5.5rem', position: 'relative', background: `linear-gradient(135deg,${course.color}28,${course.color}08)`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize: '1.4rem 1.4rem' }} />
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.6rem', background: `${course.color}22`, border: `1px solid ${course.color}44`, borderRadius: '2rem', padding: '0.2rem 0.55rem', color: course.color, fontSize: '0.55rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em' }}>{course.tag}</div>
        <div style={{ position: 'absolute', bottom: '0.55rem', left: '0.75rem', fontSize: '2rem' }}>{course.icon}</div>
        {course.enrolled && (
          <div style={{ position: 'absolute', top: '0.5rem', left: '0.6rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '2rem', padding: '0.2rem 0.55rem', color: '#22c55e', fontSize: '0.5rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em' }}>ENROLLED</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '0.9rem 1rem 1rem' }}>
        <h3 style={{ color: '#1f2937', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.02em' }}>{course.title}</h3>
        <div style={{ color: '#6b7280', fontSize: '0.65rem', fontFamily: "'Exo 2',sans-serif", marginBottom: '0.55rem' }}>by {course.instructor}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.65rem', fontFamily: "'Exo 2',sans-serif" }}>📚 {course.lessons} lessons</span>
          <span style={{ color: '#fbbf24', fontSize: '0.65rem' }}>★ {course.rating}</span>
        </div>
        {course.progress !== undefined && (
          <div style={{ marginBottom: '0.6rem' }}>
            <ProgressBar value={course.progress} color={course.color} />
            <div style={{ textAlign: 'right', marginTop: '0.25rem', color: course.color, fontSize: '0.6rem', fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>{course.progress}%</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#f3f4f6', borderRadius: '2rem', padding: '0.2rem 0.55rem', color: '#6b7280', fontSize: '0.58rem', fontFamily: 'monospace' }}>{course.level}</span>
          <span style={{ background: '#f3f4f6', borderRadius: '2rem', padding: '0.2rem 0.55rem', color: '#6b7280', fontSize: '0.58rem', fontFamily: 'monospace' }}>⏱ {course.duration}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Course Detail Panel ──────────────────────────────────────────────────────
function CourseDetail({ course, onClose }: { course: CourseItem; onClose: () => void }) {
  return (
    <div style={{
      width: '30%', minWidth: '17rem', flexShrink: 0,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '1rem', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 4rem)',
      boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.08)',
    }}>
      {/* Header banner */}
      <div style={{ height: '9rem', position: 'relative', background: `linear-gradient(135deg,${course.color}35,${course.color}10)`, flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize: '1.4rem 1.4rem', opacity: 0.15 }} />
        <Orb style={{ bottom: '-30%', right: '-10%' }} color={course.color} size="12rem" />
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', fontSize: '3rem' }}>{course.icon}</div>
        <button onClick={onClose} style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '50%', width: '1.8rem', height: '1.8rem', cursor: 'pointer', color: '#6b7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.color = '#374151' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280' }}
        >✕</button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: '0.95rem', color: '#1f2937', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{course.title}</h2>
          <div style={{ background: `${course.color}22`, border: `1px solid ${course.color}44`, borderRadius: '2rem', padding: '0.2rem 0.55rem', color: course.color, fontSize: '0.52rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0 }}>{course.tag}</div>
        </div>

        <div style={{ color: '#6b7280', fontSize: '0.68rem', fontFamily: "'Exo 2',sans-serif", marginBottom: '0.8rem' }}>by {course.instructor}</div>

        <p style={{ color: '#4b5563', fontSize: '0.72rem', lineHeight: 1.7, fontFamily: "'Exo 2',sans-serif", marginBottom: '1rem' }}>{course.desc}</p>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { icon: '📚', val: `${course.lessons}`, label: 'Lessons' },
            { icon: '⏱', val: course.duration, label: 'Duration' },
            { icon: '⭐', val: course.rating, label: 'Rating' },
          ].map(s => (
            <div key={s.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.7rem', padding: '0.65rem 0.3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ color: '#1f2937', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Orbitron',sans-serif" }}>{s.val}</div>
              <div style={{ color: '#6b7280', fontSize: '0.52rem', fontFamily: "'Exo 2',sans-serif", letterSpacing: '0.06em', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Level + enrolled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ background: `${course.color}18`, border: `1px solid ${course.color}35`, borderRadius: '2rem', padding: '0.22rem 0.6rem', color: course.color, fontSize: '0.58rem', fontFamily: "'Orbitron',sans-serif" }}>{course.level}</span>
          <span style={{ color: '#6b7280', fontSize: '0.63rem', fontFamily: "'Exo 2',sans-serif" }}>👥 {course.students} enrolled</span>
        </div>

        {/* Progress if enrolled */}
        {course.progress !== undefined && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.8rem', padding: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.62rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em' }}>PROGRESS</span>
              <span style={{ color: course.color, fontSize: '0.68rem', fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} color={course.color} />
          </div>
        )}

        {/* Topics */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ color: '#6b7280', fontSize: '0.58rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.15em', marginBottom: '0.55rem' }}>TOPICS COVERED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {course.topics.map(t => (
              <span key={t} style={{ background: `${course.color}15`, border: `1px solid ${course.color}33`, borderRadius: '2rem', padding: '0.22rem 0.55rem', color: course.color, fontSize: '0.58rem', fontFamily: "'Exo 2',sans-serif" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA footer */}
      <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
        {course.enrolled ? (
          <LGBtn variant="primary" style={{ width: '100%', padding: '0.65rem 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>
            CONTINUE LEARNING →
          </LGBtn>
        ) : (
          <LGBtn variant="enroll" style={{ width: '100%', padding: '0.65rem 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>
            ENROLL NOW →
          </LGBtn>
        )}
      </div>
    </div>
  )
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function CourseContent() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<CourseItem | null>(ALL_COURSES[0])
  const [searchFocused, setSearchFocused] = useState(false)

  const filtered = ALL_COURSES.filter(c => {
    const matchFilter =
      filter === 'All' ? true :
      filter === 'Enrolled' ? c.enrolled :
      filter === 'In Progress' ? c.progress !== undefined :
      c.level === filter
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <main style={{ flex: 1, padding: '2rem 1.8rem', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: '#f3f4f6' }}>
      <Orb style={{ top: '-5%', right: '5%' }} color="#c4b5fd" size="30vw" />
      <Orb style={{ bottom: '5%', left: '10%' }} color="#ddd6fe" size="22vw" />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ color: '#7c3aed', fontSize: '0.58rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.2em', marginBottom: '0.3rem' }}>LEARNING CENTER</div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 'clamp(1.2rem,2vw,1.8rem)', color: '#1f2937', letterSpacing: '-0.04em' }}>COURSES</h1>
        </div>
        {/* Search */}
        <div style={{ position: 'relative', width: '22rem' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#9ca3af' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search courses..."
            style={{
              width: '100%', padding: '0.55rem 0.9rem 0.55rem 2.2rem',
              borderRadius: '0.7rem', outline: 'none',
              background: searchFocused ? '#ffffff' : '#ffffff',
              border: `1px solid ${searchFocused ? '#7c3aed' : '#e5e7eb'}`,
              color: '#1f2937', fontSize: '0.72rem', fontFamily: "'Exo 2',sans-serif",
              boxShadow: searchFocused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
              transition: 'all 0.25s',
            }}
          />
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 2, alignItems: 'center' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.38rem 0.9rem', borderRadius: '2rem', cursor: 'pointer',
            fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em',
            background: filter === f ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#ffffff',
            color: filter === f ? '#fff' : '#6b7280',
            border: filter === f ? '1px solid #7c3aed' : '1px solid #e5e7eb',
            boxShadow: filter === f ? '0 0.2rem 0.8rem rgba(124,58,237,0.25)' : 'none',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}}
            onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb' }}}
          >{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.65rem', fontFamily: "'Exo 2',sans-serif" }}>
          {filtered.length} course{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Grid + Detail ── */}
      <div style={{ display: 'flex', gap: '1.2rem', flex: 1, position: 'relative', zIndex: 2, alignItems: 'flex-start' }}>
        {/* Course grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: selected ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: '1rem', alignContent: 'start' }}>
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              selected={selected?.id === course.id}
              onClick={() => setSelected(selected?.id === course.id ? null : course)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🔍</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em' }}>NO COURSES FOUND</div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <CourseDetail course={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </main>
  )
}

// ─── CoursePage ───────────────────────────────────────────────────────────────
export default function CoursePage({ onNav }: { onNav?: (id: string) => void }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Exo+2:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { background: #f3f4f6; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 0.3rem; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 0.2rem; }

        .lg-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; outline: none; overflow: hidden; isolation: isolate; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
        .lg-btn::before { content: ''; position: absolute; inset: 0; backdrop-filter: blur(1rem) saturate(200%) brightness(1.25); -webkit-backdrop-filter: blur(1rem) saturate(200%) brightness(1.25); z-index: 0; border-radius: inherit; }
        .lg-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.04) 40%,rgba(0,0,0,0) 60%,rgba(255,255,255,0.08) 100%); z-index: 1; pointer-events: none; border-radius: inherit; }
        .lg-btn .lg-inner { position: relative; z-index: 3; display: flex; align-items: center; gap: 0.4rem; }
        .lg-btn .lg-shine { position: absolute; top: -60%; left: -80%; width: 45%; height: 220%; background: linear-gradient(105deg,transparent 15%,rgba(255,255,255,0.28) 50%,transparent 85%); transform: skewX(-18deg); z-index: 4; pointer-events: none; }
        .lg-btn:hover .lg-shine { animation: shineSlide 0.55s ease forwards; }
        .lg-btn:hover { transform: translateY(-0.12rem) scale(1.01); }
        .lg-btn:active { transform: translateY(0) scale(0.98); }
        @keyframes shineSlide { 0% { left:-80% } 100% { left:130% } }

        .lg-primary { background: linear-gradient(145deg,rgba(124,58,237,0.55),rgba(168,85,247,0.38),rgba(99,102,241,0.45)); border: 1px solid rgba(196,149,255,0.45) !important; box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 0 2rem rgba(124,58,237,0.35), 0 0.4rem 1.2rem rgba(0,0,0,0.4); }
        .lg-primary:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.24) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 0 3rem rgba(124,58,237,0.6), 0 0.6rem 1.8rem rgba(0,0,0,0.45); }
        .lg-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15) !important; box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 0.25rem 1rem rgba(0,0,0,0.3); }
        .lg-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.26) !important; }
        .lg-enroll { background: linear-gradient(145deg,rgba(99,102,241,0.45),rgba(168,85,247,0.32)); border: 1px solid rgba(168,85,247,0.4) !important; box-shadow: 0 1px 0 rgba(255,255,255,0.13) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 0 1.2rem rgba(99,102,241,0.22); }
        .lg-enroll:hover { box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 0 2rem rgba(99,102,241,0.46); }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', color: '#1f2937', overflow: 'hidden', position: 'relative' }}>
        <Orb style={{ top: '20%', left: '15%' }} color="#ddd6fe" size="40vw" />
        <Sidebar onNav={id => onNav && onNav(id)} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <CourseContent />
        </div>
      </div>
    </>
  )
}