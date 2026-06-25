import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import ThemeToggle from './ThemeToggle'
import BrandLogo, { BrandMark } from './BrandLogo'

function Icon({ name, className = '' }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    focus: <><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></>,
    learn: <><path d="M5 4.5h12a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2Z"/><path d="M8 8h7M8 12h7M8 16h5"/></>,
    teach: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4Z"/><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8Z"/></>,
    swap: <><path d="M7 7h11l-3-3"/><path d="m18 7-3 3"/><path d="M17 17H6l3 3"/><path d="m6 17 3-3"/></>,
    profile: <><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.38.25.73.6 1 .6h.1v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19h4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    logout: <><path d="M10 5H5v14h5"/><path d="m14 8 4 4-4 4"/><path d="M9 12h9"/></>,
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Home', icon: 'home' },
  { to: '/app/watch/1', label: 'Focus', icon: 'focus' },
  { to: '/app/learn', label: 'Learn', icon: 'learn' },
  { to: '/app/teach', label: 'Teach', icon: 'teach' },
  { to: '/app/peers', label: 'Skill Swap', icon: 'swap' },
  { to: '/app/profile', label: 'Profile', icon: 'profile' },
]

const PAGE_META = {
  '/app/dashboard': ['Dashboard', 'Your learning overview'],
  '/app/learn': ['Learn', 'Continue building your skills'],
  '/app/teach': ['Teach', 'Share what you know'],
  '/app/peers': ['Skill Swap', 'Find the right learning partner'],
  '/app/profile': ['Profile', 'Manage your learning identity'],
}

function NavItem({ item, closeMenu }) {
  return (
    <NavLink
      to={item.to}
      onClick={closeMenu}
      title={item.label}
      className={({ isActive }) => `app-nav__item${isActive ? ' is-active' : ''}`}
    >
      <span className="app-nav__icon"><Icon name={item.icon} /></span>
      <span className="app-nav__label">{item.label}</span>
      <span className="app-nav__dot" aria-hidden="true" />
    </NavLink>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pageTitle, pageSubtitle] = location.pathname.startsWith('/app/watch')
    ? ['Focus session', 'Stay present and make progress']
    : PAGE_META[location.pathname] || ['SkillSwap', 'Learn, share, and grow']

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button type="button" aria-label="Close navigation" className="app-shell__backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`app-sidebar${menuOpen ? ' is-open' : ''}`}>
        <button type="button" onClick={() => navigate('/app/dashboard')} className="app-sidebar__brand" aria-label="Go to dashboard">
          <BrandMark className="app-sidebar__brand-mark" />
          <BrandLogo compact className="app-sidebar__brand-full" />
        </button>

        <div className="app-sidebar__eyebrow">Workspace</div>
        <nav className="app-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(item => <NavItem key={item.to} item={item} closeMenu={() => setMenuOpen(false)} />)}
          <div className="app-nav__divider" />
          <button type="button" title="Settings" className="app-nav__item app-nav__button">
            <span className="app-nav__icon"><Icon name="settings" /></span>
            <span className="app-nav__label">Settings</span>
          </button>
        </nav>

        <div className="app-sidebar__profile">
          <div className="app-sidebar__profile-row">
            <div className="app-sidebar__avatar">
              {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'LS'}
            </div>
            <div className="app-sidebar__profile-copy">
              <div>{user?.name || 'Learner'}</div>
              <span>Level 1 • Learner</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} title="Log out" className="app-sidebar__logout">
            <Icon name="logout" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <section className="app-workspace">
        <header className="app-header">
          <div className="app-header__left">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" className="app-header__menu"><Icon name="menu" /></button>
            <div className="app-header__titles">
              <h1>{pageTitle}</h1>
              <p>{pageSubtitle}</p>
            </div>
          </div>
          <div className="app-header__actions">
            <div className="app-header__streak"><span aria-hidden="true">🔥</span>{user?.streak || 0} day streak</div>
            <ThemeToggle compact />
            <button type="button" aria-label="Notifications" className="app-header__icon-button"><Icon name="bell" /></button>
          </div>
        </header>

        <main className="app-content"><Outlet /></main>
      </section>
    </div>
  )
}
