// ═══════════════════════════════════════════════
// SKILLDGE – LANDING PAGE
// Warm, emotional, human — not another SaaS template
// ═══════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const QUOTES = [
  "The best investment you can make is in yourself.",
  "Every expert was once a beginner.",
  "Learning never exhausts the mind.",
  "An hour of learning beats a day of guessing.",
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative ink blobs */}
      <div style={{
        position: 'absolute', top: -120, right: -80,
        width: 480, height: 480,
        borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
        background: 'rgba(196,96,58,0.07)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -100,
        width: 360, height: 360,
        borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
        background: 'rgba(61,122,92,0.06)',
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--accent)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#fff',
          }}>✦</div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 20, fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.3px',
          }}>Skilldge</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/auth?mode=login')}
            style={{ color: 'var(--text2)', fontSize: 14 }}>
            Sign in
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth?mode=signup')}>
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '60px 32px 0',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s ease',
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#FDF0EB', border: '1px solid #F0CABB',
          borderRadius: 50, padding: '6px 16px',
          fontSize: 12, fontWeight: 600, color: 'var(--accent)',
          marginBottom: 28, letterSpacing: '0.05em',
        }}>
          ✦ BUILT FOR REAL LEARNERS
        </div>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(42px, 7vw, 76px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-2px',
          marginBottom: 24,
          color: 'var(--text)',
        }}>
          Learn like you mean it.<br />
          <span style={{
            fontStyle: 'italic',
            color: 'var(--accent)',
          }}>Teach what you love.</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--text2)',
          lineHeight: 1.8,
          maxWidth: 540,
          margin: '0 auto 16px',
        }}>
          Watch curated lessons with your camera on. Write real notes.
          Get unlimited AI questions until you truly own the material.
        </p>

        {/* Quote */}
        <p style={{
          fontSize: 13,
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginBottom: 40,
        }}>
          "{quote}"
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth?mode=signup')}
            style={{ gap: 10 }}>
            Start learning for free
            <span style={{ fontSize: 18 }}>→</span>
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/auth?mode=login')}>
            I have an account
          </button>
        </div>

        {/* Social proof strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, marginBottom: 80,
        }}>
          {['AK','SR','MV','RP','DK'].map((i, idx) => (
            <div key={i} className="avatar" style={{
              width: 32, height: 32, fontSize: 11, fontWeight: 700,
              background: ['#C4603A','#3D7A5C','#E8956D','#8B6B4A','#5A8A6A'][idx],
              color: '#fff',
              marginLeft: idx > 0 ? -8 : 0,
              border: '2px solid var(--bg)',
              zIndex: 5 - idx,
            }}>{i}</div>
          ))}
          <span style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 10 }}>
            <strong style={{ color: 'var(--text)' }}>2,400+</strong> learners this month
          </span>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 32px 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        opacity: visible ? 1 : 0,
        transition: 'all 0.9s ease 0.2s',
      }}>
        {[
          {
            icon: '📹',
            color: '#FDF0EB',
            border: '#F0CABB',
            title: 'Camera accountability',
            desc: 'Keep your webcam on while watching. No more zoning out or switching tabs.',
          },
          {
            icon: '✍️',
            color: '#EBF5F0',
            border: '#B8DDD0',
            title: 'Notes that matter',
            desc: 'Write what you actually learned in your own words — not just highlights.',
          },
          {
            icon: '🤖',
            color: '#FEF9E6',
            border: '#F0DC88',
            title: 'Unlimited AI quiz',
            desc: 'Answer questions, get personal feedback, load more — until mastery clicks.',
          },
          {
            icon: '🤝',
            color: '#F3EFE6',
            border: '#DDD5C4',
            title: 'Teach what you know',
            desc: 'Share playlists. Match with peers. Learning is better together.',
          },
        ].map(f => (
          <div key={f.title} style={{
            background: f.color,
            border: `1.5px solid ${f.border}`,
            borderRadius: 'var(--radius)',
            padding: '24px 22px',
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <h4 style={{ fontSize: 15, fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>{f.title}</h4>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
