import { useState } from 'react'
import { COURSES } from '../lib/data'
import CourseCard from '../components/CourseCard'

const FILTERS = ['All', 'Python', 'React', 'Design', 'SQL', 'Machine Learning', 'JavaScript']

export default function LearnPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const filtered = COURSES.filter(course => {
    const term = search.trim().toLowerCase()
    const matchesSearch = !term || course.title.toLowerCase().includes(term) || course.channel.toLowerCase().includes(term)
    return matchesSearch && (filter === 'All' || course.skill === filter)
  })

  return (
    <main className="page-wrap feature-page">
      <header className="page-header">
        <div className="min-w-0">
          <p className="page-eyebrow">Learning library</p>
          <h1 className="page-title">Explore lessons</h1>
          <p className="page-subtitle">Find a focused course and learn at your own pace.</p>
        </div>
      </header>

      <section className="surface-card page-toolbar">
        <div className="page-search">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Search courses" placeholder="Search by course or creator" value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="filter-row" aria-label="Course filters">
          {FILTERS.map(item => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`filter-chip ${filter === item ? 'filter-chip--active' : ''}`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="section-label">Courses</p>
            <h2 className="section-title">{filtered.length} available</h2>
          </div>
        </div>
        {filtered.length ? (
          <div className="course-grid">
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="empty-state"><div className="empty-state__icon">⌕</div><h3>No courses found</h3><p>Try another search term or category.</p></div>
        )}
      </section>
    </main>
  )
}
