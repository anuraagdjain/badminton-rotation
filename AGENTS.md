# Badminton Rotation

Next.js 15 app (App Router) for rotating players through badminton courts.

## Stack

- TypeScript, React 19, Next.js 15 (static export), Tailwind CSS
- No backend — all state in localStorage

## Key Files

| File | Purpose |
|------|---------|
| `lib/game.ts` | Core logic: `startGame`, `rotateGame`, pair-graph functions |
| `lib/types.ts` | `GameState`, `Court` types |
| `lib/share.ts` | Share link encode/decode |
| `components/GameBoard.tsx` | Main UI: courts, buttons |
| `components/PairCoverageDialog.tsx` | n×n pair weight table modal |
| `components/GameManager.tsx` | Top-level state orchestrator |
| `__tests__/game.test.ts` | Tests for game logic |

## GameState

```ts
participants: string[]      // sorted alphabetically
courts: Court[]             // 4=doubles, 2=singles, 0=empty
resting: string | null      // resting player(s)
restIndex: number           // alphabetical rest cursor
rotationCount: number
previousSinglesPlayers: string[]
courtCount: number
pairGraph: Record<string, number>  // "A,B" → times paired
```

## Rules

- **Rest**: alphabetical cycling, never same person twice in a row
- **Singles**: previous singles players blocked from singles next round
- **Pair tracking**: every doubles court adds 6 edges to `pairGraph`
- **Court assignment**: greedy min-weight seed→partner→opponents
- **Singles selection**: picks pair that minimizes doubles pool edge weight; penalizes stale opponent pairs
- **Tiebreaks**: `Math.random()` — no alphabetical fallback

## Commands

- `npm test` — vitest
- `npm run dev` — next dev
- `npm run build` — next build (static export)
