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

## Develop

```bash
npm install
npm run dev
```

- Next.js: http://localhost:3000  
- PartyKit: `127.0.0.1:1999` (see `.env.local`)

1. Open the site on the TV → **Create room**  
2. Phones join via QR / room code  
3. Host: **Shuffle teams** → pick a game  

## Content packs
Edit `shared/packs.ts` to add puzzles, tracks, and movies.  
Replace `/packs/tamil-party/audio/placeholder-beep.wav` with your own clips (keep copyrighted audio out of git).

## Deploy
- `npm run build` + Vercel for the Next app  
- `npm run deploy:party` for PartyKit, then set `NEXT_PUBLIC_PARTYKIT_HOST` to your deployed host  
