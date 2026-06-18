import { useNavigate } from 'react-router-dom'

export default function CourseCard({ course }) {
  const navigate = useNavigate()
  const pct = Math.max(0, Math.min(100, course.progress ?? 0))

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="badge badge-warm" style={{ marginBottom: 10 }}>{course.skill}</div>
          <h3 style={{ fontSize: 18, marginBottom: 6 }}>{course.title}</h3>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{course.channel}</div>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: course.color || 'var(--bg3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {course.thumb || '▶'}
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{course.description}</p>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
          <span>{course.duration}</span>
          <span>{pct}% complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button className="btn btn-secondary btn-sm btn-full" onClick={() => navigate(`/app/watch/${course.id}`)}>
        {pct > 0 ? 'Continue lesson' : 'Start lesson'}
      </button>
    </div>
  )
}