# Quest Live - Setup Guide

## 1. Cloudflare Pages Deployment

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
2. Click "Create a project" → "Connect to Git"
3. Select the `fn-quest-live` repository
4. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variables (see below)
6. Deploy

### Option B: Via Wrangler CLI

```bash
# Login to Cloudflare
npx wrangler login

# Create the project
npx wrangler pages project create fn-quest-live

# Deploy
npm run build
npx wrangler pages deploy dist --project-name=fn-quest-live
```

### Environment Variables (Cloudflare Dashboard)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_BUBBLE_API_URL_TEST` | `https://quest.fwd.app/version-test/api/1.1` | Bubble Test API |
| `VITE_BUBBLE_API_URL_LIVE` | `https://quest.fwd.app/api/1.1` | Bubble Live API |
| `VITE_BUBBLE_API_KEY` | `your-key` | Bubble API key |
| `VITE_BUBBLE_ENV` | `test` | Default environment (test/live) |
| `VITE_AUTH0_DOMAIN` | `userauth.forwardnetworks.com` | Auth0 domain |
| `VITE_AUTH0_CLIENT_ID` | `your-client-id` | Auth0 client ID |
| `VITE_AUTH0_REDIRECT_URI` | `https://fn-quest-live.pages.dev/callback` | OAuth callback URL |
| `VITE_USE_BUBBLE_GATEWAY` | `true` | Use Bubble as OAuth gateway |
| `VITE_ADMIN_USERNAME` | `admin` | Admin login username |
| `VITE_ADMIN_PASSWORD` | `your-password` | Admin login password |

> **Note**: The Admin panel includes a TEST/LIVE toggle to switch between Bubble environments. This is persisted in localStorage.

---

## 2. Bubble Database Setup

### Create Data Types

Go to **Data** → **Data types** in Bubble and create:

#### Live-Session
| Field | Type | Description |
|-------|------|-------------|
| date | date | Competition day |
| start_time | text | "09:00", "10:00", etc. (CET) |
| total_seats | number | Default: 5 |
| available_seats | number | Starts at 4 (1 for walk-ins) |
| is_reserved_for_walkins | yes/no | Block from pre-registration |
| is_active | yes/no | Show in session list |
| challenge_set | text | "Day1", "Day2", etc. |

#### Live-Registration
| Field | Type | Description |
|-------|------|-------------|
| session | Live-Session | Which session |
| email | text | User email |
| name | text | Full name |
| company | text | Company name |
| registered_at | date | Registration timestamp |
| source | text | "pre-registration" or "walk-in" |
| checked_in | yes/no | Checked in at booth |
| checked_in_at | date | Check-in timestamp |
| player_name | text | Fun name ("Fluffy Armadillo") |
| player_icon | text | Avatar icon ID |

#### Live-Competition
| Field | Type | Description |
|-------|------|-------------|
| session | Live-Session | Which session |
| status | text | "waiting", "countdown", "active", "finished" |
| started_at | date | Countdown triggered |
| game_start_at | date | When "GO" happens |
| finished_at | date | When last player finished |
| day_number | number | 1, 2, 3, or 4 |

#### Live-Progress
| Field | Type | Description |
|-------|------|-------------|
| competition | Live-Competition | Which competition |
| registration | Live-Registration | Which player |
| current_challenge | number | 1-5 |
| challenge_1_time | number | Seconds for challenge 1 |
| challenge_2_time | number | Seconds for challenge 2 |
| challenge_3_time | number | Seconds for challenge 3 |
| challenge_4_time | number | Seconds for challenge 4 |
| challenge_5_time | number | Seconds for challenge 5 |
| total_time | number | Total seconds |
| hints_used | number | Total hints used |
| finished | yes/no | Completed all challenges |
| finished_at | date | Finish timestamp |
| rank | number | Final position |

---

## 3. Bubble API Configuration

### Enable Data API

Go to **Settings** → **API** → Enable:
- [x] Enable Data API
- [x] Enable the following data types for CRUD operations:
  - live-session
  - live-registration
  - live-competition
  - live-progress

### API Access

The app uses **direct Data API calls** (no backend workflows required):

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Get all records | `/obj/{dataType}` | GET |
| Get with filter | `/obj/{dataType}?constraints=[...]` | GET |
| Get single | `/obj/{dataType}/{id}` | GET |
| Create | `/obj/{dataType}` | POST |
| Update | `/obj/{dataType}/{id}` | PATCH |
| Delete | `/obj/{dataType}/{id}` | DELETE |

### Authentication

All API calls require Bearer token authentication:
```
Authorization: Bearer {BUBBLE_API_KEY}
```

---

## 4. Auth0 Configuration

### Request from Client

Add this redirect URL to Auth0 allowed callbacks:
```
https://fn-quest-live.pages.dev/callback
```

### If Using Bubble Gateway (Fallback)

Create a page in Bubble at `/auth-gateway` that:
1. Receives `return_url` parameter
2. Initiates Auth0 login flow
3. On success, generates a temporary token
4. Redirects to: `{return_url}?token={generated_token}`

---

## 5. Pre-populate Sessions

Run this in Bubble's app data or via workflow to create sessions:

**Days**: Feb 9, 10, 11, 12 (2025)
**Times**: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00

For each day/time combination:
- total_seats = 5
- available_seats = 4 (1 reserved for walk-ins)
- is_reserved_for_walkins = true (only for 09:00 sessions)
- is_active = true
- challenge_set = "Day1" (or Day2, Day3, Day4 based on date)

---

## 6. Testing Checklist

### Pre-Registration Flow
- [ ] Login with Auth0 works
- [ ] Can see available sessions
- [ ] Can register for a session
- [ ] Can't register twice for same day
- [ ] Confirmation page shows correctly
- [ ] Calendar links work

### Admin Flow
- [ ] Admin login works
- [ ] Can view all sessions
- [ ] Can see registrations per session
- [ ] Can check in players (fun name + icon)
- [ ] Can add walk-ins
- [ ] Can start competition

### Game Flow
- [ ] Countdown syncs across all players
- [ ] Progress updates in real-time
- [ ] Horse race display shows live progress
- [ ] Results show correctly at end

---

## 7. URLs

| Environment | URL |
|-------------|-----|
| Production | https://fn-quest-live.pages.dev |
| Admin | https://fn-quest-live.pages.dev/admin-live |
| Race Display | https://fn-quest-live.pages.dev/race/{sessionId} |
| Lobby | https://fn-quest-live.pages.dev/lobby/{sessionId} |
