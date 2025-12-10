import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Clock } from 'lucide-react'
import CommunityBadgeCTA from '@/components/CommunityBadgeCTA'
import Footer from '@/components/Footer'

interface LevelWithDetails {
  id: string
  name: string | null
  level_number: number
  quest_title: string
  quest_id: string
}

interface UserResult {
  level_id: string
  time_seconds: number
  eligible_for_leaderboard: boolean
}

export default function Profile() {
  const navigate = useNavigate()
  const { email, logout } = useAuth()
  const [levels, setLevels] = useState<LevelWithDetails[]>([])
  const [userResults, setUserResults] = useState<Map<string, UserResult>>(new Map())
  const [loading, setLoading] = useState(true)
  const [hasCommunityProfile, setHasCommunityProfile] = useState(false)

  useEffect(() => {
    async function fetchData() {
      // Fetch all levels with quest info
      const { data: levelsData } = await supabase
        .from('levels')
        .select(`
          id,
          name,
          level_number,
          quest:quests!inner(id, title)
        `)
        .order('level_number')

      if (levelsData) {
        const formattedLevels = levelsData.map((level: any) => ({
          id: level.id,
          name: level.name,
          level_number: level.level_number,
          quest_title: level.quest.title,
          quest_id: level.quest.id,
        }))
        setLevels(formattedLevels)
      }

      // Fetch user's results
      if (email) {
        const { data: resultsData } = await supabase
          .from('results')
          .select('level_id, time_seconds, eligible_for_leaderboard')
          .eq('email', email)

        if (resultsData) {
          const resultsMap = new Map<string, UserResult>()
          resultsData.forEach((result) => {
            resultsMap.set(result.level_id, result)
          })
          setUserResults(resultsMap)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [email])

  const completedCount = userResults.size
  const totalLevels = levels.length

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getLevelDisplayName = (level: LevelWithDetails): string => {
    const difficultyMap: Record<number, string> = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Expert',
    }
    const difficulty = difficultyMap[level.level_number] || `Level ${level.level_number}`
    return `${level.quest_title} - ${difficulty}`
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
        <button
          className="btn-quest-home"
          onClick={() => navigate('/quests')}
        >
          <img src="/icon_laptop.svg" alt="" className="w-10 h-10" />
          Quest Home
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Title image - different based on completion status */}
        {completedCount > 0 ? (
          <img src="/great_job.png" alt="Great Job!" className="h-16 mb-8" />
        ) : (
          <img src="/three-stars.png" alt="Stars" className="h-16 mb-8" />
        )}

        {/* Card */}
        <div className="w-full max-w-4xl container-blue">
          {/* Welcome */}
          <h1 className="mb-2"><span className="mr-2">🎊</span>Welcome!</h1>
          <p className="text-white text-lg mb-6">
            You completed successfully {completedCount} of {totalLevels} challenges.
          </p>

          {/* Challenge list */}
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            <div className="space-y-3">
              {levels.map((level) => {
                const result = userResults.get(level.id)
                const hasParticipated = !!result

                return (
                  <div key={level.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[var(--fn-blue-light)]">
                      <img src="/icon_document.svg" alt="" className="w-5 h-5" />
                      <span>{getLevelDisplayName(level)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-4">
                      {result && (
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(result.time_seconds)}</span>
                        </div>
                      )}

                      {result && result.eligible_for_leaderboard && (
                        <span className="text-2xl">🥇</span>
                      )}

                      {hasParticipated && (
                        <button
                          className="btn-primary-sm"
                          onClick={() => navigate(`/leaderboard?level=${level.id}`)}
                        >
                          Leaderboard
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA - only show if user has completed at least one challenge */}
        {completedCount > 0 && (
          <CommunityBadgeCTA hasCommunityProfile={hasCommunityProfile} />
        )}
      </div>

      <Footer />
    </div>
  )
}
