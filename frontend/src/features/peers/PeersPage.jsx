import { useState } from 'react'
import { PEERS } from '../lib/data'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../lib/ToastContext'

export default function PeersPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Online', ...Array.from(new Set(PEERS.flatMap(peer => peer.skills_teach)))]
  const filtered = PEERS.filter(peer => filter === 'All' || (filter === 'Online' ? peer.online : peer.skills_teach.includes(filter)))

  return (
    <main className="page-wrap feature-page">
      <header className="page-header">
        <div className="min-w-0">
          <p className="page-eyebrow">Skill exchange</p>
          <h1 className="page-title">Find a learning partner</h1>
          <p className="page-subtitle">Connect with people who can teach what you want to learn.</p>
        </div>
      </header>

      <section className="match-summary">
        <div className="min-w-0">
          <span className="feature-kicker">Your match profile</span>
          <h2>Learn together, grow together</h2>
          <p><strong>Want to learn:</strong> {(user?.skillsLearn || []).join(', ') || 'Not set yet'}</p>
          <p><strong>Can teach:</strong> {(user?.skillsTeach || []).join(', ') || 'Not set yet'}</p>
        </div>
      </section>

      <div className="filter-row peer-filter-row" aria-label="Peer filters">
        {filters.map(item => (
          <button key={item} type="button" className={`filter-chip ${filter === item ? 'filter-chip--active' : ''}`} onClick={() => setFilter(item)}>
            {item === 'Online' ? '● Online' : item}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <section className="peer-grid">
          {filtered.map(peer => <PeerCard key={peer.id} peer={peer} onConnect={showToast} />)}
        </section>
      ) : (
        <div className="empty-state"><div className="empty-state__icon">⌕</div><h3>No matching peers</h3><p>Try a different filter.</p></div>
      )}
    </main>
  )
}

function PeerCard({ peer, onConnect }) {
  return (
    <article className="surface-card peer-card">
      <div className="peer-card__header">
        <div className="avatar peer-avatar text-white" style={{ background: peer.color }}>{peer.avatar}</div>
        <div className="min-w-0">
          <h2>{peer.name}</h2>
          <p className={peer.online ? 'is-online' : ''}>{peer.online ? '● Online now' : '○ Offline'}</p>
        </div>
      </div>
      {peer.bio && <p className="peer-card__bio">{peer.bio}</p>}
      <div className="peer-card__skills">
        <div><p className="section-label">Can teach</p><div>{peer.skills_teach.map(skill => <span key={skill} className="tag tag-teach">{skill}</span>)}</div></div>
        <div><p className="section-label">Wants to learn</p><div>{peer.skills_learn.map(skill => <span key={skill} className="tag tag-learn">{skill}</span>)}</div></div>
      </div>
      <div className="peer-card__actions">
        <button className="btn btn-primary" onClick={() => onConnect(`Session request sent to ${peer.name}! 🎉`)}>Connect</button>
        <button className="btn btn-secondary" aria-label={`Message ${peer.name}`} onClick={() => onConnect(`Message sent to ${peer.name}!`)}>Message</button>
      </div>
    </article>
  )
}
