import { useState, useRef, useEffect } from 'react'
import ClickSpark from './components/ClickSpark'
import UnifiedSidebar from './components/UnifiedSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message { id: number; role: 'user' | 'ai'; text: string; time: string }

// ─── API Functions ────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'

async function sendChatMessage(message: string, sessionId?: string) {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId
      })
    })
    
    if (!response.ok) throw new Error('Failed to send message')
    return await response.json()
  } catch (error) {
    console.error('Error sending chat message:', error)
    // Fallback response
    return {
      response: "I'm sorry, I'm having trouble connecting to the server right now. Please try again later.",
      session_id: sessionId || `session_${Date.now()}`
    }
  }
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
  const [sessionId, setSessionId] = useState<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = async () => {
    if (!input.trim()) return
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage = { id: Date.now(), role: 'user' as const, text: input, time: now }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setTyping(true)
    onSpeak(true)

    try {
      const response = await sendChatMessage(input, sessionId)
      
      // Update session ID if this is the first message
      if (!sessionId) {
        setSessionId(response.session_id)
      }
      
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          role: 'ai' as const,
          text: response.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        setMessages(prev => [...prev, aiMessage])
        setTyping(false)
        onSpeak(false)
      }, 1500) // Simulate some processing time
      
    } catch (error) {
      console.error('Error in chat:', error)
      setTyping(false)
      onSpeak(false)
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai' as const,
        text: "I'm sorry, I encountered an error. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    }
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
              <span style={{ fontSize: '0.62rem', fontFamily: "'DM Sans',sans-serif", color: '#6b7280' }}>Online</span>
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
            color: input.trim() ? '#1e293b' : '#9ca3af',
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

  return (
    <ClickSpark
      sparkColor="#7c3aed"
      sparkSize={15}
      sparkRadius={25}
      sparkCount={12}
      duration={600}
      extraScale={1.5}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { background: #f3f4f6; overflow-x: hidden; }
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

      <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', color: '#1e1b4b', overflow: 'hidden' }}>
        {/* Unified sidebar with chat history */}
        <UnifiedSidebar 
          active="lessons" 
          onNav={id => onNav && onNav(id)} 
          variant="light"
          showChatHistory={true}
          onChatHistorySelect={setActiveSession}
          activeChatSession={activeSession}
        />

        {/* Main chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatPanel onSpeak={() => {}} />
        </div>  
      </div>
    </ClickSpark>
  )
}