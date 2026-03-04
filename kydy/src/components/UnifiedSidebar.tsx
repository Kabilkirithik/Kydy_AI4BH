import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem { id: string; icon: string; label: string }

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
  { id: 'lessons',   icon: '▶', label: 'Lessons'   },
  { id: 'visualizer', icon: '🎨', label: 'Visualizer' },
  { id: 'notes',     icon: '✦', label: 'Notes'     },
  { id: 'settings',  icon: '⚙', label: 'Settings'  },
]

// ─── Unified Sidebar ──────────────────────────────────────────────────────────
interface UnifiedSidebarProps {
  active: string
  onNav: (id: string) => void
  variant?: 'light' | 'dark'
}

export default function UnifiedSidebar({ active, onNav, variant = 'light' }: UnifiedSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const isDark = variant === 'dark'
  const sidebarWidth = isExpanded ? '240px' : '4rem'
  
  const styles = {
    sidebar: {
      width: sidebarWidth,
      minHeight: '100vh',
      flexShrink: 0,
      background: isDark ? 'rgba(6,3,22,0.98)' : '#ffffff',
      borderRight: isDark ? '1px solid rgba(124,58,237,0.15)' : '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: isExpanded ? '28px 14px' : '1.2rem 0',
      position: 'sticky' as const,
      top: 0,
      height: '100vh',
      zIndex: 10,
      transition: 'all 0.3s ease',
      alignItems: isExpanded ? 'stretch' : 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: isExpanded ? 10 : 0,
      marginBottom: isExpanded ? '3rem' : '3.5rem',
      paddingLeft: isExpanded ? 8 : 0,
      justifyContent: isExpanded ? 'flex-start' : 'center',
      position: 'relative' as const,
    },
    logoIcon: {
      width: isExpanded ? 38 : '2.2rem',
      height: isExpanded ? 38 : '2.2rem',
      borderRadius: isExpanded ? 10 : '0.55rem',
      background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins',sans-serif",
      fontWeight: 900,
      color: '#fff',
      fontSize: isExpanded ? 18 : '1rem',
      boxShadow: isDark ? '0 0 1rem rgba(124,58,237,0.5)' : '0 0 20px rgba(124,58,237,0.3)',
    },
    logoText: {
      display: isExpanded ? 'block' : 'none',
    },
    expandButton: {
      position: 'absolute' as const,
      top: isExpanded ? '4.5rem' : '4rem',
      left: isExpanded ? '1rem' : '50%',
      transform: isExpanded ? 'none' : 'translateX(-50%)',
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '0.4rem',
      border: 'none',
      cursor: 'pointer',
      background: isDark ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.15)',
      color: isDark ? '#e9d5ff' : '#7c3aed',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      zIndex: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    nav: {
      flex: 1,
    },
    navHeader: {
      fontSize: 9,
      color: isDark ? '#64748b' : '#9ca3af',
      letterSpacing: 3,
      fontFamily: 'monospace',
      marginBottom: 10,
      paddingLeft: isExpanded ? 10 : 0,
      textAlign: isExpanded ? ('left' as const) : ('center' as const),
      display: isExpanded ? 'block' : 'none',
    },
    navItems: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: isExpanded ? 3 : '0.25rem',
    },
    userCard: {
      background: isDark ? 'rgba(124,58,237,0.1)' : '#f9fafb',
      border: isDark ? '1px solid rgba(124,58,237,0.2)' : '1px solid #e5e7eb',
      borderRadius: 13,
      padding: isExpanded ? '13px' : '0.5rem',
      display: isExpanded ? 'block' : 'flex',
      justifyContent: 'center',
    },
  }

  const getNavButtonStyle = (item: NavItem) => {
    const isActive = active === item.id
    
    if (isExpanded) {
      return {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '11px 12px',
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        fontFamily: "'Poppins',sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        textAlign: 'left' as const,
        width: '100%',
        background: isActive
          ? (isDark ? 'rgba(124,58,237,0.35)' : 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(168,85,247,0.05))')
          : 'transparent',
        color: isActive 
          ? (isDark ? '#e9d5ff' : '#7c3aed') 
          : (isDark ? '#64748b' : '#6b7280'),
        borderLeft: isActive && !isDark ? '2px solid #7c3aed' : '2px solid transparent',
        boxShadow: isActive 
          ? (isDark ? '0 0 1rem rgba(124,58,237,0.25)' : '0 0 18px rgba(124,58,237,0.08)') 
          : 'none',
        transition: 'all 0.2s',
      }
    } else {
      return {
        width: '2.6rem',
        height: '2.6rem',
        borderRadius: '0.6rem',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.05rem',
        background: isActive
          ? (isDark ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.1)')
          : 'transparent',
        color: isActive 
          ? (isDark ? '#e9d5ff' : '#7c3aed') 
          : (isDark ? '#64748b' : '#6b7280'),
        boxShadow: isActive 
          ? (isDark ? '0 0 1rem rgba(124,58,237,0.25)' : '0 0 10px rgba(124,58,237,0.2)') 
          : 'none',
        transition: 'all 0.2s',
      }
    }
  }

  const handleNavHover = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean, isEnter: boolean) => {
    if (!isActive) {
      if (isEnter) {
        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb'
        e.currentTarget.style.color = isDark ? '#e9d5ff' : '#374151'
      } else {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = isDark ? '#64748b' : '#6b7280'
      }
    }
  }

  return (
    <aside style={styles.sidebar}>
      {/* Expand/Contract Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.expandButton}
        onMouseEnter={e => {
          e.currentTarget.style.background = isDark ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.25)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isDark ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.15)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {isExpanded ? '◂' : '▸'}
      </button>

      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>K</div>
        <div style={styles.logoText}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 700, color: isDark ? '#e9d5ff' : '#1f2937', letterSpacing: 2 }}>KYDY</div>
          <div style={{ fontSize: 8, color: '#7c3aed', letterSpacing: 3, fontFamily: 'monospace' }}>EDTECH</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navHeader}>NAVIGATION</div>
        <div style={styles.navItems}>
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                title={!isExpanded ? item.label : undefined}
                style={getNavButtonStyle(item)}
                onMouseEnter={e => handleNavHover(e, isActive, true)}
                onMouseLeave={e => handleNavHover(e, isActive, false)}
              >
                <span style={{ fontSize: isExpanded ? 16 : '1.05rem', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                {isExpanded && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDark ? '#e9d5ff' : '#7c3aed', boxShadow: isDark ? '0 0 8px rgba(233,213,255,0.4)' : '0 0 8px rgba(124,58,237,0.4)', flexShrink: 0 }} />
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Divider */}
      {isExpanded && (
        <div style={{ height: 1, background: isDark ? 'rgba(124,58,237,0.2)' : 'linear-gradient(90deg,transparent,#e5e7eb,transparent)', margin: '16px 0' }} />
      )}

      {/* User card */}
      <div style={styles.userCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isExpanded ? 10 : 0, justifyContent: isExpanded ? 'flex-start' : 'center' }}>
          <div style={{
            width: isExpanded ? 34 : '2.2rem',
            height: isExpanded ? 34 : '2.2rem',
            borderRadius: '50%',
            flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isExpanded ? 15 : '0.9rem',
            boxShadow: isDark ? '0 0 0.6rem rgba(124,58,237,0.4)' : '0 0 10px rgba(124,58,237,0.3)',
            cursor: 'pointer',
          }}>👤</div>
          {isExpanded && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: isDark ? '#e9d5ff' : '#1f2937', fontSize: 11, fontWeight: 700, fontFamily: "'Poppins',sans-serif", letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ridhan</div>
                <div style={{ color: isDark ? '#a78bfa' : '#6b7280', fontSize: 10, fontFamily: "'Inter',sans-serif" }}>Pro Learner</div>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
            </>
          )}
        </div>
      </div>
    </aside>
  )
}