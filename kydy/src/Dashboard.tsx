import { useState, useEffect, CSSProperties } from 'react'
import ClickSpark from './components/ClickSpark'
import UnifiedSidebar from './components/UnifiedSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatCardData { icon: string; label: string; value: string; sub: string; color: string }
interface CourseProgress {
  title: string; icon: string; color: string
  progress: number; lessons: number; lessonsTotal: number; tag: string
}

// ─── API Functions ────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'

async function fetchDashboardStats() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    return await response.json()
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Fallback to mock data
    return {
      study_time: '24h',
      study_time_sub: '+3h this week',
      streak: '12',
      streak_sub: 'Days in a row',
      in_progress: '3',
      in_progress_sub: 'Active courses',
      completed: '7',
      completed_sub: 'Courses finished'
    }
  }
}

async function fetchCourseProgress() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/courses`)
    if (!response.ok) throw new Error('Failed to fetch courses')
    return await response.json()
  } catch (error) {
    console.error('Error fetching course progress:', error)
    // Fallback to mock data
    return [
      { title: 'Web Development',  icon: '⚡', color: '#6366f1', progress: 68, lessons: 17, lessonsTotal: 25, tag: 'In Progress'  },
      { title: 'Machine Learning', icon: '🤖', color: '#7c3aed', progress: 35, lessons: 8,  lessonsTotal: 23, tag: 'In Progress'  },
      { title: 'UI/UX Design',     icon: '🎨', color: '#a855f7', progress: 82, lessons: 21, lessonsTotal: 26, tag: 'Almost Done'  },
    ]
  }
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
      <div style={{ fontSize: 28, fontWeight: 900, color: '#1f2937', fontFamily: "'Poppins',sans-serif", marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', fontFamily: "'Poppins',sans-serif", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Inter',sans-serif" }}>{sub}</div>
    </div>
  )
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function DashboardContent({ onNav }: { onNav: (id: string) => void }) {
  const [stats, setStats] = useState<StatCardData[]>([
    { icon: '⏱', label: 'Study Time',  value: '24h', sub: '+3h this week',    color: '#6366f1' },
    { icon: '🔥', label: 'Streak',      value: '12',  sub: 'Days in a row',    color: '#f59e0b' },
    { icon: '📖', label: 'In Progress', value: '3',   sub: 'Active courses',   color: '#7c3aed' },
    { icon: '🏆', label: 'Completed',   value: '7',   sub: 'Courses finished', color: '#22c55e' },
  ])
  const [courses, setCourses] = useState<CourseProgress[]>([
    { title: 'Web Development',  icon: '⚡', color: '#6366f1', progress: 68, lessons: 17, lessonsTotal: 25, tag: 'In Progress'  },
    { title: 'Machine Learning', icon: '🤖', color: '#7c3aed', progress: 35, lessons: 8,  lessonsTotal: 23, tag: 'In Progress'  },
    { title: 'UI/UX Design',     icon: '🎨', color: '#a855f7', progress: 82, lessons: 21, lessonsTotal: 26, tag: 'Almost Done'  },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const [statsData, coursesData] = await Promise.all([
          fetchDashboardStats(),
          fetchCourseProgress()
        ])

        // Update stats
        setStats([
          { icon: '⏱', label: 'Study Time',  value: statsData.study_time, sub: statsData.study_time_sub, color: '#6366f1' },
          { icon: '🔥', label: 'Streak',      value: statsData.streak,     sub: statsData.streak_sub,     color: '#f59e0b' },
          { icon: '📖', label: 'In Progress', value: statsData.in_progress, sub: statsData.in_progress_sub, color: '#7c3aed' },
          { icon: '🏆', label: 'Completed',   value: statsData.completed,   sub: statsData.completed_sub,   color: '#22c55e' },
        ])

        // Update courses
        setCourses(coursesData.map((course: any) => ({
          title: course.title,
          icon: course.icon,
          color: course.color,
          progress: course.progress,
          lessons: course.lessons,
          lessonsTotal: course.lessons_total,
          tag: course.tag
        })))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleContinueCourse = async (courseTitle: string) => {
    try {
      // Update progress when user continues a course
      const course = courses.find(c => c.title === courseTitle)
      if (course) {
        const response = await fetch(`${API_BASE}/api/dashboard/update-progress?course_title=${encodeURIComponent(courseTitle)}&lessons_completed=${course.lessons + 1}`, {
          method: 'POST'
        })
        if (response.ok) {
          // Reload dashboard data to reflect changes
          const [statsData, coursesData] = await Promise.all([
            fetchDashboardStats(),
            fetchCourseProgress()
          ])
          
          setStats([
            { icon: '⏱', label: 'Study Time',  value: statsData.study_time, sub: statsData.study_time_sub, color: '#6366f1' },
            { icon: '🔥', label: 'Streak',      value: statsData.streak,     sub: statsData.streak_sub,     color: '#f59e0b' },
            { icon: '📖', label: 'In Progress', value: statsData.in_progress, sub: statsData.in_progress_sub, color: '#7c3aed' },
            { icon: '🏆', label: 'Completed',   value: statsData.completed,   sub: statsData.completed_sub,   color: '#22c55e' },
          ])

          setCourses(coursesData.map((course: any) => ({
            title: course.title,
            icon: course.icon,
            color: course.color,
            progress: course.progress,
            lessons: course.lessons,
            lessonsTotal: course.lessons_total,
            tag: course.tag
          })))
        }
      }
    } catch (error) {
      console.error('Error updating course progress:', error)
    }
    
    onNav('lessons')
  }

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
          <div style={{ color: '#7c3aed', fontSize: 10, fontFamily: "'Poppins',sans-serif", letterSpacing: 3, marginBottom: 5 }}>OVERVIEW</div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: '1.75rem', color: '#1f2937', letterSpacing: -1 }}>DASHBOARD</h1>
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
            <div style={{ color: '#7c3aed', fontSize: 10, fontFamily: "'Poppins',sans-serif", letterSpacing: 3, marginBottom: 4 }}>CURRENTLY STUDYING</div>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#1f2937', letterSpacing: -0.5 }}>MY COURSES</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontFamily: "'Inter',sans-serif" }}>
              Loading courses...
            </div>
          ) : (
            courses.map((c, i) => (
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
                    <span style={{ color: '#1f2937', fontSize: 13, fontWeight: 700, fontFamily: "'Poppins',sans-serif", letterSpacing: 0.3 }}>{c.title}</span>
                    <span style={{ background: `${c.color}22`, border: `1px solid ${c.color}44`, borderRadius: 20, padding: '2px 10px', color: c.color, fontSize: 9, fontFamily: "'Poppins',sans-serif", letterSpacing: 1 }}>{c.tag}</span>
                  </div>
                  <ProgressBar value={c.progress} color={c.color} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ color: '#6b7280', fontSize: 11, fontFamily: "'Inter',sans-serif" }}>{c.lessons}/{c.lessonsTotal} lessons</span>
                    <span style={{ color: c.color, fontSize: 11, fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>{c.progress}%</span>
                  </div>
                </div>
                <LGBtn variant="enroll" onClick={() => handleContinueCourse(c.title)} style={{ padding: '8px 16px', borderRadius: 9, flexShrink: 0, fontFamily: "'Poppins',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#1e293b' }}>
                  CONTINUE
                </LGBtn>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Weekly Activity ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ color: '#7c3aed', fontSize: 10, fontFamily: "'Poppins',sans-serif", letterSpacing: 3, marginBottom: 4 }}>THIS WEEK</div>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#1f2937', letterSpacing: -0.5, marginBottom: 16 }}>ACTIVITY</h2>
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
    if (id === 'lessons' && onNavigate) { 
      onNavigate('lessons')
      return 
    }
    if (id === 'visualizer' && onNavigate) { 
      onNavigate('visualizer')
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
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

      <ClickSpark sparkColor="#7c3aed" sparkSize={10} sparkRadius={18} sparkCount={10} duration={450} extraScale={1.1}>
        <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', color: '#1f2937', overflow: 'hidden', position: 'relative' }}>
          <Orb style={{ top: '20%', left: '25%' }} color="#ddd6fe" size={700} />
          <UnifiedSidebar active={active} onNav={handleNav} variant="light" />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <DashboardContent onNav={handleNav} />
          </div>
        </div>
      </ClickSpark>
    </>
  )
}
