import { useState } from 'react'
import ClickSpark from './components/ClickSpark'
import UnifiedSidebar from './components/UnifiedSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisualizerNote {
  id: number
  title: string
  content: string
  timestamp: string
}

// ─── API Functions ────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'

async function saveSVGVisualization(svgContent: string, title: string, description?: string) {
  try {
    const response = await fetch(`${API_BASE}/api/visualizer/svg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        svg_content: svgContent,
        title,
        description
      })
    })
    
    if (!response.ok) throw new Error('Failed to save SVG')
    return await response.json()
  } catch (error) {
    console.error('Error saving SVG visualization:', error)
    return { message: 'Failed to save visualization', id: null }
  }
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
    
    onSaveNote({
      title: title.trim(),
      content: content.trim()
    })
    
    setTitle('')
    setContent('')
    setIsExpanded(false)
  }

  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      width: isExpanded ? '20rem' : '3rem',
      height: isExpanded ? '25rem' : '3rem',
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid #ddd6fe',
      borderRadius: '1rem',
      transition: 'all 0.3s ease',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          border: 'none',
          background: '#7c3aed',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
        onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
      >
        {isExpanded ? '✕' : '📝'}
      </button>

      {isExpanded && (
        <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              color: '#7c3aed', 
              margin: 0,
              fontFamily: "'DM Sans',sans-serif"
            }}>
              Visualizer Notes
            </h3>
            <p style={{ 
              fontSize: '0.7rem', 
              color: '#6b7280', 
              margin: '0.2rem 0 0 0',
              fontFamily: "'DM Sans',sans-serif"
            }}>
              Save notes about this visualization
            </p>
          </div>

          {/* Note Form */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontFamily: "'DM Sans',sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
            
            <textarea
              placeholder="Write your notes here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontFamily: "'DM Sans',sans-serif",
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s',
              }}
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
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: (!title.trim() || !content.trim()) ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                transition: 'all 0.2s',
                marginBottom: '0.5rem'
              }}
              onMouseEnter={e => {
                if (title.trim() && content.trim()) {
                  e.currentTarget.style.background = '#6d28d9'
                }
              }}
              onMouseLeave={e => {
                if (title.trim() && content.trim()) {
                  e.currentTarget.style.background = '#7c3aed'
                }
              }}
            >
              Save Note
            </button>

            <button
              onClick={onSaveSVG}
              style={{
                padding: '0.5rem 1rem',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              💾 Save Visualization
            </button>
          </div>

          {/* Recent Notes */}
          {notes.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: '#374151', 
                margin: '0 0 0.5rem 0',
                fontFamily: "'DM Sans',sans-serif"
              }}>
                Recent Notes ({notes.length})
              </h4>
              <div style={{ maxHeight: '4rem', overflowY: 'auto' }}>
                {notes.slice(-3).map(note => (
                  <div key={note.id} style={{
                    padding: '0.3rem',
                    background: '#f9fafb',
                    borderRadius: '0.3rem',
                    marginBottom: '0.3rem',
                    fontSize: '0.7rem',
                  }}>
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

// ─── SVG Animation — AI Brain Visualizer ─────────────────────────────────────
function AIVisualizer({ speaking }: { speaking: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
    }}>
      {/* Label */}
      <div style={{ marginBottom: '0.5rem', textAlign: 'center', position: 'absolute', top: '0.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: speaking ? '#f0fdf4' : '#f5f3ff', border: `1px solid ${speaking ? '#86efac' : '#ddd6fe'}`, borderRadius: '2rem', padding: '0.3rem 0.9rem' }}>
          <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: speaking ? '#22c55e' : '#a78bfa', display: 'inline-block', animation: speaking ? 'pulse-dot 1s infinite' : 'none' }} />
          <span style={{ fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: speaking ? '#16a34a' : '#7c3aed', letterSpacing: '0.06em' }}>
            {speaking ? 'GENERATING RESPONSE' : 'KYDY AI READY'}
          </span>
        </div>
      </div>

      {/* SVG neural net - 75% of screen area */}
      <div style={{ width: '100%', height: '75%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<svg id="ai-visualizer-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}>
    <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#00FFFF" />
        </marker>
    </defs>

    <g id="background-layer">
        <rect width="800" height="600" fill="#0f172a" />
        
        <circle cx="400" cy="300" r="250" fill="#00FFFF" opacity="0.05" />
    </g>

    <g id="title-layer">
        <text x="400" y="90" font-family="Arial, sans-serif" font-size="40" fill="#00FFFF" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="0s" fill="freeze" id="titleStart" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
            Operating System (OS) Management
        </text>
    </g>

    <g id="diagram-layer">
        
        <rect id="osBox" x="300" y="250" width="200" height="80" rx="10" ry="10" fill="#1e293b" stroke="#00FFFF" stroke-width="2" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="titleStart.end + 2s" fill="freeze" id="osBoxAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
        </rect>
        <text id="osText" x="400" y="298" font-family="Arial, sans-serif" font-size="28" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="titleStart.end + 2s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
            Operating System
        </text>

        <rect id="hardwareBox" x="150" y="450" width="150" height="60" rx="8" ry="8" fill="#1e293b" stroke="#00FFFF" stroke-width="1" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="osBoxAppear.end + 2s" fill="freeze" id="hardwareBoxAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
        </rect>
        <text id="hardwareText" x="225" y="488" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="osBoxAppear.end + 2s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
            Hardware
        </text>

        <rect id="appsBox" x="500" y="150" width="150" height="60" rx="8" ry="8" fill="#1e293b" stroke="#00FFFF" stroke-width="1" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="hardwareBoxAppear.end + 1.5s" fill="freeze" id="appsBoxAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
        </rect>
        <text id="appsText" x="575" y="188" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="hardwareBoxAppear.end + 1.5s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
            Applications
        </text>

        <line id="arrow1" x1="350" y1="330" x2="250" y2="450" stroke="#00FFFF" stroke-width="2" marker-end="url(#arrowhead)" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="appsBoxAppear.end + 1.5s" fill="freeze" id="arrow1Appear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
        </line>
        <line id="arrow2" x1="250" y1="450" x2="350" y2="330" stroke="#00FFFF" stroke-width="2" marker-end="url(#arrowhead)" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="arrow1Appear.end + 0.5s" fill="freeze" id="arrow2Appear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 2s" fill="freeze" />
        </line>

        
        <text id="functionsTitle" x="400" y="150" font-family="Arial, sans-serif" font-size="30" fill="#00FFFF" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="osIntroText2.end + 2.5s" fill="freeze" id="functionsTitleAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            Key OS Functions
        </text>

        <rect id="memBox" x="100" y="250" width="180" height="100" rx="10" ry="10" fill="#1e293b" stroke="#00FFFF" stroke-width="1" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="functionsTitleAppear.end + 2s" fill="freeze" id="memBoxAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
        </rect>
        <text id="memText1" x="190" y="290" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="functionsTitleAppear.end + 2s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            Memory
        </text>
        <text id="memText2" x="190" y="315" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="functionsTitleAppear.end + 2s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            Management
        </text>

        <rect id="procBox" x="310" y="250" width="180" height="100" rx="10" ry="10" fill="#1e293b" stroke="#00FFFF" stroke-width="1" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="memBoxAppear.end + 0.5s" fill="freeze" id="procBoxAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
        </rect>
        <text id="procText1" x="400" y="290" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="memBoxAppear.end + 0.5s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            Process
        </text>
        <text id="procText2" x="400" y="315" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="memBoxAppear.end + 0.5s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            Management
        </text>

        <rect id="fileBox" x="520" y="250" width="180" height="100" rx="10" ry="10" fill="#1e293b" stroke="#00FFFF" stroke-width="1" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="procBoxAppear.end + 0.5s" fill="freeze" id="fileBoxAppear" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
        </rect>
        <text id="fileText1" x="610" y="290" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="procBoxAppear.end + 0.5s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            File
        </text>
        <text id="fileText2" x="610" y="315" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="procBoxAppear.end + 0.5s" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="summaryText3.end + 0.5s" fill="freeze" />
            Management
        </text>

        
        <circle id="summaryCircle" cx="400" cy="300" r="100" fill="#1e293b" stroke="#00FFFF" stroke-width="2" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="fileMgrText2.end + 2.5s" fill="freeze" id="summaryCircleAppear" />
        </circle>
        <text id="summaryOSText" x="400" y="305" font-family="Arial, sans-serif" font-size="28" fill="#e2e8f0" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="fileMgrText2.end + 2.5s" fill="freeze" />
            OS
        </text>
        <text id="summarySmoothText" x="400" y="250" font-family="Arial, sans-serif" font-size="20" fill="#00FFFF" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="summaryCircleAppear.end + 1.5s" fill="freeze" />
            Smooth
        </text>
        <text id="summaryEfficientText" x="400" y="350" font-family="Arial, sans-serif" font-size="20" fill="#00FFFF" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="summaryCircleAppear.end + 2s" fill="freeze" />
            Efficient
        </text>
    </g>

    <g id="highlight-layer">
        <rect id="highlightMem" x="95" y="245" width="190" height="110" rx="12" ry="12" stroke="#FFD700" stroke-width="3" fill="none" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="memBoxAppear.end + 0.5s" fill="freeze" id="highlightMemOn" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="memMgrText2.end + 0.5s" fill="freeze" id="highlightMemOff" />
        </rect>

        <rect id="highlightProc" x="305" y="245" width="190" height="110" rx="12" ry="12" stroke="#FFD700" stroke-width="3" fill="none" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="highlightMemOff.end + 0.5s" fill="freeze" id="highlightProcOn" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="procMgrText2.end + 0.5s" fill="freeze" id="highlightProcOff" />
        </rect>

        <rect id="highlightFile" x="515" y="245" width="190" height="110" rx="12" ry="12" stroke="#FFD700" stroke-width="3" fill="none" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="highlightProcOff.end + 0.5s" fill="freeze" id="highlightFileOn" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="fileMgrText2.end + 0.5s" fill="freeze" id="highlightFileOff" />
        </rect>
    </g>

    <g id="text-layer">
        
        <text id="osIntroTextLine1" x="400" y="500" font-family="Arial, sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="arrow2Appear.end + 0.5s" fill="freeze" id="osIntroText1" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 0.5s" fill="freeze" />
            OS na enna? Computer oda brain madhiri!
        </text>
        <text id="osIntroTextLine2" x="400" y="530" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="osIntroText1.end + 2s" fill="freeze" id="osIntroText2" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="osIntroText2.end + 0.5s" fill="freeze" />
            Idhu hardware-kum software-kum naduvula oru bridge.
        </text>

        
        <text id="memMgrTextLine1" x="400" y="450" font-family="Arial, sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="highlightMemOn.end + 0.5s" fill="freeze" id="memMgrText1" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="memMgrText2.end + 0.5s" fill="freeze" />
            Memory Management: RAM-ah correct-a use pannum.
        </text>
        <text id="memMgrTextLine2" x="400" y="480" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="memMgrText1.end + 2s" fill="freeze" id="memMgrText2" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="memMgrText2.end + 0.5s" fill="freeze" />
            Apps-ku evlo memory venumo, adha allocate pannum.
        </text>

        
        <text id="procMgrTextLine1" x="400" y="450" font-family="Arial, sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="highlightProcOn.end + 0.5s" fill="freeze" id="procMgrText1" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="procMgrText2.end + 0.5s" fill="freeze" />
            Process Management: Programs-ah run pannum.
        </text>
        <text id="procMgrTextLine2" x="400" y="480" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="procMgrText1.end + 2s" fill="freeze" id="procMgrText2" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="procMgrText2.end + 0.5s" fill="freeze" />
            CPU-va use panna, programs-ku chance kudukkum.
        </text>

        
        <text id="fileMgrTextLine1" x="400" y="450" font-family="Arial, sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="highlightFileOn.end + 0.5s" fill="freeze" id="fileMgrText1" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="fileMgrText2.end + 0.5s" fill="freeze" />
            File Management: Files-ah store, organize pannum.
        </text>
        <text id="fileMgrTextLine2" x="400" y="480" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="fileMgrText1.end + 2s" fill="freeze" id="fileMgrText2" />
            <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin="fileMgrText2.end + 0.5s" fill="freeze" />
            Data-va safe-ah vechikarthu idhan velai.
        </text>

        
        <text id="summaryTextLine1" x="400" y="450" font-family="Arial, sans-serif" font-size="28" fill="#00FFFF" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="summaryCircleAppear.end + 0.8s" fill="freeze" id="summaryText1" />
            Why OS is Important?
        </text>
        <text id="summaryTextLine2" x="400" y="500" font-family="Arial, sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="summaryText1.end + 2s" fill="freeze" id="summaryText2" />
            Namma computer smooth-ah, efficient-ah work panna OS dhaan mukkiyam.
        </text>
        <text id="summaryTextLine3" x="400" y="530" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="1s" begin="summaryText2.end + 2s" fill="freeze" id="summaryText3" />
            Adhu illana, namma computer oru empty box madhiri dhaan.
        </text>
    </g>
</svg>
{/* svg generation ends */}
      </div>

      {/* Waveform bars when speaking - positioned at bottom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', height: '2rem', position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)' }}>
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

      {/* Topic chips - positioned at bottom */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', maxWidth: '18rem' }}>
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

// ─── Visualizer Page ──────────────────────────────────────────────────────────
export default function VisualizerPage({ onNav }: { onNav?: (id: string) => void }) {
  const [speaking, setSpeaking] = useState(false)
  const [notes, setNotes] = useState<VisualizerNote[]>([])

  const handleSaveNote = (noteData: Omit<VisualizerNote, 'id' | 'timestamp'>) => {
    const newNote: VisualizerNote = {
      id: Date.now(),
      ...noteData,
      timestamp: new Date().toLocaleString()
    }
    
    setNotes(prev => [...prev, newNote])
    
    // Save to localStorage to persist across sessions and make available to Notes page
    const existingNotes = JSON.parse(localStorage.getItem('visualizerNotes') || '[]')
    const updatedNotes = [...existingNotes, {
      id: newNote.id,
      title: newNote.title,
      content: newNote.content,
      course: 'Visualizer',
      color: '#a855f7',
      date: 'Today',
      tags: ['Visualizer', 'AI'],
      pinned: false,
      timestamp: newNote.timestamp
    }]
    localStorage.setItem('visualizerNotes', JSON.stringify(updatedNotes))
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('visualizerNoteSaved'))
  }

  const handleSaveSVG = async () => {
    try {
      // Get the SVG element
      const svgElement = document.querySelector('#ai-visualizer-svg')
      if (!svgElement) {
        alert('No visualization found to save!')
        return
      }

      // Get SVG content
      const svgContent = svgElement.outerHTML
      const title = `OS Management Visualization - ${new Date().toLocaleDateString()}`
      const description = 'Interactive AI visualization explaining Operating System management concepts'

      // Save to backend
      const result = await saveSVGVisualization(svgContent, title, description)
      
      if (result.id) {
        alert('Visualization saved successfully!')
      } else {
        alert('Failed to save visualization. Please try again.')
      }
    } catch (error) {
      console.error('Error saving SVG:', error)
      alert('Error saving visualization. Please try again.')
    }
  }

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
        @keyframes pulse-dot { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{opacity:0.5;box-shadow:0 0 0 0.3rem rgba(34,197,94,0)} }
        @keyframes wave-bar-0 { from { height: 20% } to { height: 80% } }
        @keyframes wave-bar-1 { from { height: 40% } to { height: 60% } }
        @keyframes wave-bar-2 { from { height: 15% } to { height: 90% } }
        @keyframes wave-bar-3 { from { height: 35% } to { height: 70% } }
      `}</style>

      <ClickSpark
        sparkColor="#7c3aed"
        sparkSize={15}
        sparkRadius={25}
        sparkCount={12}
        duration={600}
        extraScale={1.5}
      >
        <div style={{ display: 'flex', height: '100vh', background: '#fff', color: '#1e1b4b', overflow: 'hidden' }}>
          {/* Unified sidebar */}
          <UnifiedSidebar active="visualizer" onNav={id => onNav && onNav(id)} variant="dark" />

          {/* Main visualizer content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, background: '#fff', height: '3rem' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🎨 AI VISUALIZER</span>
              <span style={{ color: '#ddd6fe', fontSize: '0.7rem' }}>·</span>
              <span style={{ fontSize: '0.65rem', fontFamily: "'DM Sans',sans-serif", color: '#6b7280' }}>Neural Network Visualization</span>
            </div>

            {/* Visualizer content */}
            <div style={{ flex: 1, background: 'linear-gradient(180deg, #faf9ff 0%, #f5f3ff 50%, #faf9ff 100%)', overflow: 'hidden', position: 'relative' }}>
              <AIVisualizer speaking={speaking} />
              <NotesPanel notes={notes} onSaveNote={handleSaveNote} onSaveSVG={handleSaveSVG} />
            </div>

            {/* Controls */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #ede9fe', flexShrink: 0, background: '#fff', height: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                </div>
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