# Family Games Party Hub

Jackbox-style party games for an indoor Tamil family night: **TV host + phone controllers**.

## Games
1. **Tent Kottai** — picture connexions + buzzers  
2. **Sound Party** — Tamil song clips + buzzers  
3. **Cinema Charades** — act out Tamil movies  

## Stack
- Next.js (App Router) + Tailwind  
- PartyKit realtime rooms  
- GSAP motion + Three.js scene layer  

## Configure ports

Copy [`.env.example`](.env.example) to `.env.local` (or edit `.env.local`):

```bash
HOST=0.0.0.0
PORT=3000
NEXT_PUBLIC_PARTYKIT_PORT=1999
NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:1999
```

`npm run dev` / `npm start` read these via `scripts/run-app.mjs`. After changing `NEXT_PUBLIC_*`, rebuild (`npm run build`) so the client picks them up.

## Develop

```bash
npm install
npm run dev
```

- Next.js: `http://localhost:$PORT` (also on your LAN IP)  
- PartyKit: `$NEXT_PUBLIC_PARTYKIT_PORT` on the same host  

1. Open the site on the TV via the **Network URL** (e.g. `http://192.168.x.x:3000`) → **Create room**  
2. Phones join via QR / room code  
3. Host: wait for Team A/B buzzers → pick a game  

## Local production (party night)

`npm start` runs **both** Next and PartyKit (WebSockets need the PartyKit port).

```bash
npm run build
npm start
```

Use `npm run start:next` only if PartyKit is already running elsewhere (or deployed).

## Content packs
Edit `shared/packs.ts` to add puzzles, tracks, and movies.  
Replace `/packs/tamil-party/audio/placeholder-beep.wav` with your own clips (keep copyrighted audio out of git).

## Cloud deploy
- Deploy Next (e.g. Vercel) with `npm run build`  
- `npm run deploy:party` for PartyKit, then set `NEXT_PUBLIC_PARTYKIT_HOST` to your deployed host (rebuild Next so the env is baked in)  
- Or run Next alone with `npm run start:next` against that deployed PartyKit host  
