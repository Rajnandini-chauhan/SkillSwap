import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../lib/ToastContext'

export default function TeachPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [playlists, setPlaylists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [plTitle, setPlTitle] = useState('')
  const [plSkill, setPlSkill] = useState('JavaScript')
  const [videos, setVideos] = useState([])
  const [vidTitle, setVidTitle] = useState('')
  const [vidUrl, setVidUrl] = useState('')

  function addVideo() {
    if (!vidTitle.trim() || !vidUrl.trim()) { showToast('Fill in both title and URL'); return }
    setVideos(previous => [...previous, { title: vidTitle.trim(), url: vidUrl.trim() }])
    setVidTitle(''); setVidUrl('')
  }
  function savePlaylist() {
    if (!plTitle.trim()) { showToast('Give your playlist a title'); return }
    setPlaylists(previous => [...previous, { id: Date.now(), title: plTitle.trim(), skill: plSkill, videos }])
    setShowModal(false); setPlTitle(''); setPlSkill('JavaScript'); setVideos([])
    showToast('Playlist saved! 🎉')
  }
  function deletePlaylist(id) { setPlaylists(previous => previous.filter(playlist => playlist.id !== id)); showToast('Playlist removed') }

  return (
    <main className="page-wrap feature-page">
      <header className="page-header">
        <div className="min-w-0"><p className="page-eyebrow">Share knowledge</p><h1 className="page-title">Teach a skill</h1><p className="page-subtitle">Create a clear learning playlist for the community.</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New playlist</button>
      </header>

      <section className="teach-layout">
        <div className="teach-sidebar-stack">
          <article className="surface-card instructor-card">
            <div className="instructor-card__identity"><div className="avatar instructor-avatar text-white" style={{ background: user?.color || '#7657e8' }}>{user?.avatar}</div><div className="min-w-0"><h2>{user?.name}</h2><p>Instructor profile</p></div></div>
            <div className="skill-group"><p className="section-label">Skills you teach</p><div>{(user?.skillsTeach || []).map(skill => <span key={skill} className="tag tag-teach">{skill}</span>)}{!user?.skillsTeach?.length && <span className="empty-copy">No teaching skills added yet.</span>}</div></div>
          </article>

          <article className="surface-card teaching-overview-card">
            <p className="section-label">Overview</p><h2>Teaching activity</h2>
            <div className="teaching-stats">
              {[{ value: playlists.length, label: 'Playlists' }, { value: playlists.reduce((sum, playlist) => sum + playlist.videos.length, 0), label: 'Videos' }].map(item => <div key={item.label} className="stat-tile"><strong>{item.value}</strong><span>{item.label}</span></div>)}
            </div>
          </article>
        </div>

        <article className="surface-card playlist-panel">
          <div className="section-heading"><div><p className="section-label">Your content</p><h2 className="section-title">My playlists</h2></div></div>
          {!playlists.length ? (
            <div className="empty-state compact"><div className="empty-state__icon">＋</div><h3>Create your first playlist</h3><p>Group useful videos into a simple learning path.</p><button className="btn btn-primary" onClick={() => setShowModal(true)}>Create playlist</button></div>
          ) : (
            <div className="playlist-list">{playlists.map(playlist => <div key={playlist.id} className="playlist-card"><div className="playlist-card__header"><div className="min-w-0"><h3>{playlist.title}</h3><p>{playlist.skill} · {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}</p></div><button onClick={() => deletePlaylist(playlist.id)}>Remove</button></div><div className="playlist-videos">{playlist.videos.map((video, index) => <div className="video-row" key={`${video.url}-${index}`}><span>{index + 1}</span><p>{video.title}</p></div>)}</div></div>)}</div>
          )}
        </article>
      </section>

      {showModal && <div className="modal-overlay" onClick={event => { if (event.target === event.currentTarget) setShowModal(false) }}><div className="modal"><h3 className="modal-title">Create playlist</h3><p className="modal-sub">Add a title, category and useful videos.</p><div className="form-group"><label>Playlist title</label><input value={plTitle} onChange={event => setPlTitle(event.target.value)} placeholder="e.g. JavaScript fundamentals" /></div><div className="form-group"><label>Skill category</label><select value={plSkill} onChange={event => setPlSkill(event.target.value)}>{['JavaScript','Python','React','Design','SQL','Machine Learning','Other'].map(skill => <option key={skill}>{skill}</option>)}</select></div><div className="divider" /><p className="section-label mb-3">Add videos</p><div className="modal-video-grid"><div className="form-group"><label>Video title</label><input value={vidTitle} onChange={event => setVidTitle(event.target.value)} placeholder="Variables and data types" /></div><div className="form-group"><label>YouTube URL</label><input value={vidUrl} onChange={event => setVidUrl(event.target.value)} placeholder="https://youtube.com/..." /></div></div><button className="btn btn-secondary btn-full" onClick={addVideo}>+ Add video</button>{!!videos.length && <div className="modal-video-list">{videos.map((video, index) => <div className="video-row" key={`${video.url}-${index}`}><span>{index + 1}</span><p>{video.title}</p><button onClick={() => setVideos(previous => previous.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}</div>}<div className="modal-actions"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={savePlaylist}>Save playlist</button></div></div></div>}
    </main>
  )
}
