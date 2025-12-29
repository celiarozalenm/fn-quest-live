import { useState } from 'react'
import { generateFunName } from '@/lib/funNames'
import { RefreshCw } from 'lucide-react'

interface FunNameGeneratorProps {
  value: string
  onChange: (name: string) => void
}

export default function FunNameGenerator({ value, onChange }: FunNameGeneratorProps) {
  const [isSpinning, setIsSpinning] = useState(false)

  const handleGenerate = () => {
    setIsSpinning(true)

    // Create spinning animation effect
    let spins = 0
    const maxSpins = 10
    const interval = setInterval(() => {
      onChange(generateFunName())
      spins++

      if (spins >= maxSpins) {
        clearInterval(interval)
        setIsSpinning(false)
      }
    }, 100)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Your player name is:</p>
        <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6 mb-4">
          <p className={`text-3xl font-bold text-white transition-all ${isSpinning ? 'opacity-70' : ''}`}>
            {value || 'Click to generate!'}
          </p>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isSpinning}
        className="w-full flex items-center justify-center gap-2 bg-[var(--fn-blue-dark)] text-white py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
        {isSpinning ? 'Generating...' : 'Spin Again'}
      </button>
    </div>
  )
}
