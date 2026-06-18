// ═══════════════════════════════════════════════
// SKILLSHARE – PEERS PAGE
// Browse community members & request sessions
// ═══════════════════════════════════════════════

import { useState } from 'react'
import { PEERS } from '../lib/data'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../lib/ToastContext'

export default function PeersPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [filter, setFilter] = useState('All')

  const filters = ['All', 'Online', ...Array.from(new Set(PEERS.flatMap(p => p.skills_teach)))]

  const filtered = PEERS.filter(p => {
    if (filter === 'All') return true
    if (filter === 'Online') return p.online
    return p.skills_teach.includes(filter)
  })

  return (
    <div>
      <div style={{ padding: '28px 32px 0' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Peers 👥</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>
          Learn from each other — teach what you know, learn what you don't.
        </p>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Matching banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1040, #0a2a1a)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 18,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <span style={{ fontSize: 28 }}>🤝</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Peer Learning Matching</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              You want to learn: {(user?.skillsLearn || []).join(', ') || 'nothing set yet'} · 
              You can teach: {(user?.skillsTeach || []).join(', ') || 'nothing set yet'}
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {filters.map(f => (
            <div
              key={f}
              className={`skill-chip ${filter === f ? 'selected-learn' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'Online' ? '● ' : ''}{f}
            </div>
          ))}
        </div>

        {/* Peers grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(peer => (
            <PeerCard key={peer.id} peer={peer} onConnect={showToast} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            No peers found for this filter.
          </div>
        )}
      </div>
    </div>
  )
}

function PeerCard({ peer, onConnect }) {
  return (
    <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="avatar" style={{
          background: peer.color, color: '#fff',
          width: 46, height: 46, fontSize: 15,
        }}>
          {peer.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{peer.name}</div>
          <div style={{ fontSize: 11, color: peer.online ? 'var(--accent3)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: peer.online ? 'var(--accent3)' : 'var(--text3)',
            }} />
            {peer.online ? 'Online now' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Bio */}
      {peer.bio && (
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
          {peer.bio}
        </p>
      )}

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {peer.skills_teach.map(s => (
          <span key={s} className="tag tag-teach" style={{ fontSize: 10, padding: '3px 9px' }}>🎓 {s}</span>
        ))}
        {peer.skills_learn.map(s => (
          <span key={s} className="tag tag-learn" style={{ fontSize: 10, padding: '3px 9px' }}>📚 {s}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={() => onConnect(`Session request sent to ${peer.name}! 🎉`)}
        >
          📹 Start Session
        </button>
        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 12px' }}
          onClick={() => onConnect(`Message sent to ${peer.name}!`)}
        >
          💬
        </button>
      </div>
    </div>
  )
}
