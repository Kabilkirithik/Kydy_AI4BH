import { useState, useEffect, CSSProperties } from 'react'
import ClickSpark from './components/ClickSpark'
import UnifiedSidebar from './components/UnifiedSidebar'

interface Note {
  id: number; title: string; content: string; course: string
  color: string; date: string; tags: string[]; pinned: boolean
}

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

// API Base URL
const API_BASE = 'http://localhost:8000'

const INITIAL_NOTES: Note[] = [
  { id: 1, title: 'React Hooks Best Practices', content: 'Always use useEffect cleanup functions to prevent memory leaks. Dependencies array should include all values used inside the effect...', course: 'Web Development', color: '#7c3aed', date: 'Today', tags: ['React', 'Hooks', 'Best Practices'], pinned: true },
  { id: 2, title: 'CSS Grid Layout Patterns', content: 'Grid template areas make complex layouts easier to understand. Use minmax() for responsive columns without media queries...', course: 'Web Development', color: '#7c3aed', date: 'Today', tags: ['CSS', 'Grid', 'Layout'], pinned: true },
  { id: 3, title: 'Machine Learning Algorithms', content: 'Supervised learning requires labeled data. Common algorithms: Linear Regression, Decision Trees, Random Forest, Neural Networks...', course: 'Machine Learning', color: '#7c3aed', date: 'Yesterday', tags: ['ML', 'Algorithms'], pinned: false },
]

const FILTERS = ['All Notes', 'Pinned', 'Web Development', 'Machine Learning', 'UI/UX Design', 'Data Science', 'Visualizer']
const COURSES = [
  { name: 'Web Development', color: '#7c3aed' },
  { name: 'Machine Learning', color: '#7c3aed' },
  { name: 'UI/UX Design', color: '#a855f7' },
  { name: 'Data Science', color: '#7c3aed' },
  { name: 'Visualizer', color: '#a855f7' },
]
function NoteEditor({ note, onSave, onClose }: { note: Note | null; onSave: (note: Note) => void; onClose: () => void }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [course, setCourse] = useState(note?.course || 'Web Development')
  const [tags, setTags] = useState(note?.tags.join(', ') || '')
  const [pinned, setPinned] = useState(note?.pinned || false)

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    
    const courseData = COURSES.find(c => c.name === course) || COURSES[0]
    const newNote: Note = {
      id: note?.id || Date.now(),
      title: title.trim(),
      content: content.trim(),
      course,
      color: courseData.color,
      date: 'Today',
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      pinned,
    }
    onSave(newNote)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2%' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: '50rem', maxHeight: '90vh', overflowY: 'auto',
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '1.2rem', padding: '3%', boxShadow: '0 1rem 3rem rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4%' }}>
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: '1.3rem', color: '#1e293b' }}>
            {note ? 'EDIT NOTE' : 'NEW NOTE'}
          </h2>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', color: '#64748b', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b' }}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3%' }}>
          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em', marginBottom: '2%' }}>TITLE</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter note title..." style={{
              width: '100%', padding: '3%', borderRadius: '0.7rem', outline: 'none',
              background: '#f9fafb', border: '1px solid #e2e8f0',
              color: '#1e293b', fontSize: '0.9rem', fontFamily: "'Exo 2',sans-serif",
              transition: 'all 0.2s',
            }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#ffffff' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f9fafb' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3%' }}>
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em', marginBottom: '2%' }}>COURSE</label>
              <select value={course} onChange={e => setCourse(e.target.value)} style={{
                width: '100%', padding: '3%', borderRadius: '0.7rem', outline: 'none',
                background: '#f9fafb', border: '1px solid #e2e8f0',
                color: '#1e293b', fontSize: '0.8rem', fontFamily: "'Exo 2',sans-serif", cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#ffffff' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f9fafb' }}
              >
                {COURSES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em', marginBottom: '2%' }}>TAGS (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="React, Hooks, Best Practices" style={{
                width: '100%', padding: '3%', borderRadius: '0.7rem', outline: 'none',
                background: '#f9fafb', border: '1px solid #e2e8f0',
                color: '#1e293b', fontSize: '0.8rem', fontFamily: "'Exo 2',sans-serif",
                transition: 'all 0.2s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#ffffff' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f9fafb' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.1em', marginBottom: '2%' }}>CONTENT</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note content here..." style={{
              width: '100%', minHeight: '15rem', padding: '3%', borderRadius: '0.7rem', outline: 'none',
              background: '#f9fafb', border: '1px solid #e2e8f0',
              color: '#1e293b', fontSize: '0.85rem', fontFamily: "'Exo 2',sans-serif", lineHeight: 1.6,
              resize: 'vertical', transition: 'all 0.2s',
            }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#ffffff' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f9fafb' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
            <input type="checkbox" id="pinned" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: '#7c3aed' }} />
            <label htmlFor="pinned" style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: "'Exo 2',sans-serif", cursor: 'pointer' }}>Pin this note</label>
          </div>

          <div style={{ display: 'flex', gap: '3%', marginTop: '2%' }}>
            <LGBtn variant="ghost" onClick={onClose} style={{ flex: 1, padding: '3% 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#374151' }}>
              CANCEL
            </LGBtn>
            <LGBtn variant="primary" onClick={handleSave} style={{ flex: 1, padding: '3% 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1e293b' }}>
              SAVE NOTE
            </LGBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
