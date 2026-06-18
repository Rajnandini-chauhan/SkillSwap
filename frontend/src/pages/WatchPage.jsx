// ═══════════════════════════════════════════════
// SKILLSHARE – WATCH PAGE
// Core feature: video + camera + notes + AI quiz
// ═══════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COURSES, DEFAULT_CHECKLIST, callClaude } from '../lib/data'
import { useToast } from '../lib/ToastContext'
import styles from './WatchPage.module.css'

// ── Sub-components ────────────────────────────

function NotesTab({ notes, onNotesChange, notesSubmitted, onSubmit, onReset }) {
  if (notesSubmitted) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.submittedBanner}>
          ✅ Notes submitted! Head to the AI Quiz tab to start answering questions.
        </div>
        <div className={styles.notesPreview}>{notes}</div>
        <button className="btn btn-secondary btn-sm btn-full" onClick={onReset}>
          ✏️ Rewrite Notes
        </button>
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.notePrompt}>
        📌 Watch the full video, then write everything you learned here. The more detail you give,
        the better and more personalized your AI questions will be!
      </div>
      <textarea
        placeholder={'I learned that...\n\nKey concepts:\n1.\n2.\n3.\n\nThings I found confusing:\n\nHow I would explain this to someone:'}
        value={notes}
        onChange={e => onNotesChange(e.target.value)}
        style={{ minHeight: 240, flex: 1 }}
      />
      <button className="btn btn-success btn-full" onClick={onSubmit}>
        Submit Notes & Start AI Quiz 🤖
      </button>
    </div>
  )
}

// ── Question Block ──
function QuestionBlock({ question, index, onSubmitAnswer }) {
  const [draft, setDraft] = useState('')

  const isAnswered = !!question.answer

  return (
    <div className={styles.qBlock}>
      <div className={styles.qHeader}>
        <div className={styles.qNum}>{index + 1}</div>
        <div className={styles.qText}>{question.text}</div>
      </div>

      {isAnswered ? (
        <div className={styles.qSubmitted}>
          <div className={styles.qUserAnswer}>{question.answer}</div>
          {question.loading ? (
            <div className={styles.qLoading}>
              <div className="dot-anim">
                <span /><span /><span />
              </div>
              <span>Claude is reviewing your answer...</span>
            </div>
          ) : question.aiFeedback ? (
            <div className={styles.qAiFeedback}>{question.aiFeedback}</div>
          ) : null}
        </div>
      ) : (
        <div className={styles.qAnswerArea}>
          <textarea
            placeholder="Type your answer here... be as detailed as you want! There's no limit."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            style={{ minHeight: 90 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { if (draft.trim()) { onSubmitAnswer(index, draft); setDraft('') } }}
            disabled={!draft.trim()}
          >
            Submit Answer →
          </button>
        </div>
      )}
    </div>
  )
}

// ── AI Quiz Tab ──
function QuizTab({ notesSubmitted, quizFeedback, questions, loadingMore, onSubmitAnswer, onLoadMore }) {
  if (!notesSubmitted && questions.length === 0) {
    return (
      <div className={styles.tabContent} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🤖</div>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
          Submit your notes first to unlock the AI Quiz — answer as many questions as you want, and load more whenever you're ready.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      {quizFeedback && (
        <div className={styles.quizIntro}>
          <strong>🤖 Claude's Feedback on your notes</strong>
          {quizFeedback}
        </div>
      )}

      {questions.map((q, i) => (
        <QuestionBlock key={i} question={q} index={i} onSubmitAnswer={onSubmitAnswer} />
      ))}

      {questions.length > 0 && (
        <div
          className={`${styles.loadMoreBtn} ${loadingMore ? styles.loadingMore : ''}`}
          onClick={!loadingMore ? onLoadMore : undefined}
        >
          {loadingMore ? (
            <div className="dot-anim" style={{ justifyContent: 'center' }}>
              <span /><span /><span />
            </div>
          ) : '+ Load More Questions'}
        </div>
      )}
    </div>
  )
}

// ── Focus Checklist Tab ──
function FocusTab({ checklist, onToggle }) {
  const done = checklist.filter(i => i.done).length
  const pct  = Math.round((done / checklist.length) * 100)

  return (
    <div className={styles.tabContent}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
          <span>Focus progress</span>
          <span>{done}/{checklist.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent3)' }} />
        </div>
      </div>

      {checklist.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 10, borderRadius: 'var(--radius-sm)',
            opacity: item.done ? 0.6 : 1,
          }}
        >
          <div
            onClick={() => onToggle(i)}
            style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `1.5px solid ${item.done ? 'var(--accent3)' : 'var(--border)'}`,
              background: item.done ? 'var(--accent3)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 11, color: '#0a0a0f',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            {item.done ? '✓' : ''}
          </div>
          <span style={{
            fontSize: 13,
            textDecoration: item.done ? 'line-through' : 'none',
            color: item.done ? 'var(--text3)' : 'var(--text)',
          }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MAIN WATCH PAGE
// ═══════════════════════════════════════════════

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('skilldge_progress') || '{}') } catch { return {} }
}
function saveProgress(courseId, pct) {
  try {
    const all = loadProgress()
    all[courseId] = pct
    localStorage.setItem('skilldge_progress', JSON.stringify(all))
  } catch (error) { void error }
}
function loadNotes(courseId) {
  try { return localStorage.getItem(`skilldge_notes_${courseId}`) || '' } catch { return '' }
}
function saveNotes(courseId, notes) {
  try { localStorage.setItem(`skilldge_notes_${courseId}`, notes) } catch (error) { void error }
}

