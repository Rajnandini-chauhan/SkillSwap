import { useNavigate } from 'react-router-dom'
import { coursesApi } from '../../lib/coursesApi'
import { useToast } from '../../lib/ToastContext'

export default function CourseCard({ course }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const progress = Math.max(0, Math.min(100, course.progress ?? 0))

  const handleStartLesson = async () => {
    // Determine the ID: MongoDB uses _id, YouTube search uses id
    const videoId = course.youtubeVideoId || course.ytId || course.id;
    const dbId = course._id;

    // If we have a YouTube ID but no MongoDB ID, we MUST enroll first
    if (videoId && !dbId) {
      try {
        const enrolledCourse = await coursesApi.enroll({
          videoId: videoId,
          title: course.title,
          channel: course.channel,
          thumbnail: course.thumbnail,
          description: course.description,
        })
        // Navigate using the newly created MongoDB ID
        navigate(`/app/watch/${enrolledCourse._id}`)
      } catch (error) {
        showToast(error.message || 'Failed to enroll in course')
      }
    } else if (dbId) {
      // Already in DB, just navigate
      navigate(`/app/watch/${dbId}`)
    } else {
      showToast('Course ID not found. Please try searching again.')
    }
  }

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

      <button className="btn btn-secondary btn-full" onClick={handleStartLesson}>
        {progress > 0 ? 'Continue lesson' : 'Start lesson'}
      </button>
    </article>
  )
}
