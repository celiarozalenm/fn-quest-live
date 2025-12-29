import { PLAYER_ICONS, type LiveProgressWithPlayer } from '@/types/live'

interface HorseRaceProps {
  players: LiveProgressWithPlayer[]
  totalChallenges?: number
}

export default function HorseRace({ players, totalChallenges = 5 }: HorseRaceProps) {
  // Sort players by progress (finished first, then by current challenge)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && !b.finished) return -1
    if (!a.finished && b.finished) return 1
    if (a.finished && b.finished) {
      return (a.total_time || 0) - (b.total_time || 0)
    }
    return b.current_challenge - a.current_challenge
  })

  return (
    <div className="space-y-4">
      {sortedPlayers.map((player, index) => {
        const icon = PLAYER_ICONS.find((i) => i.id === player.player?.player_icon)
        const progress = (player.current_challenge / totalChallenges) * 100
        const isLeading = index === 0 && !player.finished

        return (
          <div key={player._id} className="relative">
            {/* Player Info */}
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl">{icon?.emoji || '🎮'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {player.player?.player_name || 'Player'}
                  </span>
                  {isLeading && (
                    <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
                      LEADING
                    </span>
                  )}
                  {player.finished && (
                    <span className="text-xs bg-[var(--fn-green)] text-white px-2 py-0.5 rounded-full font-bold">
                      FINISHED
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-sm">
                  Challenge {player.current_challenge}/{totalChallenges}
                  {player.finished && player.total_time && (
                    <span className="ml-2 text-[var(--fn-green)]">
                      {formatTime(player.total_time)}
                    </span>
                  )}
                </span>
              </div>
              {player.rank && (
                <div className="text-2xl">
                  {player.rank === 1 && '🥇'}
                  {player.rank === 2 && '🥈'}
                  {player.rank === 3 && '🥉'}
                  {player.rank > 3 && <span className="text-gray-400">#{player.rank}</span>}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
              {/* Track markers */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: totalChallenges }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r border-gray-700 last:border-r-0"
                  />
                ))}
              </div>

              {/* Progress fill */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                  player.finished
                    ? 'bg-[var(--fn-green)]'
                    : 'bg-gradient-to-r from-[var(--fn-blue-light)] to-[var(--fn-green)]'
                }`}
                style={{ width: `${player.finished ? 100 : progress}%` }}
              />

              {/* Horse icon moving along the track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-500 ease-out"
                style={{ left: `calc(${player.finished ? 100 : progress}% - 16px)` }}
              >
                {player.finished ? '🏆' : '🐎'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
