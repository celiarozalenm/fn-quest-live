import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const handleMockLogin = (type: 'employee' | 'community') => {
    const mockEmail = type === 'employee'
      ? 'employee@forwardnetworks.com'
      : 'user@community.com'
    login(mockEmail, type)
    navigate('/quests')
  }

  if (isAuthenticated) {
    navigate('/quests')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a2744] to-[#0f1829] p-4">
      <div className="mb-8">
        <img
          src="/quest-logo.png"
          alt="Forward Quest"
          className="max-w-[600px] w-full h-auto"
        />
      </div>

      <div className="text-center">
        <p className="text-gray-400 mb-6">Login / Register with:</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="btn-primary-lg"
            onClick={() => handleMockLogin('community')}
          >
            Forward Community Login
          </button>
          <button
            className="btn-primary-lg"
            onClick={() => handleMockLogin('employee')}
          >
            Forward Employee Login
          </button>
        </div>
      </div>
    </div>
  )
}
