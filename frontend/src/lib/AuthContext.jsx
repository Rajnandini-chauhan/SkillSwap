import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from './authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // checkingSession is true only during the initial silent-restore attempt
  // on app load — used to avoid flashing the /auth page before we know.
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    authApi.restoreSession()
      .then(restoredUser => setUser(restoredUser))
      .finally(() => setCheckingSession(false))
  }, [])

  async function login(credentials) {
    const loggedInUser = await authApi.login(credentials)
    setUser(loggedInUser)
    return loggedInUser
  }

  async function register(details) {
    return authApi.register(details)
  }

  async function logout() {
    await authApi.logout()
    setUser(null)
  }

  function updateUser(updates) {
    setUser(prev => ({ ...prev, ...updates }))
  }

  // Called by VerifyEmailPage after a successful token verification, so the
  // user doesn't have to manually log in right after verifying.
  async function refreshUser() {
    try {
      const refreshedUser = await authApi.getMe()
      setUser(refreshedUser)
      return refreshedUser
    } catch {
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, checkingSession, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }