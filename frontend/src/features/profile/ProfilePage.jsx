import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useToast } from '../lib/ToastContext'
import { COURSES, SKILLS } from '../lib/data'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [editingSkills, setEditingSkills] = useState(false)
  const [draftLearn, setDraftLearn] = useState(user?.skillsLearn || [])
  const [draftTeach, setDraftTeach] = useState(user?.skillsTeach || [])

  function toggle(type, skill) {
    const setter = type === 'learn' ? setDraftLearn : setDraftTeach
    setter(previous => previous.includes(skill) ? previous.filter(item => item !== skill) : [...previous, skill])
  }
  function saveSkills() { updateUser({ skillsLearn: draftLearn, skillsTeach: draftTeach }); setEditingSkills(false); showToast('Skills updated! ✓') }

  return (
    <main className="page-wrap feature-page">
      <header className="page-header">
        <div className="min-w-0"><p className="page-eyebrow">Personal space</p><h1 className="page-title">Your profile</h1><p className="page-subtitle">Manage your skills and see your learning progress.</p></div>
      </header>

      <section className="profile-grid">
        <article className="surface-card profile-summary-card">
          <div className="profile-identity">
            <div className="avatar profile-avatar text-white" style={{ background: user?.color || '#7657e8' }}>{user?.avatar}</div>
            <div className="min-w-0"><h2>{user?.name}</h2><p>{user?.email}</p></div>
          </div>
          <div className="profile-stats">
            {[{ value: user?.xp || 0, label: 'XP' }, { value: user?.streak || 0, label: 'Streak' }, { value: COURSES.filter(course => course.progress > 0).length, label: 'Active' }].map(item => <div className="stat-tile" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </div>
        </article>

        <article className="surface-card profile-skills-card">
          <div className="card-heading-row"><div><p className="section-label">Skills</p><h2>Learning and teaching</h2></div><button className="btn btn-secondary btn-sm" onClick={() => { setDraftLearn(user?.skillsLearn || []); setDraftTeach(user?.skillsTeach || []); setEditingSkills(true) }}>Edit</button></div>
          <div className="skill-group"><p className="section-label">Want to learn</p><div>{(user?.skillsLearn || []).map(skill => <span key={skill} className="tag tag-learn">{skill}</span>)}{!user?.skillsLearn?.length && <span className="empty-copy">None added</span>}</div></div>
          <div className="skill-group"><p className="section-label">Can teach</p><div>{(user?.skillsTeach || []).map(skill => <span key={skill} className="tag tag-teach">{skill}</span>)}{!user?.skillsTeach?.length && <span className="empty-copy">None added</span>}</div></div>
        </article>
      </section>

      <section className="surface-card profile-progress-card">
        <p className="section-label">Progress</p><h2>Course progress</h2>
        <div className="profile-progress-list">
          {COURSES.map(course => <div className="profile-progress-item" key={course.id}><div><span>{course.title.split('–')[0].trim()}</span><strong>{course.progress}%</strong></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${course.progress}%` }} /></div></div>)}
        </div>
      </section>

      {editingSkills && <div className="modal-overlay" onClick={event => { if (event.target === event.currentTarget) setEditingSkills(false) }}><div className="modal max-w-[620px]"><h3 className="modal-title">Edit skills</h3><p className="modal-sub">Choose what you want to learn and what you can teach.</p><div><p className="section-label mb-3">Want to learn</p><div className="filter-row">{SKILLS.map(skill => <button key={skill} className={`filter-chip ${draftLearn.includes(skill) ? 'filter-chip--active' : ''}`} onClick={() => toggle('learn', skill)}>{skill}</button>)}</div></div><div className="divider" /><div><p className="section-label mb-3">Can teach</p><div className="filter-row">{SKILLS.map(skill => <button key={skill} className={`filter-chip ${draftTeach.includes(skill) ? 'filter-chip--active-green' : ''}`} onClick={() => toggle('teach', skill)}>{skill}</button>)}</div></div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => setEditingSkills(false)}>Cancel</button><button className="btn btn-primary" onClick={saveSkills}>Save changes</button></div></div></div>}
    </main>
  )
}
