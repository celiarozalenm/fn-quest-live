// Email API client for Quest Live
// Calls Cloudflare Pages Function to send emails via SendGrid

interface EmailData {
  name: string
  sessionDate: string
  sessionTime: string
  sessionId?: string
  registrationId?: string
}

export async function sendRegistrationConfirmation(
  to: string,
  data: EmailData
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: "You're registered for Quest Live!",
    template: 'registration-confirmation',
    data,
  })
}

export async function sendSessionReminder(
  to: string,
  data: EmailData
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: 'Reminder: Quest Live session tomorrow!',
    template: 'session-reminder',
    data,
  })
}

async function sendEmail(payload: {
  to: string
  subject: string
  template: 'registration-confirmation' | 'session-reminder'
  data: EmailData
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Email send failed:', result)
      return { success: false, error: result.error || 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email API error:', error)
    return { success: false, error: 'Network error sending email' }
  }
}