function NoteCard({ note, onClick, selected }: { note: Note; onClick: () => void; selected: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? '#ffffff' : hov ? '#ffffff' : '#f9fafb',
        border: selected ? `2px solid ${note.color}` : hov ? `1px solid ${note.color}55` : '1px solid #e2e8f0',
        borderRadius: '1rem', cursor: 'pointer', overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
        transform: hov && !selected ? 'translateY(-0.3rem)' : 'translateY(0)',
        boxShadow: selected
          ? `0 0 0 3px ${note.color}22, 0 0.8rem 2rem rgba(0,0,0,0.1)`
          : hov ? `0 0.5rem 1.5rem rgba(0,0,0,0.08)` : '0 0.1rem 0.3rem rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {note.pinned && (
        <div style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', color: '#fbbf24', fontSize: '0.9rem' }}>📌</div>
      )}
      
      <div style={{ padding: '0.9rem 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: note.color, boxShadow: `0 0 0.5rem ${note.color}55` }} />
          <span style={{ color: '#64748b', fontSize: '0.65rem', fontFamily: "'Exo 2',sans-serif" }}>{note.course}</span>
        </div>
        <h3 style={{ color: '#1e293b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.02em' }}>{note.title}</h3>
        <p style={{ color: '#4b5563', fontSize: '0.7rem', lineHeight: 1.6, fontFamily: "'Exo 2',sans-serif", marginBottom: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{note.content}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
          {note.tags.map(tag => (
            <span key={tag} style={{ background: `${note.color}15`, border: `1px solid ${note.color}33`, borderRadius: '2rem', padding: '0.22rem 0.55rem', color: note.color, fontSize: '0.58rem', fontFamily: "'Exo 2',sans-serif" }}>{tag}</span>
          ))}
        </div>
        <div style={{ color: '#9ca3af', fontSize: '0.65rem', fontFamily: "'Exo 2',sans-serif" }}>{note.date}</div>
      </div>
    </div>
  )
}

function NoteDetail({ note, onClose, onEdit, onDelete, onPin }: { note: Note; onClose: () => void; onEdit: (note: Note) => void; onDelete: (id: number) => void; onPin: (id: number) => void }) {
  return (
    <div style={{
      width: '30%', minWidth: '17rem', flexShrink: 0,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '1rem', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 4rem)',
      boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.08)',
    }}>
      <div style={{ padding: '1.2rem 1rem 0.8rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: note.color, boxShadow: `0 0 0.6rem ${note.color}55` }} />
          <span style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.06em' }}>{note.course}</span>
        </div>
        <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '1.8rem', height: '1.8rem', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b' }}
        >✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: '0.95rem', color: '#1e293b', letterSpacing: '-0.02em', lineHeight: 1.3, flex: 1 }}>{note.title}</h2>
          {note.pinned && <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>📌</span>}
        </div>

        <div style={{ color: '#9ca3af', fontSize: '0.68rem', fontFamily: "'Exo 2',sans-serif", marginBottom: '0.8rem' }}>{note.date}</div>

        <div style={{ color: '#4b5563', fontSize: '0.72rem', lineHeight: 1.7, fontFamily: "'Exo 2',sans-serif", marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{note.content}</div>

        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.58rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.15em', marginBottom: '0.55rem' }}>TAGS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {note.tags.map(t => (
              <span key={t} style={{ background: `${note.color}15`, border: `1px solid ${note.color}33`, borderRadius: '2rem', padding: '0.22rem 0.55rem', color: note.color, fontSize: '0.58rem', fontFamily: "'Exo 2',sans-serif" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', gap: '0.5rem' }}>
        <LGBtn variant="ghost" onClick={() => onPin(note.id)} style={{ flex: 1, padding: '0.65rem 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: '#374151' }}>
          {note.pinned ? 'UNPIN' : 'PIN'}
        </LGBtn>
        <LGBtn variant="ghost" onClick={() => onEdit(note)} style={{ flex: 1, padding: '0.65rem 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: '#374151' }}>
          EDIT
        </LGBtn>
        <LGBtn variant="primary" onClick={() => onDelete(note.id)} style={{ flex: 1, padding: '0.65rem 0', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1e293b' }}>
          DELETE
        </LGBtn>
      </div>
    </div>
  )
}
function NotesContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filter, setFilter] = useState('All Notes')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/notes`)
      if (response.ok) {
        const apiNotes = await response.json()
        setNotes(apiNotes)
        if (apiNotes.length > 0 && !selected) {
          setSelected(apiNotes[0])
        }
      } else {
        console.error('Failed to load notes')
        setNotes(INITIAL_NOTES)
        setSelected(INITIAL_NOTES[0])
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      setNotes(INITIAL_NOTES)
      setSelected(INITIAL_NOTES[0])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
    const handleVisualizerNoteSaved = () => {
      loadNotes()
    }
    
    window.addEventListener('visualizerNoteSaved', handleVisualizerNoteSaved)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNotes()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('visualizerNoteSaved', handleVisualizerNoteSaved)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const filtered = notes.filter(n => {
    const matchFilter =
      filter === 'All Notes' ? true :
      filter === 'Pinned' ? n.pinned :
      n.course === filter
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleSaveNote = async (note: Note) => {
    try {
      if (editingNote) {
        const response = await fetch(`${API_BASE}/api/notes/${note.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            course: note.course,
            color: note.color,
            tags: note.tags,
            pinned: note.pinned
          }),
        })
        
        if (response.ok) {
          const updatedNote = await response.json()
          setNotes(notes.map(n => n.id === note.id ? updatedNote : n))
          if (selected?.id === note.id) setSelected(updatedNote)
        }
      } else {
        const response = await fetch(`${API_BASE}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            course: note.course,
            color: note.color,
            tags: note.tags
          }),
        })
        
        if (response.ok) {
          const newNote = await response.json()
          setNotes([newNote, ...notes])
          setSelected(newNote)
        }
      }
      setShowEditor(false)
      setEditingNote(null)
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please try again.')
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setShowEditor(true)
  }

  const handleDeleteNote = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`${API_BASE}/api/notes/${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setNotes(notes.filter(n => n.id !== id))
          if (selected?.id === id) setSelected(null)
        }
      } catch (error) {
        console.error('Error deleting note:', error)
        alert('Failed to delete note. Please try again.')
      }
    }
  }

  const handlePinNote = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/notes/${id}/pin`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        setNotes(notes.map(n => n.id === id ? { ...n, pinned: result.pinned } : n))
        if (selected?.id === id) {
          setSelected({ ...selected, pinned: result.pinned })
        }
      }
    } catch (error) {
      console.error('Error toggling pin status:', error)
      alert('Failed to update pin status. Please try again.')
    }
  }

  const handleNewNote = () => {
    setEditingNote(null)
    setShowEditor(true)
  }

  if (loading) {
    return (
      <main style={{ flex: 1, padding: '2rem 1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em' }}>LOADING NOTES...</div>
        </div>
      </main>
    )
  }
  return (
    <main style={{ flex: 1, padding: '2rem 1.8rem', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: '#f8fafc' }}>
      <Orb style={{ top: '-5%', right: '5%' }} color="#a855f7" size="30vw" />
      <Orb style={{ bottom: '5%', left: '10%' }} color="#7c3aed" size="22vw" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ color: '#7c3aed', fontSize: '0.58rem', fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.2em', marginBottom: '0.3rem' }}>KNOWLEDGE BASE</div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 'clamp(1.2rem,2vw,1.8rem)', color: '#1e293b', letterSpacing: '-0.04em' }}>MY NOTES</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '22rem' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#9ca3af' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search notes..."
              style={{
                width: '100%', padding: '0.55rem 0.9rem 0.55rem 2.2rem',
                borderRadius: '0.7rem', outline: 'none',
                background: searchFocused ? '#ffffff' : '#ffffff',
                border: `1px solid ${searchFocused ? '#7c3aed' : '#e2e8f0'}`,
                color: '#1e293b', fontSize: '0.72rem', fontFamily: "'Exo 2',sans-serif",
                boxShadow: searchFocused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
                transition: 'all 0.25s',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <LGBtn variant="primary" onClick={handleNewNote} style={{ padding: '0.55rem 1.2rem', borderRadius: '0.7rem', fontFamily: "'Orbitron',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1e293b' }}>
              + NEW NOTE
            </LGBtn>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 2, alignItems: 'center' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.38rem 0.9rem', borderRadius: '2rem', cursor: 'pointer',
            fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em',
            background: filter === f ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#ffffff',
            color: filter === f ? '#1e293b' : '#64748b',
            border: filter === f ? '1px solid #7c3aed' : '1px solid #e2e8f0',
            boxShadow: filter === f ? '0 0.2rem 0.8rem rgba(124,58,237,0.25)' : 'none',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}}
            onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0' }}}
          >{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.65rem', fontFamily: "'Exo 2',sans-serif" }}>
          {filtered.length} note{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid + Detail */}
      <div style={{ display: 'flex', gap: '1.2rem', flex: 1, position: 'relative', zIndex: 2, alignItems: 'flex-start' }}>
        {/* Notes grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: selected ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: '1rem', alignContent: 'start' }}>
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              selected={selected?.id === note.id}
              onClick={() => setSelected(selected?.id === note.id ? null : note)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8% 0', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '3%' }}>📝</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em' }}>NO NOTES FOUND</div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <NoteDetail 
            note={selected} 
            onClose={() => setSelected(null)} 
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onPin={handlePinNote}
          />
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <NoteEditor 
          note={editingNote} 
          onSave={handleSaveNote} 
          onClose={() => { setShowEditor(false); setEditingNote(null) }} 
        />
      )}
    </main>
  )
}
export default function NotesPage({ onNav }: { onNav?: (id: string) => void }) {
  const handleNav = (id: string) => {
    if (onNav) onNav(id)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { background: #f8fafc; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 0.3rem; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 0.2rem; }

        .lg-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; outline: none; overflow: hidden; isolation: isolate; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
        .lg-btn::before { content: ''; position: absolute; inset: 0; backdrop-filter: blur(1rem) saturate(200%) brightness(1.25); -webkit-backdrop-filter: blur(1rem) saturate(200%) brightness(1.25); z-index: 0; border-radius: inherit; }
        .lg-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.04) 40%,rgba(0,0,0,0) 60%,rgba(255,255,255,0.08) 100%); z-index: 1; border-radius: inherit; }
        .lg-btn .lg-inner { position: relative; z-index: 3; display: flex; align-items: center; gap: 0.4rem; }
        .lg-btn .lg-shine { position: absolute; top: -60%; left: -80%; width: 45%; height: 220%; background: linear-gradient(105deg,transparent 15%,rgba(255,255,255,0.28) 50%,transparent 85%); transform: skewX(-18deg); z-index: 4; pointer-events: none; }
        .lg-btn:hover .lg-shine { animation: shineSlide 0.55s ease forwards; }
        .lg-btn:hover { transform: translateY(-0.12rem) scale(1.01); }
        .lg-btn:active { transform: translateY(0) scale(0.98); }
        @keyframes shineSlide { 0% { left:-80% } 100% { left:130% } }

        .lg-primary { background: linear-gradient(145deg,rgba(124,58,237,0.55),rgba(168,85,247,0.38),rgba(245,158,11,0.45)); border: 1px solid rgba(196,149,255,0.45) !important; box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 0 2rem rgba(124,58,237,0.35), 0 0.4rem 1.2rem rgba(0,0,0,0.4); }
        .lg-primary:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.24) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 0 3rem rgba(124,58,237,0.6), 0 0.6rem 1.8rem rgba(0,0,0,0.45); }
        .lg-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15) !important; box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 0.25rem 1rem rgba(0,0,0,0.3); }
        .lg-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.26) !important; }
        .lg-enroll { background: linear-gradient(145deg,rgba(124,58,237,0.45),rgba(168,85,247,0.32)); border: 1px solid rgba(168,85,247,0.4) !important; box-shadow: 0 1px 0 rgba(255,255,255,0.13) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 0 1.2rem rgba(124,58,237,0.22); }
        .lg-enroll:hover { box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 0 2rem rgba(124,58,237,0.46); }
      `}</style>

      <ClickSpark sparkColor="#7c3aed" sparkSize={15} sparkRadius={25} sparkCount={12} duration={600} extraScale={1.5}>
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', color: '#1e293b', overflow: 'hidden', position: 'relative' }}>
          <Orb style={{ top: '20%', left: '15%' }} color="#7c3aed" size="40vw" />
          <UnifiedSidebar active="notes" onNav={handleNav} variant="light" />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <NotesContent />
          </div>
        </div>
      </ClickSpark>
    </>
  )
}