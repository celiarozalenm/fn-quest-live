import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextType {
  email: string | null
  userType: 'employee' | 'community' | null
  isAuthenticated: boolean
  login: (email: string, type: 'employee' | 'community') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)
  const [userType, setUserType] = useState<'employee' | 'community' | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const storedEmail = localStorage.getItem('fn_quest_email')
    const storedType = localStorage.getItem('fn_quest_user_type') as 'employee' | 'community' | null
    if (storedEmail && storedType) {
      setEmail(storedEmail)
      setUserType(storedType)
    }
  }, [])

  const login = (email: string, type: 'employee' | 'community') => {
    setEmail(email)
    setUserType(type)
    localStorage.setItem('fn_quest_email', email)
    localStorage.setItem('fn_quest_user_type', type)
  }

  const logout = () => {
    setEmail(null)
    setUserType(null)
    localStorage.removeItem('fn_quest_email')
    localStorage.removeItem('fn_quest_user_type')
  }

  return (
    <AuthContext.Provider value={{
      email,
      userType,
      isAuthenticated: !!email,
      login,
      logout
    }}>
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
