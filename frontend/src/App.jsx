// ═══════════════════════════════════════════════
// SKILLSHARE – APP ROUTER
// ═══════════════════════════════════════════════

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ToastProvider } from './lib/ToastContext'

import LandingPage  from './pages/LandingPage'
import AuthPage     from './pages/AuthPage'
import SetupPage    from './pages/SetupPage'
import DashboardPage from './pages/DashboardPage'
import LearnPage    from './pages/LearnPage'
import WatchPage    from './pages/WatchPage'
import TeachPage    from './pages/TeachPage'
import PeersPage    from './pages/PeersPage'
import ProfilePage  from './pages/ProfilePage'
import AppShell     from './components/AppShell'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/"     element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/setup" element={<SetupPage />} />

          {/* Protected – wrapped in sidebar shell */}
          <Route path="/app" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index              element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="learn"      element={<LearnPage />} />
            <Route path="watch/:id"  element={<WatchPage />} />
            <Route path="teach"      element={<TeachPage />} />
            <Route path="peers"      element={<PeersPage />} />
            <Route path="profile"    element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
