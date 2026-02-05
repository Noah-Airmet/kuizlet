# Kuizlet
An ad-free, client-side flashcard app built with React, Vite, and Tailwind.

## Quick Start (Local)
Requirements:
- Node.js 18+ (LTS recommended)
- npm

Install and run:
```bash
npm install
npm run dev
```
Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build & Preview
```bash
npm run build
npm run preview
```
Preview URL is usually `http://localhost:4173`.

## Use On Phone (Fastest Way)
If you want your wife to use it on her phone quickly without hosting:
1. Start the dev server and expose it on your network:
```bash
npm run dev -- --host
```
2. Find your Mac’s local IP address:
```bash
ipconfig getifaddr en0
```
3. On her phone (same Wi-Fi), open:
```
http://<your-ip>:5173
```

Note: This only works while your Mac is on and the dev server is running.

## Best Way For Daily Use (Hosted)
For a stable, always-available app, deploy it. Two easy options:

**Option A: Vercel**
1. Create a free Vercel account.
2. Import this repo.
3. Use the default build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

**Option B: Netlify**
1. Create a free Netlify account.
2. Import this repo.
3. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`

After deploy, your wife can open the URL on her phone and MacBook and add it to her home screen as a PWA-style shortcut.

## Cloud Sync (Recommended For Phone + MacBook)
This app now supports **cloud sync** using Supabase (free tier).
It will sync decks, cards, and flashcard progress across devices.

### 1) Create a Supabase project
1. Go to https://supabase.com and create a new project.
2. In the project dashboard, grab:
   - **Project URL**
   - **Anon public key**

### 2) Create the database table
In Supabase SQL editor, run:
```sql
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "Users can manage their own state"
on public.user_state
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### 3) Configure environment variables
Create a `.env.local` file in the project root:
```
VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 4) Enable magic-link auth
In Supabase Auth settings:
1. Enable Email auth.
2. Ensure "Confirm email" is ON (recommended).
3. Set the Site URL to your deployed URL (or `http://localhost:5173` for local).

### 5) Run the app
```bash
npm run dev
```
You’ll see a **Cloud Sync** bar. Use the same email on phone + MacBook to sync.

## Progress Without Cloud Sync
If you don’t configure Supabase, the app stores progress in **localStorage**.
This means progress is saved per device and browser only.

## CSV Import Format
Two formats are supported:

Headered:
```
Term,Definition
Photosynthesis,Process plants use to convert light into chemical energy.
```

Headerless:
```
Photosynthesis,Process plants use to convert light into chemical energy.
```

## Common Issues
If the UI looks unstyled, Tailwind is not loading. Fix by restarting:
```bash
npm run dev
```

If Tailwind still fails, tell me the exact error and I’ll fix it.
