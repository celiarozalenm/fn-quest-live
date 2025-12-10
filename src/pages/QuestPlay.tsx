import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, Lightbulb, AlertTriangle } from 'lucide-react'

// Mock challenge data
const mockChallenge = {
  id: 'c1',
  question: 'What command shows the routing table on a Cisco device?',
  description: 'Enter the exact command used to display IP routing information.',
  hint_1: 'The command starts with "show"',
  hint_2: 'It includes the word "route"',
  hint_3: 'The full command is "show ip route"',
  correct_answer: 'show ip route',
  solution: 'The correct answer is "show ip route". This command displays the IP routing table on Cisco IOS devices.'
}

export default function QuestPlay() {
  const { questId, levelId } = useParams()
  const navigate = useNavigate()
  useAuth() // Ensure user is authenticated

  const [answer, setAnswer] = useState('')
  const [timeSeconds, setTimeSeconds] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isRunning, setIsRunning] = useState(true)

  // Timer
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleHint = () => {
    const newHintsUsed = hintsUsed + 1
    setHintsUsed(newHintsUsed)
    setTimeSeconds(prev => prev + 30) // Add 30 seconds penalty

    if (newHintsUsed === 1) setCurrentHint(mockChallenge.hint_1)
    else if (newHintsUsed === 2) setCurrentHint(mockChallenge.hint_2)
    else if (newHintsUsed === 3) {
      setCurrentHint(mockChallenge.hint_3)
      setShowSolution(true)
    }
  }

  const handleSubmit = () => {
    if (answer.toLowerCase().trim() === mockChallenge.correct_answer.toLowerCase()) {
      setIsCorrect(true)
      setIsRunning(false)
    }
  }

  const handleComplete = () => {
    if (showSolution) {
      // Not eligible for leaderboard
      navigate('/quest-complete', {
        state: {
          eligible: false,
          time: timeSeconds,
          questId,
          levelId
        }
      })
    } else {
      // Eligible - go to initials entry
      navigate('/enter-initials', {
        state: {
          time: timeSeconds,
          hintsUsed,
          questId,
          levelId
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-[hsl(var(--card))] px-6 py-3 rounded-full">
            <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
            <span className="text-2xl font-mono font-bold text-white">
              {formatTime(timeSeconds)}
            </span>
          </div>
        </div>

        {/* Challenge Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{mockChallenge.question}</p>
            {mockChallenge.description && (
              <p className="text-sm text-gray-400 mb-4">{mockChallenge.description}</p>
            )}

            {/* Hint display */}
            {currentHint && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <p className="text-yellow-200">{currentHint}</p>
                </div>
              </div>
            )}

            {/* Solution display */}
            {showSolution && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold mb-1">Solution Revealed</p>
                    <p className="text-gray-300">{mockChallenge.solution}</p>
                    <p className="text-xs text-red-400 mt-2">
                      You are no longer eligible for the leaderboard
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Answer input */}
            {!isCorrect && (
              <div className="flex gap-2">
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            )}

            {/* Success message */}
            {isCorrect && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 font-semibold">Correct!</p>
                <Button className="mt-4" onClick={handleComplete}>
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hint buttons */}
        {!isCorrect && !showSolution && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleHint}
              disabled={hintsUsed >= 3}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Use Hint ({3 - hintsUsed} remaining) +30s
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
