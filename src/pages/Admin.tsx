import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus, Trash2, Edit, ChevronDown, ChevronRight, LogOut,
  Save, X, GripVertical, LayoutList, ScrollText, BarChart3, Loader2, Copy, Trophy, Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Quest, Level, Challenge, ChallengeField, ChallengeHint, Result, User } from '@/types/database'

type AdminSection = 'quests' | 'rules' | 'leaderboards' | 'users' | 'metrics'

const ADMIN_SESSION_KEY = 'fn_quest_admin_session'

// Level name mapping
const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Expert',
  4: 'Advanced',
  5: 'Master'
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validUsername = import.meta.env.VITE_ADMIN_USERNAME
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (username === validUsername && password === validPassword) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true')
      onLogin()
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] flex flex-col items-center justify-center p-4">
      <img src="/logo_fn.svg" alt="Forward Networks" className="w-20 mb-10" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      <button
        className="mt-6 text-white underline hover:text-gray-300 transition-colors"
        onClick={() => navigate('/quests')}
      >
        Go back to quest
      </button>
    </div>
  )
}

// Quest Form Modal
function QuestForm({
  quest,
  onSave,
  onCancel,
  saving
}: {
  quest?: Quest | null
  onSave: (data: Partial<Quest>) => void
  onCancel: () => void
  saving?: boolean
}) {
  const [formData, setFormData] = useState({
    name: quest?.name || '',
    title: quest?.title || '',
    mission: quest?.mission || '',
    achievements: quest?.achievements || '',
    is_active: quest?.is_active || false
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{quest ? 'Edit Quest' : 'New Quest'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); if (!saving) onSave(formData) }} className="space-y-4">
            <div>
              <label className="block text-base font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-base"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-2">Title (displayed)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-base"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-2">Mission</label>
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg min-h-[100px] text-base"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-2">Achievements</label>
              <textarea
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg min-h-[80px] text-base"
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
                disabled={saving}
              />
              <label htmlFor="is_active" className="text-base font-medium">Active</label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={onCancel} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Level Form Modal
function LevelForm({
  level,
  questId,
  existingLevels,
  onSave,
  onCancel
}: {
  level?: Level | null
  questId: string
  existingLevels: Level[]
  onSave: (data: { level_number: number; name: string | null }) => void
  onCancel: () => void
}) {
  const nextLevelNumber = level?.level_number || Math.max(0, ...existingLevels.map(l => l.level_number)) + 1
  const [formData, setFormData] = useState({
    level_number: nextLevelNumber,
    name: level?.name || LEVEL_NAMES[nextLevelNumber] || ''
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{level ? 'Edit Level' : 'New Level'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Level Number</label>
              <input
                type="number"
                min="1"
                value={formData.level_number}
                onChange={(e) => {
                  const num = parseInt(e.target.value)
                  setFormData({
                    ...formData,
                    level_number: num,
                    name: LEVEL_NAMES[num] || formData.name
                  })
                }}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Level Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg"
                placeholder="e.g., Beginner, Intermediate, Expert"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Challenge Field Component
function FieldEditor({
  field,
  index,
  onChange,
  onRemove
}: {
  field: Partial<ChallengeField>
  index: number
  onChange: (field: Partial<ChallengeField>) => void
  onRemove: () => void
}) {
  const [newOption, setNewOption] = useState('')
  const [draggedOptionIndex, setDraggedOptionIndex] = useState<number | null>(null)
  const [dragOverOptionIndex, setDragOverOptionIndex] = useState<number | null>(null)

  const addDropdownOption = () => {
    if (!newOption.trim()) return
    const currentOptions = field.dropdown_options || []
    onChange({
      ...field,
      dropdown_options: [...currentOptions, newOption.trim()]
    })
    setNewOption('')
  }

  const removeDropdownOption = (optionIndex: number) => {
    const currentOptions = field.dropdown_options || []
    const removedOption = currentOptions[optionIndex]
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex)
    onChange({
      ...field,
      dropdown_options: newOptions,
      // Clear correct_answer if it was the removed option
      correct_answer: field.correct_answer === removedOption ? '' : field.correct_answer
    })
  }

  const setCorrectOption = (option: string) => {
    onChange({ ...field, correct_answer: option })
  }

  // Drag and drop handlers for dropdown options
  const handleOptionDragStart = (e: React.DragEvent, optionIndex: number) => {
    setDraggedOptionIndex(optionIndex)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleOptionDragOver = (e: React.DragEvent, optionIndex: number) => {
    e.preventDefault()
    if (draggedOptionIndex !== null && draggedOptionIndex !== optionIndex) {
      setDragOverOptionIndex(optionIndex)
    }
  }

  const handleOptionDragLeave = () => {
    setDragOverOptionIndex(null)
  }

  const handleOptionDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedOptionIndex === null || draggedOptionIndex === targetIndex) {
      setDraggedOptionIndex(null)
      setDragOverOptionIndex(null)
      return
    }

    const currentOptions = [...(field.dropdown_options || [])]
    const [draggedOption] = currentOptions.splice(draggedOptionIndex, 1)
    currentOptions.splice(targetIndex, 0, draggedOption)

    onChange({
      ...field,
      dropdown_options: currentOptions
    })

    setDraggedOptionIndex(null)
    setDragOverOptionIndex(null)
  }

  const handleOptionDragEnd = () => {
    setDraggedOptionIndex(null)
    setDragOverOptionIndex(null)
  }

  return (
    <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Field {index + 1}</span>
        <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1">Type</label>
          <select
            value={field.field_type || 'text'}
            onChange={(e) => onChange({ ...field, field_type: e.target.value as 'text' | 'dropdown', correct_answer: '', dropdown_options: [] })}
            className="w-full px-2 py-1 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded text-base cursor-pointer"
          >
            <option value="text">Text Input</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Label (optional)</label>
          <input
            type="text"
            value={field.label || ''}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            className="w-full px-2 py-1 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded text-base"
            placeholder="e.g., IP Address"
          />
        </div>
      </div>
      {field.field_type === 'text' && (
        <div>
          <label className="block text-xs mb-1">Correct Answer</label>
          <input
            type="text"
            value={field.correct_answer || ''}
            onChange={(e) => onChange({ ...field, correct_answer: e.target.value })}
            className="w-full px-2 py-1 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded text-base"
            required
          />
        </div>
      )}
      {field.field_type === 'dropdown' && (
        <div>
          <label className="block text-xs mb-1">Dropdown Options (drag to reorder, select the correct one)</label>
          <div className="space-y-2">
            {(field.dropdown_options || []).map((option, optionIndex) => (
              <div
                key={optionIndex}
                draggable
                onDragStart={(e) => handleOptionDragStart(e, optionIndex)}
                onDragOver={(e) => handleOptionDragOver(e, optionIndex)}
                onDragLeave={handleOptionDragLeave}
                onDrop={(e) => handleOptionDrop(e, optionIndex)}
                onDragEnd={handleOptionDragEnd}
                className={`flex items-center gap-2 p-1 rounded transition-all ${
                  draggedOptionIndex === optionIndex ? 'opacity-50' : ''
                } ${
                  dragOverOptionIndex === optionIndex ? 'bg-[hsl(var(--primary))]/20 border border-[hsl(var(--primary))]' : ''
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-700 rounded">
                  <GripVertical className="w-3 h-3 text-gray-500" />
                </div>
                <input
                  type="radio"
                  name={`correct-option-${index}`}
                  checked={field.correct_answer === option}
                  onChange={() => setCorrectOption(option)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="flex-1 text-base">{option}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer h-6 w-6 p-0"
                  onClick={() => removeDropdownOption(optionIndex)}
                >
                  <X className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDropdownOption())}
                className="flex-1 px-2 py-1 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded text-base"
                placeholder="Add option..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={addDropdownOption}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {(field.dropdown_options || []).length > 0 && !field.correct_answer && (
            <p className="text-xs text-yellow-500 mt-1">Select the correct answer</p>
          )}
        </div>
      )}
    </div>
  )
}

// Challenge Form Modal
function ChallengeForm({
  challenge,
  levelId,
  existingChallenges,
  onSave,
  onCancel
}: {
  challenge?: (Challenge & { fields?: ChallengeField[]; hints?: ChallengeHint[] }) | null
  levelId: string
  existingChallenges: Challenge[]
  onSave: (data: {
    question: string
    description: string
    solution: string
    fields: Partial<ChallengeField>[]
    hints: string[]
  }) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    question: challenge?.question || '',
    description: challenge?.description || '',
    solution: challenge?.solution || '',
    fields: challenge?.fields?.length ? challenge.fields.map(f => ({
      field_type: f.field_type,
      label: f.label,
      correct_answer: f.correct_answer,
      dropdown_options: f.dropdown_options,
      order: f.order
    })) : [{ field_type: 'text' as const, label: '', correct_answer: '', dropdown_options: null, order: 0 }],
    hints: challenge?.hints?.sort((a, b) => a.order - b.order).map(h => h.hint_text) || ['', '', '']
  })

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Save content when clicking outside
      onSave({
        ...formData,
        hints: formData.hints.filter(h => h.trim())
      })
    }
  }

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, {
        field_type: 'text' as const,
        label: '',
        correct_answer: '',
        dropdown_options: null,
        order: formData.fields.length
      }]
    })
  }

  const updateField = (index: number, field: Partial<ChallengeField>) => {
    const newFields = [...formData.fields]
    newFields[index] = field
    setFormData({ ...formData, fields: newFields })
  }

  const removeField = (index: number) => {
    if (formData.fields.length > 1) {
      setFormData({
        ...formData,
        fields: formData.fields.filter((_, i) => i !== index)
      })
    }
  }

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints]
    newHints[index] = value
    setFormData({ ...formData, hints: newHints })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{challenge ? 'Edit Challenge' : 'New Challenge'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            onSave({
              ...formData,
              hints: formData.hints.filter(h => h.trim())
            })
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Challenge Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg min-h-[80px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg min-h-[80px]"
                required
              />
            </div>

            {/* Answer Fields */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Answer Fields</label>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Field
                </Button>
              </div>
              <div className="space-y-3">
                {formData.fields.map((field, index) => (
                  <FieldEditor
                    key={index}
                    field={field}
                    index={index}
                    onChange={(f) => updateField(index, f)}
                    onRemove={() => removeField(index)}
                  />
                ))}
              </div>
            </div>

            {/* Hints */}
            <div>
              <label className="block text-sm font-medium mb-2">Hints (revealed progressively)</label>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">Hint {i + 1}</span>
                    <input
                      type="text"
                      value={formData.hints[i] || ''}
                      onChange={(e) => updateHint(i, e.target.value)}
                      className="flex-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-base"
                      placeholder={`Hint ${i + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Solution (explanation)</label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg min-h-[80px]"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  message,
  onConfirm,
  onCancel
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Confirm Delete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
              onClick={onConfirm}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Rules Editor Component
const defaultRules = [
  'Winners can only receive a prize once every 90 days.',
  'You only get one attempt per level — no retries.',
  'Use only your own Quest account — no alternates or shared logins.',
  'Complete challenges on your own — no outside help.',
  "Don't share answers, screenshots, or walkthroughs.",
  'Forward Networks may verify identities and disqualify players if needed.',
]

function RulesEditor() {
  const [rules, setRules] = useState<string[]>(defaultRules)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadRules() {
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
          // Use default rules
        }
      }
    }
    loadRules()
  }, [])

  const saveRules = useCallback(async (rulesToSave: string[]) => {
    setSaving(true)
    setMessage(null)
    try {
      const filteredRules = rulesToSave.filter(r => r.trim())
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'quest_rules',
          value: JSON.stringify(filteredRules),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (error) throw error
      setMessage('Saved')
      setTimeout(() => setMessage(null), 2000)
    } catch {
      setMessage('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [])

  const debouncedSave = useCallback((newRules: string[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveRules(newRules)
    }, 500)
  }, [saveRules])

  const updateRule = (index: number, value: string) => {
    const newRules = [...rules]
    newRules[index] = value
    setRules(newRules)
    debouncedSave(newRules)
  }

  const addRule = async () => {
    const newRules = [...rules, '']
    setRules(newRules)
    setEditingIndex(newRules.length - 1) // Auto-edit the new rule
  }

  const confirmRemoveRule = (index: number) => {
    setDeleteIndex(index)
  }

  const removeRule = async () => {
    if (deleteIndex === null || rules.length <= 1) return
    const newRules = rules.filter((_, i) => i !== deleteIndex)
    setRules(newRules)
    setDeleteIndex(null)
    setEditingIndex(null)
    await saveRules(newRules)
  }

  const finishEditing = () => {
    setEditingIndex(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quest Rules</span>
            <div className="flex items-center gap-2">
              {saving && <span className="text-sm text-gray-400 font-normal">Saving...</span>}
              {!saving && message && (
                <span className={`text-sm font-normal ${message === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="group flex gap-2 items-start">
                <span className="text-gray-400 mt-2">{index + 1}.</span>
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                    autoFocus
                    className="flex-1 px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg"
                    placeholder="Enter rule..."
                  />
                ) : (
                  <span className="flex-1 px-3 py-2 text-gray-200">{rule}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingIndex(index)}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => confirmRemoveRule(index)}
                  disabled={rules.length <= 1}
                  className="cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={addRule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {deleteIndex !== null && (
        <DeleteConfirmModal
          message="Are you sure you want to delete this rule?"
          onConfirm={removeRule}
          onCancel={() => setDeleteIndex(null)}
        />
      )}
    </>
  )
}

// Metrics Section Component
function MetricsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Metrics and analytics will be displayed here.</p>
      </CardContent>
    </Card>
  )
}

// Leaderboards Section Component
function LeaderboardsSection() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [selectedQuest, setSelectedQuest] = useState<string>('all')
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'failed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .order('order', { ascending: true })

      if (questsData) setQuests(questsData)

      // Fetch results with quest info
      const { data: resultsData } = await supabase
        .from('results')
        .select('*')
        .order('time_seconds', { ascending: true })

      if (resultsData) setResults(resultsData)

      setLoading(false)
    }

    fetchData()
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const filteredResults = results.filter(result => {
    // Filter by quest
    if (selectedQuest !== 'all' && result.quest_id !== selectedQuest) return false

    // Filter by completion status
    if (filterCompleted === 'completed' && !result.eligible_for_leaderboard) return false
    if (filterCompleted === 'failed' && result.eligible_for_leaderboard) return false

    return true
  })

  // Group by quest for display
  const resultsByQuest = filteredResults.reduce((acc, result) => {
    const questId = result.quest_id
    if (!acc[questId]) acc[questId] = []
    acc[questId].push(result)
    return acc
  }, {} as Record<string, Result[]>)

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-400">Loading leaderboards...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Leaderboards</h2>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Quest:</label>
              <select
                value={selectedQuest}
                onChange={(e) => setSelectedQuest(e.target.value)}
                className="px-3 py-1.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm cursor-pointer"
              >
                <option value="all">All Quests</option>
                {quests.map(quest => (
                  <option key={quest.id} value={quest.id}>{quest.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Status:</label>
              <select
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value as 'all' | 'completed' | 'failed')}
                className="px-3 py-1.5 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm cursor-pointer"
              >
                <option value="all">All</option>
                <option value="completed">Completed (Eligible)</option>
                <option value="failed">Failed (Used Solution)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by Quest */}
      {Object.keys(resultsByQuest).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-400">No results found</div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(resultsByQuest).map(([questId, questResults]) => {
          const quest = quests.find(q => q.id === questId)
          const eligibleResults = questResults.filter(r => r.eligible_for_leaderboard)
          const failedResults = questResults.filter(r => !r.eligible_for_leaderboard)

          return (
            <Card key={questId} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  {quest?.name || 'Unknown Quest'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Eligible participants (completed successfully) */}
                {(filterCompleted === 'all' || filterCompleted === 'completed') && eligibleResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-green-400 mb-3">
                      Completed Successfully ({eligibleResults.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[hsl(var(--border))]">
                            <th className="text-left py-2 px-3 text-gray-400">#</th>
                            <th className="text-left py-2 px-3 text-gray-400">Initials</th>
                            <th className="text-left py-2 px-3 text-gray-400">Email</th>
                            <th className="text-left py-2 px-3 text-gray-400">Time</th>
                            <th className="text-left py-2 px-3 text-gray-400">Hints Used</th>
                            <th className="text-left py-2 px-3 text-gray-400">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eligibleResults.map((result, index) => (
                            <tr key={result.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]">
                              <td className="py-2 px-3">
                                {index === 0 && <span className="text-yellow-500">🥇</span>}
                                {index === 1 && <span className="text-gray-300">🥈</span>}
                                {index === 2 && <span className="text-orange-400">🥉</span>}
                                {index > 2 && <span className="text-gray-400">{index + 1}</span>}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold">{result.initials}</td>
                              <td className="py-2 px-3 text-gray-300">{result.email}</td>
                              <td className="py-2 px-3 font-mono">{formatTime(result.time_seconds)}</td>
                              <td className="py-2 px-3">{result.hints_used}</td>
                              <td className="py-2 px-3 text-gray-400">
                                {new Date(result.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Failed participants (used solution) */}
                {(filterCompleted === 'all' || filterCompleted === 'failed') && failedResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-3">
                      Used Solution ({failedResults.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[hsl(var(--border))]">
                            <th className="text-left py-2 px-3 text-gray-400">Initials</th>
                            <th className="text-left py-2 px-3 text-gray-400">Email</th>
                            <th className="text-left py-2 px-3 text-gray-400">Time</th>
                            <th className="text-left py-2 px-3 text-gray-400">Hints Used</th>
                            <th className="text-left py-2 px-3 text-gray-400">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {failedResults.map((result) => (
                            <tr key={result.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]">
                              <td className="py-2 px-3 font-mono">{result.initials}</td>
                              <td className="py-2 px-3 text-gray-300">{result.email}</td>
                              <td className="py-2 px-3 font-mono">{formatTime(result.time_seconds)}</td>
                              <td className="py-2 px-3">{result.hints_used}</td>
                              <td className="py-2 px-3 text-gray-400">
                                {new Date(result.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {eligibleResults.length === 0 && failedResults.length === 0 && (
                  <div className="text-center text-gray-400 py-4">No results for this quest</div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </>
  )
}

// Users Section Component
function UsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)

      const { data } = await supabase
        .from('users')
        .select('*')
        .order('last_login', { ascending: false })

      if (data) setUsers(data)

      setLoading(false)
    }

    fetchUsers()
  }, [])

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-400">Loading users...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Users</h2>
        <span className="text-gray-400">{users.length} total users</span>
      </div>

      <Card>
        <CardContent className="py-4">
          {users.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No users have logged in yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left py-2 px-3 text-gray-400">Email</th>
                    <th className="text-left py-2 px-3 text-gray-400">Type</th>
                    <th className="text-left py-2 px-3 text-gray-400">First Login</th>
                    <th className="text-left py-2 px-3 text-gray-400">Last Login</th>
                    <th className="text-left py-2 px-3 text-gray-400">Login Count</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]">
                      <td className="py-2 px-3">{user.email}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          user.user_type === 'employee'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {user.user_type || 'unknown'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-300">{formatDateTime(user.first_login)}</td>
                      <td className="py-2 px-3 text-gray-300">{formatDateTime(user.last_login)}</td>
                      <td className="py-2 px-3">{user.login_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// Quests Section Component
function QuestsSection() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [levels, setLevels] = useState<Record<string, Level[]>>({})
  const [challenges, setChallenges] = useState<Record<string, (Challenge & { fields?: ChallengeField[]; hints?: ChallengeHint[] })[]>>({})
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({})
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingQuest, setSavingQuest] = useState(false)
  const [deleteQuestId, setDeleteQuestId] = useState<string | null>(null)
  const [deleteLevelInfo, setDeleteLevelInfo] = useState<{ levelId: string; questId: string } | null>(null)
  const [deleteChallengeInfo, setDeleteChallengeInfo] = useState<{ challengeId: string; levelId: string } | null>(null)
  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null)
  const [dragOverQuestId, setDragOverQuestId] = useState<string | null>(null)
  const [draggedChallengeId, setDraggedChallengeId] = useState<string | null>(null)
  const [dragOverChallengeId, setDragOverChallengeId] = useState<string | null>(null)
  const [dragChallengeLevel, setDragChallengeLevel] = useState<string | null>(null)
  const [copiedToast, setCopiedToast] = useState<string | null>(null)

  // Form states
  const [showQuestForm, setShowQuestForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [showLevelForm, setShowLevelForm] = useState<string | null>(null)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState<string | null>(null)
  const [editingChallenge, setEditingChallenge] = useState<(Challenge & { fields?: ChallengeField[]; hints?: ChallengeHint[] }) | null>(null)

  // Load quests
  useEffect(() => {
    loadQuests()
  }, [])

  const loadQuests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      setQuests(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests')
    } finally {
      setLoading(false)
    }
  }

  const loadLevels = async (questId: string) => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('quest_id', questId)
        .order('level_number', { ascending: true })

      if (error) throw error
      setLevels(prev => ({ ...prev, [questId]: data || [] }))

      // Load challenge counts for each level
      if (data && data.length > 0) {
        const levelIds = data.map(l => l.id)
        const { data: challengeData } = await supabase
          .from('challenges')
          .select('level_id')
          .in('level_id', levelIds)

        if (challengeData) {
          // Group by level_id and count
          const counts: Record<string, number> = {}
          levelIds.forEach(id => { counts[id] = 0 })
          challengeData.forEach(c => {
            counts[c.level_id] = (counts[c.level_id] || 0) + 1
          })
          setChallengeCounts(prev => ({ ...prev, ...counts }))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load levels')
    }
  }

  const loadChallenges = async (levelId: string) => {
    try {
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('level_id', levelId)
        .order('order', { ascending: true })

      if (challengeError) throw challengeError

      // Load fields and hints for each challenge
      const challengesWithDetails = await Promise.all(
        (challengeData || []).map(async (challenge) => {
          const [fieldsResult, hintsResult] = await Promise.all([
            supabase
              .from('challenge_fields')
              .select('*')
              .eq('challenge_id', challenge.id)
              .order('order', { ascending: true }),
            supabase
              .from('challenge_hints')
              .select('*')
              .eq('challenge_id', challenge.id)
              .order('order', { ascending: true })
          ])

          return {
            ...challenge,
            fields: fieldsResult.data || [],
            hints: hintsResult.data || []
          }
        })
      )

      setChallenges(prev => ({ ...prev, [levelId]: challengesWithDetails }))
      // Update challenge count
      setChallengeCounts(prev => ({ ...prev, [levelId]: challengesWithDetails.length }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges')
    }
  }

  // Quest CRUD
  const saveQuest = async (data: Partial<Quest>) => {
    setSavingQuest(true)
    try {
      if (editingQuest) {
        const { error } = await supabase
          .from('quests')
          .update(data)
          .eq('id', editingQuest.id)
        if (error) throw error
      } else {
        // New quests go to order 0 (top), shift existing quests down
        const minOrder = Math.min(...quests.map(q => q.order), 1)
        const { error } = await supabase
          .from('quests')
          .insert({ ...data, order: minOrder - 1 } as Quest)
        if (error) throw error
      }
      setShowQuestForm(false)
      setEditingQuest(null)
      loadQuests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quest')
    } finally {
      setSavingQuest(false)
    }
  }

  const confirmDeleteQuest = (questId: string) => {
    setDeleteQuestId(questId)
  }

  const deleteQuest = async () => {
    if (!deleteQuestId) return
    try {
      const { error } = await supabase.from('quests').delete().eq('id', deleteQuestId)
      if (error) throw error
      setDeleteQuestId(null)
      loadQuests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quest')
    }
  }

  const handleDragStart = (e: React.DragEvent, questId: string) => {
    setDraggedQuestId(questId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, questId: string) => {
    e.preventDefault()
    if (draggedQuestId && draggedQuestId !== questId) {
      setDragOverQuestId(questId)
    }
  }

  const handleDragLeave = () => {
    setDragOverQuestId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetQuestId: string) => {
    e.preventDefault()
    if (!draggedQuestId || draggedQuestId === targetQuestId) {
      setDraggedQuestId(null)
      setDragOverQuestId(null)
      return
    }

    const draggedIndex = quests.findIndex(q => q.id === draggedQuestId)
    const targetIndex = quests.findIndex(q => q.id === targetQuestId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Reorder locally first for immediate feedback
    const newQuests = [...quests]
    const [draggedQuest] = newQuests.splice(draggedIndex, 1)
    newQuests.splice(targetIndex, 0, draggedQuest)

    // Update orders in database
    try {
      const updates = newQuests.map((quest, index) =>
        supabase.from('quests').update({ order: index }).eq('id', quest.id)
      )
      await Promise.all(updates)
      loadQuests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder quest')
    }

    setDraggedQuestId(null)
    setDragOverQuestId(null)
  }

  const handleDragEnd = () => {
    setDraggedQuestId(null)
    setDragOverQuestId(null)
  }

  // Level CRUD
  const saveLevel = async (questId: string, data: { level_number: number; name: string | null }) => {
    try {
      if (editingLevel) {
        const { error } = await supabase
          .from('levels')
          .update(data)
          .eq('id', editingLevel.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('levels')
          .insert({ ...data, quest_id: questId })
        if (error) throw error
      }
      setShowLevelForm(null)
      setEditingLevel(null)
      loadLevels(questId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save level')
    }
  }

  const confirmDeleteLevel = (levelId: string, questId: string) => {
    setDeleteLevelInfo({ levelId, questId })
  }

  const deleteLevel = async () => {
    if (!deleteLevelInfo) return
    try {
      const { error } = await supabase.from('levels').delete().eq('id', deleteLevelInfo.levelId)
      if (error) throw error
      loadLevels(deleteLevelInfo.questId)
      setDeleteLevelInfo(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete level')
    }
  }

  // Challenge CRUD
  const saveChallenge = async (
    levelId: string,
    data: {
      question: string
      description: string
      solution: string
      fields: Partial<ChallengeField>[]
      hints: string[]
    }
  ) => {
    try {
      let challengeId: string

      if (editingChallenge) {
        challengeId = editingChallenge.id
        const { error } = await supabase
          .from('challenges')
          .update({
            question: data.question,
            description: data.description,
            solution: data.solution
          })
          .eq('id', challengeId)
        if (error) throw error

        // Delete existing fields and hints
        await Promise.all([
          supabase.from('challenge_fields').delete().eq('challenge_id', challengeId),
          supabase.from('challenge_hints').delete().eq('challenge_id', challengeId)
        ])
      } else {
        const existingChallenges = challenges[levelId] || []
        const maxOrder = Math.max(0, ...existingChallenges.map(c => c.order))

        const { data: newChallenge, error } = await supabase
          .from('challenges')
          .insert({
            level_id: levelId,
            question: data.question,
            description: data.description,
            solution: data.solution,
            order: maxOrder + 1,
            correct_answer: data.fields[0]?.correct_answer || ''
          })
          .select()
          .single()
        if (error) throw error
        challengeId = newChallenge.id
      }

      // Insert fields
      if (data.fields.length > 0) {
        const fieldsToInsert = data.fields.map((field, index) => ({
          challenge_id: challengeId,
          field_type: field.field_type || 'text',
          label: field.label || null,
          correct_answer: field.correct_answer || '',
          dropdown_options: field.dropdown_options || null,
          order: index
        }))
        const { error: fieldsError } = await supabase
          .from('challenge_fields')
          .insert(fieldsToInsert)
        if (fieldsError) throw fieldsError
      }

      // Insert hints
      const hintsToInsert = data.hints
        .filter(h => h.trim())
        .map((hint, index) => ({
          challenge_id: challengeId,
          hint_text: hint,
          order: index + 1
        }))
      if (hintsToInsert.length > 0) {
        const { error: hintsError } = await supabase
          .from('challenge_hints')
          .insert(hintsToInsert)
        if (hintsError) throw hintsError
      }

      setShowChallengeForm(null)
      setEditingChallenge(null)
      loadChallenges(levelId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save challenge')
    }
  }

  const confirmDeleteChallenge = (challengeId: string, levelId: string) => {
    setDeleteChallengeInfo({ challengeId, levelId })
  }

  const deleteChallenge = async () => {
    if (!deleteChallengeInfo) return
    try {
      const { error } = await supabase.from('challenges').delete().eq('id', deleteChallengeInfo.challengeId)
      if (error) throw error
      loadChallenges(deleteChallengeInfo.levelId)
      setDeleteChallengeInfo(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete challenge')
    }
  }

  // Challenge drag and drop handlers
  const handleChallengeDragStart = (e: React.DragEvent, challengeId: string, levelId: string) => {
    setDraggedChallengeId(challengeId)
    setDragChallengeLevel(levelId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleChallengeDragOver = (e: React.DragEvent, challengeId: string) => {
    e.preventDefault()
    if (draggedChallengeId && draggedChallengeId !== challengeId) {
      setDragOverChallengeId(challengeId)
    }
  }

  const handleChallengeDragLeave = () => {
    setDragOverChallengeId(null)
  }

  const handleChallengeDrop = async (e: React.DragEvent, targetChallengeId: string, levelId: string) => {
    e.preventDefault()
    if (!draggedChallengeId || draggedChallengeId === targetChallengeId || dragChallengeLevel !== levelId) {
      setDraggedChallengeId(null)
      setDragOverChallengeId(null)
      setDragChallengeLevel(null)
      return
    }

    const levelChallenges = challenges[levelId] || []
    const draggedIndex = levelChallenges.findIndex(c => c.id === draggedChallengeId)
    const targetIndex = levelChallenges.findIndex(c => c.id === targetChallengeId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Reorder locally first for immediate feedback
    const newChallenges = [...levelChallenges]
    const [draggedChallenge] = newChallenges.splice(draggedIndex, 1)
    newChallenges.splice(targetIndex, 0, draggedChallenge)

    // Update orders in database
    try {
      const updates = newChallenges.map((challenge, index) =>
        supabase.from('challenges').update({ order: index }).eq('id', challenge.id)
      )
      await Promise.all(updates)
      loadChallenges(levelId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder challenge')
    }

    setDraggedChallengeId(null)
    setDragOverChallengeId(null)
    setDragChallengeLevel(null)
  }

  const handleChallengeDragEnd = () => {
    setDraggedChallengeId(null)
    setDragOverChallengeId(null)
    setDragChallengeLevel(null)
  }

  const toggleQuestActive = async (quest: Quest) => {
    try {
      const { error } = await supabase
        .from('quests')
        .update({ is_active: !quest.is_active })
        .eq('id', quest.id)
      if (error) throw error
      loadQuests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle quest status')
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Quests</h2>
        <Button className="cursor-pointer" onClick={() => { setEditingQuest(null); setShowQuestForm(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          New Quest
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : quests.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No quests yet. Create your first quest!
        </div>
      ) : (
        <div className="space-y-4">
          {quests.map((quest) => (
            <Card
              key={quest.id}
              draggable
              onDragStart={(e) => handleDragStart(e, quest.id)}
              onDragOver={(e) => handleDragOver(e, quest.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, quest.id)}
              onDragEnd={handleDragEnd}
              className={`transition-all ${
                draggedQuestId === quest.id ? 'opacity-50' : ''
              } ${
                dragOverQuestId === quest.id ? 'border-2 border-[hsl(var(--primary))]' : ''
              }`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => {
                  const newExpanded = expandedQuest === quest.id ? null : quest.id
                  setExpandedQuest(newExpanded)
                  if (newExpanded && !levels[quest.id]) {
                    loadLevels(quest.id)
                  }
                }}
              >
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-700 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </div>
                    {expandedQuest === quest.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span>{quest.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuestActive(quest) }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
                      style={{ backgroundColor: quest.is_active ? 'hsl(var(--primary))' : '#4b5563' }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          quest.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => { setEditingQuest(quest); setShowQuestForm(true) }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => confirmDeleteQuest(quest.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              {expandedQuest === quest.id && (
                <CardContent>
                  <div className="border-l-2 border-[hsl(var(--border))] pl-4 ml-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Levels</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => { setEditingLevel(null); setShowLevelForm(quest.id) }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Level
                      </Button>
                    </div>

                    {!levels[quest.id] ? (
                      <div className="text-gray-400 text-sm">Loading levels...</div>
                    ) : levels[quest.id].length === 0 ? (
                      <div className="text-gray-400 text-sm">No levels yet</div>
                    ) : (
                      levels[quest.id].map((level) => (
                        <Card key={level.id} className="mb-4">
                          <CardHeader
                            className="cursor-pointer py-3"
                            onClick={() => {
                              const newExpanded = expandedLevel === level.id ? null : level.id
                              setExpandedLevel(newExpanded)
                              if (newExpanded && !challenges[level.id]) {
                                loadChallenges(level.id)
                              }
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {expandedLevel === level.id ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <span>
                                  Level {level.level_number}
                                  {level.name && ` - ${level.name}`}
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({challengeCounts[level.id] ?? challenges[level.id]?.length ?? 0} challenges)
                                </span>
                              </div>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => { setEditingLevel(level); setShowLevelForm(quest.id) }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => confirmDeleteLevel(level.id, quest.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {expandedLevel === level.id && (
                            <CardContent className="py-2">
                              <div className="border-l-2 border-[hsl(var(--border))] pl-4">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-semibold">Challenges</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => { setEditingChallenge(null); setShowChallengeForm(level.id) }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Challenge
                                  </Button>
                                </div>

                                {!challenges[level.id] ? (
                                  <div className="text-gray-400 text-sm">Loading challenges...</div>
                                ) : challenges[level.id].length === 0 ? (
                                  <div className="text-gray-400 text-sm">No challenges yet</div>
                                ) : (
                                  challenges[level.id].map((challenge, index) => (
                                    <div
                                      key={challenge.id}
                                      draggable
                                      onDragStart={(e) => handleChallengeDragStart(e, challenge.id, level.id)}
                                      onDragOver={(e) => handleChallengeDragOver(e, challenge.id)}
                                      onDragLeave={handleChallengeDragLeave}
                                      onDrop={(e) => handleChallengeDrop(e, challenge.id, level.id)}
                                      onDragEnd={handleChallengeDragEnd}
                                      className={`flex justify-between items-center p-3 bg-[hsl(var(--secondary))] rounded mb-2 transition-all ${
                                        draggedChallengeId === challenge.id ? 'opacity-50' : ''
                                      } ${
                                        dragOverChallengeId === challenge.id ? 'border-2 border-[hsl(var(--primary))]' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="text-gray-400 font-mono text-sm w-6">{index + 1}.</span>
                                        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-700 rounded">
                                          <GripVertical className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                          <span className="text-sm">{challenge.question}</span>
                                          <div className="text-xs text-gray-400">
                                            {challenge.fields?.length || 0} fields, {challenge.hints?.length || 0} hints
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="cursor-pointer"
                                          title="Copy correct answer(s)"
                                          onClick={async () => {
                                            const answers = challenge.fields?.map(f => f.correct_answer).filter(Boolean).join(', ') || ''
                                            if (answers) {
                                              try {
                                                await navigator.clipboard.writeText(answers)
                                                setCopiedToast(challenge.id)
                                                setTimeout(() => setCopiedToast(null), 2000)
                                              } catch {
                                                // Fallback for older browsers
                                                const textArea = document.createElement('textarea')
                                                textArea.value = answers
                                                document.body.appendChild(textArea)
                                                textArea.select()
                                                document.execCommand('copy')
                                                document.body.removeChild(textArea)
                                                setCopiedToast(challenge.id)
                                                setTimeout(() => setCopiedToast(null), 2000)
                                              }
                                            }
                                          }}
                                        >
                                          {copiedToast === challenge.id ? (
                                            <span className="text-xs text-green-400">Copied!</span>
                                          ) : (
                                            <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="cursor-pointer"
                                          onClick={() => { setEditingChallenge(challenge); setShowChallengeForm(level.id) }}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="cursor-pointer"
                                          onClick={() => confirmDeleteChallenge(challenge.id, level.id)}
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showQuestForm && (
        <QuestForm
          quest={editingQuest}
          onSave={saveQuest}
          onCancel={() => { setShowQuestForm(false); setEditingQuest(null) }}
          saving={savingQuest}
        />
      )}

      {showLevelForm && (
        <LevelForm
          level={editingLevel}
          questId={showLevelForm}
          existingLevels={levels[showLevelForm] || []}
          onSave={(data) => saveLevel(showLevelForm, data)}
          onCancel={() => { setShowLevelForm(null); setEditingLevel(null) }}
        />
      )}

      {showChallengeForm && (
        <ChallengeForm
          challenge={editingChallenge}
          levelId={showChallengeForm}
          existingChallenges={challenges[showChallengeForm] || []}
          onSave={(data) => saveChallenge(showChallengeForm, data)}
          onCancel={() => { setShowChallengeForm(null); setEditingChallenge(null) }}
        />
      )}

      {deleteQuestId && (
        <DeleteConfirmModal
          message="Delete this quest and all its levels and challenges?"
          onConfirm={deleteQuest}
          onCancel={() => setDeleteQuestId(null)}
        />
      )}

      {deleteLevelInfo && (
        <DeleteConfirmModal
          message="Delete this level and all its challenges?"
          onConfirm={deleteLevel}
          onCancel={() => setDeleteLevelInfo(null)}
        />
      )}

      {deleteChallengeInfo && (
        <DeleteConfirmModal
          message="Delete this challenge?"
          onConfirm={deleteChallenge}
          onCancel={() => setDeleteChallengeInfo(null)}
        />
      )}
    </>
  )
}

// Main Admin Panel with Sidebar
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<AdminSection>('quests')

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'quests', label: 'Quests', icon: <LayoutList className="w-5 h-5" /> },
    { id: 'rules', label: 'Rules', icon: <ScrollText className="w-5 h-5" /> },
    { id: 'leaderboards', label: 'Leaderboards', icon: <Trophy className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'metrics', label: 'Metrics', icon: <BarChart3 className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] to-[#0f1829] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0d1321] border-r border-[hsl(var(--border))] flex flex-col">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <img src="/logo_fn.svg" alt="Forward Networks" className="w-10" />
            <span className="font-semibold text-white">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'text-gray-400 hover:bg-[hsl(var(--secondary))] hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[hsl(var(--border))]">
          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {activeSection === 'quests' && <QuestsSection />}
          {activeSection === 'rules' && <RulesEditor />}
          {activeSection === 'leaderboards' && <LeaderboardsSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'metrics' && <MetricsSection />}
        </div>
      </main>
    </div>
  )
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (session === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminPanel onLogout={handleLogout} />
}
