import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Quest Live pages
import Landing from '@/pages/Landing'
import Callback from '@/pages/Callback'
import Register from '@/pages/Register'
import Confirmation from '@/pages/Confirmation'
import AdminLive from '@/pages/AdminLive'
import Lobby from '@/pages/Lobby'
import Race from '@/pages/Race'
import Results from '@/pages/Results'

// Legacy Quest pages (kept for admin)
import Admin from '@/pages/Admin'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--fn-blue-dark)]">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Quest Live Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/callback" element={<Callback />} />
      <Route
        path="/register"
        element={
          <ProtectedRoute>
            <Register />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirmation"
        element={
          <ProtectedRoute>
            <Confirmation />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLive />} />
      <Route path="/admin-legacy" element={<Admin />} />

      {/* Game Routes (public for spectators) */}
      <Route path="/lobby/:sessionId" element={<Lobby />} />
      <Route path="/race/:sessionId" element={<Race />} />
      <Route path="/results/:sessionId" element={<Results />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
