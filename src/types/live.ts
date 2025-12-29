// Quest Live Types - Bubble Database Schema

export interface LiveSession {
  _id: string
  date: string // ISO date string "2025-02-09"
  start_date: string // "09:00", "10:00", etc. (CET) - named start_date in Bubble
  total_seats: number
  available_seats: number
  is_reserved_for_walkins: boolean
  is_active: boolean
  challenge_set: string // "Day1", "Day2", etc.
  Created_Date: string
  Modified_Date: string
}

export interface LiveRegistration {
  _id: string
  session: string // LiveSession ID
  email: string
  name: string
  company: string
  registered_at: string
  source: 'pre-registration' | 'walk-in'
  checked_in: boolean
  checked_in_at: string | null
  player_name: string | null // Fun name like "Fluffy Armadillo"
  player_icon: string | null // Chosen avatar icon
  Created_Date: string
  Modified_Date: string
}

export interface LiveCompetition {
  _id: string
  session: string // LiveSession ID
  status: 'waiting' | 'countdown' | 'active' | 'finished'
  started_at: string | null
  game_start_at: string | null // When "GO" happens (started_at + 5 sec)
  finished_at: string | null
  day_number: number // 1, 2, 3, or 4
  Created_Date: string
  Modified_Date: string
}

export interface LiveProgress {
  _id: string
  competition: string // LiveCompetition ID
  registration: string // LiveRegistration ID
  current_challenge: number // 1, 2, 3, 4, or 5
  challenge_1_time: number | null
  challenge_2_time: number | null
  challenge_3_time: number | null
  challenge_4_time: number | null
  challenge_5_time: number | null
  total_time: number | null
  hints_used: number
  finished: boolean
  finished_at: string | null
  rank: number | null // Final position (1st, 2nd, 3rd...)
  Created_Date: string
  Modified_Date: string
}

// Extended types with relations for UI
export interface LiveSessionWithRegistrations extends LiveSession {
  registrations: LiveRegistration[]
}

export interface LiveProgressWithPlayer extends LiveProgress {
  player: LiveRegistration | null
}

export interface LiveCompetitionWithProgress extends LiveCompetition {
  progress: LiveProgressWithPlayer[]
  sessionDetails: LiveSession
}

// API Response types
export interface BubbleResponse<T> {
  response: {
    results: T[]
    remaining: number
    count: number
  }
}

export interface BubbleSingleResponse<T> {
  response: T
}

// Player icon options
export interface PlayerIcon {
  id: string
  emoji: string
  label: string
}

export const PLAYER_ICONS: PlayerIcon[] = [
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'lightning', emoji: '⚡', label: 'Lightning' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'phoenix', emoji: '🐦‍🔥', label: 'Phoenix' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
]

// Event days
export const EVENT_DAYS = [
  { date: '2025-02-09', label: 'Sun Feb 9', dayNumber: 1 },
  { date: '2025-02-10', label: 'Mon Feb 10', dayNumber: 2 },
  { date: '2025-02-11', label: 'Tue Feb 11', dayNumber: 3 },
  { date: '2025-02-12', label: 'Wed Feb 12', dayNumber: 4 },
]
