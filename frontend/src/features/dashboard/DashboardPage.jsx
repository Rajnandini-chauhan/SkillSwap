import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { COURSES } from '../../lib/data'
import CourseCard from '../../components/shared/CourseCard'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'there'

  // Load progress from localStorage
  const progress = (() => {
    try { return JSON.parse(localStorage.getItem('skilldge_progress') || '{}') } catch { return {} }
  })()

  const coursesWithProgress = COURSES.map(c => ({
    ...c,
    progress: progress[c.id] ?? c.progress,
  }))

  const inProgress = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100)
  const suggested  = coursesWithProgress.filter(c => c.progress === 0)
  const completed  = coursesWithProgress.filter(c => c.progress === 100)

  const today = new Date().getDay()
  const doneDays = [0,1,2,3,4].map(i => (today - 4 + i + 7) % 7)

  const motivations = [
    `You've been on a roll, ${firstName}. Keep it going.`,
    `Every lesson counts. What are you learning today?`,
    `${firstName}, consistency beats intensity. Show up today.`,
    `Small steps, big results. You've got this.`,
  ]
  const motivation = motivations[new Date().getDay() % motivations.length]

  return (
    <div>
      {/* ── Header ── */}
      <div style={{
        padding: '32px 36px 0',
        borderBottom: '1.5px solid var(--border)',
        paddingBottom: 28,
        marginBottom: 28,
        background: 'var(--card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em' }}>
              DASHBOARD
            </p>
            <h1 style={{ fontSize: 28, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Welcome back, {firstName}.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', fontStyle: 'italic' }}>
              {motivation}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/app/learn')}>
            Browse lessons →
          </button>
        </div>

        {/* Streak bar */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 10 }}>
            THIS WEEK'S STREAK — {user?.streak || 0} days 🔥
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS.map((d, i) => {
              const isDone = doneDays.includes(i)
              const isToday = i === today - 1
              return (
                <div key={d} style={{
                  flex: 1, padding: '10px 0',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: isDone ? 'var(--accent)' : 'var(--bg2)',
                  border: `1.5px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isDone ? '#fff' : 'var(--text3)' }}>{d}</span>
                  {isDone && <span style={{ fontSize: 12, color: '#fff' }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 36px 40px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { num: inProgress.length, label: 'In Progress', sub: 'lessons active', color: 'var(--accent)' },
            { num: completed.length,  label: 'Completed',   sub: 'lessons done',   color: 'var(--accent3)' },
            { num: user?.skillsTeach?.length || 0, label: 'Teaching', sub: 'skills shared', color: '#8B6B4A' },
            { num: `${user?.xp || 0} XP`, label: 'Earned',  sub: 'keep learning',  color: '#5A7A8A' },
          ].map(s => (
            <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 900, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Continue */}
        {inProgress.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>Continue where you left off</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/learn')} style={{ color: 'var(--accent)' }}>
                See all →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 36 }}>
              {inProgress.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </>
        )}

        {/* Suggested */}
        {suggested.length > 0 && (
          <>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>
              {inProgress.length === 0 ? 'Start your first lesson' : 'Explore something new'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
              {suggested.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


