import { useNavigate } from 'react-router-dom'

export default function CourseCard({ course }) {
  const navigate = useNavigate()
  const pct = Math.max(0, Math.min(100, course.progress ?? 0))

  return (
    <article className="group flex h-full flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="badge badge-warm mb-3">{course.skill}</span>
          <h3 className="mb-1 text-lg font-extrabold tracking-tight">{course.title}</h3>
          <p className="text-sm text-[var(--text2)]">{course.channel}</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl text-white shadow-md" style={{ background: course.color || 'var(--primary)' }}>{course.thumb || '▶'}</div>
      </div>

      <p className="text-sm leading-6 text-[var(--text2)]">{course.description}</p>

      <div className="mt-auto">
        <div className="mb-2 flex justify-between text-xs font-semibold text-[var(--text3)]">
          <span>{course.duration}</span><span>{pct}% complete</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <button className="btn btn-secondary btn-sm btn-full" onClick={() => navigate(`/app/watch/${course.id}`)}>
        {pct > 0 ? 'Continue lesson' : 'Start lesson'}
      </button>
    </article>
  )
}
