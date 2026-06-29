# SkillSwap — Project Blueprint

> A community-driven platform where students teach what they know and learn what they don't.
> Built on MERN Stack · HuggingFace AI · Cloud Deployed

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Objective](#2-core-objective)
3. [Problem Statement](#3-problem-statement)
4. [Target Users](#4-target-users)
5. [High-Level System Architecture](#5-high-level-system-architecture)
6. [Detailed Input Layer](#6-detailed-input-layer)
7. [Processing and Intelligence Modules](#7-processing-and-intelligence-modules)
8. [Memory and Data Management](#8-memory-and-data-management)
9. [Output and User Experience](#9-output-and-user-experience)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Backend Architecture](#11-backend-architecture)
12. [AI/ML Model Architecture](#12-aiml-model-architecture)
13. [Database and Storage Design](#13-database-and-storage-design)
14. [API and Service Flow](#14-api-and-service-flow)
15. [Security, Privacy, and Ethical Considerations](#15-security-privacy-and-ethical-considerations)
16. [Development Roadmap and Phase Planning](#16-development-roadmap-and-phase-planning)
17. [Evaluation Methodology](#17-evaluation-methodology)
18. [Future Improvements](#18-future-improvements)
19. [Complete Technology Stack](#19-complete-technology-stack)
20. [Project Vision and Long-Term Direction](#20-project-vision-and-long-term-direction)

---

## 1. Project Overview

**SkillSwap** is a full-stack web platform that solves one of the most persistent problems in self-directed learning: people learn but don't retain, and they don't have a community to grow with.

The platform operates on a simple but powerful principle — every user is both a learner and a teacher. You pick a skill to learn, study in a focused session, upload your notes, get AI-tested on what you learned, and share your progress with a community that holds each other accountable. When you're ready, you swap your knowledge with someone who knows what you want to learn.

The core loop:

```
Pick a skill → Focus session (camera on) → Upload notes → AI knowledge test → Community feed → Weekly reflection
```

This is not a content platform. There are no pre-recorded courses. The knowledge comes from the community itself.

---

## 2. Core Objective

- Build a deployable, production-ready web application for student learners
- Create a self-sustaining learning loop: study → test → reflect → repeat
- Build a lightweight community layer that drives accountability and growth
- Use AI (HuggingFace models) to generate knowledge tests from a user's own notes
- Enable skill swapping between users as the platform grows (Phase 2)
- Deploy on cloud infrastructure with real users from day one

---

## 3. Problem Statement

Students today face three compounding problems:

**Problem 1 — No retention system.**
People watch tutorials and read notes but never test themselves. Without active recall, learning evaporates within days. There is no lightweight tool that takes your own notes and turns them into a quiz automatically.

**Problem 2 — No revision habit.**
Nobody revisits what they learned last week. The weekly reflection problem is universal — students know they should review but have no structured place or prompt to do so.

**Problem 3 — Learning is lonely.**
Self-study is isolating. Without peers who are on the same journey, motivation drops. People need to see others learning, ask doubts, celebrate completions — not just consume content alone.

**Existing solutions fall short:**

| Platform | What it does | What it misses |
|---|---|---|
| YouTube / Udemy | Video content | No testing, no community loop |
| Anki | Flashcard testing | No community, no notes integration |
| Discord servers | Community chat | No structured learning, no AI |
| Notion | Note-taking | No testing, no community |

SkillSwap combines all of these into one loop.

---

## 4. Target Users

**Primary — College and school students (MVP)**

- Age 16–24
- Self-taught or supplementing formal education
- Learning programming, design, languages, science, or any skill
- Want to build habits and find accountability partners

**Secondary — Working professionals upskilling (Phase 2+)**

- Age 24–35
- Learning new tools, frameworks, or switching careers
- Need efficient, bite-sized learning with testing

**User personas:**

**Aryan, 19, Engineering student**
Learns React from YouTube but forgets within a week. Has no one to discuss doubts with. Wants a system that makes him retain what he studies.

**Priya, 22, Design student**
Knows Figma deeply. Wants to learn Python. Would trade her Figma knowledge for Python lessons from someone in her college.

**Rohan, 17, Self-taught developer**
Studies alone every day. Has no community. Wants to see others progressing and feel part of something.

---

## 5. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React)                       │
│  Dashboard │ Focus Session │ Notes │ AI Test │ Community│
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (HTTP/JSON)
┌──────────────────────▼──────────────────────────────────┐
│               BACKEND (Node.js + Express)               │
│  Auth │ Sessions │ Notes │ AI Test │ Feed │ Reflections │
└───────┬──────────┬───────────────┬────────────┬─────────┘
        │          │               │            │
   ┌────▼───┐ ┌────▼────┐   ┌─────▼─────┐ ┌───▼──────┐
   │MongoDB │ │AWS S3 / │   │HuggingFace│ │Cloudinary│
   │ Atlas  │ │Cloudinary│  │Inference  │ │(images)  │
   └────────┘ └─────────┘   └───────────┘ └──────────┘

┌─────────────────────────────────────────────────────────┐
│                  DEPLOYMENT                             │
│  Vercel (Frontend) │ Render (Backend) │ Atlas (DB)      │
└─────────────────────────────────────────────────────────┘
```

**Three-tier architecture:**

- **Presentation layer** — React SPA hosted on Vercel
- **Application layer** — Express REST API hosted on Render
- **Data layer** — MongoDB Atlas (structured data) + S3/Cloudinary (files)

---

## 6. Detailed Input Layer

### 6.1 User inputs

| Input | Source | Format | Used for |
|---|---|---|---|
| Skill selection | Dropdown / search | String | Session tagging, test generation |
| Focus session | Browser camera (MediaDevices API) | Video stream (local only) | Accountability, session tracking |
| Notes upload | File picker | PDF, PNG, JPG, plain text | AI test generation |
| Text notes | Rich text editor (Quill.js) | HTML / plain text | AI test generation |
| Open answer | Text input | String | AI grading |
| Doubt post | Text editor | String + optional image | Community feed |
| Weekly reflection | Text editor | Rich text | Archive + revision |

### 6.2 System inputs

| Input | Source | Used for |
|---|---|---|
| Extracted text from PDF | pdf-parse (Node.js) | Passed to HuggingFace |
| Extracted text from image | Tesseract.js (OCR) | Passed to HuggingFace |
| Session duration | Server timer | Progress tracking |
| User test scores over time | MongoDB aggregation | Revision suggestions |

---

## 7. Processing and Intelligence Modules

### 7.1 Focus session module

- Uses `navigator.mediaDevices.getUserMedia()` in the browser
- Camera stream is local only — never sent to server (privacy-first)
- Pomodoro timer (25 min focus / 5 min break) built in JavaScript
- On session end, a POST request logs: `{ userId, skillId, duration, date }`

### 7.2 Notes processing module

**PDF flow:**
```
User uploads PDF → Multer receives file → pdf-parse extracts text → 
text stored in Notes collection → passed to HuggingFace on test request
```

**Image flow:**
```
User uploads image → Multer receives file → Tesseract.js runs OCR → 
extracted text stored → passed to HuggingFace on test request
```

### 7.3 AI knowledge test module

**MCQ generation:**
```
Extracted notes text → HuggingFace Mistral-7B-Instruct →
Prompt: "Generate 5 multiple choice questions from the following notes. 
Return JSON: [{question, options:[A,B,C,D], answer}]"
→ Parse JSON response → Store questions → Render in UI
```

**Open answer grading:**
```
User answer + original question → HuggingFace Flan-T5-Large →
Prompt: "Question: {q}. Correct answer context: {notes}. 
Student answer: {a}. Grade 0-10 and give feedback."
→ Return score + feedback → Store in Tests collection
```

### 7.4 Revision suggestion module

- Runs weekly via a cron job (node-cron)
- Aggregates test scores per skill per user
- Identifies skills where average score < 60%
- Sends a notification: "You scored low on React Hooks last week. Time to revise."

### 7.5 Community feed module

- Every completed session auto-generates a feed event: `"Aryan completed a 45-min session on React Hooks"`
- Users can post doubts (text + optional image)
- Other users can reply to doubts
- Likes on posts (optimistic UI update)

---

## 8. Memory and Data Management

### 8.1 Session state (client)

- Managed with **Zustand** (lightweight, no boilerplate)
- Stores: current user, active session, test state, feed pagination

### 8.2 Persistent data (MongoDB)

All user learning history, notes, test scores, reflections, and feed posts are stored permanently in MongoDB Atlas. Schema details in Section 13.

### 8.3 File storage

- PDFs → AWS S3 (permanent, private per user)
- Images (notes, profile photos) → Cloudinary (auto-optimized CDN)
- Extracted text → Stored in MongoDB (for re-testing without re-upload)

### 8.4 Caching

- HuggingFace responses cached per `noteId` (Redis in Phase 2, in-memory Map for MVP)
- This prevents regenerating the same quiz when a user retakes a test

---

## 9. Output and User Experience

### 9.1 Dashboard

- Weekly XP bar (based on session minutes + test scores)
- Active streak counter (days studied consecutively)
- "Your skills" grid — each skill shows last session date + average test score
- Weekly reflection prompt (appears every Monday)

### 9.2 Focus session screen

- Full-screen focus mode with camera preview (small, bottom corner)
- Pomodoro timer with start/pause/end
- Skill name displayed prominently
- On end: summary card (duration, skill) + CTA to upload notes

### 9.3 AI test screen

- Section 1: 5 MCQs (radio buttons, immediate feedback on submit)
- Section 2: 2–3 open answer questions (text area, AI grades on submit)
- Score summary: total score, per-question breakdown, AI feedback per open answer
- "Weak areas" highlighted for revision

### 9.4 Community feed

- Infinite scroll activity stream
- Filter by: all / doubts / completions / reflections
- Reply thread on doubts (2 levels deep)
- User card on hover: skills they're learning, streak, recent completions

### 9.5 Weekly reflection

- Prompted every Monday via in-app notification
- Simple rich text editor: "What did you learn this week?"
- Past reflections shown in a timeline view
- AI summary of the week generated from test scores + sessions (optional)

---

## 10. Frontend Architecture

### 10.1 Tech stack

- **React 18** with functional components and hooks
- **React Router v6** for client-side routing
- **Zustand** for global state management
- **TailwindCSS** for styling
- **Axios** for HTTP requests
- **Quill.js** for rich text editing
- **React Webcam** for camera access in focus sessions

### 10.2 Folder structure

```
src/
│
├── app/
│   ├── router.jsx
│   ├── providers.jsx
│   └── App.jsx
│
├── features/
│   │
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   │
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   └── store/
│   │       └── authStore.js
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── XPCard.jsx
│   │   │   ├── StreakCard.jsx
│   │   │   └── SkillGrid.jsx
│   │   │
│   │   └── services/
│   │       └── dashboard.service.js
│   │
│   ├── sessions/
│   │   ├── pages/
│   │   │   └── SessionPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── FocusTimer.jsx
│   │   │   ├── CameraView.jsx
│   │   │   └── SessionSummary.jsx
│   │   │
│   │   ├── services/
│   │   │   └── session.service.js
│   │   │
│   │   └── store/
│   │       └── sessionStore.js
│   │
│   ├── notes/
│   ├── tests/
│   ├── feed/
│   ├── profile/
│   └── reflections/
│
├── shared/
│   │
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Loader.jsx
│   │   └── Navbar.jsx
│   │
│   ├── layouts/
│   │   └── AppShell.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   └── useLocalStorage.js
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   └── assets/
│
├── context/
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
│
├── styles/
│   └── global.css
│
└── main.jsx
```

### 10.3 Routing

```
/                   → Landing page
/dashboard          → Protected: user dashboard
/session/:skillId   → Protected: focus session
/notes/:skillId     → Protected: upload / view notes
/test/:noteId       → Protected: AI knowledge test
/feed               → Protected: community feed
/reflect            → Protected: weekly reflection
/profile/:userId    → Public: user profile
/login              → Auth
/register           → Auth
```

---

## 11. Backend Architecture

### 11.1 Tech stack

- **Node.js** runtime
- **Express.js** REST API framework
- **Mongoose** ODM for MongoDB
- **Multer** for file upload handling
- **pdf-parse** for PDF text extraction
- **Tesseract.js** for image OCR
- **node-cron** for scheduled jobs
- **jsonwebtoken** + **bcryptjs** for auth
- **dotenv** for environment config
- **cors** + **helmet** for security middleware

### 11.2 Folder structure

```
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── env.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.model.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.routes.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── sessions/
│   │   │   ├── session.controller.js
│   │   │   ├── session.service.js
│   │   │   ├── session.routes.js
│   │   │   └── session.model.js
│   │   │
│   │   ├── notes/
│   │   │   ├── notes.controller.js
│   │   │   ├── notes.service.js
│   │   │   ├── notes.routes.js
│   │   │   └── notes.model.js
│   │   │
│   │   ├── tests/
│   │   │   ├── test.controller.js
│   │   │   ├── test.service.js
│   │   │   ├── test.routes.js
│   │   │   └── test.model.js
│   │   │
│   │   ├── feed/
│   │   │   ├── feed.controller.js
│   │   │   ├── feed.service.js
│   │   │   ├── feed.routes.js
│   │   │   └── feed.model.js
│   │   │
│   │   └── reflections/
│   │       ├── reflection.controller.js
│   │       ├── reflection.service.js
│   │       ├── reflection.routes.js
│   │       └── reflection.model.js
│   │
│   ├── services/
│   │   ├── huggingface.service.js
│   │   ├── ocr.service.js
│   │   ├── storage.service.js
│   │   └── cron.service.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── jwt.js
│   │   └── constants.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
│
├── tests/
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

### 11.3 API endpoints

**Auth**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/auth/me
POST   /api/auth/logout
```

**Sessions**
```
POST   /api/sessions/start
PATCH  /api/sessions/:id/end
GET    /api/sessions/user/:userId
GET    /api/sessions/stats/:userId
```

**Notes**
```
POST   /api/notes/upload          (multipart/form-data)
POST   /api/notes/text            (raw text note)
GET    /api/notes/:skillId
DELETE /api/notes/:noteId
```

**AI Tests**
```
POST   /api/tests/generate/:noteId   (calls HuggingFace, stores questions)
POST   /api/tests/submit/:testId     (submit answers, get score)
GET    /api/tests/history/:userId
GET    /api/tests/weak-areas/:userId
```

**Community Feed**
```
GET    /api/feed?page=1&filter=all
POST   /api/feed/post
POST   /api/feed/:postId/reply
POST   /api/feed/:postId/like
DELETE /api/feed/:postId
```

**Reflections**
```
POST   /api/reflections
GET    /api/reflections/:userId
GET    /api/reflections/week/:weekNumber
```

---

## 12. AI/ML Model Architecture

### 12.1 HuggingFace Inference API

All AI features use the HuggingFace free-tier Inference API. No model training or fine-tuning required for MVP.

### 12.2 MCQ generation

| Property | Value |
|---|---|
| Model | `mistralai/Mistral-7B-Instruct-v0.2` |
| Task | Text generation |
| Input | Extracted notes text (max 2000 tokens) |
| Prompt format | Instruction-following with JSON output spec |
| Output | JSON array of 5 MCQ objects |

**Prompt template:**
```
[INST] You are a quiz generator. Based on the following study notes, generate exactly 5 multiple choice questions.

Return ONLY a valid JSON array in this format:
[{"question":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A"}]

Notes:
{extracted_text}
[/INST]
```

### 12.3 Open answer grading

| Property | Value |
|---|---|
| Model | `google/flan-t5-large` |
| Task | Text-to-text generation |
| Input | Question + notes context + student answer |
| Output | Score (0–10) + one-line feedback |

**Prompt template:**
```
Grade this student answer from 0 to 10.
Question: {question}
Key concepts from notes: {context}
Student answer: {student_answer}
Return format: Score: X/10. Feedback: {one sentence}
```

### 12.4 Error handling for AI

- HuggingFace free tier has rate limits and cold start delays
- Implement retry logic (3 attempts, 2s delay between)
- If HuggingFace is unavailable, return a graceful error: "AI test temporarily unavailable, try again in a moment"
- Cache generated questions per `noteId` to avoid re-calling the API

### 12.5 Phase 2 AI upgrades

- Switch to `claude-haiku` via Anthropic API for more reliable grading
- Add semantic similarity scoring for open answers (sentence-transformers)
- Generate personalized revision plans from aggregated weak areas

---

## 13. Database and Storage Design

### 13.1 MongoDB schemas

**User**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  avatar: String (URL),
  skills: [{ skillName: String, level: String }],
  xp: Number (default 0),
  streak: { current: Number, longest: Number, lastStudied: Date },
  isPublic: Boolean (default true),
  createdAt: Date
}
```

**Session**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  skillName: String,
  duration: Number (minutes),
  focusScore: Number (optional, from Pomodoro completion %),
  date: Date,
  noteUploaded: Boolean (default false)
}
```

**Note**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  skillName: String,
  sessionId: ObjectId (ref: Session),
  fileUrl: String (S3 / Cloudinary URL),
  fileType: String (pdf | image | text),
  extractedText: String,
  title: String,
  createdAt: Date
}
```

**Test**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  noteId: ObjectId (ref: Note),
  skillName: String,
  questions: [{
    question: String,
    type: String (mcq | open),
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    score: Number,
    feedback: String
  }],
  totalScore: Number,
  maxScore: Number,
  completedAt: Date
}
```

**FeedPost**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (completion | doubt | reflection_share),
  content: String,
  skillName: String,
  imageUrl: String,
  likes: [ObjectId],
  replies: [{
    userId: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

**Reflection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  weekNumber: Number,
  year: Number,
  content: String (rich text),
  skillsCovered: [String],
  aiSummary: String (optional),
  createdAt: Date
}
```

### 13.2 File storage

| File type | Storage | Reason |
|---|---|---|
| PDFs | AWS S3 | Large files, private per user, cheap at scale |
| Images (notes) | Cloudinary | Auto-resize, CDN, fast delivery |
| Profile photos | Cloudinary | Same as above |
| Extracted text | MongoDB | Fast retrieval, queryable |

---

## 14. API and Service Flow

### 14.1 Complete test generation flow

```
1. User clicks "Generate Test" on a note
2. Frontend: POST /api/tests/generate/:noteId
3. authMiddleware verifies JWT
4. testController fetches note from DB
5. If extractedText exists → skip extraction
6. If not → ocrService extracts text from file
7. huggingfaceService.generateMCQ(text) called
   → Mistral-7B prompt sent to HuggingFace
   → Response parsed to JSON
8. huggingfaceService.generateOpenQuestions(text) called
   → Flan-T5 generates 2 open questions
9. Test document created in MongoDB (status: pending)
10. Questions returned to frontend
11. Frontend renders test UI
12. User submits answers → POST /api/tests/submit/:testId
13. MCQ answers scored locally (correct/incorrect)
14. Open answers sent to huggingfaceService.gradeAnswer()
15. Final scores calculated, stored in DB
16. Session XP updated on User document
17. Feed event created: "Aryan scored 80% on React Hooks"
18. Score + feedback returned to frontend
```

### 14.2 Focus session flow

```
1. User clicks "Start Session" for a skill
2. Frontend: POST /api/sessions/start { skillName }
3. Session document created in DB (no duration yet)
4. Camera turned on locally (never sent to server)
5. Pomodoro timer starts in browser
6. On "End Session": PATCH /api/sessions/:id/end { duration }
7. Session updated in DB with duration
8. XP awarded: +1 XP per minute studied
9. Streak updated on User document
10. CTA shown: "Upload your notes to unlock AI test"
```

---

## 15. Security, Privacy, and Ethical Considerations

### 15.1 Authentication security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT access tokens expire in 15 minutes
- Refresh tokens stored in HTTP-only cookies (7 day expiry)
- Google OAuth via Passport.js (Phase 1)
- Rate limiting on auth endpoints: 5 attempts per 15 minutes (express-rate-limit)

### 15.2 API security

- All routes protected by `authMiddleware` (except /register, /login, /public-profile)
- Input validation with `express-validator` on all POST/PATCH routes
- Helmet.js sets security headers
- CORS restricted to frontend domain only
- File upload limits: 10MB max, allowed types: pdf/png/jpg only

### 15.3 Privacy — camera data

- Camera stream is processed entirely in the browser using MediaDevices API
- No video frames are ever sent to the server
- This must be clearly communicated to users in onboarding
- Camera permission is optional — users can run focus sessions without it

### 15.4 User-generated content

- Doubt posts and reflections are user-generated
- Basic profanity filter on post submission (bad-words npm package)
- Report button on feed posts (stores report, reviewed manually at scale)
- Users can delete their own posts and notes at any time

### 15.5 Data ownership

- Users can export all their data (notes, test history, reflections) as JSON
- Users can delete their account and all associated data
- Notes uploaded to S3/Cloudinary are deleted when a note is deleted

### 15.6 AI ethics

- AI-generated quiz questions may occasionally be inaccurate — users are informed of this
- AI grading of open answers is explicitly labelled "AI feedback" not "official score"
- No user data is sent to third-party AI services for training purposes

---

## 16. Development Roadmap and Phase Planning

### Phase 0 — Foundation (Week 1)

**Objective:** Working skeleton with auth and database.

- Set up monorepo: `/client` (React) + `/server` (Express)
- Configure MongoDB Atlas, connect with Mongoose
- Implement User model + auth (register, login, JWT)
- Google OAuth setup
- Base React routing with protected routes
- Zustand auth store
- Deploy backend to Render, frontend to Vercel (CI/CD via GitHub Actions)

**Expected outcome:** Users can register, log in, and see an empty dashboard.

---

### Phase 1 — Solo learning loop (Weeks 2–4)

**Objective:** Core learning loop fully functional end to end.

**Week 2 — Sessions + Notes**
- Session model + start/end API
- Focus session UI (camera, Pomodoro timer)
- Multer file upload (PDF + image)
- pdf-parse + Tesseract.js OCR
- Notes storage (S3 + MongoDB)

**Week 3 — AI Tests**
- HuggingFace service (MCQ + open answer generation)
- Test model + generate/submit APIs
- MCQ UI + open answer UI
- Score display + feedback card
- XP + streak system

**Week 4 — Reflections + Dashboard**
- Weekly reflection editor + API
- Reflection timeline view
- Dashboard: streak, XP bar, skills grid, recent sessions
- node-cron weekly reminder job

**Expected outcome:** A user can study, upload notes, get AI-tested, and write weekly reflections. Full loop works.

---

### Phase 2 — Community (Weeks 5–6)

**Objective:** Add the social accountability layer.

- Feed model + CRUD API
- Auto-generate feed events on session complete + test complete
- Community feed UI (infinite scroll, filters)
- Doubt posting + reply threads
- Like system
- Public user profiles
- Follow/unfollow (optional)
- In-app notifications (new reply on your doubt, someone followed you)

**Expected outcome:** Users can see each other's progress, post doubts, and get replies.

---

### Phase 3 — Skill Swap (Weeks 7–10)

**Objective:** The core differentiator — peer-to-peer teaching.

- Skill swap profile: "I can teach X, I want to learn Y"
- Matching algorithm (simple: find users where their teach = your learn, and vice versa)
- Swap request system (accept / decline)
- Scheduling (pick a time slot)
- WebRTC peer-to-peer video (for live sessions)
- Socket.io real-time chat (for text-based sessions)
- Session notes: both parties upload notes after session
- Rating system (1–5 stars after each swap)

**Expected outcome:** Users can match with each other, schedule sessions, teach live, and rate each other.

---

### Phase 4 — Scale and Polish (Ongoing)

- Redis caching for HuggingFace responses and feed queries
- Push notifications (PWA)
- Mobile-responsive UI audit
- Analytics dashboard (admin)
- Upgrade HuggingFace to paid tier or switch to Anthropic Claude API
- Performance monitoring (Sentry + Datadog)

---

## 17. Evaluation Methodology

### 17.1 Product metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Daily Active Users (DAU) | 500+ |
| Sessions per user per week | 3+ |
| AI test completion rate | > 70% of uploaded notes |
| Weekly reflection submission rate | > 40% of active users |
| Doubt reply rate | > 60% of doubts get at least 1 reply |

### 17.2 AI quality metrics

| Metric | Method |
|---|---|
| MCQ question relevance | Manual review of 100 generated tests |
| Open answer grading accuracy | Compare AI grade vs human grade on 50 answers |
| OCR accuracy | Test on 20 handwritten + 20 printed notes |
| HuggingFace uptime | Monitor via UptimeRobot |

### 17.3 Technical metrics

| Metric | Target |
|---|---|
| API response time (p95) | < 500ms for non-AI endpoints |
| AI test generation time | < 8 seconds |
| Frontend Lighthouse score | > 85 |
| Test coverage | > 60% backend unit tests |

---

## 18. Future Improvements

### Short term (3–6 months)

- Mobile app (React Native — reuse existing API)
- Offline mode (cache notes and test questions in IndexedDB)
- Voice notes (upload audio, transcribe via Whisper API)
- AI revision plan: "Based on your weak areas, study these topics this week"
- Leaderboard (weekly XP rankings among friends)

### Medium term (6–12 months)

- Institution accounts (schools/colleges can create private SkillSwap communities)
- Verified teacher badges (users with high ratings in a skill)
- Skill certificates (auto-generated PDF certificate after passing test at 90%+)
- Paid skill sessions (teachers can charge for 1-on-1 swap sessions — Razorpay/Stripe)
- API for educators to embed SkillSwap testing into their own platforms

### Long term (12+ months)

- AI tutor (context-aware assistant that knows your notes, weak areas, and history)
- AR/VR sessions (immersive skill learning for practical skills)
- Skill graph (knowledge map showing how your skills connect and grow)
- Enterprise version for corporate training

---

## 19. Complete Technology Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| React Router | v6 | Client routing |
| Zustand | latest | State management |
| TailwindCSS | 3 | Styling |
| Axios | latest | HTTP requests |
| Quill.js | latest | Rich text editor |
| React Webcam | latest | Camera access |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express.js | 4 | REST API |
| Mongoose | 8 | MongoDB ODM |
| Multer | latest | File upload |
| pdf-parse | latest | PDF text extraction |
| Tesseract.js | 5 | Image OCR |
| jsonwebtoken | latest | JWT auth |
| bcryptjs | latest | Password hashing |
| node-cron | latest | Scheduled jobs |
| helmet | latest | Security headers |
| cors | latest | CORS middleware |
| express-rate-limit | latest | Rate limiting |
| bad-words | latest | Content moderation |

### AI / ML
| Tool | Purpose |
|---|---|
| HuggingFace Inference API | MCQ generation, open answer grading |
| Mistral-7B-Instruct-v0.2 | MCQ question generation |
| google/flan-t5-large | Open answer grading |
| Tesseract.js | Handwritten note OCR |

### Database and Storage
| Tool | Purpose |
|---|---|
| MongoDB Atlas | Primary database (M0 free → M10 on scale) |
| AWS S3 | PDF storage |
| Cloudinary | Image storage + CDN |

### DevOps and Deployment
| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting + CDN + auto-deploy |
| Render | Backend hosting (free tier → paid on scale) |
| GitHub Actions | CI/CD pipeline |
| MongoDB Atlas | Database hosting + backups |
| HuggingFace | AI API hosting (free → PRO on scale) |
| UptimeRobot | Uptime monitoring |

### Phase 2 additions
| Tool | Purpose |
|---|---|
| Socket.io | Real-time chat |
| WebRTC (simple-peer) | Peer-to-peer video sessions |
| Redis (Upstash) | Caching HuggingFace responses + sessions |
| Passport.js | Google OAuth |

---

## 20. Project Vision and Long-Term Direction

SkillSwap starts as a student learning tool, but the vision is much larger.

**The core insight is this:** Every person on earth knows something that someone else wants to learn. Universities charge lakhs for knowledge that exists freely in people's heads. SkillSwap is the infrastructure for that exchange.

In 5 years, SkillSwap should be the platform where:
- A 17-year-old in Jaipur learns machine learning from a 22-year-old in Bengaluru
- A working professional teaches accounting on weekends in exchange for learning design
- Schools use SkillSwap to let students peer-teach each other (proven to be the most effective learning method)
- Employers look at a candidate's SkillSwap profile the same way they look at a GitHub profile

The AI layer is what makes this different from every other community platform. The learning loop — study, get tested by AI, reflect, revise — creates compounding retention. The community layer creates compounding motivation. Together, they create something no existing platform has: **a place where learning is both effective and social.**

This is not another EdTech product. This is the infrastructure for human knowledge exchange.

---

*Document version 1.0 · Built with MERN + HuggingFace · Prepared for GitHub, portfolio showcase, and deployment*

---

#### Work Completed So Far :
- [*] Basic Frontend Setup, with simple react, dummy data, and hardcoded links
- [*] Updated the Backend, it now house the follwing :
  -  User model with bcrypt password hashing
  - JWT access token (15m) + refresh token (7d) in HTTP-only cookie
  - Register, login, logout, refresh, getMe endpoints
  - Email verification via Resend (dev override to project email)
  - Resend verification endpoint
  - Rate limiting on auth routes (5 req/15min)
  - Input validation with express-validator
  - Global error handler with ApiError
  - asyncHandler wrapper
  
  