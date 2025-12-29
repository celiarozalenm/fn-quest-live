// Bubble Data API Client for Quest Live
// Uses direct Data API calls (no backend workflows needed)
// Supports test and live environments

import type {
  LiveSession,
  LiveRegistration,
  LiveCompetition,
  LiveProgress,
  BubbleResponse,
  BubbleSingleResponse,
} from '@/types/live'

const BUBBLE_API_KEY = import.meta.env.VITE_BUBBLE_API_KEY || ''
const BUBBLE_API_URL_TEST = import.meta.env.VITE_BUBBLE_API_URL_TEST || 'https://quest.fwd.app/version-test/api/1.1'
const BUBBLE_API_URL_LIVE = import.meta.env.VITE_BUBBLE_API_URL_LIVE || 'https://quest.fwd.app/api/1.1'
const DEFAULT_ENV = import.meta.env.VITE_BUBBLE_ENV || 'test'

if (!BUBBLE_API_KEY) {
  console.warn('Bubble API key not configured. Please set VITE_BUBBLE_API_KEY in .env')
}

// ============================================
// Environment Management
// ============================================

const STORAGE_KEY = 'fn-quest-live-env'

function getStoredEnv(): 'test' | 'live' {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'test' || stored === 'live') {
      return stored
    }
  }
  return DEFAULT_ENV as 'test' | 'live'
}

let currentEnv: 'test' | 'live' = getStoredEnv()

export function setEnvironment(env: 'test' | 'live') {
  currentEnv = env
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, env)
  }
}

export function getEnvironment(): 'test' | 'live' {
  return currentEnv
}

function getApiUrl(): string {
  return currentEnv === 'live' ? BUBBLE_API_URL_LIVE : BUBBLE_API_URL_TEST
}

// Data type names in Bubble (must match exactly with spaces)
export const DATA_TYPES = {
  SESSION: 'Live - Session',
  REGISTRATION: 'Live - Registration',
  COMPETITION: 'Live - Competition',
  PROGRESS: 'Live - Progress',
} as const

// Generic fetch helper
async function bubbleFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BUBBLE_API_KEY}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Bubble API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  // PATCH and DELETE return empty responses
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text)
}

