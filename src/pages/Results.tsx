import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCompetitionBySession,
  getCompetitionProgress,
  getSession,
  getRegistrations,
  getSessions,
} from '@/api/bubble'
import {
  PLAYER_ICONS,
  type LiveSession,
  type LiveProgressWithPlayer,
} from '@/types/live'
import { Trophy, Clock, Lightbulb, ArrowRight } from 'lucide-react'

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<LiveSession | null>(null)
  const [results, setResults] = useState<LiveProgressWithPlayer[]>([])
  const [nextSession, setNextSession] = useState<LiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

        if (comp) {
          const progressData = await getCompetitionProgress(comp._id)
          const progressWithPlayers = progressData
            .map((p) => ({
              ...p,
              player: regs.find((r) => r._id === p.registration) || null,
            }))
            .sort((a, b) => {
              // Sort by rank, or by total time if no rank
              if (a.rank && b.rank) return a.rank - b.rank
              if (a.finished && !b.finished) return -1
              if (!a.finished && b.finished) return 1
              return (a.total_time || 999999) - (b.total_time || 999999)
            }) as LiveProgressWithPlayer[]

          setResults(progressWithPlayers)
        }

        // Find next session
        if (sessionData) {
          const allSessions = await getSessions(sessionData.date)
          const currentIndex = allSessions.findIndex((s) => s._id === sessionId)
          const next = allSessions.find(
            (s, i) => i > currentIndex && s.is_active
          )
          setNextSession(next || null)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load results:', err)
      }
    }

    loadData()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--fn-blue-dark)]">
        <div className="text-white text-2xl">Loading results...</div>
      </div>
    )
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const top3 = results.slice(0, 3)

  return (
    <div
      className="min-h-screen w-full py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-2">
            Competition Complete!
          </h1>
          <p className="text-xl text-gray-400">
            {session?.start_date} Session Results
          </p>
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end gap-4 mb-12">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="text-center">
              <div className="text-6xl mb-2">🥈</div>
              <div className="bg-gray-600 rounded-t-xl p-6 w-36 h-32 flex flex-col items-center justify-end">
                <span className="text-4xl mb-2">
                  {PLAYER_ICONS.find((i) => i.id === top3[1].player?.player_icon)?.emoji || '🎮'}
                </span>
                <p className="text-white font-medium text-sm truncate w-full">
                  {top3[1].player?.player_name || 'Player'}
                </p>
                <p className="text-[var(--fn-green)] font-bold">
                  {top3[1].total_time ? formatTime(top3[1].total_time) : '--:--'}
                </p>
              </div>
              <div className="text-gray-400 text-sm mt-2">2nd Place</div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="text-center">
              <div className="text-7xl mb-2">🥇</div>
              <div className="bg-yellow-600 rounded-t-xl p-6 w-40 h-44 flex flex-col items-center justify-end">
                <span className="text-5xl mb-2">
                  {PLAYER_ICONS.find((i) => i.id === top3[0].player?.player_icon)?.emoji || '🎮'}
                </span>
                <p className="text-white font-bold text-lg truncate w-full">
                  {top3[0].player?.player_name || 'Player'}
                </p>
                <p className="text-white font-bold text-xl">
                  {top3[0].total_time ? formatTime(top3[0].total_time) : '--:--'}
                </p>
              </div>
              <div className="text-yellow-400 text-sm mt-2 font-bold">1st Place</div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="text-center">
              <div className="text-5xl mb-2">🥉</div>
              <div className="bg-amber-700 rounded-t-xl p-6 w-32 h-24 flex flex-col items-center justify-end">
                <span className="text-3xl mb-1">
                  {PLAYER_ICONS.find((i) => i.id === top3[2].player?.player_icon)?.emoji || '🎮'}
                </span>
                <p className="text-white font-medium text-xs truncate w-full">
                  {top3[2].player?.player_name || 'Player'}
                </p>
                <p className="text-[var(--fn-green)] font-bold text-sm">
                  {top3[2].total_time ? formatTime(top3[2].total_time) : '--:--'}
                </p>
              </div>
              <div className="text-gray-400 text-sm mt-2">3rd Place</div>
            </div>
          )}
        </div>

        {/* Full Rankings Table */}
        <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6 mb-8">
          <h2 className="text-xl text-white mb-4">Full Rankings</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 w-16">Rank</th>
                <th className="pb-3">Player</th>
                <th className="pb-3 text-right">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </th>
                <th className="pb-3 text-right">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Hints
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const icon = PLAYER_ICONS.find((i) => i.id === result.player?.player_icon)
                const rank = result.rank || index + 1

                return (
                  <tr key={result._id} className="border-b border-gray-800">
                    <td className="py-4">
                      {rank === 1 && <span className="text-2xl">🥇</span>}
                      {rank === 2 && <span className="text-2xl">🥈</span>}
                      {rank === 3 && <span className="text-2xl">🥉</span>}
                      {rank > 3 && <span className="text-gray-400">#{rank}</span>}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon?.emoji || '🎮'}</span>
                        <span className="text-white">
                          {result.player?.player_name || 'Player'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-[var(--fn-green)] font-mono">
                      {result.total_time ? formatTime(result.total_time) : '--:--'}
                    </td>
                    <td className="py-4 text-right text-gray-400">
                      {result.hints_used}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Next Session */}
        {nextSession && (
          <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-2">Next Competition</p>
            <p className="text-3xl text-white font-bold mb-4">
              {nextSession.start_date} CET
            </p>
            <button
              onClick={() => navigate(`/race/${nextSession._id}`)}
              className="btn-primary-md inline-flex items-center gap-2"
            >
              View Next Race <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Back to Admin */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-gray-400 hover:text-white"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
