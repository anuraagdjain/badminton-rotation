# Badminton Rotation App

A simple web app to manage badminton court rotations for recreational games.

## Rules

### Game Setup
- Enter the number of participants (2-20)
- Enter the number of courts (1-3)
- Enter participant names
- Click **Start Game** to begin

### Court Configuration
- **Dynamic court count** (1-3 courts, chosen at setup)
- Each court supports either **4 players (doubles)** or **2 players (singles)**
- Courts are always filled with exactly 4, 2, or 0 players (never 1 or 3)
- **Within capacity**: Everyone plays, no one rests
- **Over capacity**: Players rest in rotation until courts have room

### Rest Logic (2 courts example)

| Players | Rest | Courts |
|---------|------|--------|
| 2 | 0 | [2, 0] |
| 3 | 1 | [2, 0] |
| 4 | 0 | [4, 0] |
| 5 | 1 | [4, 0] |
| 6 | 0 | [4, 2] |
| 7 | 1 | [4, 2] |
| 8 | 0 | [4, 4] |
| 9 | 1 | [4, 4] |
| 10 | 2 | [4, 4] |

### Rest Rotation
- Rest follows **alphabetical order** of participant names
- The same person **cannot rest twice in a row**
- Example: 7 players A-G → A rests first, then B, then C, etc.

### Singles Court Rule
- Players on any singles court are **never assigned back to singles** on the next rotation
- Previous singles players must either:
  - Move to a **doubles court**, or
  - Take their **rest turn** if it's their turn
- This prevents exhausting players with consecutive singles games

### Court Randomization
- Court assignments are **randomized** on each rotation
- Ensures everyone gets to play with different partners over time
- All courts get different players on rotation (not just court 1)

### Game Controls
- **Rotate**: Ends the current round and reassigns courts + rest
- **Reset**: Clears all data (with confirmation dialog)

### Persistence
- Game state is saved to **localStorage**
- Refreshing the page preserves the current game state

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Vitest** (testing)

## Getting Started

Requires Node.js 22+ (use `nvm use` if you have nvm installed).

```bash
nvm use
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Deploy to Cloudflare Pages

1. Push code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages
3. Connect your GitHub repo
4. Build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.vercel/output/static`
   - **Environment variables**: `NODE_VERSION=22.20.0`
5. Deploy

Cloudflare auto-deploys on every push to `main`.
