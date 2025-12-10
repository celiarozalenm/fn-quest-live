import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { Quest, Level, Challenge, ChallengeField, ChallengeHint } from '@/types/database'

interface ChallengeWithDetails extends Challenge {
  fields: ChallengeField[]
  hints: ChallengeHint[]
}

export default function QuestPlay() {
  const { questId, levelId } = useParams()
  const navigate = useNavigate()
  const { email } = useAuth()

  const [quest, setQuest] = useState<Quest | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([])
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeSeconds, setTimeSeconds] = useState(0)
  const [hintsUsedForChallenge, setHintsUsedForChallenge] = useState(0)
  const [totalHintsUsed, setTotalHintsUsed] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [isRunning, setIsRunning] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showHintTooltip, setShowHintTooltip] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [hasSeenHintTooltip, setHasSeenHintTooltip] = useState(false)
  const [showQuestionPanel, setShowQuestionPanel] = useState(true)

  const difficultyLabels: Record<number, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Expert',
    4: 'Advanced',
    5: 'Master'
  }

  useEffect(() => {
    async function fetchData() {
      if (!questId || !levelId) return

      // Fetch quest
      const { data: questData } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single()

      if (questData) setQuest(questData)

      // Fetch level
      const { data: levelData } = await supabase
        .from('levels')
        .select('*')
        .eq('id', levelId)
        .single()

      if (levelData) setLevel(levelData)

      // Fetch challenges with fields and hints
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('level_id', levelId)
        .order('order', { ascending: true })

      if (challengesData) {
        const challengesWithDetails: ChallengeWithDetails[] = await Promise.all(
          challengesData.map(async (challenge) => {
            const { data: fields } = await supabase
              .from('challenge_fields')
              .select('*')
              .eq('challenge_id', challenge.id)
              .order('order', { ascending: true })

            const { data: hints } = await supabase
              .from('challenge_hints')
              .select('*')
              .eq('challenge_id', challenge.id)
              .order('order', { ascending: true })

            return {
              ...challenge,
              fields: fields || [],
              hints: hints || []
            }
          })
        )
        setChallenges(challengesWithDetails)
      }

      setLoading(false)
    }

    fetchData()
  }, [questId, levelId])

  // Timer
  useEffect(() => {
    if (!isRunning || loading) return

    const interval = setInterval(() => {
      setTimeSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, loading])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentChallenge = challenges[currentChallengeIndex]
  const totalChallenges = challenges.length
  const currentHint = currentChallenge?.hints[hintsUsedForChallenge - 1]

  const handleHintButtonClick = () => {
    if (hintsUsedForChallenge >= 3 || showSolution) return

    if (hintsUsedForChallenge === 0) {
      // First hint - show modal to confirm
      setShowHintModal(true)
    } else {
      // Already used hints, show modal with next hint
      setShowHintModal(true)
    }
  }

  const handleUseHint = () => {
    if (!currentChallenge) return

    const newHintsUsed = hintsUsedForChallenge + 1
    setHintsUsedForChallenge(newHintsUsed)
    setTotalHintsUsed(prev => prev + 1)
    setTimeSeconds(prev => prev + 30) // Add 30 seconds penalty
    setHasSeenHintTooltip(true)

    // After 3rd hint, show solution
    if (newHintsUsed >= 3) {
      setShowSolution(true)
    }
  }

  const handleAnswerChange = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
  }

  const checkAnswers = () => {
    if (!currentChallenge) return false

    return currentChallenge.fields.every(field => {
      const userAnswer = answers[field.id]?.toLowerCase().trim() || ''
      const correctAnswer = field.correct_answer.toLowerCase().trim()
      return userAnswer === correctAnswer
    })
  }

  const handleSubmit = async () => {
    if (!currentChallenge) return

    const isCorrect = checkAnswers()

    if (isCorrect) {
      // Move to next challenge or complete
      if (currentChallengeIndex < totalChallenges - 1) {
        setCurrentChallengeIndex(prev => prev + 1)
        setAnswers({})
        setHintsUsedForChallenge(0)
      } else {
        // All challenges completed
        setIsRunning(false)

        // Save result to database
        if (email && levelId) {
          await supabase.from('results').upsert({
            email,
            level_id: levelId,
            time_seconds: timeSeconds,
            completed: true,
            eligible_for_leaderboard: !showSolution
          }, { onConflict: 'email,level_id' })
        }

        // Navigate based on eligibility
        if (showSolution) {
          navigate(`/quest/${questId}`)
        } else {
          navigate('/enter-initials', {
            state: {
              time: timeSeconds,
              hintsUsed: totalHintsUsed,
              questId,
              levelId
            }
          })
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/background_red.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start p-4">
        <img src="/logo_fn.svg" alt="Forward Networks" className="h-12" />

        {/* Timer and Hint */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div
            className="flex items-center gap-3 bg-white rounded-full w-max h-max"
            style={{ padding: '10px 20px 10px 8px' }}
          >
            <img src="/icon_timer.svg" alt="Timer" className="w-[46px] h-[46px]" />
            <span className="text-[36px] text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
              {formatTime(timeSeconds)}
            </span>
          </div>

          {/* Hint button with tooltip */}
          <div className="relative">
            <button
              onClick={handleHintButtonClick}
              onMouseEnter={() => !hasSeenHintTooltip && setShowHintTooltip(true)}
              onMouseLeave={() => setShowHintTooltip(false)}
              disabled={hintsUsedForChallenge >= 3 || showSolution}
              className="flex items-center gap-3 bg-white rounded-full w-max h-max disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: '10px 20px 10px 8px' }}
            >
              <img src="/icon_hint.svg" alt="Hint" className="w-[46px] h-[46px]" />
              <span className="text-[24px] text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                Hint (+30s)
              </span>
            </button>

            {/* Tooltip */}
            {showHintTooltip && !hasSeenHintTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-[#4a4a4a] text-white px-4 py-3 rounded-lg w-64 z-10">
                If you check a hint, 30 seconds will be added to your time as a penalty.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content - two column layout */}
      <div className="flex-1 flex p-4 gap-4">
        {/* Left side - iframe for Forward Networks app */}
        <div className="flex-1 bg-white rounded-lg overflow-hidden">
          <iframe
            src="https://fwd-quest-endpoint.forwardnetworks.com/login?basic=ZGVtb0Bmb3J3YXJkbmV0d29ya3MuY29tOkNrYXpzNHZGa2lFeVFVMkFKSHNOZ1llYVpZR0J6JEckZkZZOVhydzlMY0hB"
            style={{ border: '0px', borderRadius: '8px' }}
            name="application"
            scrolling="auto"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            width="100%"
            height="100%"
            allowFullScreen
            allow="same-origin; scripts; forms"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>

        {/* Toggle button for question panel - only show when panel is closed */}
        {!showQuestionPanel && (
          <button
            onClick={() => setShowQuestionPanel(true)}
            className="w-14 h-14 bg-[var(--fn-blue-dark)] rounded-full flex items-center justify-center self-start mt-4 hover:bg-[var(--fn-blue-dark)]/80 transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Right side - Challenge panel */}
        {showQuestionPanel && (
          <div className="w-[400px] bg-[var(--fn-blue-dark)] rounded-lg p-6 flex flex-col">
            {/* Quest info header */}
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo_color.svg" alt="" className="w-10 h-10" />
              <div className="flex items-center gap-2 text-white">
                <span>{quest?.name}</span>
                <span>-</span>
                <span>{difficultyLabels[level?.level_number || 1]}</span>
              </div>
              <button
                onClick={() => setShowQuestionPanel(false)}
                className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>

            {/* Challenge number */}
            <h1 className="text-[var(--fn-green)] text-[48px] mb-4">
              Challenge #{currentChallengeIndex + 1} of {totalChallenges}
            </h1>

            {/* Challenge description */}
            <p className="text-white text-lg mb-4">
              {currentChallenge?.description}
            </p>

            {/* Question */}
            <p className="text-[var(--fn-blue-light)] text-lg mb-6">
              {currentChallenge?.question}
            </p>

            {/* Answer fields */}
            <div className="space-y-4 flex-1">
              {currentChallenge?.fields.map((field) => (
                <div key={field.id}>
                  {field.label && (
                    <label className="block text-white text-sm mb-1">{field.label}</label>
                  )}
                  {field.field_type === 'dropdown' ? (
                    <select
                      value={answers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 bg-white text-gray-800 rounded-lg text-lg cursor-pointer"
                    >
                      <option value="">Choose an option...</option>
                      {field.dropdown_options?.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={answers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full px-4 py-3 bg-white text-gray-800 rounded-lg text-lg"
                    />
                  )}
                </div>
              ))}

              {/* Solution display */}
              {showSolution && currentChallenge?.solution && (
                <div className="mt-4 p-4 bg-red-500/20 rounded-lg">
                  <p className="text-red-400 font-semibold mb-2">Solution:</p>
                  <p className="text-white text-sm">{currentChallenge.solution}</p>
                  <p className="text-red-400 text-xs mt-2">
                    You are no longer eligible for the leaderboard
                  </p>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              className="btn-primary-md w-full mt-6 flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f5f5f5] rounded-2xl w-[920px] max-w-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-16 py-6">
              <img src="/logo_color.svg" alt="" className="w-10 h-10" />
              <span className="text-[var(--fn-blue-dark)] text-[24px]">
                {quest?.name} | #{currentChallengeIndex + 1} OF {totalChallenges}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: '0 64px 40px 64px' }}>
              {/* Hint content */}
              {hintsUsedForChallenge === 0 ? (
                <>
                  <h2 className="text-[var(--fn-blue-dark)] text-[48px] mb-4">Use a Hint?</h2>
                  <p className="text-gray-600 text-lg mb-8">
                    If you use a hint, 30 seconds will be added to your time as a penalty.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-[var(--fn-blue-dark)] text-[48px] mb-4">
                    Hint {hintsUsedForChallenge} of 3
                  </h2>
                  <p className="text-gray-600 text-[18px] mb-8">
                    {currentHint?.hint_text}
                  </p>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowHintModal(false)}
                  className="btn-primary-md flex-1"
                >
                  Back to challenge
                </button>
                {hintsUsedForChallenge < 3 && !showSolution && (
                  <button
                    onClick={handleUseHint}
                    className="btn-primary-md-outline flex-1"
                  >
                    {hintsUsedForChallenge === 0 ? 'Use hint (+30s)' : 'Next hint'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
