import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  // Temporary mock login for development
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
      {/* Logo area */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">FORWARD</h1>
        <div className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
          QUEST
        </div>
      </div>

      {/* Login buttons */}
      <div className="text-center">
        <p className="text-gray-400 mb-6">Login / Register with:</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="min-w-[250px] bg-[#7cb342] hover:bg-[#689f38] text-white font-semibold py-6"
            onClick={() => handleMockLogin('community')}
          >
            Forward Community Login
          </Button>
          <Button
            size="lg"
            className="min-w-[250px] bg-[#7cb342] hover:bg-[#689f38] text-white font-semibold py-6"
            onClick={() => handleMockLogin('employee')}
          >
            Forward Employee Login
          </Button>
        </div>
      </div>

      {/* Dev note */}
      <p className="text-xs text-gray-500 mt-8">
        Development mode: Click buttons for mock login
      </p>
    </div>
  )
}
