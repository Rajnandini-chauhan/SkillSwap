import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { COURSES, DEFAULT_CHECKLIST } from '../../lib/data'
import { notesApi } from '../../lib/notesApi'
import { useToast } from '../../lib/ToastContext'

import QuizPanel from './QuizPanel'
import styles from './WatchPage.module.css'

// ─────────────────────────────────────────────
// Notes tab
// ─────────────────────────────────────────────

function NotesTab({
  notes,
  onNotesChange,
  notesSubmitted,
  onSubmit,
  onReset,
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  async function handlePdfChange(event) {
    const file = event.target.files?.[0]

    // Allows the same PDF to be selected again later.
    event.target.value = ''

    if (!file) return

    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file')
      return
    }

    setUploading(true)

    try {
      const { text } = await notesApi.extractPdf(file)

      const combinedNotes = notes.trim()
        ? `${notes.trim()}\n\n${text}`
        : text

      onNotesChange(combinedNotes)

      showToast(
        'PDF text extracted! Review it below before submitting.'
      )
    } catch (error) {
      showToast(
        error.message ||
          'Could not extract text from this PDF'
      )
    } finally {
      setUploading(false)
    }
  }

  if (notesSubmitted) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.submittedBanner}>
          ✅ Notes submitted! Open the AI Quiz tab to
          begin your five-question quiz.
        </div>

        <div className={styles.notesPreview}>
          {notes}
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm btn-full"
          onClick={onReset}
        >
          ✏️ Rewrite Notes
        </button>
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.notePrompt}>
        📌 Watch the full video, then write everything
        you learned here. More detailed notes will help
        Gemini create better quiz questions.
      </div>

      <textarea
        placeholder={
          'I learned that...\n\n' +
          'Key concepts:\n' +
          '1.\n' +
          '2.\n' +
          '3.\n\n' +
          'Things I found confusing:\n\n' +
          'How I would explain this to someone:'
        }
        value={notes}
        onChange={(event) =>
          onNotesChange(event.target.value)
        }
        style={{
          minHeight: 240,
          flex: 1,
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        className="btn btn-secondary btn-sm btn-full"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={uploading}
      >
        {uploading
          ? 'Extracting text…'
          : '📄 Upload PDF instead'}
      </button>

      <button
        type="button"
        className="btn btn-success btn-full"
        onClick={onSubmit}
      >
        Submit Notes & Start AI Quiz 🤖
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Focus checklist tab
// ─────────────────────────────────────────────

function FocusTab({ checklist, onToggle }) {
  const completedItems = checklist.filter(
    (item) => item.done
  ).length

  const percentage =
    checklist.length > 0
      ? Math.round(
          (completedItems / checklist.length) * 100
        )
      : 0

  return (
    <div className={styles.tabContent}>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontSize: 12,
            color: 'var(--text2)',
          }}
        >
          <span>Focus progress</span>

          <span>
            {completedItems}/{checklist.length}
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${percentage}%`,
              background: 'var(--accent3)',
            }}
          />
        </div>
      </div>

      {checklist.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 10,
            borderRadius: 'var(--radius-sm)',
            opacity: item.done ? 0.6 : 1,
          }}
        >
          <button
            type="button"
            aria-label={
              item.done
                ? 'Mark task incomplete'
                : 'Mark task complete'
            }
            onClick={() => onToggle(index)}
            style={{
              width: 20,
              height: 20,
              padding: 0,
              borderRadius: '50%',
              border: `1.5px solid ${
                item.done
                  ? 'var(--accent3)'
                  : 'var(--border)'
              }`,
              background: item.done
                ? 'var(--accent3)'
                : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 11,
              color: '#0a0a0f',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {item.done ? '✓' : ''}
          </button>

          <span
            style={{
              fontSize: 13,
              textDecoration: item.done
                ? 'line-through'
                : 'none',
              color: item.done
                ? 'var(--text3)'
                : 'var(--text)',
            }}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Local storage helpers
// ─────────────────────────────────────────────

function loadProgress() {
  try {
    return JSON.parse(
      localStorage.getItem('skilldge_progress') ||
        '{}'
    )
  } catch {
    return {}
  }
}

function saveProgress(courseId, percentage) {
  try {
    const allProgress = loadProgress()

    allProgress[courseId] = percentage

    localStorage.setItem(
      'skilldge_progress',
      JSON.stringify(allProgress)
    )
  } catch (error) {
    void error
  }
}

function loadNotes(courseId) {
  try {
    return (
      localStorage.getItem(
        `skilldge_notes_${courseId}`
      ) || ''
    )
  } catch {
    return ''
  }
}

function saveNotes(courseId, notes) {
  try {
    localStorage.setItem(
      `skilldge_notes_${courseId}`,
      notes
    )
  } catch (error) {
    void error
  }
}

function loadNotesSubmitted(courseId) {
  try {
    return (
      localStorage.getItem(
        `skilldge_notes_submitted_${courseId}`
      ) === 'true'
    )
  } catch {
    return false
  }
}

function saveNotesSubmitted(
  courseId,
  submitted
) {
  try {
    localStorage.setItem(
      `skilldge_notes_submitted_${courseId}`,
      String(submitted)
    )
  } catch (error) {
    void error
  }
}

function removeQuizSession(courseId) {
  try {
    localStorage.removeItem(
      `quiz_session_${courseId}`
    )
  } catch (error) {
    void error
  }
}

// ─────────────────────────────────────────────
// Main watch page
// ─────────────────────────────────────────────

export default function WatchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const course = COURSES.find(
    (item) => item.id === Number(id)
  )

  const [activeTab, setActiveTab] =
    useState('notes')

  const [camOn, setCamOn] =
    useState(false)

  const [camStream, setCamStream] =
    useState(null)

  const [notes, setNotes] = useState(() =>
    loadNotes(id)
  )

  const [
    notesSubmitted,
    setNotesSubmitted,
  ] = useState(() => loadNotesSubmitted(id))

  const [checklist, setChecklist] =
    useState(() =>
      DEFAULT_CHECKLIST.map((item) => ({
        ...item,
      }))
    )

  const videoRef = useRef(null)

  useEffect(() => {
    return () => {
      if (camStream) {
        camStream
          .getTracks()
          .forEach((track) => track.stop())
      }
    }
  }, [camStream])

  if (!course) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--text2)',
        }}
      >
        Course not found.{' '}

        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--accent)',
            cursor: 'pointer',
          }}
          onClick={() =>
            navigate('/app/learn')
          }
        >
          Go back
        </button>
      </div>
    )
  }

  // ───────────────────────────────────────────
  // Camera
  // ───────────────────────────────────────────

  async function toggleCam() {
    if (camOn) {
      if (camStream) {
        camStream
          .getTracks()
          .forEach((track) => track.stop())
      }

      setCamStream(null)
      setCamOn(false)

      return
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

      setCamStream(stream)
      setCamOn(true)

      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)

      setChecklist((previous) =>
        previous.map((item) =>
          item.id === 2
            ? { ...item, done: true }
            : item
        )
      )
    } catch {
      showToast(
        'Camera permission denied. Please allow camera access in your browser.'
      )
    }
  }

  // ───────────────────────────────────────────
  // Notes
  // ───────────────────────────────────────────

  function handleNotesChange(value) {
    setNotes(value)
    saveNotes(id, value)
  }

  function submitNotes() {
    if (notes.trim().length < 20) {
      showToast(
        'Write a bit more about what you learned!'
      )

      return
    }

    setNotesSubmitted(true)
    saveNotesSubmitted(id, true)

    setActiveTab('quiz')

    setChecklist((previous) =>
      previous.map((item) =>
        item.id === 4
          ? { ...item, done: true }
          : item
      )
    )
  }

  function resetNotes() {
    setNotesSubmitted(false)
    saveNotesSubmitted(id, false)

    setNotes('')
    saveNotes(id, '')

    removeQuizSession(id)

    setActiveTab('notes')

    setChecklist((previous) =>
      previous.map((item) =>
        item.id === 4 || item.id === 5
          ? { ...item, done: false }
          : item
      )
    )
  }

  // ───────────────────────────────────────────
  // Quiz completion
  // ───────────────────────────────────────────

  function handleQuizCompleted() {
    saveProgress(Number(id), 100)

    setChecklist((previous) =>
      previous.map((item) =>
        item.id === 5
          ? { ...item, done: true }
          : item
      )
    )

    showToast(
      'Excellent! You completed all five quiz questions.'
    )
  }

  // ───────────────────────────────────────────
  // Focus checklist
  // ───────────────────────────────────────────

  function toggleCheckItem(index) {
    setChecklist((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              done: !item.done,
            }
          : item
      )
    )
  }

  const tabs = [
    {
      id: 'notes',
      label: '📝 Notes',
    },
    {
      id: 'quiz',
      label: '🤖 AI Quiz',
    },
    {
      id: 'focus',
      label: '✅ Focus',
    },
  ]

  return (
    <div className={styles.layout}>
      {/* Left video panel */}
      <div className={styles.videoPanel}>
        <div className={styles.topBar}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate('/app/learn')
            }
          >
            ← Back
          </button>

          <h2 className={styles.courseTitle}>
            {course.title}
          </h2>

          <button
            type="button"
            className={`btn btn-sm ${
              camOn
                ? 'btn-danger'
                : 'btn-primary'
            }`}
            onClick={toggleCam}
          >
            {camOn
              ? '📹 Camera On'
              : '📷 Enable Camera'}
          </button>
        </div>

        {/* Video and camera */}
        <div className={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${course.ytId}?rel=0`}
            title={course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
          />

          <button
            type="button"
            className={styles.camOverlay}
            onClick={toggleCam}
            title="Click to toggle camera"
            aria-label={
              camOn
                ? 'Turn camera off'
                : 'Turn camera on'
            }
          >
            {camOn ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                  }}
                />

                <span
                  className={styles.camDot}
                />
              </>
            ) : (
              <span
                className={
                  styles.camPlaceholder
                }
              >
                <span
                  style={{
                    fontSize: 22,
                  }}
                >
                  📷
                </span>

                <span>Camera Off</span>
              </span>
            )}
          </button>
        </div>

        {/* Information panel */}
        <div
          style={{
            padding: 16,
            background: 'var(--bg2)',
            border:
              '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            style={{
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text2)',
            }}
          >
            HOW IT WORKS
          </div>

          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--text2)',
            }}
          >
            1. Watch the video with your camera on
            for accountability.
            <br />

            2. Write detailed notes about what you
            learned.
            <br />

            3. Submit your notes and start a
            five-question Gemini quiz.
            <br />

            4. Answer one question at a time and
            receive feedback.
            <br />

            5. Answer all five correctly to unlock
            deeper follow-up questions.
          </p>
        </div>
      </div>

      {/* Right sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          {course.title.split('–')[0].trim()}
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id
                  ? styles.tabActive
                  : ''
              }`}
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            onNotesChange={handleNotesChange}
            notesSubmitted={notesSubmitted}
            onSubmit={submitNotes}
            onReset={resetNotes}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizPanel
            notes={notes}
            notesSubmitted={notesSubmitted}
            courseId={id}
            onQuizCompleted={
              handleQuizCompleted
            }
          />
        )}

        {activeTab === 'focus' && (
          <FocusTab
            checklist={checklist}
            onToggle={toggleCheckItem}
          />
        )}
      </div>
    </div>
  )
}