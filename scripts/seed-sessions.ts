// Script to seed Live-Session data into Bubble
// Run with: npx tsx scripts/seed-sessions.ts

const BUBBLE_API_KEY = '927f928753d6925200027064a9138f24'
// Try version-1wli since that's what's shown in the Bubble API settings screenshot
const BUBBLE_API_URL = 'https://quest.fwd.app/version-1wli/api/1.1'

// Data type name - Bubble uses the display name with spaces replaced
// "Live - Session" in Bubble becomes "live - session" or "Live - Session" in API
const DATA_TYPE = 'Live - Session'

// Field names must match exactly what's in Bubble
interface SessionData {
  date: string
  start_date: string  // This is the time slot like "09:00" - named start_date in Bubble
  total_seats: number
  available_seats: number
  is_reserved_for_walkins: boolean
  is_active: boolean
  challenge_set: string
}

const DAYS = [
  { date: '2025-02-09', challenge_set: 'Day1' },
  { date: '2025-02-10', challenge_set: 'Day2' },
  { date: '2025-02-11', challenge_set: 'Day3' },
  { date: '2025-02-12', challenge_set: 'Day4' },
]

const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

async function createSession(session: SessionData) {
  const response = await fetch(`${BUBBLE_API_URL}/obj/${encodeURIComponent(DATA_TYPE)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BUBBLE_API_KEY}`,
    },
    body: JSON.stringify(session),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create session: ${response.status} - ${error}`)
  }

  return response.json()
}

async function seedSessions() {
  console.log('Seeding sessions into Bubble...\n')

  let created = 0
  let failed = 0

  for (const day of DAYS) {
    for (const time of TIMES) {
      const session: SessionData = {
        date: day.date,
        start_date: time,
        total_seats: 5,
        available_seats: 4, // 1 reserved for walk-ins
        is_reserved_for_walkins: time === '09:00', // First slot reserved for walk-ins
        is_active: true,
        challenge_set: day.challenge_set,
      }

      try {
        const result = await createSession(session)
        console.log(`✓ Created: ${day.date} ${time} (${day.challenge_set}) - ID: ${result.id}`)
        created++
      } catch (error) {
        console.error(`✗ Failed: ${day.date} ${time} - ${error}`)
        failed++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  console.log(`\n--- Summary ---`)
  console.log(`Created: ${created}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total: ${created + failed}`)
}

seedSessions().catch(console.error)
