import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { generateGoogleCalendarUrl, downloadICSFile, createQuestLiveEvent } from '@/lib/calendar'
import { EVENT_DAYS, type LiveSession } from '@/types/live'
import { CheckCircle, Calendar, MapPin, ExternalLink } from 'lucide-react'

interface ConfirmationState {
  registrationId: string
  session: LiveSession
  name: string
}

export default function Confirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const state = location.state as ConfirmationState | null

  if (!state || !state.session) {
    return <Navigate to="/register" replace />
  }

  const { session, name } = state
  const dayInfo = EVENT_DAYS.find((d) => d.date === session.date)
  const event = createQuestLiveEvent(session.date, session.start_time)

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), '_blank')
  }

  const handleAppleCalendar = () => {
    downloadICSFile(event, 'quest-live-competition.ics')
  }

  const handleOutlookCalendar = () => {
    downloadICSFile(event, 'quest-live-competition.ics')
  }

  return (
    <div
      className="min-h-screen w-full py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0c253f 0%, #1a3a5c 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--fn-green)] rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">You're Registered!</h1>
          <p className="text-gray-400">See you at Quest Live, {name}!</p>
        </div>

        {/* Registration Details */}
        <div className="bg-[var(--fn-blue-dark)] rounded-xl p-8 mb-8">
          <h2 className="text-xl text-white mb-6">Your Competition Details</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-[var(--fn-green)] flex-shrink-0 mt-1" />
              <div>
                <p className="text-white text-lg font-medium">
                  {dayInfo?.label}, 2025
                </p>
                <p className="text-[var(--fn-green)] text-2xl font-bold">
                  {session.start_time} CET
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-[var(--fn-green)] flex-shrink-0 mt-1" />
              <div>
                <p className="text-white">Cisco Live EMEA</p>
                <p className="text-gray-400">Amsterdam, Netherlands</p>
                <p className="text-gray-400">Forward Networks Booth #TBD</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              Please arrive 5-10 minutes early to check in at our booth. You'll receive
              a fun player name and choose your avatar before the competition begins!
            </p>
          </div>
        </div>

        {/* Calendar Buttons */}
        <div className="mb-8">
          <h2 className="text-xl text-white mb-4">Add to Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleGoogleCalendar}
              className="flex items-center justify-center gap-2 bg-[var(--fn-blue-dark)] text-white py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Google Calendar
            </button>
            <button
              onClick={handleAppleCalendar}
              className="flex items-center justify-center gap-2 bg-[var(--fn-blue-dark)] text-white py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Apple Calendar
            </button>
            <button
              onClick={handleOutlookCalendar}
              className="flex items-center justify-center gap-2 bg-[var(--fn-blue-dark)] text-white py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Outlook
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <a
            href="https://quest.fwd.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-lg w-full block text-center"
          >
            Start Practicing
          </a>

          <button
            onClick={() => navigate('/register')}
            className="btn-primary-md-outline w-full"
          >
            Register for Another Day
          </button>
        </div>

        {/* Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>A confirmation email has been sent to {user?.email}</p>
        </div>
      </div>
    </div>
  )
}
