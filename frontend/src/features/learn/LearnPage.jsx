import { useState, useEffect } from 'react'
import { COURSES } from '../../lib/data'
import { coursesApi } from '../../lib/coursesApi'
import CourseCard from '../../components/shared/CourseCard'
import { useToast } from '../../lib/ToastContext'

const FILTERS = ['All', 'Python', 'React', 'Design', 'SQL', 'Machine Learning', 'JavaScript']

export default function LearnPage() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [courses, setCourses] = useState(COURSES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const term = search.trim().toLowerCase()

      if (!term) {
        setCourses(COURSES)
        return
      }

      setLoading(true)
      try {
        const results = await coursesApi.search(term)
        setCourses(results)
      } catch (error) {
        showToast(error.message || 'Failed to fetch courses')
        setCourses([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search, showToast])

  const filtered = courses.filter(course => {
    // If we are searching (using API), we ignore the category filters
    // since YouTube results don't have a 'skill' property.
    if (search.trim()) return true

    return filter === 'All' || course.skill === filter
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
          <input
            aria-label="Search courses"
            placeholder="Search by course or creator"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-row" aria-label="Course filters">
          {FILTERS.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`filter-chip ${filter === item ? 'filter-chip--active' : ''}`}
              disabled={!!search.trim()}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="section-label">Courses</p>
            <h2 className="section-title">
              {loading ? 'Searching...' : `${filtered.length} available`}
            </h2>
          </div>
        </div>
        {filtered.length ? (
          <div className="course-grid">
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">⌕</div>
            <h3>No courses found</h3>
            <p>Try another search term or category.</p>
          </div>
        )}
      </section>
    </main>
  )
}