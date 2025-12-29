import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Callback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    // Prevent double processing
    if (processedRef.current) return
    processedRef.current = true

    const processCallback = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError(searchParams.get('error_description') || 'Authentication failed')
        return
      }

      // Handle email from Bubble gateway (simple flow)
      if (email) {
        const success = await handleCallback(email)
        if (success) {
          navigate('/register', { replace: true })
        } else {
          setError('Failed to authenticate user')
        }
        return
      }

      // Handle token from Bubble gateway (legacy)
      if (token) {
        const success = await handleCallback(token)
        if (success) {
          navigate('/register', { replace: true })
        } else {
          setError('Failed to validate authentication token')
        }
        return
      }

      // Handle code from direct Auth0 redirect
      if (code) {
        setError('Direct Auth0 code exchange not implemented. Please use Bubble gateway.')
        return
      }

      setError('No authentication data received')
    }

    processCallback()
  }, [searchParams, handleCallback, navigate])

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--fn-blue-dark)]">
        <div className="text-center max-w-md px-8">
          <div className="text-red-500 text-6xl mb-4">!</div>
          <h1 className="text-2xl text-white mb-4">Authentication Error</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            className="btn-primary-md"
            onClick={() => navigate('/', { replace: true })}
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--fn-blue-dark)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--fn-green)] mx-auto mb-4"></div>
        <p className="text-white text-xl">Completing authentication...</p>
      </div>
    </div>
  )
}
