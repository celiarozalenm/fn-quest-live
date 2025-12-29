// Calendar utilities for generating calendar links and ICS files

interface CalendarEvent {
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function generateICSContent(event: CalendarEvent): string {
  const uid = `quest-live-${Date.now()}@forwardnetworks.com`

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Forward Networks//Quest Live//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTART:${formatDateForICS(event.startDate)}
DTEND:${formatDateForICS(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`
}

export function downloadICSFile(event: CalendarEvent, filename: string = 'quest-live.ics'): void {
  const icsContent = generateICSContent(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function createQuestLiveEvent(
  date: string, // "2025-02-09"
  startTime: string, // "10:00"
  boothNumber: string = 'TBD'
): CalendarEvent {
  // Parse date and time (CET timezone)
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = startTime.split(':').map(Number)

  // Create date in CET (UTC+1 in February)
  const startDate = new Date(Date.UTC(year, month - 1, day, hours - 1, minutes, 0))
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

  return {
    title: 'Quest Live Competition',
    description: `Head-to-head competition at the Forward Networks booth at Cisco Live EMEA.

What to expect:
- 5 players competing simultaneously
- Network challenges to solve
- Live leaderboard display
- Prizes for top performers

Arrive 5-10 minutes early to check in at the booth.

More info: https://quest-live.pages.dev`,
    location: `Cisco Live EMEA, Amsterdam - Forward Networks Booth #${boothNumber}`,
    startDate,
    endDate,
  }
}
