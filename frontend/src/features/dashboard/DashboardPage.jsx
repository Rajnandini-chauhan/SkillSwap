import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { COURSES, getGreeting } from '../lib/data'
import {
  FocusTomatoIllustration,
  NotesIllustration,
  TeachBotIllustration,
  RainbowCloudIllustration,
} from '../components/DashboardIllustrations'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getCurrentWeekDates() {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)

  return weekDays.map((_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date.getDate()
  })
}

const quickActions = [
  {
    title: 'Focus session',
    description: 'Start a distraction-free study block.',
    button: 'Start focus',
    path: '/app/watch/1',
    tone: 'focus',
    Illustration: FocusTomatoIllustration,
  },
  {
    title: 'Teach a skill',
    description: 'Create a lesson and share what you know.',
    button: 'Start teaching',
    path: '/app/teach',
    tone: 'teach',
    Illustration: TeachBotIllustration,
  },
  {
    title: 'Find a partner',
    description: 'Meet someone with complementary skills.',
    button: 'Browse peers',
    path: '/app/peers',
    tone: 'match',
    Illustration: RainbowCloudIllustration,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'Learner'
  const todayIndex = Math.max(0, Math.min(6, (new Date().getDay() + 6) % 7))
  const weekDates = getCurrentWeekDates()

  let storedProgress = {}
  try {
    storedProgress = JSON.parse(localStorage.getItem('skilldge_progress') || '{}')
  } catch {
    storedProgress = {}
  }

  const courses = COURSES.map(course => ({
    ...course,
    progress: storedProgress[course.id] ?? course.progress,
  }))
  const continueCourse = courses.find(course => course.progress > 0 && course.progress < 100) || courses[0]
  const activeCount = courses.filter(course => course.progress > 0).length
  const goalCount = Math.min(4, activeCount)
  const weeklyProgress = Math.min(100, Math.max(20, goalCount * 25))
  const skills = (user?.skillsLearn || []).slice(0, 4)

  return (
    <main className="dashboard-clean">
      <section className="dashboard-clean__intro">
        <div>
          <p className="page-eyebrow">Your learning space</p>
          <h1>Good {getGreeting()}, {firstName}.</h1>
          <p>Choose one meaningful thing to work on today.</p>
        </div>
      </section>

      <section className="dashboard-clean__top-grid">
        <article className="dashboard-hero-card">
          <div className="dashboard-hero-card__content">
            <span className="feature-kicker">Continue where you left off</span>
            <h2>{continueCourse.title}</h2>
            <p>{continueCourse.channel}</p>

            <div className="dashboard-hero-card__progress-row">
              <div className="dashboard-progress-track" aria-label={`${continueCourse.progress}% complete`}>
                <div style={{ width: `${continueCourse.progress}%` }} />
              </div>
              <strong>{continueCourse.progress}%</strong>
            </div>

            <div className="dashboard-hero-card__actions">
              <button className="btn btn-primary" onClick={() => navigate(`/app/watch/${continueCourse.id}`)}>
                Continue learning
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/app/learn')}>
                Browse lessons
              </button>
            </div>
          </div>
          <div className="dashboard-hero-card__art" aria-hidden="true">
            <NotesIllustration />
          </div>
        </article>

        <article className="dashboard-goal-card">
          <div className="dashboard-goal-card__heading">
            <div>
              <p className="section-label">Weekly goal</p>
              <h2>Learning rhythm</h2>
            </div>
            <strong>{goalCount}/4</strong>
          </div>
          <div className="dashboard-progress-track dashboard-progress-track--goal">
            <div style={{ width: `${weeklyProgress}%` }} />
          </div>
          <p>Small, consistent sessions build stronger progress.</p>

          <div className="dashboard-week-strip" aria-label="Current week">
            {weekDays.map((day, index) => {
              const active = index === todayIndex
              return (
                <div key={day} className={active ? 'is-active' : ''}>
                  <span>{day}</span>
                  <strong>{weekDates[index]}</strong>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className="dashboard-clean__section">
        <div className="section-heading">
          <div>
            <p className="section-label">Quick access</p>
            <h2 className="section-title">What would you like to do?</h2>
          </div>
        </div>

        <div className="dashboard-quick-grid">
          {quickActions.map(action => (
            <article key={action.title} className={`dashboard-quick-card dashboard-quick-card--${action.tone}`}>
              <div className="dashboard-quick-card__copy">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <button type="button" onClick={() => navigate(action.path)}>
                  {action.button} <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="dashboard-quick-card__art" aria-hidden="true">
                <action.Illustration />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-clean__bottom-grid">
        <article className="dashboard-mini-card">
          <div>
            <p className="section-label">Current progress</p>
            <h2>{continueCourse.title}</h2>
            <p>{continueCourse.channel}</p>
          </div>
          <div className="dashboard-mini-card__footer">
            <div className="dashboard-progress-track">
              <div style={{ width: `${continueCourse.progress}%` }} />
            </div>
            <button type="button" onClick={() => navigate(`/app/watch/${continueCourse.id}`)}>Resume course →</button>
          </div>
        </article>

        <article className="dashboard-mini-card">
          <div>
            <p className="section-label">Your skills</p>
            <h2>Learning profile</h2>
          </div>
          <div className="dashboard-skill-list">
            {skills.length
              ? skills.map(skill => <span key={skill}>{skill}</span>)
              : <p>Add skills from your profile.</p>}
          </div>
          <button type="button" onClick={() => navigate('/app/profile')}>Open profile →</button>
        </article>
      </section>
    </main>
  )
}
