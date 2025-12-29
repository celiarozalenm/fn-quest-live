import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/register')
    }
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--fn-blue-dark)]">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      <div className="text-center max-w-2xl px-8">
        {/* Logo */}
        <img
          src="/logo_fn.svg"
          alt="Forward Networks"
          className="w-48 mx-auto mb-8"
        />

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Quest <span className="text-[var(--fn-green)]">Live</span>
        </h1>

        {/* Event Info */}
        <p className="text-xl text-gray-300 mb-2">
          Head-to-Head Competition Experience
        </p>
        <p className="text-lg text-[var(--fn-blue-light)] mb-12">
          Cisco Live EMEA | Amsterdam | February 9-12, 2025
        </p>

        {/* Description */}
        <p className="text-gray-300 mb-12 leading-relaxed">
          Race against other players in real-time challenges at the Forward Networks booth.
          Compete for prizes and claim your spot on the leaderboard!
        </p>

        {/* Login Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            className="btn-primary-lg"
            onClick={login}
          >
            Login with Forward Community
          </button>
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <a
              href="https://community.forwardnetworks.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--fn-green)] hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-gray-500 text-sm">
        Powered by Forward Networks
      </div>
    </div>
  )
}
