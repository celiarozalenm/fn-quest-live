import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { Trophy } from 'lucide-react'

export default function EnterInitials() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email } = useAuth()
  const [initials, setInitials] = useState('')

  const { time, hintsUsed, questId, levelId } = location.state || {}

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (initials.length !== 3) return

    // TODO: Save to Supabase
    console.log('Saving result:', {
      email,
      questId,
      levelId,
      initials: initials.toUpperCase(),
      time_seconds: time,
      hints_used: hintsUsed,
      eligible_for_leaderboard: true
    })

    navigate('/leaderboard', {
      state: { questId, levelId }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] p-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-2xl">Quest Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-4xl font-mono font-bold text-[hsl(var(--primary))] mb-6">
            {formatTime(time || 0)}
          </p>

          <p className="text-gray-400 mb-6">
            Enter your 3-letter initials for the leaderboard
          </p>

          <div className="flex justify-center gap-2 mb-6">
            <Input
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              className="text-center text-2xl font-mono w-32 tracking-widest"
              placeholder="ABC"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={initials.length !== 3}
            className="w-full"
          >
            Submit to Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