export default function WatchPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const course = COURSES.find(c => c.id === Number(id))

  const [activeTab, setActiveTab]   = useState('notes')
  const [camOn, setCamOn]           = useState(false)
  const [camStream, setCamStream]   = useState(null)
  const [notes, setNotes]           = useState(() => loadNotes(id))
  const [notesSubmitted, setNotesSubmitted] = useState(false)
  const [quizFeedback, setQuizFeedback]     = useState('')
  const [questions, setQuestions]   = useState([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [checklist, setChecklist]   = useState(
    DEFAULT_CHECKLIST.map(item => ({ ...item }))
  )

  const videoRef = useRef(null)

  useEffect(() => {
    return () => {
      if (camStream) camStream.getTracks().forEach(t => t.stop())
    }
  }, [camStream])

  if (!course) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
        Course not found.{' '}
        <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/app/learn')}>
          Go back
        </span>
      </div>
    )
  }

  // ── Camera ──
  async function toggleCam() {
    if (camOn) {
      if (camStream) camStream.getTracks().forEach(t => t.stop())
      setCamStream(null)
      setCamOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setCamStream(stream)
      setCamOn(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
      setChecklist(prev => prev.map(item => item.id === 2 ? { ...item, done: true } : item))
    } catch {
      showToast('Camera permission denied. Please allow camera access in your browser.')
    }
  }

  // Auto-save notes to localStorage
  function handleNotesChange(val) {
    setNotes(val)
    saveNotes(id, val)
  }

  // ── Notes Submit ──
  async function submitNotes() {
    if (notes.trim().length < 20) {
      showToast('Write a bit more about what you learned!')
      return
    }
    setNotesSubmitted(true)
    setActiveTab('quiz')
    saveProgress(Number(id), 100)
    setChecklist(prev => prev.map(item => item.id === 4 ? { ...item, done: true } : item))
    await generateQuestions(notes, true)
  }

  function resetNotes() {
    setNotesSubmitted(false)
    setNotes('')
    setQuestions([])
    setQuizFeedback('')
    setActiveTab('notes')
  }

  // ── AI Question Generation ──
  async function generateQuestions(notesText, withFeedback) {
    const prevQs = questions.map(q => q.text).join(' | ')
    const prompt = withFeedback
      ? `A student watched a video and wrote these notes:\n\n"${notesText}"\n\nRespond ONLY with valid JSON (no markdown, no backticks):\n{"feedback":"2-3 sentences of specific, encouraging feedback on the notes quality","questions":["q1","q2","q3","q4","q5","q6","q7"]}\n\nMake the 7 questions progressively deeper: start with recall/comprehension, move to application and analysis. Be specific to what they actually wrote.`
      : `Based on these learning notes:\n\n"${notesText}"\n\nGenerate 7 more DIFFERENT, more challenging follow-up questions.\nPrevious questions already asked: ${prevQs}\n\nDo NOT repeat previous questions. Make these more advanced.\n\nRespond ONLY with valid JSON (no markdown, no backticks):\n{"questions":["q1","q2","q3","q4","q5","q6","q7"]}`

    try {
      const text   = await callClaude(prompt, 1200)
      const clean  = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      if (withFeedback) setQuizFeedback(parsed.feedback || '')
      const newQs = (parsed.questions || []).map(q => ({
        text: q, answer: '', aiFeedback: '', loading: false,
      }))
      setQuestions(prev => [...prev, ...newQs])
    } catch {
      if (withFeedback) {
        setQuizFeedback('Great notes! Your effort to capture key concepts is clear. Here are your follow-up questions:')
        setQuestions([
          { text: 'In your own words, what is the single most important thing you learned?', answer: '', aiFeedback: '', loading: false },
          { text: 'Can you give a real-world example of what you learned?', answer: '', aiFeedback: '', loading: false },
          { text: 'What was the most confusing part? How would you explain it simply?', answer: '', aiFeedback: '', loading: false },
          { text: 'How does this topic connect to something you already knew?', answer: '', aiFeedback: '', loading: false },
          { text: 'What would happen if you applied this incorrectly?', answer: '', aiFeedback: '', loading: false },
          { text: 'If you taught this to a beginner, what 3 steps would you use?', answer: '', aiFeedback: '', loading: false },
          { text: 'What is one thing you want to explore further after this lesson?', answer: '', aiFeedback: '', loading: false },
        ])
      } else {
        setQuestions(prev => [...prev,
          { text: 'How would you apply this knowledge to solve a real problem?', answer: '', aiFeedback: '', loading: false },
          { text: 'What are the limitations or edge cases of what you learned?', answer: '', aiFeedback: '', loading: false },
          { text: 'Compare this to an alternative approach — what are the trade-offs?', answer: '', aiFeedback: '', loading: false },
          { text: 'If you had to teach this tomorrow, what would your lesson plan be?', answer: '', aiFeedback: '', loading: false },
          { text: 'What assumption in what you learned might not always hold?', answer: '', aiFeedback: '', loading: false },
          { text: 'Describe a scenario where this knowledge could be misapplied.', answer: '', aiFeedback: '', loading: false },
          { text: 'What is the most advanced concept you encountered? Explain simply.', answer: '', aiFeedback: '', loading: false },
        ])
      }
    }

    setLoadingMore(false)
  }

  // ── Answer Submission ──
  async function handleSubmitAnswer(index, answer) {
    setQuestions(prev => prev.map((q, i) =>
      i === index ? { ...q, answer, loading: true } : q
    ))

    const answeredCount = questions.filter(q => q.answer).length + 1
    if (answeredCount >= 3) {
      setChecklist(prev => prev.map(item => item.id === 5 ? { ...item, done: true } : item))
    }

    const prompt = `Question: "${questions[index].text}"\n\nStudent's answer: "${answer}"\n\nProvide concise, encouraging feedback in 2-3 sentences. Point out what's correct, gently correct any misconceptions, and suggest one way to deepen understanding. Be conversational and supportive.`

    try {
      const feedback = await callClaude(prompt, 400)
      setQuestions(prev => prev.map((q, i) =>
        i === index ? { ...q, aiFeedback: feedback, loading: false } : q
      ))
    } catch {
      setQuestions(prev => prev.map((q, i) =>
        i === index ? { ...q, aiFeedback: 'Great effort! Your understanding is developing well. Keep practicing this topic.', loading: false } : q
      ))
    }
  }

  async function loadMoreQuestions() {
    if (loadingMore) return
    setLoadingMore(true)
    await generateQuestions(notes, false)
  }

  function toggleCheckItem(i) {
    setChecklist(prev => prev.map((item, idx) =>
      idx === i ? { ...item, done: !item.done } : item
    ))
  }

  const TABS = [
    { id: 'notes',    label: '📝 Notes' },
    { id: 'quiz',     label: '🤖 AI Quiz' },
    { id: 'focus',    label: '✅ Focus' },
  ]

  return (
    <div className={styles.layout}>
      {/* ══ LEFT: VIDEO PANEL ══ */}
      <div className={styles.videoPanel}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/learn')}>← Back</button>
          <h2 className={styles.courseTitle}>{course.title}</h2>
          <button
            className={`btn btn-sm ${camOn ? 'btn-danger' : 'btn-primary'}`}
            onClick={toggleCam}
          >
            {camOn ? '📹 Camera On' : '📷 Enable Camera'}
          </button>
        </div>

        {/* Video + Camera */}
        <div className={styles.videoWrapper}>
          <iframe
            src={`https://www.youtube.com/embed/${course.ytId}?rel=0`}
            title={course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
          />

          {/* Camera overlay */}
          <div className={styles.camOverlay} onClick={toggleCam} title="Click to toggle camera">
            {camOn ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                <div className={styles.camDot} />
              </>
            ) : (
              <div className={styles.camPlaceholder}>
                <span style={{ fontSize: 22 }}>📷</span>
                <span>Camera Off</span>
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div style={{
          background: 'var(--bg2)', borderRadius: 'var(--radius)',
          padding: 16, border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>HOW IT WORKS</div>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            1. Watch the video with your camera on for accountability.<br />
            2. Write detailed notes about what you learned.<br />
            3. Submit notes → Claude gives you 7+ AI questions.<br />
            4. Answer each question and get personal feedback.<br />
            5. Load more questions anytime — keep going until you truly master it!
          </p>
        </div>
      </div>

      {/* ══ RIGHT: SIDEBAR ══ */}
      <div className={styles.sidebar}>
        {/* Course name */}
        <div className={styles.sidebarHeader}>
          {course.title.split('–')[0].trim()}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <div
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Tab bodies */}
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
          <QuizTab
            notesSubmitted={notesSubmitted}
            quizFeedback={quizFeedback}
            questions={questions}
            loadingMore={loadingMore}
            onSubmitAnswer={handleSubmitAnswer}
            onLoadMore={loadMoreQuestions}
          />
        )}
        {activeTab === 'focus' && (
          <FocusTab checklist={checklist} onToggle={toggleCheckItem} />
        )}
      </div>
    </div>
  )
}
