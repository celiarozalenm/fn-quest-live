// Bubble Data API Client for Quest Live

import type {
  LiveSession,
  LiveRegistration,
  LiveCompetition,
  LiveProgress,
  BubbleResponse,
  BubbleSingleResponse,
} from '@/types/live'

const BUBBLE_API_URL = import.meta.env.VITE_BUBBLE_API_URL || 'https://quest.fwd.app/api/1.1'
const BUBBLE_API_KEY = import.meta.env.VITE_BUBBLE_API_KEY || ''

if (!BUBBLE_API_KEY) {
  console.warn('Bubble API key not configured. Please set VITE_BUBBLE_API_KEY in .env')
}

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  ...(BUBBLE_API_KEY ? { Authorization: `Bearer ${BUBBLE_API_KEY}` } : {}),
}

// ============================================
// Sessions
// ============================================

export async function getSessions(date?: string): Promise<LiveSession[]> {
  const constraints = date
    ? JSON.stringify([{ key: 'date', constraint_type: 'equals', value: date }])
    : undefined

  const url = new URL(`${BUBBLE_API_URL}/obj/live-session`)
  if (constraints) url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch sessions')

  const data: BubbleResponse<LiveSession> = await response.json()
  return data.response.results
}

export async function getSession(sessionId: string): Promise<LiveSession> {
  const response = await fetch(`${BUBBLE_API_URL}/obj/live-session/${sessionId}`, { headers })
  if (!response.ok) throw new Error('Failed to fetch session')

  const data: BubbleSingleResponse<LiveSession> = await response.json()
  return data.response
}

export async function getAvailableSessions(date: string): Promise<LiveSession[]> {
  const constraints = JSON.stringify([
    { key: 'date', constraint_type: 'equals', value: date },
    { key: 'is_active', constraint_type: 'equals', value: true },
    { key: 'is_reserved_for_walkins', constraint_type: 'equals', value: false },
  ])

  const url = new URL(`${BUBBLE_API_URL}/obj/live-session`)
  url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch available sessions')

  const data: BubbleResponse<LiveSession> = await response.json()
  return data.response.results
}

// ============================================
// Registrations
// ============================================

export async function getRegistrations(sessionId: string): Promise<LiveRegistration[]> {
  const constraints = JSON.stringify([
    { key: 'session', constraint_type: 'equals', value: sessionId },
  ])

  const url = new URL(`${BUBBLE_API_URL}/obj/live-registration`)
  url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch registrations')

  const data: BubbleResponse<LiveRegistration> = await response.json()
  return data.response.results
}

export async function getRegistration(registrationId: string): Promise<LiveRegistration> {
  const response = await fetch(`${BUBBLE_API_URL}/obj/live-registration/${registrationId}`, {
    headers,
  })
  if (!response.ok) throw new Error('Failed to fetch registration')

  const data: BubbleSingleResponse<LiveRegistration> = await response.json()
  return data.response
}

export async function getUserRegistrations(email: string): Promise<LiveRegistration[]> {
  const constraints = JSON.stringify([{ key: 'email', constraint_type: 'equals', value: email }])

  const url = new URL(`${BUBBLE_API_URL}/obj/live-registration`)
  url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch user registrations')

  const data: BubbleResponse<LiveRegistration> = await response.json()
  return data.response.results
}

export async function registerForSession(data: {
  session_id: string
  email: string
  name: string
  company: string
}): Promise<{ registration_id: string }> {
  const response = await fetch(`${BUBBLE_API_URL}/wf/register-for-session`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to register for session')
  }

  return response.json()
}

export async function checkInPlayer(data: {
  registration_id: string
  player_name: string
  player_icon: string
}): Promise<void> {
  const response = await fetch(`${BUBBLE_API_URL}/wf/check-in-player`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to check in player')
  }
}

// ============================================
// Competitions
// ============================================

export async function getActiveCompetition(): Promise<LiveCompetition | null> {
  const constraints = JSON.stringify([
    { key: 'status', constraint_type: 'in', value: ['countdown', 'active'] },
  ])

  const url = new URL(`${BUBBLE_API_URL}/obj/live-competition`)
  url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch active competition')

  const data: BubbleResponse<LiveCompetition> = await response.json()
  return data.response.results[0] || null
}

export async function getCompetition(competitionId: string): Promise<LiveCompetition> {
  const response = await fetch(`${BUBBLE_API_URL}/obj/live-competition/${competitionId}`, {
    headers,
  })
  if (!response.ok) throw new Error('Failed to fetch competition')

  const data: BubbleSingleResponse<LiveCompetition> = await response.json()
  return data.response
}

export async function getCompetitionBySession(sessionId: string): Promise<LiveCompetition | null> {
  const constraints = JSON.stringify([
    { key: 'session', constraint_type: 'equals', value: sessionId },
  ])

  const url = new URL(`${BUBBLE_API_URL}/obj/live-competition`)
  url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch competition')

  const data: BubbleResponse<LiveCompetition> = await response.json()
  return data.response.results[0] || null
}

export async function startCompetition(sessionId: string): Promise<{ competition_id: string }> {
  const response = await fetch(`${BUBBLE_API_URL}/wf/start-competition`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ session_id: sessionId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to start competition')
  }

  return response.json()
}

// ============================================
// Progress
// ============================================

export async function getCompetitionProgress(competitionId: string): Promise<LiveProgress[]> {
  const constraints = JSON.stringify([
    { key: 'competition', constraint_type: 'equals', value: competitionId },
  ])

  const url = new URL(`${BUBBLE_API_URL}/obj/live-progress`)
  url.searchParams.set('constraints', constraints)

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) throw new Error('Failed to fetch progress')

  const data: BubbleResponse<LiveProgress> = await response.json()
  return data.response.results
}

export async function updateProgress(data: {
  competition_id: string
  registration_id: string
  challenge_number: number
  time_seconds: number
}): Promise<void> {
  const response = await fetch(`${BUBBLE_API_URL}/wf/update-progress`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to update progress')
  }
}

// ============================================
// Admin
// ============================================

export async function adminAddWalkin(data: {
  session_id: string
  email: string
  name: string
  company: string
}): Promise<{ registration_id: string }> {
  const response = await fetch(`${BUBBLE_API_URL}/wf/admin-add-walkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to add walk-in')
  }

  return response.json()
}

// ============================================
// Auth (via Bubble gateway)
// ============================================

export async function validateToken(token: string): Promise<{
  valid: boolean
  email?: string
  name?: string
}> {
  const response = await fetch(`${BUBBLE_API_URL}/wf/validate-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    return { valid: false }
  }

  return response.json()
}
