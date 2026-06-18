// ═══════════════════════════════════════════════
// SKILLSHARE – TEACH PAGE
// Create playlists, view teaching stats
// ═══════════════════════════════════════════════

import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../lib/ToastContext'

export default function TeachPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [playlists, setPlaylists]   = useState([])
  const [showModal, setShowModal]   = useState(false)

  // Current playlist being built in modal
  const [plTitle, setPlTitle]   = useState('')
  const [plSkill, setPlSkill]   = useState('JavaScript')
  const [videos, setVideos]     = useState([])
  const [vidTitle, setVidTitle] = useState('')
  const [vidUrl, setVidUrl]     = useState('')

  function addVideo() {
    if (!vidTitle.trim() || !vidUrl.trim()) { showToast('Fill in both title and URL'); return }
    setVideos(prev => [...prev, { title: vidTitle.trim(), url: vidUrl.trim() }])
    setVidTitle('')
    setVidUrl('')
  }

  function savePlaylist() {
    if (!plTitle.trim()) { showToast('Give your playlist a title'); return }
    setPlaylists(prev => [...prev, { id: Date.now(), title: plTitle, skill: plSkill, videos }])
    setShowModal(false)
    setPlTitle(''); setPlSkill('JavaScript'); setVideos([])
    showToast('Playlist saved! 🎉')
  }

  function deletePlaylist(id) {
    setPlaylists(prev => prev.filter(p => p.id !== id))
    showToast('Playlist removed')
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ padding: '28px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Teach 🎓</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>Share your knowledge with the community</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Playlist</button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── Left: Profile + Stats ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Profile card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div className="avatar" style={{
                  background: user?.color || '#5040a0', color: '#fff',
                  width: 52, height: 52, fontSize: 20,
                }}>
                  {user?.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>Instructor Profile</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Skills I teach:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(user?.skillsTeach || []).map(s => (
                  <span key={s} className="tag tag-teach">{s}</span>
                ))}
                {(!user?.skillsTeach?.length) && (
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>None set yet — go to Profile to update.</span>
                )}
              </div>
            </div>

            {/* Stats card */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📊 Teaching Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { num: playlists.length, label: 'Playlists', color: 'var(--accent)' },
                  { num: playlists.reduce((a, p) => a + p.videos.length, 0), label: 'Total Videos', color: 'var(--accent3)' },
                  { num: 12, label: 'Students', color: '#f472b6' },
                  { num: '4.8⭐', label: 'Rating', color: 'var(--accent2)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                    padding: 14, textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: s.color }}>{s.num}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Playlists ── */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>My Playlists</h3>

            {playlists.length === 0 ? (
              <div style={{
                background: 'var(--bg3)', border: '1px dashed var(--border)',
                borderRadius: 'var(--radius)', padding: 40,
                textAlign: 'center', color: 'var(--text2)', fontSize: 13,
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📁</div>
                No playlists yet.<br />
                <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setShowModal(true)}>
                  Create your first one →
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {playlists.map(pl => (
                  <div key={pl.id} className="card card-sm">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{pl.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                          <span className="tag tag-teach" style={{ fontSize: 10, padding: '2px 8px' }}>{pl.skill}</span>
                          <span style={{ marginLeft: 8 }}>{pl.videos.length} video{pl.videos.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => deletePlaylist(pl.id)} style={{ fontSize: 16 }}>🗑️</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {pl.videos.map((v, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', background: 'var(--bg3)',
                          borderRadius: 'var(--radius-xs)', fontSize: 12,
                        }}>
                          <span style={{ color: 'var(--text3)', fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Playlist Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <h3 className="modal-title">Create Playlist</h3>
            <p className="modal-sub">Add YouTube videos to build a lesson series for others</p>

            <div className="form-group">
              <label>Playlist Title</label>
              <input placeholder="e.g. JavaScript Fundamentals" value={plTitle} onChange={e => setPlTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Skill Category</label>
              <select value={plSkill} onChange={e => setPlSkill(e.target.value)}>
                {['JavaScript','Python','React','Design','SQL','Machine Learning','Other'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="divider" />
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add Videos</div>

            <div className="form-group">
              <label>Video Title</label>
              <input placeholder="e.g. Variables & Data Types" value={vidTitle} onChange={e => setVidTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>YouTube URL</label>
              <input placeholder="https://youtube.com/watch?v=..." value={vidUrl} onChange={e => setVidUrl(e.target.value)} />
            </div>
            <button className="btn btn-secondary btn-full" style={{ marginBottom: 16 }} onClick={addVideo}>
              + Add Video
            </button>

            {/* Video list preview */}
            {videos.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', marginBottom: 16 }}>
                {videos.map((v, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)', fontSize: 12,
                  }}>
                    <span style={{ color: 'var(--text3)', fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ flex: 1 }}>{v.title}</span>
                    <span
                      style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 14 }}
                      onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))}
                    >✕</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={savePlaylist}>Save Playlist ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
