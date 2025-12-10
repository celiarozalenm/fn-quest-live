import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronRight, LogOut } from 'lucide-react'

// Mock data - will be replaced with Supabase data
const mockQuests = [
  {
    id: '1',
    name: 'Quest 1',
    title: 'Network Fundamentals',
    mission: 'Master the basics of network configuration',
    is_active: true,
    levels: [
      { id: 'l1', level_number: 1 },
      { id: 'l2', level_number: 2 },
    ]
  },
  {
    id: '2',
    name: 'Quest 2',
    title: 'Advanced Routing',
    mission: 'Deep dive into routing protocols',
    is_active: false,
    levels: []
  }
]

export default function QuestList() {
  const navigate = useNavigate()
  const { email, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Forward Quest</h1>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quest Grid */}
        <div className="grid gap-4">
          {mockQuests.map((quest) => (
            <Card
              key={quest.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${
                !quest.is_active ? 'opacity-50' : ''
              }`}
              onClick={() => quest.is_active && navigate(`/quest/${quest.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{quest.title}</span>
                  {quest.is_active && <ChevronRight className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-2">{quest.mission}</p>
                <div className="flex gap-2">
                  {quest.levels.map((level) => (
                    <span
                      key={level.id}
                      className="px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs rounded-full"
                    >
                      Level {level.level_number}
                    </span>
                  ))}
                </div>
                {!quest.is_active && (
                  <p className="text-xs text-yellow-500 mt-2">Coming soon</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
