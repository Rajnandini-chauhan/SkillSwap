import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ToastProvider } from './lib/ToastContext'
import { ThemeProvider } from './lib/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import PageTransition from './components/PageTransition'

import LandingPage   from './components/LandingPage'
import AuthPage      from './features/auth/AuthPage'
import SetupPage     from './features/auth/SetupPage'
import DashboardPage from './features/dashboard/DashboardPage'
import LearnPage     from './features/learn/LearnPage'
import WatchPage     from './features/learn/WatchPage'
import TeachPage     from './features/teach/TeachPage'
import PeersPage     from './features/peers/PeersPage'
import ProfilePage   from './features/profile/ProfilePage'
import AppShell      from './components/AppShell'

// ProtectedRoute must live inside AuthProvider — fixed placement below.
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes() {
  const location = useLocation()
  // Only show the floating ThemeToggle on the landing page.
  // /auth has its own built-in ThemeToggle; /setup inherits global bg.
  const isLanding = location.pathname === '/'

  return (
    <>
      {isLanding && (
        <div className="fixed right-4 top-4 z-[100]">
          <ThemeToggle compact />
        </div>
      )}
      <Routes>
        {/* Public */}
        <Route path="/"     element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/setup" element={<PageTransition><SetupPage /></PageTransition>} />

        {/* Protected – wrapped in sidebar shell */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index             element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"  element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="learn"      element={<PageTransition><LearnPage /></PageTransition>} />
          <Route path="watch/:id"  element={<PageTransition><WatchPage /></PageTransition>} />
          <Route path="teach"      element={<PageTransition><TeachPage /></PageTransition>} />
          <Route path="peers"      element={<PageTransition><PeersPage /></PageTransition>} />
          <Route path="profile"    element={<PageTransition><ProfilePage /></PageTransition>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      {/*
        AuthProvider wraps everything so ProtectedRoute (which calls useAuth)
        always has access to the context — Bug Fix #1.
      */}
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}