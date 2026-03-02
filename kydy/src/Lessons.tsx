import { useState, useRef, useEffect, CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message { id: number; role: 'user' | 'ai'; text: string; time: string }
interface Session { id: number; title: string; date: string; preview: string; active: boolean }

// ─── Nav Items (reuse sidebar shape) ─────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
  { id: 'courses',   icon: '◈', label: 'Courses'   },
  { id: 'lessons',   icon: '▶', label: 'Lessons'   },
  { id: 'notes',     icon: '✦', label: 'Notes'     },
  { id: 'settings',  icon: '⚙', label: 'Settings'  },
]

// ─── Sidebar (dark — matches rest of app) ─────────────────────────────────────
function Sidebar({ onNav }: { onNav: (id: string) => void }) {
  return (
    <aside style={{
      width: '4rem', flexShrink: 0,
      background: 'rgba(6,3,22,0.98)',
      borderRight: '1px solid rgba(124,58,237,0.15)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '1.2rem 0',
      position: 'sticky', top: 0, height: '100vh', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        width: '2.2rem', height: '2.2rem', borderRadius: '0.55rem', marginBottom: '2rem',
        background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans',sans-serif", fontWeight: 900, color: '#fff', fontSize: '1rem',
        boxShadow: '0 0 1rem rgba(124,58,237,0.5)',
      }}>K</div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.id === 'lessons'
          return (
            <button key={item.id} title={item.label} onClick={() => onNav(item.id)} style={{
              width: '2.6rem', height: '2.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem',
              background: isActive ? 'rgba(124,58,237,0.35)' : 'transparent',
              color: isActive ? '#e9d5ff' : '#64748b',
              boxShadow: isActive ? '0 0 1rem rgba(124,58,237,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >{item.icon}</button>
          )
        })}
      </nav>

      {/* Avatar */}
      <div style={{
        width: '2.2rem', height: '2.2rem', borderRadius: '50%',
        background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
        boxShadow: '0 0 0.6rem rgba(124,58,237,0.4)', cursor: 'pointer',
      }}>👤</div>
    </aside>
  )
}

// ─── Chat History Panel ───────────────────────────────────────────────────────
const SESSIONS: Session[] = [
  { id: 1, title: 'React Hooks Explained', date: 'Today', preview: 'Can you explain useEffect in depth?', active: true },
  { id: 2, title: 'CSS Grid vs Flexbox', date: 'Today', preview: 'When should I use Grid over Flexbox?', active: false },
  { id: 3, title: 'JavaScript Closures', date: 'Yesterday', preview: 'What exactly is a closure?', active: false },
  { id: 4, title: 'Node.js Event Loop', date: 'Yesterday', preview: 'How does the event loop work?', active: false },
  { id: 5, title: 'TypeScript Generics', date: 'Feb 25', preview: 'Help me understand generics', active: false },
  { id: 6, title: 'REST vs GraphQL', date: 'Feb 24', preview: 'Pros and cons of each?', active: false },
  { id: 7, title: 'Database Indexing', date: 'Feb 22', preview: 'Why are indexes so important?', active: false },
]

