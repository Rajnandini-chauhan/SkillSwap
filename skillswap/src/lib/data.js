// ═══════════════════════════════════════════════
// SKILLSHARE – APP DATA & CONSTANTS
// ═══════════════════════════════════════════════

export const SKILLS = [
  'Python', 'JavaScript', 'Design', 'React', 'SQL',
  'Machine Learning', 'Photography', 'Music', 'Writing',
  'Marketing', 'Video Editing', '3D Modeling', 'Finance',
  'Spanish', 'Drawing', 'TypeScript', 'Node.js', 'Flutter',
]

export const COURSES = [
  {
    id: 1,
    title: 'Python for Beginners – Full Course',
    channel: 'freeCodeCamp',
    thumb: '🐍',
    color: '#1a2a3a',
    ytId: 'rfscVS0vtbw',
    duration: '4h 26m',
    progress: 60,
    skill: 'Python',
    description: 'Learn Python from scratch — variables, loops, functions, OOP, and more.',
  },
  {
    id: 2,
    title: 'Full React Course 2024',
    channel: 'Traversy Media',
    thumb: '⚛️',
    color: '#1a1a3a',
    ytId: 'w7ejDZ8SWv8',
    duration: '6h 31m',
    progress: 20,
    skill: 'React',
    description: 'Master React hooks, state, context, and modern component patterns.',
  },
  {
    id: 3,
    title: 'SQL Full Course',
    channel: 'Bro Code',
    thumb: '🗄️',
    color: '#1a2a1a',
    ytId: '7S_tz1z_5bA',
    duration: '3h 11m',
    progress: 0,
    skill: 'SQL',
    description: 'Everything you need to know about relational databases and SQL queries.',
  },
  {
    id: 4,
    title: 'Machine Learning A-Z',
    channel: 'Edureka',
    thumb: '🤖',
    color: '#2a1a1a',
    ytId: 'ukzFI9rgwfU',
    duration: '5h 48m',
    progress: 35,
    skill: 'Machine Learning',
    description: 'Supervised, unsupervised learning, neural networks and real ML projects.',
  },
  {
    id: 5,
    title: 'Figma UI Design Tutorial',
    channel: 'DesignCourse',
    thumb: '🎨',
    color: '#2a1a2a',
    ytId: 'FTFaQWZBqQ8',
    duration: '2h 15m',
    progress: 80,
    skill: 'Design',
    description: 'Design beautiful interfaces in Figma — from wireframes to polished UI.',
  },
  {
    id: 6,
    title: 'JavaScript DOM Crash Course',
    channel: 'Traversy Media',
    thumb: '🌐',
    color: '#2a2a1a',
    ytId: '0ik6X4DJKCc',
    duration: '1h 44m',
    progress: 0,
    skill: 'JavaScript',
    description: 'Manipulate the DOM, handle events, and build dynamic web pages.',
  },
]

export const PEERS = [
  {
    id: 1,
    name: 'Aisha Patel',
    skills_teach: ['Python', 'ML'],
    skills_learn: ['Design'],
    online: true,
    avatar: 'AP',
    color: '#4040a0',
    bio: 'Data scientist who loves teaching Python to beginners.',
  },
  {
    id: 2,
    name: 'Rohan Mehta',
    skills_teach: ['React', 'JavaScript'],
    skills_learn: ['SQL'],
    online: true,
    avatar: 'RM',
    color: '#40a060',
    bio: 'Frontend engineer with 3 years of React experience.',
  },
  {
    id: 3,
    name: 'Sara Kim',
    skills_teach: ['Design', 'Photography'],
    skills_learn: ['Python'],
    online: false,
    avatar: 'SK',
    color: '#a04060',
    bio: 'UI/UX designer who also loves film photography.',
  },
  {
    id: 4,
    name: 'Dev Verma',
    skills_teach: ['SQL', 'Finance'],
    skills_learn: ['React'],
    online: true,
    avatar: 'DV',
    color: '#a06020',
    bio: 'Database architect and chartered accountant.',
  },
]

export const DEFAULT_CHECKLIST = [
  { id: 1, text: 'Opened the video', done: true },
  { id: 2, text: 'Camera is on', done: false },
  { id: 3, text: 'Watched without switching tabs', done: false },
  { id: 4, text: 'Submitted my notes', done: false },
  { id: 5, text: 'Answered at least 3 questions', done: false },
]

// ── Google Gemini API call (FREE) ──
// Get your free key at: https://aistudio.google.com → "Get API Key"
// No credit card needed. Set it in your .env file as VITE_GEMINI_API_KEY
export async function callClaude(prompt, maxTokens = 1000) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Gemini API error ${response.status}: ${err?.error?.message || 'unknown'}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
