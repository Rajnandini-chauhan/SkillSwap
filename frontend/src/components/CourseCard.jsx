import { useNavigate } from 'react-router-dom'

export default function CourseCard({ course }) {
  const navigate = useNavigate()
  const progress = Math.max(0, Math.min(100, course.progress ?? 0))

  return (
    <article className="course-card">
      <div className="course-card__header">
        <div className="min-w-0">
          <span className="badge badge-warm">{course.skill}</span>
          <h3>{course.title}</h3>
          <p>{course.channel}</p>
        </div>
        <div className="course-card__thumb" style={{ background: course.color || 'var(--bg3)' }} aria-hidden="true">
          {course.thumb || '▶'}
        </div>
      </div>

      <p className="course-card__description">{course.description}</p>

      <div className="course-card__progress">
        <div><span>{course.duration}</span><strong>{progress}% complete</strong></div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      <button className="btn btn-secondary btn-full" onClick={() => navigate(`/app/watch/${course.id}`)}>
        {progress > 0 ? 'Continue lesson' : 'Start lesson'}
      </button>
    </article>
  )
}
