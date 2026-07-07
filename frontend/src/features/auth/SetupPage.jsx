import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { SKILLS } from '../../lib/data'
import { usersApi } from '../../lib/usersApi'

const STEPS = ['Pick skills to learn', 'Pick skills to teach', "You're all set!"]

export default function SetupPage() {
  const [step, setStep]     = useState(0)
  const [learnSkills, setLearnSkills] = useState([])
  const [teachSkills, setTeachSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  function toggleSkill(type, skill) {
    if (type === 'learn') {
      setLearnSkills(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      )
    } else {
      setTeachSkills(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      )
    }
  }

  async function handleFinish() {
    setLoading(true)
    const finalLearnSkills = learnSkills.length ? learnSkills : ['Python', 'React']
    const finalTeachSkills = teachSkills.length ? teachSkills : ['Design']

    try {
      await usersApi.setup({
        skillsLearn: finalLearnSkills,
        skillsTeach: finalTeachSkills,
      })

      updateUser({
        skillsLearn: finalLearnSkills,
        skillsTeach: finalTeachSkills,
        isProfileComplete: true,
      })

      setStep(2)
    } catch (error) {
      console.error('Setup failed:', error.message)
      // still move forward — don't block the user
      updateUser({
        skillsLearn: finalLearnSkills,
        skillsTeach: finalTeachSkills,
      })
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 40, width: '100%', maxWidth: 540,
        boxShadow: 'var(--shadow)',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 8,
              width: i === step ? 28 : 8,
              borderRadius: 4,
              background: i === step ? 'var(--accent)' : i < step ? 'var(--accent3)' : 'var(--border)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{STEPS[step]}</h2>

        {/* Step 0 – Learn */}
        {step === 0 && (
          <>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
              Select everything you want to learn. You can always update this later.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {SKILLS.map(s => (
                <div
                  key={s}
                  className={`skill-chip ${learnSkills.includes(s) ? 'selected-learn' : ''}`}
                  onClick={() => toggleSkill('learn', s)}
                >
                  {s}
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full" style={{ padding: 13 }} onClick={() => setStep(1)}>
              Continue →
            </button>
          </>
        )}

        {/* Step 1 – Teach */}
        {step === 1 && (
          <>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
              Select skills you can teach to others. Share what you know!
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {SKILLS.map(s => (
                <div
                  key={s}
                  className={`skill-chip ${teachSkills.includes(s) ? 'selected-teach' : ''}`}
                  onClick={() => toggleSkill('teach', s)}
                >
                  {s}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: 13 }} onClick={() => setStep(0)}>
                ← Back
              </button>
             <button
                className="btn btn-primary"
                style={{ flex: 2, padding: 13 }}
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Finish Setup →'}
              </button>
            </div>
          </>
        )}

        {/* Step 2 – Done */}
        {step === 2 && (
          <>
            <div style={{ fontSize: 56, textAlign: 'center', margin: '24px 0' }}>🎉</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20, textAlign: 'center' }}>
              Your profile is ready, {user?.name?.split(' ')[0]}!
            </p>

            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Want to learn</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {(user?.skillsLearn || []).map(s => (
                  <span key={s} className="tag tag-learn">{s}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Can teach</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(user?.skillsTeach || []).map(s => (
                  <span key={s} className="tag tag-teach">{s}</span>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              style={{ padding: 14, fontSize: 15 }}
              onClick={() => navigate('/app/dashboard')}
            >
              Enter SkillShare 🚀
            </button>
          </>
        )}
      </div>
    </div>
  )
}