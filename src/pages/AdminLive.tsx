import { useState, useEffect } from 'react'
import {
  getSessions,
  getRegistrations,
  checkInPlayer as checkInPlayerApi,
  adminAddWalkin,
  startCompetition,
  getCompetitionBySession,
} from '@/api/bubble'
import { generateFunName } from '@/lib/funNames'
import { EVENT_DAYS, PLAYER_ICONS, type LiveSession, type LiveRegistration, type LiveCompetition } from '@/types/live'
import FunNameGenerator from '@/components/FunNameGenerator'
import IconPicker from '@/components/IconPicker'
import {
  Calendar,
  Users,
  Play,
  UserPlus,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

export default function AdminLive() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Data state
  const [selectedDay, setSelectedDay] = useState(EVENT_DAYS[0].date)
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)
  const [registrations, setRegistrations] = useState<LiveRegistration[]>([])
  const [competition, setCompetition] = useState<LiveCompetition | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [checkInPlayerData, setCheckInPlayerData] = useState<LiveRegistration | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [playerIcon, setPlayerIcon] = useState<string | null>(null)

  // Walk-in form
  const [walkInEmail, setWalkInEmail] = useState('')
  const [walkInName, setWalkInName] = useState('')
  const [walkInCompany, setWalkInCompany] = useState('')

  // Check for existing admin session
  useEffect(() => {
    const session = localStorage.getItem('fn_quest_admin_session')
    if (session) {
      setIsAuthenticated(true)
    }
  }, [])

  // Load sessions when day changes
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions()
    }
  }, [selectedDay, isAuthenticated])

  // Load registrations when session changes
  useEffect(() => {
    if (selectedSession) {
      loadRegistrations()
    }
  }, [selectedSession])

  const handleLogin = () => {
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'questlive2025'

    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('fn_quest_admin_session', 'true')
      setAuthError('')
    } else {
      setAuthError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('fn_quest_admin_session')
  }

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const data = await getSessions(selectedDay)
      setSessions(data.sort((a, b) => a.start_time.localeCompare(b.start_time)))
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRegistrations = async () => {
    if (!selectedSession) return

    setIsLoading(true)
    try {
      const [regs, comp] = await Promise.all([
        getRegistrations(selectedSession._id),
        getCompetitionBySession(selectedSession._id),
      ])
      setRegistrations(regs)
      setCompetition(comp)
    } catch (err) {
      console.error('Failed to load registrations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = (registration: LiveRegistration) => {
    setCheckInPlayerData(registration)
    setPlayerName(generateFunName())
    setPlayerIcon(PLAYER_ICONS[0].id)
    setShowCheckInModal(true)
  }

  const submitCheckIn = async () => {
    if (!checkInPlayerData || !playerName || !playerIcon) return

    try {
      await checkInPlayerApi({
        registration_id: checkInPlayerData._id,
        player_name: playerName,
        player_icon: playerIcon,
      })
      setShowCheckInModal(false)
      setCheckInPlayerData(null)
      loadRegistrations()
    } catch (err) {
      console.error('Check-in failed:', err)
    }
  }

  const submitWalkIn = async () => {
    if (!selectedSession || !walkInEmail || !walkInName) return

    try {
      await adminAddWalkin({
        session_id: selectedSession._id,
        email: walkInEmail,
        name: walkInName,
        company: walkInCompany,
      })
      setShowWalkInModal(false)
      setWalkInEmail('')
      setWalkInName('')
      setWalkInCompany('')
      loadRegistrations()
      loadSessions()
    } catch (err) {
      console.error('Walk-in registration failed:', err)
    }
  }

  const handleStartCompetition = async () => {
    if (!selectedSession) return

    const checkedIn = registrations.filter((r) => r.checked_in)
    if (checkedIn.length < 2) {
      alert('Need at least 2 players checked in to start')
      return
    }

    try {
      await startCompetition(selectedSession._id)
      // Open race view in new tab
      window.open(`/race/${selectedSession._id}`, '_blank')
      loadRegistrations()
    } catch (err) {
      console.error('Failed to start competition:', err)
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
        }}
      >
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <img src="/fn-logo.png" alt="Forward Networks" className="w-32 mx-auto mb-4" />
            <h1 className="text-2xl text-white">Quest Live Admin</h1>
          </div>

          <div className="bg-[var(--fn-blue-dark)] rounded-xl p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              <button onClick={handleLogin} className="btn-primary-md w-full">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const checkedInCount = registrations.filter((r) => r.checked_in).length
  const registeredCount = registrations.length

  return (
    <div
      className="min-h-screen w-full py-8 px-4"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-white">Quest Live Admin</h1>
            <p className="text-gray-400">Manage sessions and players</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
            Logout
          </button>
        </div>

        {/* Day Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[var(--fn-green)]" />
            <span className="text-white">Select Day</span>
          </div>
          <div className="flex gap-2">
            {EVENT_DAYS.map((day) => (
              <button
                key={day.date}
                onClick={() => {
                  setSelectedDay(day.date)
                  setSelectedSession(null)
                }}
                className={`py-2 px-4 rounded-lg transition-colors ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--fn-green)]" />
                  Sessions
                </h2>
                <button onClick={loadSessions} className="text-gray-400 hover:text-white">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {isLoading && !selectedSession ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const seatsUsed = session.total_seats - session.available_seats
                    return (
                      <button
                        key={session._id}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                          selectedSession?._id === session._id
                            ? 'bg-[var(--fn-green)] text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{session.start_time}</span>
                          <span className="text-sm">
                            {seatsUsed}/{session.total_seats}
                          </span>
                        </div>
                        {session.is_reserved_for_walkins && (
                          <span className="text-xs text-yellow-400">Walk-ins only</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Session Detail */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-[var(--fn-blue-dark)] rounded-xl p-6">
                {/* Session Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl text-white mb-1">
                      {selectedSession.start_time} Session
                    </h2>
                    <p className="text-gray-400">
                      {checkedInCount} checked in / {registeredCount} registered
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowWalkInModal(true)}
                      className="flex items-center gap-2 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Walk-in
                    </button>
                    <button
                      onClick={handleStartCompetition}
                      disabled={checkedInCount < 2 || competition?.status === 'active'}
                      className="flex items-center gap-2 bg-[var(--fn-green)] text-white py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      Start Competition
                    </button>
                  </div>
                </div>

                {/* Competition Status */}
                {competition && (
                  <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 text-sm">Competition Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-sm ${
                            competition.status === 'active'
                              ? 'bg-green-600 text-white'
                              : competition.status === 'countdown'
                              ? 'bg-yellow-600 text-white'
                              : competition.status === 'finished'
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {competition.status.toUpperCase()}
                        </span>
                      </div>
                      {competition.status === 'active' && (
                        <a
                          href={`/race/${selectedSession._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[var(--fn-green)] hover:underline"
                        >
                          View Race <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Players Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Company</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Player Name</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => {
                        const icon = PLAYER_ICONS.find((i) => i.id === reg.player_icon)
                        return (
                          <tr key={reg._id} className="border-b border-gray-800">
                            <td className="py-3 text-white">{reg.name}</td>
                            <td className="py-3 text-gray-400 text-sm">{reg.email}</td>
                            <td className="py-3 text-gray-400">{reg.company || '-'}</td>
                            <td className="py-3">
                              {reg.checked_in ? (
                                <span className="flex items-center gap-1 text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  Checked In
                                </span>
                              ) : (
                                <span className="text-yellow-400">Pending</span>
                              )}
                            </td>
                            <td className="py-3 text-white">
                              {reg.player_name && (
                                <span className="flex items-center gap-2">
                                  {icon?.emoji} {reg.player_name}
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              {!reg.checked_in && (
                                <button
                                  onClick={() => handleCheckIn(reg)}
                                  className="text-[var(--fn-green)] hover:underline text-sm"
                                >
                                  Check In
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {registrations.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No registrations for this session
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--fn-blue-dark)] rounded-xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && checkInPlayerData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--fn-blue-dark)] rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white">Check In Player</h2>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              Checking in: <span className="text-white">{checkInPlayerData.name}</span>
            </p>

            <div className="space-y-6">
              <FunNameGenerator value={playerName} onChange={setPlayerName} />
              <IconPicker value={playerIcon} onChange={setPlayerIcon} />

              <button
                onClick={submitCheckIn}
                disabled={!playerName || !playerIcon}
                className="btn-primary-md w-full disabled:opacity-50"
              >
                Confirm Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--fn-blue-dark)] rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white">Add Walk-in</h2>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={walkInEmail}
                  onChange={(e) => setWalkInEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name *</label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Company</label>
                <input
                  type="text"
                  value={walkInCompany}
                  onChange={(e) => setWalkInCompany(e.target.value)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg"
                />
              </div>

              <button
                onClick={submitWalkIn}
                disabled={!walkInEmail || !walkInName}
                className="btn-primary-md w-full disabled:opacity-50"
              >
                Add Walk-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
