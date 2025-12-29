// Cloudflare Pages Function for sending emails via SendGrid
// POST /api/send-email

interface Env {
  SENDGRID_API_KEY: string
  SENDGRID_FROM_EMAIL: string
  SENDGRID_FROM_NAME: string
}

interface EmailRequest {
  to: string
  subject: string
  template: 'registration-confirmation' | 'session-reminder'
  data: {
    name: string
    sessionDate: string
    sessionTime: string
    sessionId?: string
    registrationId?: string
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body: EmailRequest = await request.json()
    const { to, subject, template, data } = body

    // Validate required fields
    if (!to || !subject || !template || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate HTML content based on template
    const htmlContent = generateEmailHtml(template, data)
    const textContent = generateEmailText(template, data)

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: env.SENDGRID_FROM_EMAIL || 'noreply@forwardnetworks.com',
          name: env.SENDGRID_FROM_NAME || 'Forward Networks Quest',
        },
        subject,
        content: [
          { type: 'text/plain', value: textContent },
          { type: 'text/html', value: htmlContent },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

function generateEmailHtml(
  template: EmailRequest['template'],
  data: EmailRequest['data']
): string {
  const baseStyles = `
    body { font-family: 'Lato', Arial, sans-serif; background-color: #0c253f; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1a3a5c; border-radius: 16px; padding: 40px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo img { width: 150px; }
    h1 { color: #ffffff; font-size: 28px; margin-bottom: 20px; text-align: center; }
    .highlight { color: #00d26a; }
    p { color: #b0c4de; font-size: 16px; line-height: 1.6; margin-bottom: 16px; }
    .details-box { background-color: #0c253f; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .detail-label { color: #7a8fa6; }
    .detail-value { color: #ffffff; font-weight: bold; }
    .cta-button { display: block; background-color: #00d26a; color: #0c253f; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; text-align: center; margin: 30px auto; max-width: 250px; }
    .footer { text-align: center; color: #7a8fa6; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2a4a6c; }
  `

  if (template === 'registration-confirmation') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://quest.fwd.app/logo_fn.svg" alt="Forward Networks" />
    </div>

    <h1>You're In! <span class="highlight">Quest Live</span> Awaits</h1>

    <p>Hi ${data.name},</p>

    <p>Great news! Your spot for Quest Live at Cisco Live EMEA is confirmed. Get ready for a fun, fast-paced network challenge!</p>

    <div class="details-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color: #7a8fa6; padding-bottom: 12px;">Date</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 12px;">${data.sessionDate}</td>
        </tr>
        <tr>
          <td style="color: #7a8fa6; padding-bottom: 12px;">Time</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 12px;">${data.sessionTime} CET</td>
        </tr>
        <tr>
          <td style="color: #7a8fa6;">Location</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right;">Forward Networks Booth, RAI Amsterdam</td>
        </tr>
      </table>
    </div>

    <p><strong style="color: #ffffff;">What to expect:</strong></p>
    <ul style="color: #b0c4de; line-height: 1.8;">
      <li>5 players compete head-to-head</li>
      <li>5 network challenges to solve</li>
      <li>Live leaderboard for spectators</li>
      <li>Prizes for the fastest finishers!</li>
    </ul>

    <p>Arrive 5 minutes early to check in at our booth. We'll assign you a fun player name and get you set up!</p>

    <div class="footer">
      <p>See you at the booth!</p>
      <p>Forward Networks Team</p>
    </div>
  </div>
</body>
</html>`
  }

  if (template === 'session-reminder') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quest Live Reminder</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://quest.fwd.app/logo_fn.svg" alt="Forward Networks" />
    </div>

    <h1>Reminder: <span class="highlight">Quest Live</span> Tomorrow!</h1>

    <p>Hi ${data.name},</p>

    <p>Just a friendly reminder that your Quest Live session is tomorrow! Don't miss your chance to compete.</p>

    <div class="details-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color: #7a8fa6; padding-bottom: 12px;">Date</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 12px;">${data.sessionDate}</td>
        </tr>
        <tr>
          <td style="color: #7a8fa6; padding-bottom: 12px;">Time</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right; padding-bottom: 12px;">${data.sessionTime} CET</td>
        </tr>
        <tr>
          <td style="color: #7a8fa6;">Location</td>
          <td style="color: #ffffff; font-weight: bold; text-align: right;">Forward Networks Booth, RAI Amsterdam</td>
        </tr>
      </table>
    </div>

    <p><strong style="color: #ffffff;">Remember:</strong></p>
    <ul style="color: #b0c4de; line-height: 1.8;">
      <li>Arrive 5 minutes early for check-in</li>
      <li>Find the Forward Networks booth</li>
      <li>Get ready to compete!</li>
    </ul>

    <div class="footer">
      <p>Good luck!</p>
      <p>Forward Networks Team</p>
    </div>
  </div>
</body>
</html>`
  }

  return '<p>Email template not found</p>'
}

function generateEmailText(
  template: EmailRequest['template'],
  data: EmailRequest['data']
): string {
  if (template === 'registration-confirmation') {
    return `
Hi ${data.name},

Your Quest Live registration is confirmed!

Session Details:
- Date: ${data.sessionDate}
- Time: ${data.sessionTime} CET
- Location: Forward Networks Booth, RAI Amsterdam

What to expect:
- 5 players compete head-to-head
- 5 network challenges to solve
- Live leaderboard for spectators
- Prizes for the fastest finishers!

Arrive 5 minutes early to check in at our booth.

See you there!
Forward Networks Team
`
  }

  if (template === 'session-reminder') {
    return `
Hi ${data.name},

Reminder: Your Quest Live session is tomorrow!

Session Details:
- Date: ${data.sessionDate}
- Time: ${data.sessionTime} CET
- Location: Forward Networks Booth, RAI Amsterdam

Remember to arrive 5 minutes early for check-in.

Good luck!
Forward Networks Team
`
  }

  return 'Email template not found'
}
