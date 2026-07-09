import { useEffect, useState } from 'react'
import { quizApi } from '../../lib/quizApi'
import { useToast } from '../../lib/ToastContext'

function StatusBadge({ status }) {
  const styles = {
    correct:
      'border-green-300 bg-green-50 text-green-700',

    partially_correct:
      'border-yellow-300 bg-yellow-50 text-yellow-700',

    incorrect:
      'border-red-300 bg-red-50 text-red-700',

    off_topic:
      'border-orange-300 bg-orange-50 text-orange-700',
  }

  const labels = {
    correct: '✓ Correct',
    partially_correct: '◐ Partially correct',
    incorrect: '✕ Incorrect',
    off_topic: '↻ Read your notes again',
  }

  if (!status) return null

  return (
    <div
      className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold ${styles[status]}`}
    >
      {labels[status]}
    </div>
  )
}

export default function QuizPanel({
  notes,
  notesSubmitted,
  courseId,
  onQuizCompleted,
}) {
  const { showToast } = useToast()

  const [sessionId, setSessionId] =
    useState('')

  const [stage, setStage] =
    useState('idle')

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(null)

  const [progress, setProgress] =
    useState({
      correctBasicAnswers: 0,
      totalBasicQuestions: 5,
      percentage: 0,
    })

  const [answer, setAnswer] =
    useState('')

  const [evaluation, setEvaluation] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const storageKey =
    `quiz_session_${courseId}`

  useEffect(() => {
    if (!notesSubmitted) return

    const savedSessionId =
      localStorage.getItem(storageKey)

    if (!savedSessionId) return

    restoreSession(savedSessionId)
  }, [notesSubmitted, courseId])

  async function restoreSession(
    savedSessionId
  ) {
    setLoading(true)

    try {
      const data =
        await quizApi.getSession(
          savedSessionId
        )

      setSessionId(data.sessionId)
      setStage(data.stage)
      setCurrentQuestion(
        data.currentQuestion
      )
      setProgress(data.progress)
    } catch {
      localStorage.removeItem(
        storageKey
      )

      setSessionId('')
      setStage('idle')
      setCurrentQuestion(null)
    } finally {
      setLoading(false)
    }
  }

  async function startQuiz() {
    if (!notesSubmitted) {
      showToast(
        'Submit your notes first'
      )
      return
    }

    setLoading(true)

    try {
      const data =
        await quizApi.start({
          courseId,
          notes,
        })

      setSessionId(data.sessionId)
      setStage(data.stage)
      setCurrentQuestion(
        data.currentQuestion
      )
      setProgress(data.progress)
      setEvaluation(null)
      setAnswer('')

      localStorage.setItem(
        storageKey,
        data.sessionId
      )
    } catch (error) {
      showToast(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      showToast(
        'Please write an answer first'
      )
      return
    }

    setLoading(true)

    try {
      const data =
        await quizApi.submitAnswer({
          sessionId,
          answer,
        })

      setEvaluation(
        data.evaluation
      )

      setProgress(
        data.progress
      )

      if (data.basicQuizCompleted) {
        setStage('basic_completed')
        setCurrentQuestion(null)
        onQuizCompleted?.()
      }
    } catch (error) {
      showToast(error.message)
    } finally {
      setLoading(false)
    }
  }

  function continueToNextQuestion() {
    if (!evaluation?.canContinue) {
      return
    }

    setAnswer('')
    setEvaluation(null)

    restoreSession(sessionId)
  }

  function retryAnswer() {
    setAnswer('')
    setEvaluation(null)
  }

  async function startFollowUp() {
    setLoading(true)

    try {
      const data =
        await quizApi.generateFollowUp(
          sessionId
        )

      setStage(data.stage)
      setCurrentQuestion(
        data.currentQuestion
      )
      setAnswer('')
      setEvaluation(null)
    } catch (error) {
      showToast(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!notesSubmitted) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center text-center"
        style={{
          padding: '32px 24px',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            fontSize: '42px',
          }}
        >
          🤖
        </div>

        <p
          className="text-[13px] leading-6 text-[var(--text2)]"
          style={{
            maxWidth: '320px',
          }}
        >
          Submit your notes first to start
          the AI quiz.
        </p>
      </div>
    )
  }

  if (
    loading &&
    stage === 'idle'
  ) {
    return (
      <div
        className="flex min-h-0 flex-1 items-center justify-center"
        style={{
          padding: '24px',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="dot-anim">
            <span />
            <span />
            <span />
          </div>

          <p className="text-[13px] text-[var(--text2)]">
            Loading quiz...
          </p>
        </div>
      </div>
    )
  }

  if (stage === 'idle') {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center text-center"
        style={{
          padding: '32px 24px',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            fontSize: '42px',
          }}
        >
          🧠
        </div>

        <h3 className="text-[18px] font-bold text-[var(--text)]">
          Ready for your quiz?
        </h3>

        <p
          className="text-[13px] leading-6 text-[var(--text2)]"
          style={{
            marginTop: '8px',
            maxWidth: '340px',
          }}
        >
          Gemini will create five questions
          from your notes. Answer each
          question correctly before moving
          ahead.
        </p>

        <button
          type="button"
          className="btn btn-primary btn-full"
          style={{
            marginTop: '20px',
          }}
          onClick={startQuiz}
          disabled={loading}
        >
          {loading
            ? 'Creating quiz...'
            : 'Start Five Question Quiz'}
        </button>
      </div>
    )
  }

  if (
    stage === 'basic_completed'
  ) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto"
        style={{
          padding: '24px 20px',
        }}
      >
        <div
          className="rounded-[var(--radius-sm)] border border-green-300 bg-green-50 text-center"
          style={{
            padding: '24px 20px',
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              fontSize: '40px',
            }}
          >
            🎉
          </div>

          <h3 className="text-[18px] font-bold text-[var(--text)]">
            Basic quiz completed
          </h3>

          <p
            className="text-[13px] leading-6 text-[var(--text2)]"
            style={{
              marginTop: '8px',
            }}
          >
            You answered all five questions
            correctly. Follow-up questions
            are now unlocked.
          </p>

          <button
            type="button"
            className="btn btn-success btn-full"
            style={{
              marginTop: '20px',
            }}
            onClick={startFollowUp}
            disabled={loading}
          >
            {loading
              ? 'Creating follow-up...'
              : 'Start Follow-up Question'}
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
      style={{
        // IMPORTANT:
        // These values force visible spacing even if global.css
        // overrides Tailwind padding or gap utilities.
        gap: '16px',
        padding: '16px 18px 24px',
      }}
    >
      {/* Progress */}
      <div
        className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg2)]"
        style={{
          // IMPORTANT:
          // Prevents the progress card from touching the edges.
          padding: '12px 14px',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            marginBottom: '8px',
            gap: '12px',
          }}
        >
          <span className="text-[12px] font-bold text-[var(--text)]">
            {currentQuestion.type ===
            'basic'
              ? `Question ${currentQuestion.number} of ${currentQuestion.total}`
              : `Follow-up Question ${currentQuestion.number}`}
          </span>

          {currentQuestion.type ===
            'basic' && (
            <span className="shrink-0 text-[11px] font-bold text-[var(--accent)]">
              {
                progress.correctBasicAnswers
              }
              /
              {
                progress.totalBasicQuestions
              }
            </span>
          )}
        </div>

        {currentQuestion.type ===
          'basic' && (
          <div
            className="overflow-hidden rounded-full bg-[var(--border)]"
            style={{
              height: '8px',
            }}
          >
            <div
              className="h-full rounded-full bg-[var(--accent3)] transition-[width] duration-300"
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Question card */}
      <div className="w-full shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border)] bg-[var(--card)]">
        <div
          className="border-b border-[var(--border)] bg-[var(--bg2)]"
          style={{
            // IMPORTANT:
            // Gives the question proper internal spacing.
            padding: '14px 16px',
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]"
            style={{
              marginBottom: '6px',
            }}
          >
            {currentQuestion.type ===
            'basic'
              ? 'Basic quiz'
              : 'Follow-up quiz'}
          </p>

          <h3 className="break-words text-[13px] font-medium leading-[1.6] text-[var(--text)]">
            {currentQuestion.text}
          </h3>
        </div>

        <div
          className="flex flex-col"
          style={{
            // IMPORTANT:
            // Separates label, textarea, feedback, and buttons.
            gap: '12px',
            padding: '14px 16px 16px',
          }}
        >
          {!evaluation ? (
            <>
              <label className="text-xs font-semibold text-[var(--text2)]">
                Write your answer
              </label>

              <textarea
                value={answer}
                onChange={(event) =>
                  setAnswer(
                    event.target.value
                  )
                }
                placeholder="Explain your answer in your own words..."
                className="w-full resize-y text-[13px] leading-6"
                style={{
                  // IMPORTANT:
                  // Prevents the textarea from being too tall
                  // and ensures visible inner padding.
                  minHeight: '105px',
                  padding: '14px 16px',
                  boxSizing: 'border-box',
                }}
                disabled={loading}
              />

              <button
                type="button"
                className="btn btn-primary btn-full"
                style={{
                  // IMPORTANT:
                  // Keeps the button separate from the textarea.
                  marginTop: '2px',
                  minHeight: '46px',
                }}
                onClick={submitAnswer}
                disabled={
                  !answer.trim() ||
                  loading
                }
              >
                {loading
                  ? 'Gemini is checking...'
                  : 'Submit Answer'}
              </button>
            </>
          ) : (
            <>
              <StatusBadge
                status={
                  evaluation.status
                }
              />

              <div
                className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--bg2)]"
                style={{
                  padding: '12px',
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--text3)]"
                  style={{
                    marginBottom: '4px',
                  }}
                >
                  Your answer
                </p>

                <p className="whitespace-pre-wrap break-words text-xs leading-6 text-[var(--text2)]">
                  {answer}
                </p>
              </div>

              <div
                className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--card)]"
                style={{
                  padding: '12px',
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--text3)]"
                  style={{
                    marginBottom: '4px',
                  }}
                >
                  Gemini feedback
                </p>

                <p className="break-words text-xs leading-6 text-[var(--text)]">
                  {
                    evaluation.feedback
                  }
                </p>

                {evaluation.hint && (
                  <div
                    className="border-t border-[var(--border)]"
                    style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                    }}
                  >
                    <p className="text-[11px] font-bold text-[var(--text2)]">
                      Hint
                    </p>

                    <p
                      className="break-words text-xs leading-6 text-[var(--text2)]"
                      style={{
                        marginTop: '4px',
                      }}
                    >
                      {
                        evaluation.hint
                      }
                    </p>
                  </div>
                )}
              </div>

              {evaluation.canContinue ? (
                <button
                  type="button"
                  className="btn btn-success btn-full"
                  style={{
                    minHeight: '46px',
                  }}
                  onClick={
                    currentQuestion.type ===
                    'follow_up'
                      ? startFollowUp
                      : continueToNextQuestion
                  }
                >
                  {currentQuestion.type ===
                  'follow_up'
                    ? 'Generate Another Follow-up'
                    : 'Next Question'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  style={{
                    minHeight: '46px',
                  }}
                  onClick={retryAnswer}
                >
                  Try Again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}