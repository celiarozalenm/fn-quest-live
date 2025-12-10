import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Quest } from '@/types/database'

export default function QuestList() {
  const navigate = useNavigate()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuests() {
      const { data } = await supabase
        .from('quests')
        .select('*')
        .order('order', { ascending: true })

      if (data) {
        setQuests(data)
      }
      setLoading(false)
    }

    fetchQuests()
  }, [])

  // Get the first active quest (sorted by order) for the main button
  const activeQuest = quests.find(q => q.is_active)

  return (
    <div
      className="min-h-screen p-4 flex flex-col"
      style={{
        backgroundImage: 'url(/background_pink.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header - Full width at very top */}
      <div className="flex justify-between items-start mb-8">
        <img src="/logo_fn.svg" alt="Forward Networks" className="h-12" />
        <img src="/profile_icon.svg" alt="Profile" className="h-12 w-12 cursor-pointer" onClick={() => navigate('/profile')} />
      </div>

      {/* Logo in center */}
      <div className="flex-1 flex items-center justify-center">
        <img src="/logo_transparent.png" alt="Forward Networks" className="w-full max-w-2xl" />
      </div>

      {/* Quest Buttons at bottom */}
      <div className="flex justify-center gap-4 mb-8">
        {!loading && (
          <>
            <button
              className="btn-secondary-md"
              onClick={() => navigate('/profile')}
            >
              Previous Missions
            </button>
            {activeQuest && (
              <button
                className="btn-primary-md"
                onClick={() => navigate(`/quest/${activeQuest.id}`)}
              >
                <Zap className="inline-block w-6 h-6 mr-2 fill-current" />
                {activeQuest.name}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
