import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { validateToken } from '@/api/bubble'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  handleCallback: (token: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || 'userauth.forwardnetworks.com'
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || ''
const AUTH0_REDIRECT_URI =
  import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/callback`

// Use Bubble gateway as fallback if Auth0 redirect not configured
const USE_BUBBLE_GATEWAY = import.meta.env.VITE_USE_BUBBLE_GATEWAY === 'true'
const BUBBLE_GATEWAY_URL = import.meta.env.VITE_BUBBLE_GATEWAY_URL || 'https://quest.fwd.app/auth-gateway'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('fn_quest_live_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('fn_quest_live_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = () => {
    if (USE_BUBBLE_GATEWAY) {
      // Option B: Use Bubble as OAuth gateway
      const returnUrl = encodeURIComponent(AUTH0_REDIRECT_URI)
      window.location.href = `${BUBBLE_GATEWAY_URL}?return_url=${returnUrl}`
    } else {
      // Option A: Direct Auth0 redirect
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: AUTH0_CLIENT_ID,
        redirect_uri: AUTH0_REDIRECT_URI,
        scope: 'openid profile email',
      })
      window.location.href = `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fn_quest_live_user')
    localStorage.removeItem('fn_quest_live_token')
  }

  const handleCallback = async (emailOrToken: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Check if it's an email (contains @) or a token
      if (emailOrToken.includes('@')) {
        // Direct email from Bubble gateway
        const newUser = {
          email: emailOrToken,
          name: emailOrToken.split('@')[0],
        }
        setUser(newUser)
        localStorage.setItem('fn_quest_live_user', JSON.stringify(newUser))
        return true
      }

      // Validate token with Bubble backend (legacy flow)
      const result = await validateToken(emailOrToken)

      if (result.valid && result.email) {
        const newUser = {
          email: result.email,
          name: result.name || result.email.split('@')[0],
        }
        setUser(newUser)
        localStorage.setItem('fn_quest_live_user', JSON.stringify(newUser))
        localStorage.setItem('fn_quest_live_token', emailOrToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Auth callback error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