function HistoryPanel({ activeId, onSelect }: { activeId: number; onSelect: (id: number) => void }) {
  const grouped = [
    { label: 'Today', items: SESSIONS.filter(s => s.date === 'Today') },
    { label: 'Yesterday', items: SESSIONS.filter(s => s.date === 'Yesterday') },
    { label: 'Earlier', items: SESSIONS.filter(s => !['Today', 'Yesterday'].includes(s.date)) },
  ].filter(g => g.items.length > 0)

  return (
    <div style={{
      width: '16rem', flexShrink: 0, height: '100vh',
      background: '#f8f7ff',
      borderRight: '1px solid #e8e4f8',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '1.2rem 1rem 0.8rem', borderBottom: '1px solid #eeeaf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#6d28d9', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Chat History</span>
          <button style={{
            width: '1.8rem', height: '1.8rem', borderRadius: '0.45rem', border: 'none', cursor: 'pointer',
            background: '#ede9fe', color: '#7c3aed', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#ddd6fe'}
            onMouseLeave={e => e.currentTarget.style.background = '#ede9fe'}
            title="New chat"
          >+</button>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#a78bfa' }}>🔍</span>
          <input placeholder="Search sessions..." style={{
            width: '100%', padding: '0.42rem 0.6rem 0.42rem 1.8rem',
            borderRadius: '0.5rem', border: '1px solid #e0d9f7',
            background: '#fff', fontSize: '0.7rem', fontFamily: "'DM Sans',sans-serif",
            color: '#374151', outline: 'none',
          }} />
        </div>
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.6rem' }}>
        {grouped.map(group => (
          <div key={group.label} style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.58rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.4rem 0.4rem 0.25rem' }}>{group.label}</div>
            {group.items.map(session => (
              <button key={session.id} onClick={() => onSelect(session.id)} style={{
                width: '100%', textAlign: 'left', padding: '0.6rem 0.65rem',
                borderRadius: '0.55rem', border: 'none', cursor: 'pointer',
                background: activeId === session.id ? '#ede9fe' : 'transparent',
                borderLeft: activeId === session.id ? '2px solid #7c3aed' : '2px solid transparent',
                transition: 'all 0.15s', marginBottom: '0.1rem',
              }}
                onMouseEnter={e => { if (activeId !== session.id) e.currentTarget.style.background = '#f3f0ff' }}
                onMouseLeave={e => { if (activeId !== session.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ fontSize: '0.72rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: activeId === session.id ? '#6d28d9' : '#374151', marginBottom: '0.18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.title}</div>
                <div style={{ fontSize: '0.62rem', fontFamily: "'DM Sans',sans-serif", color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.preview}</div>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Course context badge */}
      <div style={{ padding: '0.7rem 0.8rem', borderTop: '1px solid #eeeaf8', background: '#f3f0ff' }}>
        <div style={{ fontSize: '0.58rem', color: '#a78bfa', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>CURRENT COURSE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>⚡</span>
          <div>
            <div style={{ fontSize: '0.7rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#374151' }}>Web Development</div>
            <div style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", color: '#9ca3af' }}>Lesson 17 of 25</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SVG Animation — AI Brain Visualizer ─────────────────────────────────────
function AIVisualizer({ speaking, svgCode }: { speaking: boolean; svgCode?: string }) {
  // If SVG code is provided from backend, render it directly
  if (svgCode) {
    return (
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        {/* Label */}
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: speaking ? '#f0fdf4' : '#f5f3ff', border: `1px solid ${speaking ? '#86efac' : '#ddd6fe'}`, borderRadius: '2rem', padding: '0.3rem 0.9rem' }}>
            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: speaking ? '#22c55e' : '#a78bfa', display: 'inline-block', animation: speaking ? 'pulse-dot 1s infinite' : 'none' }} />
            <span style={{ fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: speaking ? '#16a34a' : '#7c3aed', letterSpacing: '0.06em' }}>
              {speaking ? 'GENERATING RESPONSE' : 'KYDY AI READY'}
            </span>
          </div>
        </div>

        {/* Dynamic SVG from backend */}
        <div 
          style={{ width: '100%', maxWidth: '22rem', height: 'auto' }}
          dangerouslySetInnerHTML={{ __html: svgCode }}
        />

        {/* Waveform bars when speaking */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', height: '2.5rem', marginTop: '0.8rem' }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{
              width: '0.2rem', borderRadius: '0.2rem',
              background: speaking ? `hsl(${265 + i * 3},70%,${50 + (i % 3) * 10}%)` : '#e5e7eb',
              height: speaking ? `${30 + Math.sin(i * 0.8) * 20}%` : '20%',
              transition: 'height 0.3s ease, background 0.3s',
              animation: speaking ? `wave-bar-${i % 4} ${0.6 + (i % 3) * 0.2}s ease-in-out infinite alternate` : 'none',
            }} />
          ))}
        </div>
      </div>
    )
  }

  // Default neural network visualization (fallback)
  const nodes = [
    { cx: '50%', cy: '22%', r: 18, delay: 0 },
    { cx: '25%', cy: '42%', r: 13, delay: 0.3 },
    { cx: '75%', cy: '42%', r: 13, delay: 0.6 },
    { cx: '15%', cy: '65%', r: 10, delay: 0.9 },
    { cx: '40%', cy: '65%', r: 10, delay: 0.2 },
    { cx: '60%', cy: '65%', r: 10, delay: 0.5 },
    { cx: '85%', cy: '65%', r: 10, delay: 0.8 },
    { cx: '30%', cy: '83%', r: 8, delay: 1.1 },
    { cx: '50%', cy: '83%', r: 8, delay: 0.4 },
    { cx: '70%', cy: '83%', r: 8, delay: 0.7 },
  ]

  const edges = [
    ['50%,22%', '25%,42%'], ['50%,22%', '75%,42%'],
    ['25%,42%', '15%,65%'], ['25%,42%', '40%,65%'],
    ['75%,42%', '60%,65%'], ['75%,42%', '85%,65%'],
    ['15%,65%', '30%,83%'], ['40%,65%', '30%,83%'],
    ['40%,65%', '50%,83%'], ['60%,65%', '50%,83%'],
    ['60%,65%', '70%,83%'], ['85%,65%', '70%,83%'],
  ]

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Label */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: speaking ? '#f0fdf4' : '#f5f3ff', border: `1px solid ${speaking ? '#86efac' : '#ddd6fe'}`, borderRadius: '2rem', padding: '0.3rem 0.9rem' }}>
          <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: speaking ? '#22c55e' : '#a78bfa', display: 'inline-block', animation: speaking ? 'pulse-dot 1s infinite' : 'none' }} />
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: speaking ? '#16a34a' : '#7c3aed', letterSpacing: '0.06em' }}>
            {speaking ? 'GENERATING RESPONSE' : 'KYDY AI READY'}
          </span>
        </div>
      </div>

      {/* SVG neural net */}
      <svg viewBox="0 0 400 320" style={{ width: '100%', maxWidth: '22rem', height: 'auto' }}>
        <defs>
          <radialGradient id="nodeGrad1" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
          <radialGradient id="nodeGrad2" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes pulse-node { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
            @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
            @keyframes flow { 0%{stroke-dashoffset:100} 100%{stroke-dashoffset:0} }
            @keyframes glow-line { 0%,100%{opacity:0.15} 50%{opacity:0.55} }
            .nn-node { animation: pulse-node 2.5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
            .nn-edge { stroke-dasharray: 5 5; animation: flow 2s linear infinite; }
            .nn-edge-glow { animation: glow-line 2.5s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Edges */}
        <line x1="200" y1="70" x2="100" y2="134" className="nn-edge-glow" stroke="#c4b5fd" strokeWidth="1.5" />
        <line x1="200" y1="70" x2="300" y2="134" className="nn-edge-glow" stroke="#c4b5fd" strokeWidth="1.5" />
        <line x1="100" y1="134" x2="60"  y2="208" className="nn-edge-glow" stroke="#ddd6fe" strokeWidth="1" />
        <line x1="100" y1="134" x2="160" y2="208" className="nn-edge-glow" stroke="#ddd6fe" strokeWidth="1" />
        <line x1="300" y1="134" x2="240" y2="208" className="nn-edge-glow" stroke="#ddd6fe" strokeWidth="1" />
        <line x1="300" y1="134" x2="340" y2="208" className="nn-edge-glow" stroke="#ddd6fe" strokeWidth="1" />
        <line x1="60"  y1="208" x2="120" y2="265" className="nn-edge-glow" stroke="#ede9fe" strokeWidth="1" />
        <line x1="160" y1="208" x2="120" y2="265" className="nn-edge-glow" stroke="#ede9fe" strokeWidth="1" />
        <line x1="160" y1="208" x2="200" y2="265" className="nn-edge-glow" stroke="#ede9fe" strokeWidth="1" />
        <line x1="240" y1="208" x2="200" y2="265" className="nn-edge-glow" stroke="#ede9fe" strokeWidth="1" />
        <line x1="240" y1="208" x2="280" y2="265" className="nn-edge-glow" stroke="#ede9fe" strokeWidth="1" />
        <line x1="340" y1="208" x2="280" y2="265" className="nn-edge-glow" stroke="#ede9fe" strokeWidth="1" />

        {/* Animated flow lines */}
        <line x1="200" y1="70" x2="100" y2="134" className="nn-edge" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5" />
        <line x1="200" y1="70" x2="300" y2="134" className="nn-edge" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5" strokeDashoffset="50" />
        <line x1="100" y1="134" x2="60"  y2="208" className="nn-edge" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" strokeDashoffset="25" />
        <line x1="300" y1="134" x2="340" y2="208" className="nn-edge" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" />

        {/* Layer 1 — root */}
        <circle cx="200" cy="70" r="22" fill="url(#nodeGrad1)" filter="url(#glow)" className="nn-node" style={{ animationDelay: '0s' }} />
        <text x="200" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">AI</text>

        {/* Layer 2 */}
        <circle cx="100" cy="134" r="15" fill="url(#nodeGrad2)" filter="url(#glow)" className="nn-node" style={{ animationDelay: '0.3s' }} />
        <circle cx="300" cy="134" r="15" fill="url(#nodeGrad2)" filter="url(#glow)" className="nn-node" style={{ animationDelay: '0.6s' }} />

        {/* Layer 3 */}
        {[60, 160, 240, 340].map((x, i) => (
          <circle key={x} cx={x} cy="208" r="11" fill="#c4b5fd" filter="url(#glow)" className="nn-node" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}

        {/* Layer 4 */}
        {[120, 200, 280].map((x, i) => (
          <circle key={x} cx={x} cy="265" r="8" fill="#ddd6fe" className="nn-node" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </svg>

      {/* Waveform bars when speaking */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', height: '2.5rem', marginTop: '0.8rem' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{
            width: '0.2rem', borderRadius: '0.2rem',
            background: speaking ? `hsl(${265 + i * 3},70%,${50 + (i % 3) * 10}%)` : '#e5e7eb',
            height: speaking ? `${30 + Math.sin(i * 0.8) * 20}%` : '20%',
            transition: 'height 0.3s ease, background 0.3s',
            animation: speaking ? `wave-bar-${i % 4} ${0.6 + (i % 3) * 0.2}s ease-in-out infinite alternate` : 'none',
          }} />
        ))}
      </div>

      {/* Topic chips */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem', maxWidth: '18rem' }}>
        {['useEffect', 'Hooks', 'React', 'Lifecycle', 'Cleanup'].map((t, i) => (
          <span key={t} style={{
            background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '2rem',
            padding: '0.22rem 0.6rem', fontSize: '0.6rem',
            fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#7c3aed',
            animation: `fadeIn 0.4s ease forwards`,
            animationDelay: `${i * 0.1}s`, opacity: 0,
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  { id: 1, role: 'ai', text: "Hi Ridhan! 👋 I'm your KYDY AI tutor. I see you're working on **React Hooks** today. What would you like to understand better?", time: '10:14 AM' },
  { id: 2, role: 'user', text: 'Can you explain useEffect in depth? I keep getting confused about the dependency array.', time: '10:15 AM' },
  { id: 3, role: 'ai', text: "Great question! `useEffect` runs **after every render** by default. The dependency array controls *when* it re-runs:\n\n• **No array** → runs after every render\n• **Empty `[]`** → runs once on mount\n• **`[value]`** → runs when `value` changes\n\nThink of it like a watcher — you tell it what to watch, and it reacts when those things change.", time: '10:15 AM' },
]

function renderText(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|•[^\n]+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: '#f0ebff', color: '#6d28d9', borderRadius: '0.3rem', padding: '0.1em 0.35em', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82em' }}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: '#4c1d95', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} style={{ color: '#6d28d9' }}>{part.slice(1, -1)}</em>
    if (part.startsWith('•'))
      return <div key={i} style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0' }}>
        <span style={{ color: '#a78bfa', flexShrink: 0 }}>◆</span>
        <span>{part.slice(1).trim()}</span>
      </div>
    return part.split('\n').map((line, j) => <span key={j}>{line}{j < part.split('\n').length - 1 && <br />}</span>)
  })
}

function ChatPanel({ onSpeak }: { onSpeak: (v: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const AI_RESPONSES = [
    "That's a wonderful question! Let me break it down clearly.\n\n`useCallback` memoizes a **function** so it doesn't get recreated on every render. This is useful when passing callbacks to child components that use `React.memo`.\n\n• Wrap with `useCallback(fn, [deps])`\n• Only recreates when deps change\n• Pairs well with `React.memo`",
    "Here's how to think about it: imagine your component is a factory. Every time it renders, it rebuilds everything from scratch — *unless* you tell it to remember something.\n\n`useMemo` remembers **values**, `useCallback` remembers **functions**. Both take a dependency array just like `useEffect`.",
    "The **cleanup function** in useEffect is returned as a function:\n\n```\nuseEffect(() => {\n  const sub = subscribe()\n  return () => sub.unsubscribe() // cleanup\n}, [])\n```\n\nIt runs before the effect re-runs and on unmount. Always clean up subscriptions, timers, and listeners!",
  ]
  let aiResponseIdx = 0

  const send = () => {
    if (!input.trim()) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: input, time: now }])
    setInput('')
    setTyping(true)
    onSpeak(true)
    setTimeout(() => {
      const response = AI_RESPONSES[aiResponseIdx % AI_RESPONSES.length]
      aiResponseIdx++
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      setTyping(false)
      onSpeak(false)
    }, 2200)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid #f0ebff', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <div style={{
            width: '2.2rem', height: '2.2rem', borderRadius: '50%',
            background: 'linear-gradient(135deg,#8b5cf6,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 0 0.8rem rgba(124,58,237,0.35)',
          }}>🤖</div>
          <div>
            <div style={{ fontSize: '0.82rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#1e1b4b' }}>KYDY AI Tutor</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '0.62rem', fontFamily: "'DM Sans',sans-serif", color: '#6b7280' }}>Online · Specialized in React</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['📎', '⚙'].map(icon => (
            <button key={icon} style={{ width: '1.9rem', height: '1.9rem', borderRadius: '0.45rem', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >{icon}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '0.6rem', alignItems: 'flex-start' }}>
            {/* Avatar */}
            {msg.role === 'ai' ? (
              <div style={{ width: '1.9rem', height: '1.9rem', borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, boxShadow: '0 0 0.5rem rgba(124,58,237,0.25)' }}>🤖</div>
            ) : (
              <div style={{ width: '1.9rem', height: '1.9rem', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>👤</div>
            )}
            <div style={{ maxWidth: '72%' }}>
              <div style={{
                padding: '0.7rem 0.9rem',
                borderRadius: msg.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                background: msg.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#f8f7ff',
                border: msg.role === 'ai' ? '1px solid #ede9fe' : 'none',
                color: msg.role === 'user' ? '#fff' : '#1e1b4b',
                fontSize: '0.78rem', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.65,
                boxShadow: msg.role === 'user' ? '0 0.25rem 1rem rgba(124,58,237,0.3)' : '0 0.1rem 0.4rem rgba(0,0,0,0.06)',
              }}>
                {renderText(msg.text)}
              </div>
              <div style={{ fontSize: '0.58rem', fontFamily: "'DM Sans',sans-serif", color: '#9ca3af', marginTop: '0.25rem', textAlign: msg.role === 'user' ? 'right' : 'left', padding: '0 0.2rem' }}>{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{ width: '1.9rem', height: '1.9rem', borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>🤖</div>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0.2rem', background: '#f8f7ff', border: '1px solid #ede9fe', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      <div style={{ padding: '0.5rem 1.2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderTop: '1px solid #f5f3ff' }}>
        {['What is useCallback?', 'Explain cleanup functions', 'Show me an example'].map(q => (
          <button key={q} onClick={() => setInput(q)} style={{
            padding: '0.3rem 0.7rem', borderRadius: '2rem', border: '1px solid #ddd6fe',
            background: '#faf9ff', color: '#7c3aed', fontSize: '0.62rem',
            fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#a78bfa' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#faf9ff'; e.currentTarget.style.borderColor = '#ddd6fe' }}
          >{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '0.8rem 1.2rem 1rem', borderTop: '1px solid #f0ebff', background: '#fff', flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: '0.6rem', alignItems: 'flex-end',
          background: inputFocused ? '#faf8ff' : '#f8f7ff',
          border: `1.5px solid ${inputFocused ? '#a78bfa' : '#e8e4f8'}`,
          borderRadius: '0.9rem', padding: '0.55rem 0.55rem 0.55rem 0.9rem',
          boxShadow: inputFocused ? '0 0 0 0.2rem rgba(167,139,250,0.15)' : 'none',
          transition: 'all 0.2s',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }}}
            placeholder="Ask anything about React Hooks..."
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontSize: '0.78rem', fontFamily: "'DM Sans',sans-serif", color: '#1e1b4b',
              lineHeight: 1.5, maxHeight: '6rem', overflowY: 'auto',
            }}
          />
          <button onClick={send} disabled={!input.trim()} style={{
            width: '2rem', height: '2rem', borderRadius: '0.55rem', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#e5e7eb',
            color: input.trim() ? '#fff' : '#9ca3af',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0,
            boxShadow: input.trim() ? '0 0.2rem 0.8rem rgba(124,58,237,0.35)' : 'none',
            transition: 'all 0.2s',
          }}>→</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.58rem', fontFamily: "'DM Sans',sans-serif", color: '#d1d5db' }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

// ─── Lessons Page ─────────────────────────────────────────────────────────────
export default function LessonsPage({ onNav }: { onNav?: (id: string) => void }) {
  const [activeSession, setActiveSession] = useState(1)
  const [speaking, setSpeaking] = useState(false)
  const [svgCode, setSvgCode] = useState<string | undefined>(undefined)

  // Example: You can fetch SVG code from your backend API
  // useEffect(() => {
  //   fetch('/api/get-svg')
  //     .then(res => res.text())
  //     .then(svg => setSvgCode(svg))
  //     .catch(err => console.error('Failed to load SVG:', err))
  // }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { background: #fff; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 0.25rem; }
        ::-webkit-scrollbar-track { background: #f8f7ff; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 0.2rem; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(0.4rem) } to { opacity: 1; transform: translateY(0) } }
        @keyframes typing-dot { 0%,60%,100% { transform: translateY(0); opacity: 0.4 } 30% { transform: translateY(-0.25rem); opacity: 1 } }
        @keyframes wave-bar-0 { from { height: 20% } to { height: 80% } }
        @keyframes wave-bar-1 { from { height: 40% } to { height: 60% } }
        @keyframes wave-bar-2 { from { height: 15% } to { height: 90% } }
        @keyframes wave-bar-3 { from { height: 35% } to { height: 70% } }
        @keyframes pulse-dot { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{opacity:0.5;box-shadow:0 0 0 0.3rem rgba(34,197,94,0)} }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', background: '#fff', color: '#1e1b4b', overflow: 'hidden' }}>
        {/* Dark icon sidebar */}
        <Sidebar onNav={id => onNav && onNav(id)} />

        {/* Light chat history */}
        <HistoryPanel activeId={activeSession} onSelect={setActiveSession} />

        {/* Center: SVG visualizer */}
        <div style={{
          width: '22rem', flexShrink: 0, borderRight: '1px solid #f0ebff',
          background: 'linear-gradient(180deg, #faf9ff 0%, #f5f3ff 50%, #faf9ff 100%)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Center header */}
          <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>⚡ Lesson 17</span>
            <span style={{ color: '#ddd6fe', fontSize: '0.7rem' }}>·</span>
            <span style={{ fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", color: '#6b7280' }}>React Hooks Deep Dive</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AIVisualizer speaking={speaking} svgCode={svgCode} />
          </div>
          {/* Progress bar */}
          <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid #ede9fe', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", color: '#9ca3af' }}>Lesson progress</span>
              <span style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#7c3aed' }}>68%</span>
            </div>
            <div style={{ height: '0.3rem', background: '#ede9fe', borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius: '1rem', boxShadow: '0 0 0.5rem rgba(124,58,237,0.4)' }} />
            </div>
          </div>
        </div>

        {/* Right: Chat output */}
        <ChatPanel onSpeak={setSpeaking} />
      </div>
    </>
  )
}