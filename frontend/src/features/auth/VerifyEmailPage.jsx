import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { authApi } from '../../lib/api'
import ThemeToggle from '../../components/ThemeToggle'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  // 'verifying' | 'success' | 'error'
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const calledOnce = useRef(false)

  useEffect(() => {
    if (calledOnce.current) return
    calledOnce.current = true

    if (!token) {
      setStatus('error')
      setMessage('This verification link is missing its token.')
      return
    }

    authApi.verifyEmail(token)
      .then(async () => {
        setStatus('success')
        // If the user already has a live session (e.g. opened the link in
        // the same browser they registered in), refresh it so isVerified
        // reflects right away. Otherwise they'll just sign in normally.
        await refreshUser()
        setTimeout(() => navigate('/auth?mode=login'), 2500)
      })
      .catch(error => {
        setStatus('error')
        setMessage(error.message || 'This link is invalid or has expired.')
      })
  }, [token, navigate, refreshUser])

  return (
    <main className="classic-auth-page">
      <section className="classic-auth-form-panel" style={{ margin: '0 auto' }}>
        <div className="classic-auth-theme"><ThemeToggle compact /></div>
        <div className="classic-auth-form-wrap">
          <button type="button" className="classic-auth-mobile-brand" onClick={() => navigate('/')} aria-label="Go to SkillSwap home">
            <span className="classic-auth-brand-mark">✦</span>
            <span>SkillSwap</span>
          </button>

          {status === 'verifying' && (
            <>
              <h2>Verifying your email…</h2>
              <p className="classic-auth-subtitle">Hang tight, this only takes a second.</p>
              <span className="dot-anim" aria-label="Loading"><span/><span/><span/></span>
            </>
          )}

          {status === 'success' && (
            <>
              <h2>Email verified ✓</h2>
              <p className="classic-auth-subtitle">
                Your account is active. Taking you to sign in…
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h2>Verification failed</h2>
              <p className="classic-auth-subtitle">{message}</p>
              <button
                type="button"
                className="btn btn-primary btn-full classic-auth-submit"
                style={{ marginTop: '1.5rem' }}
                onClick={() => navigate('/auth?mode=login')}
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
