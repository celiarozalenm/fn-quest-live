import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Award } from 'lucide-react'

// Mock leaderboard data
const mockLeaderboard = [
  { initials: 'JDO', time_seconds: 45, rank: 1 },
  { initials: 'SAM', time_seconds: 52, rank: 2 },
  { initials: 'MAX', time_seconds: 68, rank: 3 },
  { initials: 'ANA', time_seconds: 75, rank: 4 },
  { initials: 'BOB', time_seconds: 89, rank: 5 },
]

export default function Leaderboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { questId: _questId, levelId: _levelId } = location.state || {}

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 text-center font-bold text-gray-500">{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <p className="text-sm text-gray-400">Quest 1 - Level 1</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockLeaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.rank <= 3
                      ? 'bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30'
                      : 'bg-[hsl(var(--secondary))]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <span className="font-mono text-xl font-bold tracking-widest">
                      {entry.initials}
                    </span>
                  </div>
                  <span className="font-mono text-lg">
                    {formatTime(entry.time_seconds)}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => navigate('/quests')}
            >
              Back to Quests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
