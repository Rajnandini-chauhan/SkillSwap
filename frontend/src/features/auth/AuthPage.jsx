import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { NotesIllustration, RainbowCloudIllustration } from '../components/DashboardIllustrations'

const AVATAR_COLORS = ['#C4603A', '#3D7A5C', '#8B6B4A', '#5A7A8A', '#7A5A8A', '#8A7A3A']

function getInitials(name) {
  return name.trim().split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

function pickColor(name) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('What should we call you?')
      return
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    const displayName = mode === 'signup'
      ? name.trim()
      : (() => {
          try {
            const existing = localStorage.getItem('skilldge_user')
            if (existing) return JSON.parse(existing).name
          } catch (storageError) {
            void storageError
          }
          return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
        })()

    login({
      name: displayName,
      email: email.trim().toLowerCase(),
      avatar: getInitials(displayName),
      color: pickColor(displayName),
      skillsLearn: [],
      skillsTeach: [],
      streak: 0,
      xp: 0,
      joinedAt: new Date().toISOString(),
    })

    setLoading(false)
    navigate(mode === 'signup' ? '/setup' : '/app/dashboard')
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="classic-auth-page">
      <section className="classic-auth-showcase hide-mobile" aria-label="About SkillSwap">
        <div className="classic-auth-orb" aria-hidden="true" />
        <div className="classic-auth-showcase-content">
          <button type="button" className="classic-auth-brand" onClick={() => navigate('/')} aria-label="Go to SkillSwap home">
            <span className="classic-auth-brand-mark">✦</span>
            <span>SkillSwap</span>
          </button>

          <h1>
            Every lesson<br />
            <em>is a step forward.</em>
          </h1>

          <p className="classic-auth-intro">
            Your learning journey, your notes, and your growth — all in one calm place that remembers where you left off.
          </p>

          <div className="classic-auth-preview" aria-hidden="true">
            <div className="classic-auth-preview__note">
              <NotesIllustration />
            </div>

            <div className="classic-auth-preview__goal">
              <div className="classic-auth-preview__goal-head">
                <span>Weekly goal</span>
                <strong>3/4</strong>
              </div>
              <div className="classic-auth-preview__track"><span /></div>
              <div className="classic-auth-preview__days">
                <i /><i /><i />
              </div>
              <div className="classic-auth-preview__mini-track"><span /></div>
            </div>

            <div className="classic-auth-preview__rainbow">
              <RainbowCloudIllustration />
            </div>
          </div>
        </div>
      </section>

      <section className="classic-auth-form-panel">
        <div className="classic-auth-theme"><ThemeToggle compact /></div>

        <div className="classic-auth-form-wrap">
          <button type="button" className="classic-auth-mobile-brand" onClick={() => navigate('/')} aria-label="Go to SkillSwap home">
            <span className="classic-auth-brand-mark">✦</span>
            <span>SkillSwap</span>
          </button>

          <h2>{mode === 'login' ? 'Good to see you again' : 'Create your account'}</h2>
          <p className="classic-auth-subtitle">
            {mode === 'login'
              ? 'Pick up right where you left off.'
              : 'Join people who are learning and sharing something new.'}
          </p>

          <div className="classic-auth-tabs" role="tablist" aria-label="Authentication mode">
            {['login', 'signup'].map(option => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={mode === option}
                className={mode === option ? 'is-active' : ''}
                onClick={() => changeMode(option)}
              >
                {option === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="full-name">Your full name</label>
                <input
                  id="full-name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <div className="classic-auth-error" role="alert">{error}</div>}

            <button type="submit" className="btn btn-primary btn-full classic-auth-submit" disabled={loading}>
              {loading
                ? <span className="dot-anim" aria-label="Loading"><span/><span/><span/></span>
                : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p className="classic-auth-switch">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
