
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

      {/* SVG neural net - 75% of screen area aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*/}
      <div style={{ width: '100%', height: '75%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect x="0" y="0" width="800" height="600" fill="#F8F8F8"/>

  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
    </marker>
  </defs>

  
  <g id="scene1" opacity="0">
    <rect x="250" y="380" width="300" height="10" fill="#4A4A4A"/>
    <rect x="300" y="300" width="200" height="80" fill="#4A4A4A" rx="5" ry="5"/>
    <path id="appliedForce1" d="M200 340 H300" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)" opacity="0"/>
    <text x="170" y="330" font-family="Arial, sans-serif" font-size="20" fill="#66BB6A" opacity="0">Applied Force</text>
    <path id="frictionForce1" d="M500 340 H600" stroke="#EF5350" stroke-width="5" marker-end="url(#arrowhead)" opacity="0"/>
    <text x="610" y="330" font-family="Arial, sans-serif" font-size="20" fill="#EF5350" opacity="0">Friction Force</text>
  </g>

  
  <g id="scene2_setup" opacity="0">
    <rect x="200" y="290" width="400" height="10" fill="#4A4A4A"/>
    <rect x="250" y="200" width="300" height="80" fill="#4A4A4A" rx="5" ry="5"/>
    <path d="M250 280 C260 270, 270 290, 280 280 C290 270, 300 290, 310 280 C320 270, 330 290, 340 280 C350 270, 360 290, 370 280 C380 270, 390 290, 400 280 C410 270, 420 290, 430 280 C440 270, 450 290, 460 280 C470 270, 480 290, 490 280 C500 270, 510 290, 520 280 C530 270, 540 290, 550 280" fill="none" stroke="#42A5F5" stroke-width="2" id="block_roughness_path" opacity="0"/>
    <path d="M200 290 C210 300, 220 280, 230 290 C240 300, 250 280, 260 290 C270 300, 280 280, 290 290 C300 300, 310 280, 320 290 C330 300, 340 280, 350 290 C360 300, 370 280, 380 290 C390 300, 400 280, 410 290 C420 300, 430 280, 440 290 C450 300, 460 280, 470 290 C480 300, 490 280, 500 290 C510 300, 520 280, 530 290 C540 300, 550 280, 560 290 C570 300, 580 280, 590 290 C600 300" fill="none" stroke="#66BB6A" stroke-width="2" id="ground_roughness_path" opacity="0"/>
  </g>

  
  <g id="scene3_interlock" opacity="0">
    <rect x="200" y="290" width="400" height="10" fill="#4A4A4A"/>
    <rect x="250" y="200" width="300" height="80" fill="#4A4A4A" rx="5" ry="5"/>
    <g id="interlocking_surfaces">
      <path d="M250 280 C260 270, 270 290, 280 280 C290 270, 300 290, 310 280 C320 270, 330 290, 340 280 C350 270, 360 290, 370 280 C380 270, 390 290, 400 280 C410 270, 420 290, 430 280 C440 270, 450 290, 460 280 C470 270, 480 290, 490 280 C500 270, 510 290, 520 280 C530 270, 540 290, 550 280" fill="none" stroke="#42A5F5" stroke-width="4" id="block_roughness_interlock"/>
      <path d="M200 290 C210 300, 220 280, 230 290 C240 300, 250 280, 260 290 C270 300, 280 280, 290 290 C300 300, 310 280, 320 290 C330 300, 340 280, 350 290 C360 300, 370 280, 380 290 C390 300, 400 280, 410 290 C420 300, 430 280, 440 290 C450 300, 460 280, 470 290 C480 300, 490 280, 500 290 C510 300, 520 280, 530 290 C540 300, 550 280, 560 290 C570 300, 580 280, 590 290 C600 300" fill="none" stroke="#66BB6A" stroke-width="4" id="ground_roughness_interlock"/>
    </g>
    <path id="appliedForce3" d="M150 285 H200" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)" opacity="0"/>
    <path id="frictionForce3" d="M600 285 H650" stroke="#EF5350" stroke-width="5" marker-end="url(#arrowhead)" opacity="0"/>
  </g>


  <g id="scene4_roughness" opacity="0">
    <text x="400" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4A4A4A" opacity="0">Surface Roughness</text>

    
    <g>
      <rect x="100" y="380" width="250" height="10" fill="#4A4A4A"/>
      <rect x="150" y="300" width="150" height="80" fill="#4A4A4A" rx="5" ry="5"/>
      <path d="M100 380 C110 370, 120 390, 130 380 C140 370, 150 390, 160 380 C170 370, 180 390, 190 380 C200 370, 210 390, 220 380 C230 370, 240 390, 250 380 C260 370, 270 390, 280 380 C290 370, 300 390, 310 380 C320 370, 330 390, 340 380" fill="none" stroke="#EF5350" stroke-width="2"/>
      <path d="M150 380 C160 370, 170 390, 180 380 C190 370, 200 390, 210 380 C220 370, 230 390, 240 380 C250 370, 260 390, 270 380 C280 370, 290 390, 300 380" fill="none" stroke="#66BB6A" stroke-width="2"/>
      <path d="M100 340 H150" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
      <path d="M300 340 H350" stroke="#EF5350" stroke-width="5" marker-end="url(#arrowhead)"/>
      <text x="225" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#4A4A4A">Rough Surface (More Friction)</text>
    </g>


    <g>
      <rect x="450" y="380" width="250" height="10" fill="#4A4A4A"/>
      <rect x="500" y="300" width="150" height="80" fill="#4A4A4A" rx="5" ry="5"/>
      <path d="M450 380 L700 380" fill="none" stroke="#EF5350" stroke-width="2"/>
      <path d="M500 380 L650 380" fill="none" stroke="#66BB6A" stroke-width="2"/>
      <path d="M450 340 H500" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
      <path d="M650 340 H700" stroke="#EF5350" stroke-width="3" marker-end="url(#arrowhead)"/>
      <text x="575" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#4A4A4A">Smooth Surface (Less Friction)</text>
    </g>
  </g>

  
  <g id="scene5_weight" opacity="0">
    <text x="400" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4A4A4A" opacity="0">Normal Force / Weight</text>

    
    <g>
      <rect x="100" y="380" width="250" height="10" fill="#4A4A4A"/>
      <rect x="150" y="300" width="150" height="80" fill="#4A4A4A" rx="5" ry="5"/>
      <path d="M100 340 H150" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
      <path d="M300 340 H350" stroke="#EF5350" stroke-width="3" marker-end="url(#arrowhead)"/>
      <text x="225" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#4A4A4A">Less Weight (Less Friction)</text>
    </g>


    <g>
      <rect x="450" y="380" width="250" height="10" fill="#4A4A4A"/>
      <rect x="500" y="300" width="150" height="80" fill="#4A4A4A" rx="5" ry="5"/>
      <rect x="525" y="250" width="100" height="50" fill="#42A5F5" rx="5" ry="5" opacity="0" id="top_block"/>
      <path d="M450 340 H500" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
      <path d="M650 340 H700" stroke="#EF5350" stroke-width="3" marker-end="url(#arrowhead)"/>
      <text x="575" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#4A4A4A">More Weight (More Friction)</text>
    </g>
  </g>

  
  <g id="scene6_types" opacity="0">
    <text x="400" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4A4A4A" opacity="0">Static vs. Kinetic Friction</text>

    <rect x="250" y="380" width="300" height="10" fill="#4A4A4A"/>
    <rect id="friction_block_main" x="300" y="300" width="200" height="80" fill="#4A4A4A" rx="5" ry="5"/>

    <path id="push_arrow_static" d="M200 340 H300" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)" opacity="0"/>
    <text id="static_text" x="400" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" fill="#EF5350" opacity="0">Static Friction (No Movement)</text>

    <path id="push_arrow_kinetic" d="M200 340 H300" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)" opacity="0"/>
    <text id="kinetic_text" x="400" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" fill="#42A5F5" opacity="0">Kinetic Friction (Moving)</text>
  </g>

   
  <g id="scene7_benefits" opacity="0">
    <text x="400" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4A4A4A" opacity="0">Benefits of Friction</text>


    <g transform="translate(100, 200)">
      <circle cx="50" cy="50" r="30" fill="#4A4A4A"/>
      <rect x="25" y="80" width="50" height="80" fill="#4A4A4A"/>
      <rect x="30" y="160" width="20" height="50" fill="#4A4A4A" transform="rotate(-15 40 160)"/>
      <rect x="50" y="160" width="20" height="50" fill="#4A4A4A" transform="rotate(15 60 160)"/>
      <rect x="20" y="205" width="40" height="10" fill="#4A4A4A" rx="3" ry="3" transform="rotate(-15 40 205)"/>
      <rect x="40" y="205" width="40" height="10" fill="#4A4A4A" rx="3" ry="3" transform="rotate(15 60 205)"/>
      <rect x="0" y="215" width="150" height="10" fill="#4A4A4A"/>
      <path d="M70 210 H100" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
      <text x="75" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Walking</text>
    </g>


    <g transform="translate(325, 200)">
      <circle cx="50" cy="50" r="40" fill="#4A4A4A" stroke="#42A5F5" stroke-width="5"/>
      <rect x="40" y="20" width="20" height="30" fill="#EF5350" rx="3" ry="3"/>
      <path d="M50 100 V120" stroke="#EF5350" stroke-width="5" marker-end="url(#arrowhead)"/>
      <text x="50" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Braking</text>
    </g>

    
    <g transform="translate(550, 200)">
      <rect x="40" y="40" width="70" height="100" fill="#4A4A4A" rx="5" ry="5"/>
      <path d="M30 70 C10 70, 10 120, 30 120" stroke="#42A5F5" stroke-width="5" fill="none"/>
      <text x="75" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Holding Objects</text>
    </g>
  </g>

  
  <g id="scene8_drawbacks" opacity="0">
    <text x="400" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4A4A4A" opacity="0">Drawbacks of Friction</text>

    
    <g transform="translate(150, 200)">
      <circle cx="50" cy="50" r="40" fill="#4A4A4A"/>
      <circle cx="150" cy="50" r="40" fill="#4A4A4A"/>
      <path d="M90 50 H110" stroke="#EF5350" stroke-width="3"/>
      <path d="M95 40 L105 60" stroke="#EF5350" stroke-width="3"/>
      <path d="M95 60 L105 40" stroke="#EF5350" stroke-width="3"/>
      <text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Wear &amp; Tear / Heat</text>
    </g>

    
    <g transform="translate(450, 200)">
      <rect x="0" y="100" width="150" height="80" fill="#4A4A4A" rx="5" ry="5"/>
      <rect x="150" y="100" width="150" height="80" fill="#4A4A4A" rx="5" ry="5"/>
      <path d="M-50 140 H0" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
      <path d="M150 140 H200" stroke="#EF5350" stroke-width="5" marker-end="url(#arrowhead)"/>
      <path d="M140 100 C145 90, 155 90, 160 100" fill="none" stroke="#EF5350" stroke-width="2"/>
      <path d="M140 180 C145 190, 155 190, 160 180" fill="none" stroke="#EF5350" stroke-width="2"/>
      <text x="150" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Energy Loss</text>
    </g>
  </g>

  
  <g id="scene9_reduce" opacity="0">
    <text x="400" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#4A4A4A" opacity="0">Reducing Friction</text>


    <g transform="translate(100, 200)">
      <circle cx="50" cy="50" r="40" fill="#4A4A4A"/>
      <circle cx="150" cy="50" r="40" fill="#4A4A4A"/>
      <path d="M90 50 H110" stroke="#42A5F5" stroke-width="3"/>
      <circle cx="100" cy="50" r="10" fill="#42A5F5" opacity="0.5"/>
      <text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Lubricants</text>
    </g>


    <g transform="translate(325, 200)">
      <rect x="25" y="0" width="100" height="50" fill="#4A4A4A" rx="5" ry="5"/>
      <circle cx="50" cy="80" r="25" fill="#4A4A4A"/>
      <circle cx="100" cy="80" r="25" fill="#4A4A4A"/>
      <rect x="0" y="110" width="150" height="10" fill="#4A4A4A"/>
      <text x="75" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Wheels</text>
    </g>

    
    <g transform="translate(550, 200)">
      <rect x="0" y="100" width="150" height="10" fill="#4A4A4A"/>
      <rect x="25" y="50" width="100" height="50" fill="#4A4A4A" rx="5" ry="5"/>
      <path d="M0 100 L150 100" fill="none" stroke="#42A5F5" stroke-width="2"/>
      <path d="M25 100 L125 100" fill="none" stroke="#42A5F5" stroke-width="2"/>
      <text x="75" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4A4A4A">Smooth Surfaces</text>
    </g>
  </g>

  
  <g id="scene10_conclusion" opacity="0">
    <rect x="250" y="380" width="300" height="10" fill="#4A4A4A"/>
    <rect x="300" y="300" width="200" height="80" fill="#4A4A4A" rx="5" ry="5"/>
    <path d="M200 340 H300" stroke="#66BB6A" stroke-width="5" marker-end="url(#arrowhead)"/>
    <path d="M500 340 H600" stroke="#EF5350" stroke-width="5" marker-end="url(#arrowhead)"/>
    <text x="400" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#4A4A4A">Friction: An Essential Force!</text>
  </g>


  
  <animate attributeName="opacity" href="#scene1" from="0" to="1" dur="1s" begin="0s" fill="freeze"/>
  <animate attributeName="opacity" href="#appliedForce1" from="0" to="1" dur="0.8s" begin="1.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene1 text:nth-of-type(1)" from="0" to="1" dur="0.8s" begin="1.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#frictionForce1" from="0" to="1" dur="0.8s" begin="2.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene1 text:nth-of-type(2)" from="0" to="1" dur="0.8s" begin="2.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene1" from="1" to="0" dur="1s" begin="5s" fill="freeze"/>

  
  <animate attributeName="opacity" href="#scene2_setup" from="0" to="1" dur="1s" begin="6s" fill="freeze"/>
  <animate attributeName="opacity" href="#block_roughness_path" from="0" to="1" dur="1s" begin="7s" fill="freeze"/>
  <animate attributeName="opacity" href="#ground_roughness_path" from="0" to="1" dur="1s" begin="7.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene2_setup" from="1" to="0" dur="1s" begin="10.5s" fill="freeze"/>

  <animate attributeName="opacity" href="#scene3_interlock" from="0" to="1" dur="1s" begin="11.5s" fill="freeze"/>
  <animateTransform attributeName="transform" type="translate" href="#block_roughness_interlock" from="0 0" to="-10 0" dur="1s" begin="13s" fill="freeze"/>
  <animateTransform attributeName="transform" type="translate" href="#block_roughness_interlock" from="-10 0" to="0 0" dur="0.5s" begin="14s" fill="freeze"/>
  <animate attributeName="opacity" href="#appliedForce3" from="0" to="1" dur="0.8s" begin="13s" fill="freeze"/>
  <animate attributeName="opacity" href="#frictionForce3" from="0" to="1" dur="0.8s" begin="13.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene3_interlock" from="1" to="0" dur="1s" begin="15.5s" fill="freeze"/>

  
  <animate attributeName="opacity" href="#scene4_roughness" from="0" to="1" dur="1s" begin="16.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene4_roughness > text" from="0" to="1" dur="0.8s" begin="17s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene4_roughness > g:nth-of-type(1) path" from="0" to="1" dur="0.8s" begin="18s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene4_roughness > g:nth-of-type(2) path" from="0" to="1" dur="0.8s" begin="18.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene4_roughness" from="1" to="0" dur="1s" begin="22s" fill="freeze"/>

  
  <animate attributeName="opacity" href="#scene5_weight" from="0" to="1" dur="1s" begin="23s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene5_weight > text" from="0" to="1" dur="0.8s" begin="23.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#top_block" from="0" to="1" dur="1s" begin="25s" fill="freeze"/>
  <animate attributeName="stroke-width" href="#scene5_weight > g:nth-of-type(2) path:nth-of-type(4)" from="3" to="5" dur="1s" begin="25.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene5_weight" from="1" to="0" dur="1s" begin="27.5s" fill="freeze"/>

  
  <animate attributeName="opacity" href="#scene6_types" from="0" to="1" dur="1s" begin="28.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene6_types > text" from="0" to="1" dur="0.8s" begin="29s" fill="freeze"/>
  <animate attributeName="opacity" href="#push_arrow_static" from="0" to="1" dur="0.8s" begin="30s" fill="freeze"/>
  <animate attributeName="opacity" href="#static_text" from="0" to="1" dur="0.8s" begin="30.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#push_arrow_static, #static_text" from="1" to="0" dur="0.5s" begin="32s" fill="freeze"/>
  <animate attributeName="opacity" href="#push_arrow_kinetic" from="0" to="1" dur="0.8s" begin="32.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#kinetic_text" from="0" to="1" dur="0.8s" begin="33s" fill="freeze"/>
  <animateTransform attributeName="transform" type="translate" href="#friction_block_main" from="0 0" to="50 0" dur="1.5s" begin="33.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene6_types" from="1" to="0" dur="1s" begin="36s" fill="freeze"/>


  <animate attributeName="opacity" href="#scene7_benefits" from="0" to="1" dur="1s" begin="37s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene7_benefits > text" from="0" to="1" dur="0.8s" begin="37.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene7_benefits > g:nth-of-type(1)" from="0" to="1" dur="0.8s" begin="38.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene7_benefits > g:nth-of-type(2)" from="0" to="1" dur="0.8s" begin="39.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene7_benefits > g:nth-of-type(3)" from="0" to="1" dur="0.8s" begin="40.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene7_benefits" from="1" to="0" dur="1s" begin="42.5s" fill="freeze"/>


  <animate attributeName="opacity" href="#scene8_drawbacks" from="0" to="1" dur="1s" begin="43.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene8_drawbacks > text" from="0" to="1" dur="0.8s" begin="44s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene8_drawbacks > g:nth-of-type(1)" from="0" to="1" dur="0.8s" begin="45s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene8_drawbacks > g:nth-of-type(2)" from="0" to="1" dur="0.8s" begin="46s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene8_drawbacks" from="1" to="0" dur="1s" begin="48s" fill="freeze"/>


  <animate attributeName="opacity" href="#scene9_reduce" from="0" to="1" dur="1s" begin="49s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene9_reduce > text" from="0" to="1" dur="0.8s" begin="49.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene9_reduce > g:nth-of-type(1)" from="0" to="1" dur="0.8s" begin="50.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene9_reduce > g:nth-of-type(2)" from="0" to="1" dur="0.8s" begin="51.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene9_reduce > g:nth-of-type(3)" from="0" to="1" dur="0.8s" begin="52.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene9_reduce" from="1" to="0" dur="1s" begin="54.5s" fill="freeze"/>

  
  <animate attributeName="opacity" href="#scene10_conclusion" from="0" to="1" dur="1s" begin="55.5s" fill="freeze"/>
  <animate attributeName="opacity" href="#scene10_conclusion > text" from="0" to="1" dur="1s" begin="56.5s" fill="freeze"/>

</svg>
{/* svg generation ends //////////////////////////////////////////////////////*/}
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');
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
        <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', color: '#1e1b4b', overflow: 'hidden' }}>
          {/* Unified sidebar */}
          <UnifiedSidebar active="visualizer" onNav={id => onNav && onNav(id)} variant="light" />

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
