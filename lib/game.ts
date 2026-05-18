import type { GameState, Court } from "./types";

export function startGame(participants: string[], courtCount: number): GameState {
  const sorted = [...participants].sort();
  return buildState(sorted, 0, [], courtCount);
}

export function rotateGame(state: GameState): GameState {
  const nextRestIndex = (state.restIndex + 1) % state.participants.length;
  const previousSingles = state.courts
    .filter((c) => c.type === "singles")
    .flatMap((c) => c.players);
  return buildState(state.participants, nextRestIndex, previousSingles, state.courtCount);
}

export function resetGame(): GameState | null {
  return null;
}

function buildState(sorted: string[], restIndex: number, previousSingles: string[], courtCount: number): GameState {
  const totalCapacity = courtCount * 4;
  const restingCount = Math.max(0, sorted.length - totalCapacity);
  const resting = restingCount > 0 ? sorted[restIndex] : null;

  const players = restingCount > 0
    ? sorted.filter((_, i) => i !== restIndex)
    : [...sorted];

  const courts = assignCourts(players, previousSingles, courtCount);

  const newSinglesPlayers = courts
    .filter((c) => c.type === "singles")
    .flatMap((c) => c.players);

  return {
    participants: sorted,
    courts,
    resting,
    restIndex,
    rotationCount: restingCount > 0 ? restIndex : 0,
    previousSinglesPlayers: newSinglesPlayers,
    courtCount,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function assignCourts(players: string[], previousSingles: string[], courtCount: number): Court[] {
  const courts: Court[] = Array.from({ length: courtCount }, () => ({
    players: [],
    type: "doubles" as const,
  }));

  const mustSkipSingles = players.filter((p) => previousSingles.includes(p));
  const eligibleForAny = players.filter((p) => !previousSingles.includes(p));

  const shuffledEligible = shuffleArray(eligibleForAny);
  const shuffledRestricted = shuffleArray(mustSkipSingles);

  let playerIndex = 0;

  for (let courtIdx = 0; courtIdx < courtCount; courtIdx++) {
    const remainingPlayers = [...shuffledEligible.slice(playerIndex), ...shuffledRestricted];
    const playersForThisCourt = remainingPlayers.slice(0, 4);

    if (playersForThisCourt.length === 0) break;

    courts[courtIdx].players = playersForThisCourt;
    courts[courtIdx].type = playersForThisCourt.length === 2 ? "singles" : "doubles";

    playerIndex += playersForThisCourt.length;

    if (playerIndex >= shuffledEligible.length + shuffledRestricted.length) break;
  }

  return courts;
}
