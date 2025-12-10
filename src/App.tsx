import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Home from '@/pages/Home'
import QuestList from '@/pages/QuestList'
import QuestDetail from '@/pages/QuestDetail'
import QuestPlay from '@/pages/QuestPlay'
import EnterInitials from '@/pages/EnterInitials'
import Leaderboard from '@/pages/Leaderboard'
import Admin from '@/pages/Admin'
import Profile from '@/pages/Profile'
import Rules from '@/pages/Rules'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/quests"
        element={
          <ProtectedRoute>
            <QuestList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quest/:questId"
        element={
          <ProtectedRoute>
            <QuestDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quest/:questId/level/:levelId"
        element={
          <ProtectedRoute>
            <QuestPlay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enter-initials"
        element={
          <ProtectedRoute>
            <EnterInitials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Admin />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rules"
        element={
          <ProtectedRoute>
            <Rules />
          </ProtectedRoute>
        }
      />
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
