// ═══════════════════════════════════════════════
// SKILLSHARE – PROFILE PAGE
// View XP, streak, skills, and course progress
// ═══════════════════════════════════════════════

import { useState } from 'react'
import { useAuth } from "../../lib/AuthContext";
import { useToast } from "../../lib/ToastContext";
import { COURSES, SKILLS } from "../../lib/data";

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [editingSkills, setEditingSkills] = useState(false)
  const [draftLearn, setDraftLearn] = useState(user?.skillsLearn || [])
  const [draftTeach, setDraftTeach] = useState(user?.skillsTeach || [])

  function toggle(type, skill) {
    if (type === 'learn') {
      setDraftLearn(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
    } else {
      setDraftTeach(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
    }
  }

  function saveSkills() {
    updateUser({ skillsLearn: draftLearn, skillsTeach: draftTeach })
    setEditingSkills(false)
    showToast('Skills updated! ✓')
  }

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const doneDays = [0, 1, 2, 3, 4]

  return (
    <div>
      <div style={{ padding: '28px 32px 0' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Profile ⚡</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>Your learning identity and progress</p>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Top Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Identity card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="avatar" style={{
                background: user?.color || '#5040a0', color: '#fff',
                width: 64, height: 64, fontSize: 24,
              }}>
                {user?.avatar}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.email}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <span className="badge badge-purple">⚡ {user?.xp} XP</span>
                  <span className="badge badge-green">🔥 {user?.streak} day streak</span>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* XP + Streak stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
              {[
                { num: user?.xp,    label: 'Total XP',   color: 'var(--accent)' },
                { num: user?.streak, label: 'Day Streak', color: 'var(--accent2)' },
                { num: COURSES.filter(c => c.progress > 0).length, label: 'Active', color: 'var(--accent3)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                  padding: 12, textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700 }}>🎯 My Skills</h4>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setDraftLearn(user?.skillsLearn || [])
                  setDraftTeach(user?.skillsTeach || [])
                  setEditingSkills(true)
                }}
              >
                ✏️ Edit
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Want to learn</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(user?.skillsLearn || []).map(s => <span key={s} className="tag tag-learn">{s}</span>)}
                {!user?.skillsLearn?.length && <span style={{ fontSize: 12, color: 'var(--text3)' }}>None set yet</span>}
              </div>
            </div>

            <div className="divider" />

            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Can teach</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(user?.skillsTeach || []).map(s => <span key={s} className="tag tag-teach">{s}</span>)}
                {!user?.skillsTeach?.length && <span style={{ fontSize: 12, color: 'var(--text3)' }}>None set yet</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Weekly Activity ── */}
        <div className="card">
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📅 This Week's Activity</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{
                flex: 1, padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: doneDays.includes(i) ? 'var(--accent)' : 'var(--bg3)',
                border: `1px solid ${i === 5 ? 'var(--accent3)' : 'transparent'}`,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: doneDays.includes(i) ? '#fff' : 'var(--text2)',
                }}>{d}</span>
                {doneDays.includes(i) && <span style={{ fontSize: 14 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Course Progress ── */}
        <div className="card">
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>📈 Course Progress</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {COURSES.map(c => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>{c.title.split('–')[0].trim()}</span>
                  <span style={{ color: 'var(--text2)' }}>{c.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Edit Skills Modal ── */}
      {editingSkills && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditingSkills(false) }}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <h3 className="modal-title">Edit Skills</h3>
            <p className="modal-sub">Update what you learn and teach</p>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 10 }}>
                📚 Skills I want to learn
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SKILLS.map(s => (
                  <div key={s} className={`skill-chip ${draftLearn.includes(s) ? 'selected-learn' : ''}`} onClick={() => toggle('learn', s)}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent3)', marginBottom: 10 }}>
                🎓 Skills I can teach
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SKILLS.map(s => (
                  <div key={s} className={`skill-chip ${draftTeach.includes(s) ? 'selected-teach' : ''}`} onClick={() => toggle('teach', s)}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingSkills(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveSkills}>Save Changes ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


