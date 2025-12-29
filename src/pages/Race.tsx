import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCompetitionBySession,
  getCompetitionProgress,
  getSession,
  getRegistrations,
} from '@/api/bubble'
import {
  type LiveSession,
  type LiveCompetition,
  type LiveProgressWithPlayer,
} from '@/types/live'
import HorseRace from '@/components/HorseRace'
import { Clock, Flag, Trophy } from 'lucide-react'

export default function Race() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<LiveSession | null>(null)
  const [competition, setCompetition] = useState<LiveCompetition | null>(null)
  const [progress, setProgress] = useState<LiveProgressWithPlayer[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    if (!sessionId) return

    const loadData = async () => {
      try {
        const [sessionData, comp, regs] = await Promise.all([
          getSession(sessionId),
          getCompetitionBySession(sessionId),
          getRegistrations(sessionId),
        ])

        setSession(sessionData)
        setCompetition(comp)

        if (comp) {
          const progressData = await getCompetitionProgress(comp._id)
          // Combine progress with player info
          const progressWithPlayers = progressData.map((p) => ({
            ...p,
            player: regs.find((r) => r._id === p.registration) || null,
          })) as LiveProgressWithPlayer[]
          setProgress(progressWithPlayers)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load race data:', err)
      }
    }

    loadData()
  }, [sessionId])

  // Poll for progress updates
  useEffect(() => {
    if (!competition || competition.status === 'finished') return

    const pollInterval = setInterval(async () => {
      try {
        const [comp, regs] = await Promise.all([
          getCompetitionBySession(sessionId!),
          getRegistrations(sessionId!),
        ])

        setCompetition(comp)

        if (comp) {
          const progressData = await getCompetitionProgress(comp._id)
          const progressWithPlayers = progressData.map((p) => ({
            ...p,
            player: regs.find((r) => r._id === p.registration) || null,
          })) as LiveProgressWithPlayer[]
          setProgress(progressWithPlayers)

          // Check if all players finished
          if (comp.status === 'finished' || progressData.every((p) => p.finished)) {
            // Navigate to results after a short delay
            setTimeout(() => {
              navigate(`/results/${sessionId}`)
            }, 3000)
          }
        }
      } catch (err) {
        console.error('Poll error:', err)
      }
    }, 1500)

    return () => clearInterval(pollInterval)
  }, [competition, sessionId, navigate])

  // Elapsed time counter
  useEffect(() => {
    if (!competition?.game_start_at || competition.status === 'finished') return

    const startTime = new Date(competition.game_start_at).getTime()

    const timer = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedTime(Math.max(0, elapsed))
    }, 1000)

    return () => clearInterval(timer)
  }, [competition])

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--fn-blue-dark)]">
        <div className="text-white text-2xl">Loading race...</div>
      </div>
    )
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const finishedCount = progress.filter((p) => p.finished).length
  const allFinished = finishedCount === progress.length && progress.length > 0

  return (
    <div
      className="min-h-screen w-full p-8"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Quest Live Race
            </h1>
            <p className="text-gray-400">
              {session?.start_date} Session
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock className="w-5 h-5" />
              <span>Elapsed Time</span>
            </div>
            <div className="text-4xl font-mono text-[var(--fn-green)]">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        {/* Race Status */}
        <div className="bg-[var(--fn-blue-dark)] rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allFinished ? (
              <>
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="text-white text-lg">Race Complete!</span>
              </>
            ) : (
              <>
                <Flag className="w-6 h-6 text-[var(--fn-green)] animate-pulse" />
                <span className="text-white text-lg">Race in Progress</span>
              </>
            )}
          </div>
          <div className="text-gray-400">
            {finishedCount}/{progress.length} finished
          </div>
        </div>

        {/* Track Labels */}
        <div className="flex justify-between text-gray-500 text-sm mb-2 px-4">
          <span className="flex items-center gap-1">
            <Flag className="w-4 h-4" /> START
          </span>
          <span className="flex items-center gap-1">
            FINISH <Trophy className="w-4 h-4" />
          </span>
        </div>

        {/* Horse Race Visualization */}
        <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6">
          {progress.length > 0 ? (
            <HorseRace players={progress} totalChallenges={5} />
          ) : (
            <div className="text-center text-gray-400 py-12">
              Waiting for players to start...
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>🐎</span> Racing
          </div>
          <div className="flex items-center gap-2">
            <span>🏆</span> Finished
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">LEADING</span> In the lead
          </div>
        </div>
      </div>
    </div>
  )
}
