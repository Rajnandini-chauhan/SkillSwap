// ═══════════════════════════════════════════════
// SKILLSHARE – LEARN PAGE
// Browse and search all courses
// ═══════════════════════════════════════════════

import { useState } from 'react'
import { COURSES } from '../../lib/data'
import CourseCard from '../../components/shared/CourseCard'

const FILTERS = ['All', 'Python', 'React', 'Design', 'SQL', 'Machine Learning', 'JavaScript']

export default function LearnPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = COURSES.filter(c => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.channel.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || c.skill === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <div style={{ padding: '28px 32px 0' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Learn 📚</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>Curated YouTube courses with AI accountability</p>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Search */}
        <input
          placeholder="🔍 Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {FILTERS.map(f => (
            <div
              key={f}
              className={`skill-chip ${filter === f ? 'selected-learn' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Course grid */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>No courses found for "{search}"</div>
          </div>
        )}
      </div>
    </div>
  )
}


