import type { GameState, Court } from "./types";

export function makePairKey(a: string, b: string): string {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

export function updatePairGraph(courts: Court[], pairGraph: Record<string, number>): Record<string, number> {
  const updated = { ...pairGraph };
  for (const court of courts) {
    if (court.type !== "doubles" || court.players.length < 4) continue;
    const [p0, p1, p2, p3] = court.players;
    const pairs: [string, string][] = [
      [p0, p1], [p0, p2], [p0, p3],
      [p1, p2], [p1, p3],
      [p2, p3],
    ];
    for (const [a, b] of pairs) {
      const key = makePairKey(a, b);
      updated[key] = (updated[key] ?? 0) + 1;
    }
  }
  return updated;
}

export function startGame(participants: string[], courtCount: number): GameState {
  const sorted = [...participants].sort();
  return buildState(sorted, 0, [], courtCount, {});
}

export function rotateGame(state: GameState): GameState {
  const maxCapacity = state.courtCount * 4;
  const excess = Math.max(0, state.participants.length - maxCapacity);
  const isOdd = (state.participants.length - excess) % 2 === 1;
  const restingCount = excess + (isOdd ? 1 : 0);

  const nextRestIndex = (state.restIndex + restingCount) % state.participants.length;
  const previousSingles = state.courts
    .filter((c) => c.type === "singles")
    .flatMap((c) => c.players);
  const pairGraph = state.pairGraph ?? {};
  return buildState(state.participants, nextRestIndex, previousSingles, state.courtCount, pairGraph);
}

export function resetGame(): GameState | null {
  return null;
}

function buildState(
  sorted: string[],
  restIndex: number,
  previousSingles: string[],
  courtCount: number,
  pairGraph: Record<string, number>,
): GameState {
  const maxCapacity = courtCount * 4;
  const excess = Math.max(0, sorted.length - maxCapacity);
  const isOdd = (sorted.length - excess) % 2 === 1;
  const restingCount = excess + (isOdd ? 1 : 0);

  const restingPlayers: string[] = [];
  for (let i = 0; i < restingCount; i++) {
    restingPlayers.push(sorted[(restIndex + i) % sorted.length]);
  }

  const players = sorted.filter((p) => !restingPlayers.includes(p));

  const courtSizes = calculateCourtSizes(players.length, courtCount);
  const courts = assignCourts(players, previousSingles, courtSizes, pairGraph);
  const newPairGraph = updatePairGraph(courts, pairGraph);

  const newSinglesPlayers = courts
    .filter((c) => c.type === "singles")
    .flatMap((c) => c.players);

  return {
    participants: sorted,
    courts,
    resting: restingPlayers.length > 0 ? restingPlayers.join(", ") : null,
    restIndex,
    rotationCount: restingCount > 0 ? restIndex : 0,
    previousSinglesPlayers: newSinglesPlayers,
    courtCount,
    pairGraph: newPairGraph,
  };
}

function calculateCourtSizes(playerCount: number, courtCount: number): number[] {
  const sizes: number[] = new Array(courtCount).fill(0);
  let remaining = playerCount;

  for (let i = 0; i < courtCount && remaining > 0; i++) {
    const size = Math.min(4, remaining);
    sizes[i] = size === 3 ? 2 : size;
    remaining -= sizes[i];
  }

  return sizes;
}

function assignCourts(
  players: string[],
  previousSingles: string[],
  courtSizes: number[],
  pairGraph: Record<string, number>,
): Court[] {
  const courts: Court[] = courtSizes.map((size) => ({
    players: [],
    type: size === 2 ? "singles" : "doubles",
  }));

  const singlesCourtIndices = courts
    .map((c, i) => (c.type === "singles" ? i : -1))
    .filter((i) => i !== -1);

  const doublesCourtIndices = courts
    .map((c, i) => (c.type === "doubles" ? i : -1))
    .filter((i) => i !== -1);

  const mustSkipSingles = players.filter((p) => previousSingles.includes(p));
  const eligibleForAny = players.filter((p) => !previousSingles.includes(p));

  const getWeight = (a: string, b: string): number => pairGraph[makePairKey(a, b)] ?? 0;

  const computePoolWeight = (pool: string[]): number => {
    let total = 0;
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        total += getWeight(pool[i], pool[j]);
      }
    }
    return total;
  };

  const singlesTotal = singlesCourtIndices.reduce((sum, idx) => sum + courtSizes[idx], 0);
  const singlesPlayers: string[] = [];

  if (singlesTotal > 0 && singlesTotal <= eligibleForAny.length) {
    if (singlesTotal === 2) {
      let best: [string, string] = [eligibleForAny[0], eligibleForAny[1]];
      let bestWeight = Infinity;
      for (let i = 0; i < eligibleForAny.length; i++) {
        for (let j = i + 1; j < eligibleForAny.length; j++) {
          const candidate = [eligibleForAny[i], eligibleForAny[j]];
          const pool = players.filter((p) => !candidate.includes(p));
          const w = computePoolWeight(pool);
          if (w < bestWeight || (w === bestWeight && candidate.join(",") < best.join(","))) {
            bestWeight = w;
            best = [eligibleForAny[i], eligibleForAny[j]];
          }
        }
      }
      singlesPlayers.push(...best);
    } else {
      singlesPlayers.push(...[...eligibleForAny].sort().slice(0, singlesTotal));
    }
  }

  let singlesIndex = 0;
  for (const idx of singlesCourtIndices) {
    const size = courtSizes[idx];
    const courtPlayers: string[] = [];
    for (let i = 0; i < size && singlesIndex < singlesPlayers.length; i++) {
      courtPlayers.push(singlesPlayers[singlesIndex]);
      singlesIndex++;
    }
    courts[idx].players = courtPlayers;
  }

  const remaining = players.filter((p) => !singlesPlayers.includes(p));
  let remainingPool = [...remaining];

  for (const idx of doublesCourtIndices) {
    const size = courtSizes[idx];
    if (size === 0 || remainingPool.length === 0) {
      courts[idx].players = [];
      continue;
    }
    const courtPlayers = pickDoublesCourt(remainingPool, pairGraph);
    courts[idx].players = courtPlayers;
    remainingPool = remainingPool.filter((p) => !courtPlayers.includes(p));
  }

  return courts;
}

