import { useState, useEffect, useRef, CSSProperties } from 'react'
import Dashboard from './Dashboard'
import LessonsPage from './Lessons'
import NotesPage from './Notes'
import VisualizerPage from './Visualizer'
import ClickSpark from './components/ClickSpark'



// ─── Types ────────────────────────────────────────────────────────────────────
interface OrbProps { style?: CSSProperties; color?: string; size?: number }
interface NavbarProps { activeTab: string; setActiveTab: (tab: string) => void }
interface Feature { icon: string; title: string; desc: string; color: string }
interface FloatCard { icon: string; text: string; top?: string; bottom?: string; left?: string; right?: string }

// ─── Liquid Glass Button ──────────────────────────────────────────────────────
interface LGBtnProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'tab' | 'tabActive' | 'enroll'
  onClick?: () => void
  style?: CSSProperties
  className?: string
}
function LGBtn({ children, variant = 'ghost', onClick, style }: LGBtnProps) {
  const variantClass = {
    primary: 'lg-primary',
    ghost: 'lg-ghost',
    tab: 'lg-tab',
    tabActive: 'lg-tab-active',
    enroll: 'lg-enroll',
  }[variant]
  return (
    <button className={`lg-btn ${variantClass}`} onClick={onClick} style={style}>
      <span className="lg-shine" />
      <span className="lg-inner">{children}</span>
    </button>
  )
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.4, o: Math.random() * 0.25 + 0.05,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196,181,253,${p.o})`
        ctx.fill()
      })
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(196,181,253,${0.05 * (1 - d / 110)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return (
    <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
  )
}

// ─── Glow Orb ─────────────────────────────────────────────────────────────────
function Orb({ style, color = '#c4b5fd', size = 400 }: OrbProps) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
      width: size, height: size,
      background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
      filter: 'blur(1px)',
      ...style,
    }} />
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ activeTab, setActiveTab, setIsLoggedIn }: NavbarProps & { setIsLoggedIn: (val: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
      
      // Update active tab based on scroll position
      const aboutSection = document.getElementById('about-section')
      if (aboutSection) {
        const aboutTop = aboutSection.offsetTop - 100
        if (window.scrollY >= aboutTop) {
          setActiveTab('about')
        } else {
          setActiveTab('home')
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(124,58,237,0.12)' : '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.4s',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.05)' : 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: '#fff',
            boxShadow: '0 0 20px rgba(124,58,237,0.3)',
            fontFamily: "'Poppins',sans-serif",
          }}>K</div>
          <div>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: '#1e293b', letterSpacing: 2 }}>KYDY</span>
            <div style={{ fontSize: 8, color: '#7c3aed', letterSpacing: 3, fontFamily: 'monospace', lineHeight: 1 }}>EDTECH PLATFORM</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['home', 'about'] as const).map(tab => (
            <LGBtn
              key={tab}
              variant={activeTab === tab ? 'tabActive' : 'tab'}
              onClick={() => {
                setActiveTab(tab)
                if (tab === 'about') {
                  // Scroll to about section
                  setTimeout(() => {
                    const aboutSection = document.getElementById('about-section')
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }, 100)
                } else if (tab === 'home') {
                  // Scroll to top
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              style={{
                padding: '8px 22px', borderRadius: 8,
                fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 11,
                letterSpacing: 1.5, textTransform: 'uppercase',
                color: activeTab === tab ? '#fff' : '#64748b',
              }}
            >{tab}</LGBtn>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10 }}>
          <LGBtn variant="ghost" onClick={() => setIsLoggedIn(true)} style={{
            padding: '9px 20px', borderRadius: 8,
            fontFamily: "'Poppins',sans-serif", fontSize: 10, letterSpacing: 1, fontWeight: 600,
            color: '#7c3aed',
          }}>EXPLORE KYDY</LGBtn>
          <LGBtn variant="primary" onClick={() => setIsLoggedIn(true)} style={{
            padding: '9px 20px', borderRadius: 8,
            fontFamily: "'Poppins',sans-serif", fontSize: 10, letterSpacing: 1, fontWeight: 700,
            color: '#1e293b',
          }}>START FREE</LGBtn>
        </div>
      </div>
    </nav>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) {
  const count = { s: 0, c: 0, i: 0 }

  const floatCards: FloatCard[] = [
    { icon: '⚡', text: 'Live Sessions', top: '8%', left: '2%' },
    { icon: '🤖', text: 'AI Powered', top: '8%', right: '2%' },
    { icon: '🏆', text: 'Certified', bottom: '12%', left: '0%' },
    { icon: '👥', text: 'Community', bottom: '12%', right: '0%' },
  ]

  const features: Feature[] = [
    { icon: '📚', title: 'Quality Content', desc: 'Access thousands of courses from expert instructors worldwide', color: '#6366f1' },
    { icon: '🎯', title: 'Learn at Your Pace', desc: 'Flexible schedules that fit your lifestyle and ambitions', color: '#7c3aed' },
    { icon: '🏆', title: 'Get Certified', desc: 'Earn industry-recognized certificates upon completion', color: '#a855f7' },
  ]

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 70, background: '#f3f4f6' }}>
      <ParticleCanvas />
      <Orb style={{ top: '-10%', left: '-5%' }} color="#c4b5fd" size={600} />
      <Orb style={{ bottom: '5%', right: '-5%' }} color="#ddd6fe" size={500} />
      <Orb style={{ top: '40%', left: '40%' }} color="#e9d5ff" size={350} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 2, width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60, alignItems: 'center' }}>

          {/* Left */}
          <div style={{ animation: 'slideUp 0.9s ease forwards' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 30, padding: '6px 18px', marginBottom: 28,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 10px #7c3aed', display: 'inline-block', animation: 'blink 2s infinite' }} />
              <span style={{ color: '#7c3aed', fontSize: 11, fontFamily: "'Poppins',sans-serif", letterSpacing: 2, fontWeight: 600 }}>NEXT-GEN LEARNING PLATFORM</span>
            </div>

            <h1 style={{
              fontFamily: "'Poppins',sans-serif", fontWeight: 900, lineHeight: 1.05,
              fontSize: 'clamp(2.4rem,4vw,3.8rem)', color: '#1e293b', marginBottom: 28, letterSpacing: '-1px',
            }}>
              UNLOCK YOUR<br />
              <span style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FULL POTENTIAL
              </span><br />
              WITH KYDY
            </h1>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <LGBtn
                variant="primary"
                onClick={() => setIsLoggedIn(true)}
                style={{
                  padding: '14px 34px', borderRadius: 10,
                  fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1,
                  color: '#1e293b',
                }}
              >EXPLORE KYDY →</LGBtn>
              <LGBtn
                variant="ghost"
                style={{
                  padding: '14px 34px', borderRadius: 10,
                  fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1,
                  color: '#7c3aed',
                }}
              >▶ WATCH DEMO</LGBtn>
            </div>

            <div style={{ display: 'flex', gap: 36, marginTop: 44 }}>
              {[{ v: `${count.s}K+`, l: 'Learners' }, { v: `${count.c}+`, l: 'Courses' }, { v: `${count.i}+`, l: 'Instructors' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#1e293b', fontFamily: "'Poppins',sans-serif" }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'Inter',sans-serif", letterSpacing: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — orbiting visual */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              width: 420, height: 420, borderRadius: '50%',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', animation: 'spinSlow 30s linear infinite',
            }}>
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <div key={deg} style={{
                  position: 'absolute', width: 10, height: 10, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                  boxShadow: '0 0 12px #7c3aed', top: '50%', left: '50%',
                  transform: `translate(-50%,-50%) rotate(${deg}deg) translateX(210px)`,
                }} />
              ))}
            </div>
            <div style={{
              position: 'absolute', width: 300, height: 300, borderRadius: '50%',
              border: '1px solid rgba(168,85,247,0.25)',
              animation: 'spinSlow 20s linear infinite reverse',
            }} />
            <div style={{
              position: 'absolute', width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(124,58,237,0.5), rgba(168,85,247,0.3), rgba(99,102,241,0.1))',
              border: '2px solid rgba(124,58,237,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 72, boxShadow: '0 0 60px rgba(124,58,237,0.4), inset 0 0 40px rgba(124,58,237,0.2)',
              animation: 'corePulse 4s ease-in-out infinite',
            }}>🎓</div>

            {floatCards.map((c, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
                backdropFilter: 'blur(20px)', whiteSpace: 'nowrap',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                animation: `floatCard 4s ease-in-out ${i * 0.6}s infinite`,
              }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span style={{ color: '#1e293b', fontSize: 11, fontFamily: "'Poppins',sans-serif", fontWeight: 600, letterSpacing: 0.5 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 70 }}>
          {features.map((f, i) => (
            <div key={i}
              style={{
                background: '#ffffff', border: '1px solid rgba(124,58,237,0.12)',
                borderRadius: 18, padding: '28px', transition: 'all 0.3s', cursor: 'default',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${f.color}55`
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.1), 0 0 30px ${f.color}15`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, marginBottom: 18,
                background: `${f.color}18`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{f.icon}</div>
              <h3 style={{ color: '#1e293b', fontSize: 13, fontWeight: 700, marginBottom: 8, fontFamily: "'Poppins',sans-serif", letterSpacing: 0.5 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65, fontFamily: "'Inter',sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const features: Feature[] = [
    { icon: '📚', title: 'Quality Content', desc: 'Thousands of courses from world-class instructors', color: '#6366f1' },
    { icon: '🎯', title: 'Learn at Your Pace', desc: 'Flexible schedules that fit your lifestyle', color: '#7c3aed' },
    { icon: '🏆', title: 'Get Certified', desc: 'Earn recognized certificates upon completion', color: '#a855f7' },
  ]
  const stats = [
    { v: '50K+', l: 'Active Learners' }, { v: '500+', l: 'Courses' },
    { v: '100+', l: 'Instructors' }, { v: '98%', l: 'Satisfaction' },
  ]
  return (
    <section id="about-section" style={{ minHeight: '100vh', padding: '110px 2rem 80px', position: 'relative', overflow: 'hidden', background: '#f3f4f6' }}>
      <Orb style={{ top: '10%', left: '-5%' }} color="#ddd6fe" size={500} />
      <Orb style={{ bottom: '5%', right: '-5%' }} color="#c4b5fd" size={400} />
      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 30, padding: '5px 18px', marginBottom: 18,
          }}>
            <span style={{ color: '#a855f7', fontSize: 10, fontFamily: "'Poppins',sans-serif", letterSpacing: 3, fontWeight: 600 }}>OUR STORY</span>
          </div>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', color: '#1e293b', letterSpacing: -1 }}>
            ABOUT{' '}
            <span style={{ background: 'linear-gradient(90deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>KYDY</span>
          </h2>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: 24, padding: '48px 52px', backdropFilter: 'blur(24px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: 24,
        }}>
          <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 16, marginBottom: 18, fontFamily: "'Inter',sans-serif" }}>
            Kydy is a modern educational technology platform designed to make learning accessible, engaging, and effective for everyone. We believe that knowledge has the power to transform lives.
          </p>
          <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 16, marginBottom: 44, fontFamily: "'Inter',sans-serif" }}>
            Our mission is to empower learners worldwide with high-quality educational content, interactive learning experiences, and industry-recognized certifications that open doors to limitless opportunities.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {stats.map((s, i) => (
              <div key={i}
                style={{
                  background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)',
                  borderRadius: 16, padding: '22px 16px', textAlign: 'center', transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)' }}
              >
                <div style={{
                  fontSize: 30, fontWeight: 900, fontFamily: "'Poppins',sans-serif",
                  background: 'linear-gradient(135deg,#7c3aed,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6,
                }}>{s.v}</div>
                <div style={{ color: '#64748b', fontSize: 11, fontFamily: "'Inter',sans-serif", letterSpacing: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i}
              style={{
                background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 20, padding: '28px 24px', transition: 'all 0.3s', cursor: 'default',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}44`; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)' }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ color: '#1e293b', fontSize: 13, fontWeight: 700, marginBottom: 8, fontFamily: "'Poppins',sans-serif", letterSpacing: 0.5 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65, fontFamily: "'Inter',sans-serif" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [dashboardView, setDashboardView] = useState<string>('lessons')

  // If logged in, show Dashboard or other views based on dashboardView
  if (isLoggedIn) {
    if (dashboardView === 'lessons') {
      return <LessonsPage onNav={(id: string) => setDashboardView(id)} />
    }
    if (dashboardView === 'notes') {
      return <NotesPage onNav={(id: string) => setDashboardView(id)} />
    }
    if (dashboardView === 'visualizer') {
      return <VisualizerPage onNav={(id: string) => setDashboardView(id)} />
    }
    return <Dashboard onNavigate={(view: string) => setDashboardView(view)} />
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #f3f4f6; overflow-x: hidden; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }
        @keyframes slideUp { from { opacity:0; transform:translateY(35px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spinSlow { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes floatCard { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
        @keyframes corePulse {
          0%,100% { box-shadow:0 0 60px rgba(124,58,237,0.3),inset 0 0 40px rgba(124,58,237,0.15) }
          50% { box-shadow:0 0 100px rgba(124,58,237,0.5),inset 0 0 60px rgba(124,58,237,0.25) }
        }
        @keyframes blink { 0%,100% { opacity:1; box-shadow:0 0 10px #7c3aed } 50% { opacity:0.4; box-shadow:0 0 20px #7c3aed } }
        @keyframes shineSlide { 0% { left:-75% } 100% { left:130% } }

        /* ── Liquid Glass Core ── */
        .lg-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          outline: none;
          overflow: hidden;
          isolation: isolate;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
        }
        /* Frosted glass blur layer */
        .lg-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          backdrop-filter: blur(16px) saturate(200%) brightness(1.25) contrast(1.05);
          -webkit-backdrop-filter: blur(16px) saturate(200%) brightness(1.25) contrast(1.05);
          z-index: 0;
          border-radius: inherit;
        }
        /* Glass highlight gradient — top-left bright, bottom-right dim */
        .lg-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg,
              rgba(255,255,255,0.26) 0%,
              rgba(255,255,255,0.06) 35%,
              rgba(0,0,0,0.0) 55%,
              rgba(255,255,255,0.09) 100%
            );
          z-index: 1;
          pointer-events: none;
          border-radius: inherit;
        }
        /* Top edge specular highlight */
        .lg-btn .lg-inner {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        /* Sweep shine */
        .lg-btn .lg-shine {
          position: absolute;
          top: -60%;
          left: -80%;
          width: 45%;
          height: 220%;
          background: linear-gradient(105deg,
            transparent 15%,
            rgba(255,255,255,0.32) 50%,
            transparent 85%
          );
          transform: skewX(-18deg);
          z-index: 4;
          pointer-events: none;
          transition: left 0s;
        }
        .lg-btn:hover .lg-shine {
          animation: shineSlide 0.6s ease forwards;
        }
        .lg-btn:hover { transform: translateY(-2px) scale(1.01); }
        .lg-btn:active { transform: translateY(0) scale(0.98); }

        /* ── Primary: purple liquid glass ── */
        .lg-primary {
          background: linear-gradient(145deg,
            rgba(124,58,237,0.55) 0%,
            rgba(168,85,247,0.38) 50%,
            rgba(99,102,241,0.45) 100%
          );
          border: 1px solid rgba(196,149,255,0.45) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06) inset,
            0 1px 0 rgba(255,255,255,0.2) inset,
            0 -1px 0 rgba(0,0,0,0.3) inset,
            0 0 35px rgba(124,58,237,0.4),
            0 6px 24px rgba(0,0,0,0.45);
        }
        .lg-primary:hover {
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08) inset,
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 -1px 0 rgba(0,0,0,0.3) inset,
            0 0 55px rgba(124,58,237,0.65),
            0 10px 35px rgba(0,0,0,0.5);
        }

        /* ── Ghost: neutral frosted glass ── */
        .lg-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18) !important;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 -1px 0 rgba(0,0,0,0.2) inset,
            0 4px 20px rgba(0,0,0,0.35);
        }
        .lg-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3) !important;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.22) inset,
            0 -1px 0 rgba(0,0,0,0.2) inset,
            0 6px 28px rgba(0,0,0,0.42);
        }

        /* ── Nav tab active ── */
        .lg-tab-active {
          background: linear-gradient(145deg, rgba(124,58,237,0.52), rgba(168,85,247,0.4));
          border: 1px solid rgba(196,149,255,0.4) !important;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.18) inset,
            0 -1px 0 rgba(0,0,0,0.25) inset,
            0 0 20px rgba(124,58,237,0.45);
        }

        /* ── Nav tab inactive ── */
        .lg-tab {
          background: rgba(255,255,255,0.03);
          border: 1px solid transparent !important;
        }
        .lg-tab:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset;
        }

        /* ── Enroll card button ── */
        .lg-enroll {
          background: linear-gradient(145deg, rgba(99,102,241,0.45), rgba(168,85,247,0.32));
          border: 1px solid rgba(168,85,247,0.42) !important;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 -1px 0 rgba(0,0,0,0.22) inset,
            0 0 22px rgba(99,102,241,0.25);
        }
        .lg-enroll:hover {
          box-shadow:
            0 1px 0 rgba(255,255,255,0.22) inset,
            0 -1px 0 rgba(0,0,0,0.22) inset,
            0 0 40px rgba(99,102,241,0.5);
        }
      `}</style>
      <ClickSpark sparkColor="#7c3aed" sparkSize={15} sparkRadius={25} sparkCount={12} duration={600} extraScale={1.5}>
        <div style={{ background: '#f3f4f6', minHeight: '100vh', color: '#1e293b' }}>
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setIsLoggedIn={setIsLoggedIn} />
          <div>
            <Home setIsLoggedIn={setIsLoggedIn} />
            <About />
          </div>
          <footer style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '28px 2rem', textAlign: 'center', background: '#ffffff' }}>
            <span style={{ color: '#64748b', fontSize: 13, fontFamily: "'Inter',sans-serif" }}>
              © 2025 <span style={{ color: '#7c3aed', fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>KYDY</span> — Empowering learners worldwide
            </span>
          </footer>
        </div>
      </ClickSpark>
    </>
  )
}
