import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Play, XCircle } from 'lucide-react'
import type { Quest, Level } from '@/types/database'

interface UserLevelResult {
  level_id: string
  time_seconds: number
  completed: boolean
  eligible_for_leaderboard: boolean
}

export default function QuestDetail() {
  const { questId } = useParams()
  const navigate = useNavigate()
  const { email } = useAuth()

  const [quest, setQuest] = useState<Quest | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [userResults, setUserResults] = useState<Map<string, UserLevelResult>>(new Map())
  const [loading, setLoading] = useState(true)

  const difficultyLabels: Record<number, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Expert',
    4: 'Advanced',
    5: 'Master'
  }

  useEffect(() => {
    async function fetchData() {
      if (!questId) return

      // Fetch quest
      const { data: questData } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single()

      if (questData) {
        setQuest(questData)
      }

      // Fetch levels for this quest
      const { data: levelsData } = await supabase
        .from('levels')
        .select('*')
        .eq('quest_id', questId)
        .order('level_number', { ascending: true })

      if (levelsData && levelsData.length > 0) {
        setLevels(levelsData)
        setSelectedLevel(levelsData[0]) // Default to first level
      }

      // Fetch user's results for this quest's levels
      if (email && levelsData) {
        const levelIds = levelsData.map(l => l.id)
        const { data: resultsData } = await supabase
          .from('results')
          .select('level_id, time_seconds, completed, eligible_for_leaderboard')
          .eq('email', email)
          .in('level_id', levelIds)

        if (resultsData) {
          const resultsMap = new Map<string, UserLevelResult>()
          resultsData.forEach((result) => {
            resultsMap.set(result.level_id, result)
          })
          setUserResults(resultsMap)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [questId, email])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Quest not found</p>
      </div>
    )
  }

  // Check if user has attempted this level
  const currentResult = selectedLevel ? userResults.get(selectedLevel.id) : null
  const hasAttempted = !!currentResult
  const hasCompleted = currentResult?.completed ?? false

  // Determine mission status
  // not_started = never attempted
  // completed = attempted and completed successfully (eligible_for_leaderboard = true means didn't use solution)
  // incomplete = attempted but didn't complete (used solution or failed)
  let missionStatus: 'not_started' | 'incomplete' | 'completed' = 'not_started'
  if (hasAttempted) {
    missionStatus = hasCompleted ? 'completed' : 'incomplete'
  }

  return (
    <div
      className="min-h-screen p-4 flex flex-col"
      style={{
        backgroundImage: 'url(/background_red.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <img src="/logo_fn.svg" alt="Forward Networks" className="h-12" />
        <div className="flex items-center gap-4">
          <button
            className="btn-quest-home"
            onClick={() => navigate('/quests')}
          >
            <img src="/icon_laptop.svg" alt="" className="w-10 h-10" />
            Quest Home
          </button>
          <img
            src="/profile_icon.svg"
            alt="Profile"
            className="h-12 w-12 cursor-pointer"
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Card */}
        <div className="w-full max-w-4xl container-blue">
          {/* Quest header with icon, name, and level tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img src="/logo_color.svg" alt="" className="w-12 h-12" />
              <span className="text-[var(--fn-blue-light)] text-2xl">{quest.name}</span>
            </div>

            {/* Level tabs */}
            {levels.length > 0 && (
              <div className="flex border-2 border-[var(--fn-green)] p-1.5" style={{ borderRadius: '12px' }}>
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-6 py-3 text-lg font-medium transition-all duration-200 cursor-pointer min-w-[60px] mx-1 ${
                      selectedLevel?.id === level.id
                        ? 'bg-[var(--fn-green)] text-white shadow-sm'
                        : 'bg-transparent text-white hover:bg-[var(--fn-green)]/20'
                    }`}
                    style={{ borderRadius: '8px' }}
                  >
                    {difficultyLabels[level.level_number] || `Level ${level.level_number}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quest title */}
          <h1 className="mb-4">{quest.title}</h1>

          {/* Content based on mission status */}
          {missionStatus === 'not_started' && (
            <>
              <h2 className="text-[var(--fn-blue-light)] text-2xl mb-4">Your Mission:</h2>
              <p className="text-white text-lg mb-6">
                {quest.mission}
              </p>

              <h2 className="text-white text-2xl mb-3">Remember</h2>
              <ul className="text-white text-lg space-y-2">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You've got a need, a need of speed (to get to the leaderboard)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Once you click Start, the clock is ticking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Each hint costs you a 30 seconds penalty</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Each month 1st, 2nd, and 3rd place winners get fabulous prizes</span>
                </li>
              </ul>
            </>
          )}

          {missionStatus === 'completed' && (
            <>
              <p className="text-white text-lg mb-2">
                You've already stepped up to this month's challenge — nice move.
              </p>
              <p className="text-white text-lg">
                Now it's time to see how your speed and skill stack up.
              </p>
            </>
          )}

          {missionStatus === 'incomplete' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="text-white text-xl">Mission Status: Incomplete</span>
              </div>
              <p className="text-white text-lg mb-2">
                You started the challenge, but didn't finish.
              </p>
              <p className="text-white text-lg">
                Unfortunately, each player only gets one shot — and yours has been used.
              </p>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-8">
          {/* See leaderboard - only if user has attempted */}
          {hasAttempted && selectedLevel && (
            <button
              className="btn-primary-md"
              onClick={() => navigate(`/leaderboard?level=${selectedLevel.id}`)}
            >
              See leaderboard
            </button>
          )}

          {/* Start/Revisit button */}
          {selectedLevel && (
            <button
              className="btn-primary-md"
              onClick={() => navigate(`/quest/${questId}/level/${selectedLevel.id}`)}
            >
              <Play className="inline-block w-6 h-6 mr-2 fill-current" />
              {hasAttempted ? 'Revisit the challenge' : 'Start the Clock!'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