function pickDoublesCourt(pool: string[], pairGraph: Record<string, number>): string[] {
  const getWeight = (a: string, b: string): number => pairGraph[makePairKey(a, b)] ?? 0;

  const seed = pool
    .map((p) => ({
      player: p,
      totalWeight: pool.reduce((sum, o) => (o !== p ? sum + getWeight(p, o) : sum), 0),
    }))
    .sort((a, b) => a.totalWeight - b.totalWeight || a.player.localeCompare(b.player))[0].player;

  const remaining1 = pool.filter((p) => p !== seed);

  const partner = remaining1
    .map((p) => ({ player: p, weight: getWeight(seed, p) }))
    .sort((a, b) => a.weight - b.weight || a.player.localeCompare(b.player))[0].player;

  const remaining2 = remaining1.filter((p) => p !== partner);

  if (remaining2.length <= 2) {
    return [seed, partner, ...remaining2];
  }

  let bestOpponents: [string, string] = [remaining2[0], remaining2[1]];
  let bestScore = -Infinity;

  for (let i = 0; i < remaining2.length; i++) {
    for (let j = i + 1; j < remaining2.length; j++) {
      const o1 = remaining2[i];
      const o2 = remaining2[j];
      const score =
        -getWeight(seed, o1) +
        -getWeight(seed, o2) +
        -getWeight(partner, o1) +
        -getWeight(partner, o2) +
        -getWeight(o1, o2);

      if (
        score > bestScore ||
        (score === bestScore && `${o1},${o2}` < `${bestOpponents[0]},${bestOpponents[1]}`)
      ) {
        bestScore = score;
        bestOpponents = [o1, o2];
      }
    }
  }

  return [seed, partner, ...bestOpponents];
}
