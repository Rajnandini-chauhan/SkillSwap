// ═══════════════════════════════════════════════
// SKILLDGE – AUTH PAGE
// Real name, real user — warm onboarding
// ═══════════════════════════════════════════════

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from "../../lib/AuthContext";

const AVATAR_COLORS = ['#C4603A','#3D7A5C','#8B6B4A','#5A7A8A','#7A5A8A','#8A7A3A']

function getInitials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function pickColor(name) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode]       = useState(params.get('mode') || 'login')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name.trim())  { setError('What should we call you?'); return }
    if (mode === 'signup' && name.trim().length < 2) { setError('Please enter your full name.'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // feels real

    const displayName = mode === 'signup' ? name.trim() : (
      // On login, load existing user name from storage or use email prefix
      (() => {
        try {
          const existing = localStorage.getItem('skilldge_user')
          if (existing) return JSON.parse(existing).name
        } catch (error) { void error }
        return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      })()
    )

    const user = {
      name: displayName,
      email: email.trim().toLowerCase(),
      avatar: getInitials(displayName),
      color: pickColor(displayName),
      skillsLearn: [],
      skillsTeach: [],
      streak: 0,
      xp: 0,
      joinedAt: new Date().toISOString(),
    }

    login(user)
    setLoading(false)
    navigate(mode === 'signup' ? '/setup' : '/app/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #F3EFE6 0%, #EDE7D9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
        position: 'relative',
        overflow: 'hidden',
      }} className="hide-mobile">
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'rgba(196,96,58,0.08)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 340 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36, background: 'var(--accent)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, color: '#fff',
            }}>✦</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 800 }}>Skilldge</span>
          </div>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 36, fontWeight: 900,
            lineHeight: 1.15, marginBottom: 16,
            letterSpacing: '-1px',
          }}>
            Every lesson<br />
            <em style={{ color: 'var(--accent)' }}>is a step forward.</em>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8 }}>
            Your learning journey, your notes, your growth — all in one place that remembers where you left off.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '📹', text: 'Camera-on accountability' },
              { icon: '🧠', text: 'Unlimited AI deep-dive questions' },
              { icon: '🤝', text: 'Peer matching & teaching' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--card)', border: '1.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>{f.icon}</div>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--card)',
        boxShadow: '-4px 0 40px rgba(28,24,18,0.06)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{
              width: 30, height: 30, background: 'var(--accent)',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, color: '#fff',
            }}>✦</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 800 }}>Skilldge</span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Good to see you again' : 'Create your account'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 30, lineHeight: 1.6 }}>
            {mode === 'login'
              ? 'Pick up right where you left off.'
              : 'Join thousands of people learning something new today.'}
          </p>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg2)',
            borderRadius: 50, padding: 3, marginBottom: 28,
            border: '1.5px solid var(--border)',
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '9px 0',
                border: 'none',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text2)',
                borderRadius: 50, cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Your full name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: '#dc4a3a',
                background: '#FDF0EE', border: '1px solid #F0C8C4',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ padding: 15, fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? <div className="dot-anim"><span/><span/><span/></div>
                : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 20 }}>
            {mode === 'login' ? "New here?" : "Already have an account?"}{' '}
            <span
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}


