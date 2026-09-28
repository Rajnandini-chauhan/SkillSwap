import { useEffect, useState } from 'react'
import { reflectionsApi } from '../../lib/reflectionsApi'
import { useToast } from '../../lib/ToastContext'

const MOODS = [
  { value: 'great', label: '🤩 Great' },
  { value: 'good', label: '🙂 Good' },
  { value: 'okay', label: '😐 Okay' },
  { value: 'tough', label: '😓 Tough' },
]

const EMPTY_FORM = { learned: '', difficult: '', nextWeekGoal: '', mood: 'good' }

function formatWeek(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ReflectionsPage() {
  const { showToast } = useToast()
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadReflections()
  }, [])

  async function loadReflections() {
    setLoading(true)
    try {
      const data = await reflectionsApi.getMy()
      setReflections(data)
    } catch (error) {
      showToast(error.message || 'Failed to load reflections')
    } finally {
      setLoading(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.learned.trim() || !form.difficult.trim() || !form.nextWeekGoal.trim()) {
      showToast('Please fill in all three reflection fields')
      return
    }

    setSaving(true)
    try {
      const reflection = await reflectionsApi.create(form)
      setReflections((prev) => [reflection, ...prev])
      setForm(EMPTY_FORM)
      showToast('Reflection saved! ✓')
    } catch (error) {
      // Backend returns 409 REFLECTION_EXISTS if this week is already logged
      showToast(error.message || 'Failed to save reflection')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await reflectionsApi.remove(id)
      setReflections((prev) => prev.filter((item) => item._id !== id))
      showToast('Reflection deleted')
    } catch (error) {
      showToast(error.message || 'Failed to delete reflection')
    }
  }

  return (
    <main className="page-wrap feature-page">
      <header className="page-header">
        <div className="min-w-0">
          <p className="page-eyebrow">Weekly check-in</p>
          <h1 className="page-title">Reflections</h1>
          <p className="page-subtitle">
            Look back on what you learned and set your intention for next week.
          </p>
        </div>
      </header>

      <section className="surface-card" style={{ padding: 20, marginBottom: 24 }}>
        <p className="section-label">This week</p>
        <h2 style={{ marginBottom: 16 }}>Add your reflection</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
              What did you learn this week?
            </label>
            <textarea
              value={form.learned}
              onChange={(e) => updateField('learned', e.target.value)}
              placeholder="Key things you picked up..."
              style={{ minHeight: 90, width: '100%' }}
              maxLength={1000}
            />
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
              What was difficult?
            </label>
            <textarea
              value={form.difficult}
              onChange={(e) => updateField('difficult', e.target.value)}
              placeholder="Where did you get stuck..."
              style={{ minHeight: 90, width: '100%' }}
              maxLength={1000}
            />
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
              Goal for next week
            </label>
            <textarea
              value={form.nextWeekGoal}
              onChange={(e) => updateField('nextWeekGoal', e.target.value)}
              placeholder="What will you focus on..."
              style={{ minHeight: 90, width: '100%' }}
              maxLength={1000}
            />
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
              Mood
            </label>
            <div className="filter-row">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  className={`filter-chip ${form.mood === m.value ? 'filter-chip--active' : ''}`}
                  onClick={() => updateField('mood', m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save reflection'}
          </button>
        </form>
      </section>

      <section>
        <p className="section-label" style={{ marginBottom: 12 }}>Past reflections</p>

        {loading && <p className="empty-copy">Loading…</p>}

        {!loading && reflections.length === 0 && (
          <p className="empty-copy">No reflections yet — add your first one above.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reflections.map((r) => (
            <article key={r._id} className="surface-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong>Week of {formatWeek(r.weekStart)}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{MOODS.find((m) => m.value === r.mood)?.label}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(r._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, marginBottom: 6 }}><strong>Learned:</strong> {r.learned}</p>
              <p style={{ fontSize: 13, marginBottom: 6 }}><strong>Difficult:</strong> {r.difficult}</p>
              <p style={{ fontSize: 13 }}><strong>Next week:</strong> {r.nextWeekGoal}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}