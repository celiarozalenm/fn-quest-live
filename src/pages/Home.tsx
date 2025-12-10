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
    <div
      className="min-h-screen w-full flex flex-col items-center justify-end pb-16"
      style={{
        backgroundImage: 'url(/quest-logo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="text-center">
        <p className="text-white mb-10">Login / Register with:</p>
        <div className="flex flex-col sm:flex-row gap-8">
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
