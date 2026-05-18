import type { GameState, Court } from "./types";

export function startGame(participants: string[], courtCount: number): GameState {
  const sorted = [...participants].sort();
  return buildState(sorted, 0, [], courtCount);
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
  return buildState(state.participants, nextRestIndex, previousSingles, state.courtCount);
}

export function resetGame(): GameState | null {
  return null;
}

function buildState(sorted: string[], restIndex: number, previousSingles: string[], courtCount: number): GameState {
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
  const courts = assignCourts(players, previousSingles, courtSizes);

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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function assignCourts(players: string[], previousSingles: string[], courtSizes: number[]): Court[] {
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

  const shuffledEligible = shuffleArray(eligibleForAny);
  const shuffledRestricted = shuffleArray(mustSkipSingles);

  let eligibleIndex = 0;

  for (const idx of singlesCourtIndices) {
    const size = courtSizes[idx];
    const courtPlayers: string[] = [];
    for (let i = 0; i < size && eligibleIndex < shuffledEligible.length; i++) {
      courtPlayers.push(shuffledEligible[eligibleIndex]);
      eligibleIndex++;
    }
    courts[idx].players = courtPlayers;
  }

  const remainingEligible = shuffledEligible.slice(eligibleIndex);
  const allRemaining = shuffleArray([...remainingEligible, ...shuffledRestricted]);

  let remainingIndex = 0;

  for (const idx of doublesCourtIndices) {
    const size = courtSizes[idx];
    const courtPlayers: string[] = [];
    for (let i = 0; i < size && remainingIndex < allRemaining.length; i++) {
      courtPlayers.push(allRemaining[remainingIndex]);
      remainingIndex++;
    }
    courts[idx].players = courtPlayers;
  }

  return courts;
}
