import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/learn', label: 'Learn' },
  { to: '/app/watch/1', label: 'Watch' },
  { to: '/app/teach', label: 'Teach' },
  { to: '/app/peers', label: 'Peers' },
  { to: '/app/profile', label: 'Profile' },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '250px 1fr', background: 'var(--bg)' }}>
      <aside style={{ padding: 24, borderRight: '1px solid var(--border)', background: 'var(--card)' }} className="hide-mobile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            ✦
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 800 }}>SkillSwap</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Learn and teach</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--text2)',
                background: isActive ? 'var(--accent)' : 'transparent',
                fontWeight: 600,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 24, padding: 16, borderRadius: 'var(--radius)', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Signed in as</div>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>{user?.name || 'Learner'}</div>
          <button className="btn btn-secondary btn-sm btn-full" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(250,248,243,0.88)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.08em' }}>WELCOME</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.name || 'Learner'}</div>
          </div>
          <button className="btn btn-primary btn-sm hide-mobile" onClick={() => navigate('/app/learn')}>Browse lessons</button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}