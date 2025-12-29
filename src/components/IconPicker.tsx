import { PLAYER_ICONS } from '@/types/live'

interface IconPickerProps {
  value: string | null
  onChange: (iconId: string) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm text-center">Choose your avatar:</p>
      <div className="grid grid-cols-5 gap-3">
        {PLAYER_ICONS.map((icon) => (
          <button
            key={icon.id}
            onClick={() => onChange(icon.id)}
            className={`aspect-square flex items-center justify-center text-4xl rounded-xl transition-all ${
              value === icon.id
                ? 'bg-[var(--fn-green)] ring-2 ring-white scale-110'
                : 'bg-[var(--fn-blue-dark)] hover:bg-opacity-80 hover:scale-105'
            }`}
            title={icon.label}
          >
            {icon.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
