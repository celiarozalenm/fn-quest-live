import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getCompetitionBySession, getRegistrations, getSession } from '@/api/bubble'
import { PLAYER_ICONS, type LiveSession, type LiveRegistration, type LiveCompetition } from '@/types/live'
import { Users, Clock } from 'lucide-react'

export default function Lobby() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const [session, setSession] = useState<LiveSession | null>(null)
  const [, setCompetition] = useState<LiveCompetition | null>(null)
  const [registrations, setRegistrations] = useState<LiveRegistration[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    if (!sessionId) return

    const loadData = async () => {
      try {
        const [sessionData, regs] = await Promise.all([
          getSession(sessionId),
          getRegistrations(sessionId),
        ])
        setSession(sessionData)
        setRegistrations(regs.filter((r) => r.checked_in))
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load lobby data:', err)
      }
    }

    loadData()
  }, [sessionId])

  // Poll for competition status
  useEffect(() => {
    if (!sessionId) return

    const pollInterval = setInterval(async () => {
      try {
        const comp = await getCompetitionBySession(sessionId)
        setCompetition(comp)

        if (comp?.status === 'countdown' && comp.game_start_at) {
          // Calculate countdown
          const startTime = new Date(comp.game_start_at).getTime()
          const now = Date.now()
          const remaining = Math.ceil((startTime - now) / 1000)

          if (remaining > 0) {
            setCountdown(remaining)
          } else {
            // Game started - redirect to Bubble game page
            setCountdown(0)
            // Short delay to show "GO!" then redirect
            setTimeout(() => {
              // Redirect to Bubble game page
              const playerId = localStorage.getItem('fn_quest_live_registration_id')
              window.location.href = `https://quest.fwd.app/live-game/${comp._id}?player=${playerId}`
            }, 1500)
          }
        } else if (comp?.status === 'active') {
          // Already started - redirect immediately
          const playerId = localStorage.getItem('fn_quest_live_registration_id')
          window.location.href = `https://quest.fwd.app/live-game/${comp._id}?player=${playerId}`
        }
      } catch (err) {
        console.error('Poll error:', err)
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--fn-blue-dark)]">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  const checkedInPlayers = registrations.filter((r) => r.checked_in)

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-8"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      {/* Countdown Display */}
      {countdown !== null ? (
        <div className="text-center">
          {countdown > 0 ? (
            <>
              <p className="text-2xl text-gray-300 mb-4">Get Ready!</p>
              <div className="text-[200px] font-bold text-[var(--fn-green)] leading-none animate-pulse">
                {countdown}
              </div>
            </>
          ) : (
            <div className="text-[150px] font-bold text-[var(--fn-green)] leading-none animate-bounce">
              GO!
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Waiting Screen */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Get Ready!</h1>
            <p className="text-xl text-gray-300">
              {session?.start_date} Session
            </p>
          </div>

          {/* Players Grid */}
          <div className="max-w-4xl w-full mb-12">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <Users className="w-6 h-6 text-[var(--fn-green)]" />
              <span className="text-white text-xl">Players</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {checkedInPlayers.map((player) => {
                const icon = PLAYER_ICONS.find((i) => i.id === player.player_icon)
                return (
                  <div
                    key={player._id}
                    className="bg-[var(--fn-blue-dark)] rounded-xl p-6 text-center"
                  >
                    <div className="text-5xl mb-3">{icon?.emoji || '🎮'}</div>
                    <p className="text-white font-medium text-sm">
                      {player.player_name || player.name}
                    </p>
                  </div>
                )
              })}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 5 - checkedInPlayers.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-[var(--fn-blue-dark)]/50 rounded-xl p-6 text-center border-2 border-dashed border-gray-600"
                >
                  <div className="text-5xl mb-3 opacity-30">❓</div>
                  <p className="text-gray-500 text-sm">Waiting...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 text-gray-400">
            <Clock className="w-5 h-5 animate-pulse" />
            <span>Waiting for host to start the competition...</span>
          </div>
        </>
      )}
    </div>
  )
}
