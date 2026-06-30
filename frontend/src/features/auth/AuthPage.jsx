import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { authApi } from '../../lib/api'
import ThemeToggle from '../../components/ThemeToggle'
import { NotesIllustration, RainbowCloudIllustration } from '../../components/DashboardIllustrations'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const [resendStatus, setResendStatus] = useState('') // '' | 'sending' | 'sent'

  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNeedsVerification(false)

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
    try {
      if (mode === 'signup') {
        await register({ name: name.trim(), email: email.trim().toLowerCase(), password })
        setJustRegistered(true)
      } else {
        const loggedInUser = await login({ email: email.trim().toLowerCase(), password })
        navigate(loggedInUser.isProfileComplete ? '/app/dashboard' : '/setup')
      }
    } catch (submitError) {
      if (submitError.status === 403) {
        // Account exists but email isn't verified yet
        setNeedsVerification(true)
        setError(submitError.message)
      } else {
        setError(submitError.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendStatus('sending')
    try {
      await authApi.resendVerification(email.trim().toLowerCase())
      setResendStatus('sent')
    } catch {
      setResendStatus('')
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
    setNeedsVerification(false)
    setJustRegistered(false)
    setResendStatus('')
  }

  // After signup, show a "check your inbox" screen instead of the form —
  // the backend requires email verification before the first login.
  if (justRegistered) {
    return (
      <main className="classic-auth-page">
        <section className="classic-auth-form-panel" style={{ margin: '0 auto' }}>
          <div className="classic-auth-theme"><ThemeToggle compact /></div>
          <div className="classic-auth-form-wrap">
            <button type="button" className="classic-auth-mobile-brand" onClick={() => navigate('/')} aria-label="Go to SkillSwap home">
              <span className="classic-auth-brand-mark">✦</span>
              <span>SkillSwap</span>
            </button>

            <h2>Check your inbox</h2>
            <p className="classic-auth-subtitle">
              We sent a verification link to <strong>{email.trim()}</strong>. Click it to activate your account, then come back and sign in.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-full classic-auth-submit"
              style={{ marginTop: '1.5rem' }}
              onClick={() => changeMode('login')}
            >
              Back to sign in
            </button>

            <p className="classic-auth-switch" style={{ marginTop: '1rem' }}>
              Didn't get it?{' '}
              <button type="button" onClick={handleResend} disabled={resendStatus === 'sending'}>
                {resendStatus === 'sent' ? 'Sent again ✓' : resendStatus === 'sending' ? 'Sending…' : 'Resend email'}
              </button>
            </p>
          </div>
        </section>
      </main>
    )
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

            {error && (
              <div className="classic-auth-error" role="alert">
                {error}
                {needsVerification && (
                  <>
                    {' '}
                    <button type="button" onClick={handleResend} disabled={resendStatus === 'sending'} style={{ textDecoration: 'underline' }}>
                      {resendStatus === 'sent' ? 'Sent ✓' : resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
                    </button>
                  </>
                )}
              </div>
            )}

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