// Generic CRUD operations
export const bubbleApi = {
  async getAll<T>(dataType: string, constraints?: object[]): Promise<T[]> {
    let url = `/obj/${dataType}`
    if (constraints && constraints.length > 0) {
      url += `?constraints=${encodeURIComponent(JSON.stringify(constraints))}`
    }
    const data = await bubbleFetch<BubbleResponse<T>>(url)
    return data.response.results
  },

  async getById<T>(dataType: string, id: string): Promise<T> {
    const data = await bubbleFetch<BubbleSingleResponse<T>>(`/obj/${dataType}/${id}`)
    return data.response
  },

  async create<T>(dataType: string, body: Partial<T>): Promise<{ id: string }> {
    return bubbleFetch<{ id: string }>(`/obj/${dataType}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  async update<T>(dataType: string, id: string, body: Partial<T>): Promise<void> {
    await bubbleFetch(`/obj/${dataType}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  async delete(dataType: string, id: string): Promise<void> {
    await bubbleFetch(`/obj/${dataType}/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// Sessions
// ============================================

export async function getSessions(date?: string): Promise<LiveSession[]> {
  const constraints = date
    ? [{ key: 'date', constraint_type: 'equals', value: date }]
    : undefined
  return bubbleApi.getAll<LiveSession>(DATA_TYPES.SESSION, constraints)
}

export async function getSession(sessionId: string): Promise<LiveSession> {
  return bubbleApi.getById<LiveSession>(DATA_TYPES.SESSION, sessionId)
}

export async function getAvailableSessions(date: string): Promise<LiveSession[]> {
  const constraints = [
    { key: 'date', constraint_type: 'equals', value: date },
    { key: 'is_active', constraint_type: 'equals', value: true },
    { key: 'is_reserved_for_walkins', constraint_type: 'equals', value: false },
    { key: 'available_seats', constraint_type: 'greater than', value: 0 },
  ]
  return bubbleApi.getAll<LiveSession>(DATA_TYPES.SESSION, constraints)
}

// ============================================
// Registrations
// ============================================

export async function getRegistrations(sessionId: string): Promise<LiveRegistration[]> {
  const constraints = [{ key: 'session', constraint_type: 'equals', value: sessionId }]
  return bubbleApi.getAll<LiveRegistration>(DATA_TYPES.REGISTRATION, constraints)
}

export async function getRegistration(registrationId: string): Promise<LiveRegistration> {
  return bubbleApi.getById<LiveRegistration>(DATA_TYPES.REGISTRATION, registrationId)
}

export async function getUserRegistrations(email: string): Promise<LiveRegistration[]> {
  const constraints = [{ key: 'email', constraint_type: 'equals', value: email }]
  return bubbleApi.getAll<LiveRegistration>(DATA_TYPES.REGISTRATION, constraints)
}

export async function registerForSession(data: {
  session_id: string
  email: string
  name: string
  company: string
}): Promise<{ registration_id: string }> {
  // Create registration
  const result = await bubbleApi.create<LiveRegistration>(DATA_TYPES.REGISTRATION, {
    session: data.session_id,
    email: data.email,
    name: data.name,
    company: data.company,
    registered_at: new Date().toISOString(),
    source: 'pre-registration',
    checked_in: false,
  })

  // Update session available seats
  const session = await getSession(data.session_id)
  await bubbleApi.update<LiveSession>(DATA_TYPES.SESSION, data.session_id, {
    available_seats: Math.max(0, session.available_seats - 1),
  })

  return { registration_id: result.id }
}

export async function checkInPlayer(data: {
  registration_id: string
  player_name: string
  player_icon: string
}): Promise<void> {
  await bubbleApi.update<LiveRegistration>(DATA_TYPES.REGISTRATION, data.registration_id, {
    checked_in: true,
    checked_in_at: new Date().toISOString(),
    player_name: data.player_name,
    player_icon: data.player_icon,
  })
}

// ============================================
// Competitions
// ============================================

export async function getActiveCompetition(): Promise<LiveCompetition | null> {
  const constraints = [
    { key: 'status', constraint_type: 'in', value: ['countdown', 'active'] },
  ]
  const results = await bubbleApi.getAll<LiveCompetition>(DATA_TYPES.COMPETITION, constraints)
  return results[0] || null
}

export async function getCompetition(competitionId: string): Promise<LiveCompetition> {
  return bubbleApi.getById<LiveCompetition>(DATA_TYPES.COMPETITION, competitionId)
}

export async function getCompetitionBySession(sessionId: string): Promise<LiveCompetition | null> {
  const constraints = [{ key: 'session', constraint_type: 'equals', value: sessionId }]
  const results = await bubbleApi.getAll<LiveCompetition>(DATA_TYPES.COMPETITION, constraints)
  return results[0] || null
}

export async function startCompetition(sessionId: string): Promise<{ competition_id: string }> {
  const now = new Date()
  const gameStartAt = new Date(now.getTime() + 5000) // 5 seconds from now

  // Get session to determine day number
  const session = await getSession(sessionId)
  const dayNumber = parseInt(session.challenge_set?.replace('Day', '') || '1')

  // Create competition
  const compResult = await bubbleApi.create<LiveCompetition>(DATA_TYPES.COMPETITION, {
    session: sessionId,
    status: 'countdown',
    started_at: now.toISOString(),
    game_start_at: gameStartAt.toISOString(),
    day_number: dayNumber,
  })

  // Get checked-in registrations
  const registrations = await getRegistrations(sessionId)
  const checkedIn = registrations.filter((r) => r.checked_in)

  // Create progress records for each checked-in player
  for (const reg of checkedIn) {
    await bubbleApi.create<LiveProgress>(DATA_TYPES.PROGRESS, {
      competition: compResult.id,
      registration: reg._id,
      current_challenge: 1,
      hints_used: 0,
      finished: false,
    })
  }

  // Schedule status change to "active" after 5 seconds
  // Note: In browser, we'll handle this on the Lobby page instead
  // For now, the admin will manually trigger or lobby polls and updates

  return { competition_id: compResult.id }
}

export async function updateCompetitionStatus(
  competitionId: string,
  status: 'waiting' | 'countdown' | 'active' | 'finished'
): Promise<void> {
  const updates: Partial<LiveCompetition> = { status }
  if (status === 'finished') {
    updates.finished_at = new Date().toISOString()
  }
  await bubbleApi.update<LiveCompetition>(DATA_TYPES.COMPETITION, competitionId, updates)
}

// ============================================
// Progress
// ============================================

export async function getCompetitionProgress(competitionId: string): Promise<LiveProgress[]> {
  const constraints = [{ key: 'competition', constraint_type: 'equals', value: competitionId }]
  return bubbleApi.getAll<LiveProgress>(DATA_TYPES.PROGRESS, constraints)
}

export async function updateProgress(data: {
  competition_id: string
  registration_id: string
  challenge_number: number
  time_seconds: number
}): Promise<void> {
  // Find the progress record for this player
  const constraints = [
    { key: 'competition', constraint_type: 'equals', value: data.competition_id },
    { key: 'registration', constraint_type: 'equals', value: data.registration_id },
  ]
  const progress = await bubbleApi.getAll<LiveProgress>(DATA_TYPES.PROGRESS, constraints)

  if (progress.length === 0) {
    throw new Error('Progress record not found')
  }

  const progressId = progress[0]._id
  const isFinished = data.challenge_number >= 5

  // Build update object with dynamic challenge time field
  const updates: Partial<LiveProgress> & Record<string, unknown> = {
    current_challenge: data.challenge_number + 1,
    [`challenge_${data.challenge_number}_time`]: data.time_seconds,
  }

  if (isFinished) {
    // Calculate total time
    const totalTime =
      (progress[0].challenge_1_time || 0) +
      (progress[0].challenge_2_time || 0) +
      (progress[0].challenge_3_time || 0) +
      (progress[0].challenge_4_time || 0) +
      data.time_seconds

    updates.finished = true
    updates.finished_at = new Date().toISOString()
    updates.total_time = totalTime

    // Calculate rank based on finish order
    const allProgress = await getCompetitionProgress(data.competition_id)
    const finishedCount = allProgress.filter((p) => p.finished).length
    updates.rank = finishedCount + 1
  }

  await bubbleApi.update<LiveProgress>(DATA_TYPES.PROGRESS, progressId, updates)
}

// ============================================
// Admin Operations
// ============================================

export async function adminAddWalkin(data: {
  session_id: string
  email: string
  name: string
  company: string
}): Promise<{ registration_id: string }> {
  // Create registration as walk-in
  const result = await bubbleApi.create<LiveRegistration>(DATA_TYPES.REGISTRATION, {
    session: data.session_id,
    email: data.email,
    name: data.name,
    company: data.company,
    registered_at: new Date().toISOString(),
    source: 'walk-in',
    checked_in: false,
  })

  // Update session available seats
  const session = await getSession(data.session_id)
  await bubbleApi.update<LiveSession>(DATA_TYPES.SESSION, data.session_id, {
    available_seats: Math.max(0, session.available_seats - 1),
  })

  return { registration_id: result.id }
}

// ============================================
// Auth (simple validation - expand as needed)
// ============================================

export async function validateToken(token: string): Promise<{
  valid: boolean
  email?: string
  name?: string
}> {
  // For now, just decode a simple token format
  // In production, this should validate against Auth0 or Bubble's auth
  try {
    // Simple base64 encoded JSON token format: { email, name, exp }
    const decoded = JSON.parse(atob(token))
    if (decoded.exp && decoded.exp < Date.now()) {
      return { valid: false }
    }
    return {
      valid: true,
      email: decoded.email,
      name: decoded.name,
    }
  } catch {
    return { valid: false }
  }
}

// Helper to generate a simple token (for Bubble gateway)
export function generateToken(email: string, name: string): string {
  const payload = {
    email,
    name,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return btoa(JSON.stringify(payload))
}
