# Kollywood Games Night

Jackbox-style party games for an indoor Tamil terrace night: **TV host + phone buzzers**.

## Games
1. **Panchathanthiram** — picture connexions + buzzers
2. **Isaignani** — picture connexions + buzzers
3. **Keladi Kanmani** — Tamil song clips + buzzers
4. **Nee Nadigan da!** — act out Tamil movies

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

## HTTPS on your domain (e.g. games.raghavk.me)

Do **not** expose PartyKit on public `:1999`. Terminate TLS on **443** and proxy WebSockets.

1. DNS: `games.raghavk.me` and `party.games.raghavk.me`  
2. Server env (then rebuild):

```bash
HOST=127.0.0.1
PORT=3001
PARTYKIT_PORT=1999
NEXT_PUBLIC_PARTYKIT_PORT=
NEXT_PUBLIC_PARTYKIT_HOST=party.games.raghavk.me
```

3. Install nginx site from [`deploy/nginx/family-games`](deploy/nginx/family-games) (**HTTP only** — no `ssl` listen until certs exist), then Certbot:

```bash
sudo cp deploy/nginx/family-games /etc/nginx/sites-available/games
sudo ln -sf /etc/nginx/sites-available/games /etc/nginx/sites-enabled/games
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d games.raghavk.me -d party.games.raghavk.me
```

Certbot adds `listen 443 ssl` and `ssl_certificate` lines. Enabling `ssl` without those certs causes:
`no "ssl_certificate" is defined for the "listen ... ssl" directive`.

4. `npm run build && npm start`  
5. Confirm DevTools WS → `wss://party.games.raghavk.me/parties/...` (101)

## Content packs
Edit `shared/packs.ts` to add puzzles, tracks, and movies.  
Replace `/packs/tamil-party/audio/placeholder-beep.wav` with your own clips (keep copyrighted audio out of git).

## Cloud PartyKit
- `npm run deploy:party`, then set `NEXT_PUBLIC_PARTYKIT_HOST` to the PartyKit cloud host and rebuild  
- Or run Next with `npm run start:next` against that host  
