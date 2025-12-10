import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const defaultRules = [
  'Winners can only receive a prize once every 90 days.',
  'You only get one attempt per level — no retries.',
  'Use only your own Quest account — no alternates or shared logins.',
  'Complete challenges on your own — no outside help.',
  "Don't share answers, screenshots, or walkthroughs.",
  'Forward Networks may verify identities and disqualify players if needed.',
]

export default function Rules() {
  const navigate = useNavigate()
  const [rules, setRules] = useState<string[]>(defaultRules)

  useEffect(() => {
    async function fetchRules() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'quest_rules')
        .single()

      if (data?.value) {
        try {
          const parsedRules = JSON.parse(data.value)
          if (Array.isArray(parsedRules) && parsedRules.length > 0) {
            setRules(parsedRules)
          }
        } catch {
          // Use default rules if parsing fails
        }
      }
    }

    fetchRules()
  }, [])

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
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl container-blue">
          <h1 className="mb-6">Quest rules</h1>

          <ul className="space-y-4 text-white text-lg">
            {rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-white">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
