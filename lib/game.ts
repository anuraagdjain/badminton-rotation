import type { GameState, Court } from "./types";

export function startGame(participants: string[]): GameState {
  const sorted = [...participants].sort();
  return buildState(sorted, 0, []);
}

export function rotateGame(state: GameState): GameState {
  const nextRestIndex = (state.restIndex + 1) % state.participants.length;
  const previousSingles = state.court2.type === "singles" ? state.court2.players : [];
  return buildState(state.participants, nextRestIndex, previousSingles);
}

export function resetGame(): GameState | null {
  return null;
}

function buildState(sorted: string[], restIndex: number, previousSingles: string[]): GameState {
  const isOdd = sorted.length % 2 === 1;
  const resting = isOdd ? sorted[restIndex] : null;

  const players = isOdd
    ? sorted.filter((_, i) => i !== restIndex)
    : [...sorted];

  const { court1, court2 } = assignCourts(players, previousSingles);

  return {
    participants: sorted,
    court1,
    court2,
    resting,
    restIndex,
    rotationCount: isOdd ? restIndex : 0,
    previousSinglesPlayers: court2.type === "singles" ? court2.players : [],
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

function assignCourts(players: string[], previousSingles: string[]): { court1: Court; court2: Court } {
  const court1: Court = { players: [], type: "doubles" };
  const court2: Court = { players: [], type: "singles" };

  const n = players.length;

  if (n <= 2) {
    court1.players = shuffleArray(players);
    court1.type = "singles";
  } else if (n <= 4) {
    court1.players = shuffleArray(players);
    court1.type = "doubles";
  } else if (n <= 6) {
    const eligibleForCourt2 = players.filter((p) => !previousSingles.includes(p));
    const mustGoToCourt1 = players.filter((p) => previousSingles.includes(p));

    let court2Pool: string[];
    let court1Pool: string[];

    if (eligibleForCourt2.length >= 2) {
      court2Pool = shuffleArray(eligibleForCourt2).slice(0, 2);
      court1Pool = [...mustGoToCourt1, ...eligibleForCourt2.filter((p) => !court2Pool.includes(p))];
    } else {
      court2Pool = shuffleArray(eligibleForCourt2);
      const remaining = players.filter((p) => !court2Pool.includes(p));
      court1Pool = shuffleArray(remaining).slice(0, 4);
      court2Pool = [...court2Pool, ...shuffleArray(remaining.filter((p) => !court1Pool.includes(p))).slice(0, 2 - court2Pool.length)];
    }

    court1.players = court1Pool.slice(0, 4);
    court2.players = court2Pool.slice(0, 2);
    court2.type = "singles";
  } else {
    const eligibleForCourt2 = players.filter((p) => !previousSingles.includes(p));
    const mustGoToCourt1 = players.filter((p) => previousSingles.includes(p));

    let court2Pool: string[];
    let court1Pool: string[];

    if (eligibleForCourt2.length >= 4) {
      court2Pool = shuffleArray(eligibleForCourt2).slice(0, 4);
      court1Pool = [...mustGoToCourt1, ...eligibleForCourt2.filter((p) => !court2Pool.includes(p))];
    } else {
      court2Pool = shuffleArray(eligibleForCourt2);
      const remaining = players.filter((p) => !court2Pool.includes(p));
      court1Pool = shuffleArray(remaining).slice(0, 4);
      court2Pool = [...court2Pool, ...shuffleArray(remaining.filter((p) => !court1Pool.includes(p))).slice(0, 4 - court2Pool.length)];
    }

    court1.players = court1Pool.slice(0, 4);
    court2.players = court2Pool.slice(0, 4);
    court2.type = court2.players.length === 4 ? "doubles" : "singles";
  }

  return { court1, court2 };
}
