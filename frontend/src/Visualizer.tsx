//visualizer.tsx
import { useState, useEffect, useRef } from 'react'
import ClickSpark from './components/ClickSpark'
import UnifiedSidebar from './components/UnifiedSidebar'
import { useVisualizer } from './context/VisualizerContext'        // ← NEW (replaces the SVG file fetch)

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisualizerNote {
  id: number
  title: string
  content: string
  timestamp: string
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ─── API Functions ────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'

async function saveSVGVisualization(svgContent: string, title: string, description?: string) {
  try {
    const response = await fetch(`${API_BASE}/api/visualizer/svg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ svg_content: svgContent, title, description })
    })
    if (!response.ok) throw new Error('Failed to save SVG')
    return await response.json()
  } catch (error) {
    console.error('Error saving SVG visualization:', error)
    return { message: 'Failed to save visualization', id: null }
  }
}

async function sendChatMessage(message: string, history: ChatMessage[]) {
  const response = await fetch(`${API_BASE}/api/visualizer/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.map(m => ({ role: m.role, content: m.content }))
    })
  })
  if (!response.ok) throw new Error('Chat request failed')
  return await response.json()
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
// ← NEW component — shows while Bedrock agent is running
function VisualizerSkeleton({ topic, error }: { topic: string; error: string }) {
  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', fontFamily: "'DM Sans',sans-serif" }}>Agent Error</div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: "'DM Sans',sans-serif", textAlign: 'center', maxWidth: '18rem' }}>{error}</div>
        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: "'DM Sans',sans-serif" }}>Check your VITE_AWS_* env vars and try again</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}>
      {/* Pulsing brain with ripple rings */}
      <div style={{ position: 'relative', width: '6rem', height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ position: 'absolute', inset: `-${i * 12}px`, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.25)', animation: `ripple 2s ease-out ${i * 0.4}s infinite` }} />
        ))}
        <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #a78bfa, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', animation: 'agentPulse 2s ease-in-out infinite', boxShadow: '0 0 2rem rgba(124,58,237,0.4)' }}>
          🧠
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#7c3aed', fontFamily: "'DM Sans',sans-serif", marginBottom: '0.3rem' }}>Generating Visualization…</div>
        {topic && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: "'DM Sans',sans-serif" }}>
            Topic: <span style={{ color: '#7c3aed', fontWeight: 600 }}>{topic}</span>
          </div>
        )}
        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: "'DM Sans',sans-serif", marginTop: '0.4rem' }}>Your Bedrock agent is crafting an SVG animation…</div>
      </div>
      {/* Shimmer progress bar */}
      <div style={{ width: '14rem', height: '0.35rem', background: '#ede9fe', borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a855f7,#7c3aed)', backgroundSize: '200% 100%', borderRadius: '1rem', animation: 'shimmer 1.5s linear infinite' }} />
      </div>
      {/* Skeleton bars */}
      <div style={{ width: '100%', maxWidth: '20rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[100, 80, 90, 60, 75].map((w, i) => (
          <div key={i} style={{ height: '0.55rem', borderRadius: '0.5rem', background: '#ede9fe', width: `${w}%`, animation: `skeletonPulse 1.5s ease-in-out ${i * 0.12}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Notes Panel ──────────────────────────────────────────────────────────────
function NotesPanel({ notes, onSaveNote, onSaveSVG }: {
  notes: VisualizerNote[];
  onSaveNote: (note: Omit<VisualizerNote, 'id' | 'timestamp'>) => void;
  onSaveSVG: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    onSaveNote({ title: title.trim(), content: content.trim() })
    setTitle('')
    setContent('')
    setIsExpanded(false)
  }

  return (
    <div style={{
      position: 'absolute', top: '1rem', right: '1rem',
      width: isExpanded ? '20rem' : '3rem', height: isExpanded ? '25rem' : '3rem',
      background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd6fe',
      borderRadius: '1rem', transition: 'all 0.3s ease', zIndex: 100,
      backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          width: '2rem', height: '2rem', borderRadius: '0.5rem', border: 'none',
          background: '#7c3aed', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
        onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
      >
        {isExpanded ? '✕' : '📝'}
      </button>

      {isExpanded && (
        <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#7c3aed', margin: 0, fontFamily: "'DM Sans',sans-serif" }}>Visualizer Notes</h3>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0.2rem 0 0 0', fontFamily: "'DM Sans',sans-serif" }}>Save notes about this visualization</p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text" placeholder="Note title..." value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem', fontFamily: "'DM Sans',sans-serif", outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
            <textarea
              placeholder="Write your notes here..." value={content}
              onChange={e => setContent(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.8rem', fontFamily: "'DM Sans',sans-serif", outline: 'none', resize: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: (!title.trim() || !content.trim()) ? '#e5e7eb' : '#7c3aed',
                color: (!title.trim() || !content.trim()) ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600,
                cursor: (!title.trim() || !content.trim()) ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s', marginBottom: '0.5rem'
              }}
              onMouseEnter={e => { if (title.trim() && content.trim()) e.currentTarget.style.background = '#6d28d9' }}
              onMouseLeave={e => { if (title.trim() && content.trim()) e.currentTarget.style.background = '#7c3aed' }}
            >
              Save Note
            </button>
            <button
              onClick={onSaveSVG}
              style={{ padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              💾 Save Visualization
            </button>
          </div>

          {notes.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', margin: '0 0 0.5rem 0', fontFamily: "'DM Sans',sans-serif" }}>Recent Notes ({notes.length})</h4>
              <div style={{ maxHeight: '4rem', overflowY: 'auto' }}>
                {notes.slice(-3).map(note => (
                  <div key={note.id} style={{ padding: '0.3rem', background: '#f9fafb', borderRadius: '0.3rem', marginBottom: '0.3rem', fontSize: '0.7rem' }}>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{note.title}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.6rem' }}>{note.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Chatbot Panel ────────────────────────────────────────────────────────────
function ChatbotPanel({ speaking }: { speaking: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Hi! Ask me anything about this visualization.',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await sendChatMessage(text, [...messages, userMsg])
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || 'Sorry, I could not get a response.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ Could not reach the server. Make sure the API is running at ' + API_BASE,
        timestamp: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      width: '100%',
      borderTop: '1px solid #ede9fe',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}>
      {/* Chat header */}
      <div style={{
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #ede9fe',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.75rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#7c3aed' }}>
          💬 Ask about this visualization
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{
            width: '0.4rem', height: '0.4rem', borderRadius: '50%',
            background: speaking ? '#22c55e' : '#a78bfa',
            display: 'inline-block',
            animation: speaking ? 'pulse-dot 1s infinite' : 'none'
          }} />
          <span style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", color: '#9ca3af' }}>
            {speaking ? 'Thinking…' : 'Ready'}
          </span>
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '0.45rem 0.75rem',
              borderRadius: msg.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
              background: msg.role === 'user' ? '#7c3aed' : '#f5f3ff',
              color: msg.role === 'user' ? '#fff' : '#1e1b4b',
              fontSize: '0.75rem',
              fontFamily: "'DM Sans',sans-serif",
              lineHeight: 1.5,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '1rem 1rem 1rem 0.2rem',
              background: '#f5f3ff',
              display: 'flex', gap: '0.3rem', alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '0.35rem', height: '0.35rem', borderRadius: '50%',
                  background: '#a78bfa', display: 'inline-block',
                  animation: `typing-dot 1s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '0.5rem 1rem',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder="Ask something about the visualization…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.45rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '2rem',
            fontSize: '0.75rem',
            fontFamily: "'DM Sans',sans-serif",
            outline: 'none',
            transition: 'border-color 0.2s',
            background: loading ? '#f9fafb' : '#fff',
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
          onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            width: '2rem', height: '2rem',
            borderRadius: '50%',
            border: 'none',
            background: (!input.trim() || loading) ? '#e5e7eb' : '#7c3aed',
            color: (!input.trim() || loading) ? '#9ca3af' : '#fff',
            cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.background = '#6d28d9' }}
          onMouseLeave={e => { if (input.trim() && !loading) e.currentTarget.style.background = '#7c3aed' }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

// ─── AI Visualizer — reads from context instead of animation.svg ──────────────
function AIVisualizer({ speaking, expanded, onToggle }: { speaking: boolean; expanded: boolean; onToggle: () => void }) {
  // ← CHANGED: read from context instead of fetching animation.svg
  const { svgContent, svgLoading, svgTopic, svgError } = useVisualizer()

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0.5rem',
    }}>
      {/* Status label + expand/collapse toggle */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, marginBottom: '0.25rem', gap: '0.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: svgLoading ? '#fef9c3' : svgContent ? '#f0fdf4' : '#f5f3ff',
          border: `1px solid ${svgLoading ? '#fde047' : svgContent ? '#86efac' : '#ddd6fe'}`,
          borderRadius: '2rem', padding: '0.3rem 0.9rem'
        }}>
          <span style={{
            width: '0.5rem', height: '0.5rem', borderRadius: '50%',
            background: svgLoading ? '#f59e0b' : svgContent ? '#22c55e' : '#a78bfa',
            display: 'inline-block',
            animation: (speaking || svgLoading) ? 'pulse-dot 1s infinite' : 'none'
          }} />
          <span style={{
            fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
            color: svgLoading ? '#92400e' : svgContent ? '#166534' : '#7c3aed',
            letterSpacing: '0.06em'
          }}>
            {svgLoading ? 'AGENT RUNNING…' : svgContent ? `READY · ${svgTopic || 'Visualization'}`.toUpperCase() : 'KYDY AI READY'}
          </span>
        </div>

        {/* Expand / Collapse button */}
        <button
          onClick={onToggle}
          title={expanded ? 'Collapse animation' : 'Expand animation'}
          style={{
            width: '1.8rem', height: '1.8rem', borderRadius: '0.5rem', border: '1px solid #ddd6fe',
            background: '#f5f3ff', color: '#7c3aed', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed' }}
        >
          {expanded ? '⊟' : '⊞'}
        </button>
      </div>

      {/* SVG area — only shown when expanded */}
      {expanded && (
        <div
          id="ai-visualizer-svg"
          style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}
        >
          {/* ← CHANGED: show skeleton while loading, SVG when ready, empty state otherwise */}
          {(svgLoading || svgError) ? (
            <VisualizerSkeleton topic={svgTopic} error={svgError} />
          ) : svgContent ? (
            <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            <div style={{ color: '#a78bfa', fontSize: '0.75rem', fontFamily: "'DM Sans',sans-serif", textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
              <strong>No visualization yet</strong>
              <p style={{ color: '#6b7280', marginTop: '0.4rem', fontSize: '0.75rem' }}>
                Ask a question in <strong>Lessons</strong> to generate one
              </p>
            </div>
          )}
        </div>
      )}

      {/* Waveform bars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', height: '1.5rem', margin: '0.25rem 0' }}>
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

// ─── Visualizer Page ──────────────────────────────────────────────────────────
export default function VisualizerPage({ onNav }: { onNav?: (id: string) => void }) {
  const [speaking, setSpeaking] = useState(false)
  const [notes, setNotes] = useState<VisualizerNote[]>([])
  const [svgExpanded, setSvgExpanded] = useState(true)

  const handleSaveNote = (noteData: Omit<VisualizerNote, 'id' | 'timestamp'>) => {
    const newNote: VisualizerNote = {
      id: Date.now(),
      ...noteData,
      timestamp: new Date().toLocaleString()
    }
    setNotes(prev => [...prev, newNote])

    const existingNotes = JSON.parse(localStorage.getItem('visualizerNotes') || '[]')
    localStorage.setItem('visualizerNotes', JSON.stringify([...existingNotes, {
      ...newNote, course: 'Visualizer', color: '#a855f7',
      date: 'Today', tags: ['Visualizer', 'AI'], pinned: false
    }]))
    window.dispatchEvent(new CustomEvent('visualizerNoteSaved'))
  }

  const handleSaveSVG = async () => {
    try {
      const svgElement = document.querySelector('#ai-visualizer-svg svg')
      if (!svgElement) { alert('No visualization found to save!'); return }

      const result = await saveSVGVisualization(
        svgElement.outerHTML,
        `Visualization - ${new Date().toLocaleDateString()}`,
        'Interactive AI visualization'
      )
      alert(result.id ? 'Visualization saved successfully!' : 'Failed to save. Please try again.')
    } catch (error) {
      console.error('Error saving SVG:', error)
      alert('Error saving visualization. Please try again.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { background: #fff; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 0.25rem; }
        ::-webkit-scrollbar-track { background: #f8f7ff; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 0.2rem; }

        #ai-visualizer-svg svg { width: 100% !important; height: 100% !important; }

        @keyframes fadeIn      { from { opacity: 0; transform: translateY(0.4rem) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse-dot   { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{opacity:0.5;box-shadow:0 0 0 0.3rem rgba(34,197,94,0)} }
        @keyframes wave-bar-0  { from { height: 20% } to { height: 80% } }
        @keyframes wave-bar-1  { from { height: 40% } to { height: 60% } }
        @keyframes wave-bar-2  { from { height: 15% } to { height: 90% } }
        @keyframes wave-bar-3  { from { height: 35% } to { height: 70% } }
        @keyframes typing-dot  { 0%,100% { opacity: 0.3; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-0.2rem) } }

        @keyframes agentPulse    { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(124,58,237,0.4)} 50%{transform:scale(1.06);box-shadow:0 0 0 1.2rem rgba(124,58,237,0)} }
        @keyframes ripple        { 0%{transform:scale(0.85);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
        @keyframes shimmer       { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes skeletonPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>

      <ClickSpark sparkColor="#7c3aed" sparkSize={15} sparkRadius={25} sparkCount={12} duration={600} extraScale={1.5}>
        <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', color: '#1e1b4b', overflow: 'hidden' }}>
          <UnifiedSidebar active="visualizer" onNav={id => onNav && onNav(id)} variant="light" />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, background: '#fff', height: '3rem' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🎨 AI VISUALIZER</span>
              <span style={{ color: '#ddd6fe', fontSize: '0.7rem' }}>·</span>
              <span style={{ fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", color: '#6b7280' }}>Neural Network Visualization</span>
            </div>

            {/* SVG visualizer area */}
            <div style={{
              height: svgExpanded ? '75%' : '4rem',
              minHeight: svgExpanded ? '10rem' : '4rem',
              transition: 'height 0.35s ease, min-height 0.35s ease',
              background: 'linear-gradient(180deg, #faf9ff 0%, #f5f3ff 50%, #faf9ff 100%)',
              overflow: 'hidden', position: 'relative', flexShrink: 0,
            }}>
              <AIVisualizer speaking={speaking} expanded={svgExpanded} onToggle={() => setSvgExpanded(p => !p)} />
              <NotesPanel notes={notes} onSaveNote={handleSaveNote} onSaveSVG={handleSaveSVG} />
            </div>

            {/* Chatbot area */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ChatbotPanel speaking={speaking} />
            </div>

            {/* Controls */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #ede9fe', flexShrink: 0, background: '#fff', height: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setSpeaking(!speaking)}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #ddd6fe',
                    background: speaking ? '#7c3aed' : '#fff', color: speaking ? '#fff' : '#7c3aed',
                    fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {speaking ? 'Stop Animation' : 'Start Animation'}
                </button>
                <div style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", color: '#9ca3af' }}>
                  Interactive AI Brain Visualization
                </div>
              </div>
            </div>

          </div>
        </div>
      </ClickSpark>
    </>
  )
}