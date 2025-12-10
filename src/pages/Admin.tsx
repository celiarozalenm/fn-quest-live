import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, LogOut } from 'lucide-react'

const ADMIN_SESSION_KEY = 'fn_quest_admin_session'

// Mock data for development
const mockQuests = [
  {
    id: '1',
    name: 'Quest 1',
    title: 'Network Fundamentals',
    is_active: true,
    levels: [
      {
        id: 'l1',
        level_number: 1,
        challenges: [
          { id: 'c1', question: 'What command shows routing table?', order: 1 }
        ]
      }
    ]
  }
]

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validUsername = import.meta.env.VITE_ADMIN_USERNAME
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (username === validUsername && password === validPassword) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true')
      onLogin()
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] flex flex-col items-center justify-center p-4">
      <img src="/logo_fn.svg" alt="Forward Networks" className="w-48 mb-8" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <div className="flex gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Quest
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {mockQuests.map((quest) => (
            <Card key={quest.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
              >
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {expandedQuest === quest.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span>{quest.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      quest.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {quest.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              {expandedQuest === quest.id && (
                <CardContent>
                  <div className="border-l-2 border-[hsl(var(--border))] pl-4 ml-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Levels</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Level
                      </Button>
                    </div>

                    {quest.levels.map((level) => (
                      <Card key={level.id} className="mb-4">
                        <CardHeader
                          className="cursor-pointer py-3"
                          onClick={() => setExpandedLevel(
                            expandedLevel === level.id ? null : level.id
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {expandedLevel === level.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span>Level {level.level_number}</span>
                              <span className="text-xs text-gray-400">
                                ({level.challenges.length} challenges)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedLevel === level.id && (
                          <CardContent className="py-2">
                            <div className="border-l-2 border-[hsl(var(--border))] pl-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-semibold">Challenges</h4>
                                <Button variant="outline" size="sm">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Challenge
                                </Button>
                              </div>

                              {level.challenges.map((challenge) => (
                                <div
                                  key={challenge.id}
                                  className="flex justify-between items-center p-3 bg-[hsl(var(--secondary))] rounded mb-2"
                                >
                                  <span className="text-sm">{challenge.question}</span>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (session === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminPanel onLogout={handleLogout} />
}
