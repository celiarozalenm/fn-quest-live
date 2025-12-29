import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getAvailableSessions, getUserRegistrations, registerForSession } from '@/api/bubble'
import { EVENT_DAYS, type LiveSession, type LiveRegistration } from '@/types/live'
import { ChevronDown, Calendar, Clock, Users } from 'lucide-react'

export default function Register() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [selectedDay, setSelectedDay] = useState(EVENT_DAYS[0].date)
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [userRegistrations, setUserRegistrations] = useState<LiveRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState(user?.name || '')
  const [company, setCompany] = useState('')

  useEffect(() => {
    loadData()
  }, [selectedDay, user?.email])

  const loadData = async () => {
    if (!user?.email) return

    setIsLoading(true)
    setError(null)

    try {
      const [sessionsData, registrationsData] = await Promise.all([
        getAvailableSessions(selectedDay),
        getUserRegistrations(user.email),
      ])

      setSessions(sessionsData.sort((a, b) => a.start_time.localeCompare(b.start_time)))
      setUserRegistrations(registrationsData)
      setSelectedSession(null)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load available sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isAlreadyRegisteredForDay = () => {
    return userRegistrations.some((reg) => {
      // Check if registration is for selected day by looking at session
      return sessions.some((s) => s._id === reg.session && s.date === selectedDay)
    })
  }

  const handleSubmit = async () => {
    if (!selectedSession || !user?.email || !name) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await registerForSession({
        session_id: selectedSession,
        email: user.email,
        name,
        company,
      })

      // Navigate to confirmation with registration details
      const session = sessions.find((s) => s._id === selectedSession)
      navigate('/confirmation', {
        state: {
          registrationId: result.registration_id,
          session,
          name,
        },
      })
    } catch (err) {
      console.error('Registration failed:', err)
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDayLabel = EVENT_DAYS.find((d) => d.date === selectedDay)?.label || ''

  return (
    <div
      className="min-h-screen w-full py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl text-white mb-2">Register for Quest Live</h1>
            <p className="text-gray-400">
              Welcome, <span className="text-[var(--fn-green)]">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6 mb-8">
          <p className="text-gray-300">
            Select the day and time you would like to compete. Each competition session
            has 5 players racing head-to-head through network challenges.
          </p>
        </div>

        {/* Day Selection */}
        <div className="mb-6">
          <label className="block text-white text-lg mb-3">
            <Calendar className="inline-block w-5 h-5 mr-2 text-[var(--fn-green)]" />
            Select Day
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EVENT_DAYS.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`py-3 px-4 rounded-lg text-center transition-colors ${
                  selectedDay === day.date
                    ? 'bg-[var(--fn-green)] text-white'
                    : 'bg-[var(--fn-blue-dark)] text-gray-300 hover:bg-opacity-80'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-6">
          <label className="block text-white text-lg mb-3">
            <Clock className="inline-block w-5 h-5 mr-2 text-[var(--fn-green)]" />
            Select Time ({selectedDayLabel})
          </label>

          {isLoading ? (
            <div className="text-gray-400 text-center py-8">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No available sessions for this day
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedSession || ''}
                onChange={(e) => setSelectedSession(e.target.value || null)}
                disabled={isAlreadyRegisteredForDay()}
                className="w-full bg-[var(--fn-blue-dark)] text-white py-4 px-4 pr-12 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a time slot...</option>
                {sessions.map((session) => {
                  const isFull = session.available_seats <= 0
                  return (
                    <option
                      key={session._id}
                      value={session._id}
                      disabled={isFull}
                    >
                      {session.start_time} CET - {session.available_seats} seats available
                      {isFull ? ' (FULL)' : ''}
                    </option>
                  )
                })}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {isAlreadyRegisteredForDay() && (
            <p className="text-yellow-500 mt-2 text-sm">
              You are already registered for a session on this day.
            </p>
          )}
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-white text-lg mb-3">
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full bg-[var(--fn-blue-dark)] text-white py-4 px-4 rounded-lg placeholder-gray-500"
          />
        </div>

        {/* Company Input */}
        <div className="mb-8">
          <label className="block text-white text-lg mb-3">
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter your company name (optional)"
            className="w-full bg-[var(--fn-blue-dark)] text-white py-4 px-4 rounded-lg placeholder-gray-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedSession || !name || isSubmitting || isAlreadyRegisteredForDay()}
          className="btn-primary-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Registering...' : 'Register for Session'}
        </button>

        {/* Existing Registrations */}
        {userRegistrations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--fn-green)]" />
              Your Registrations
            </h2>
            <div className="space-y-3">
              {userRegistrations.map((reg) => (
                <div
                  key={reg._id}
                  className="bg-[var(--fn-blue-dark)] rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white">{reg.name}</p>
                    <p className="text-gray-400 text-sm">
                      {reg.source === 'walk-in' ? 'Walk-in' : 'Pre-registered'}
                      {reg.checked_in && ' - Checked In'}
                    </p>
                  </div>
                  {reg.checked_in && (
                    <span className="bg-[var(--fn-green)] text-white text-sm px-3 py-1 rounded-full">
                      Checked In
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
