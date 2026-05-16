# Birthday Pool Fantasy

A tiny medieval-fantasy costume voting app.

## Stack

- Next.js App Router
- Supabase Postgres
- Custom invite-code login for guests
- Admin panel for guests, costumes, votes, and results

## Local setup

1. Install Node.js LTS.
2. Install dependencies:

```powershell
npm install
```

3. Create a Supabase project.
4. In Supabase SQL Editor, run the files in `supabase/migrations/` in order.
5. Copy `.env.example` to `.env.local` and fill the values.
6. Run:

```powershell
npm run dev
```

## Initial logins

Admin:

- username: `admin`
- password: `admin-change-me`

Change this immediately from Supabase or by adding an admin-edit screen later.

Seeded guest codes for the initial pool:

| Guest | Code |
| --- | --- |
| Alice | RAVEN-42 |
| Marco | SWORD-17 |
| Giulia | DRAGON-88 |
| Lorenzo | CROWN-05 |
| Sofia | SHIELD-31 |
| Matteo | WIZARD-64 |
| Chiara | QUEST-29 |
| Davide | CASTLE-73 |

## Deploy

Deploy on Vercel, then add the same environment variables in the Vercel project settings.

## Pool controls

The admin panel can:

- open or close registration
- open or close voting
- hide or publish results for participants
- reset votes for the current pool
- create a new active pool
- download votes as CSV
