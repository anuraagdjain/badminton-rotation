export type Court = {
  players: string[];
  type: "doubles" | "singles";
};

export type GameState = {
  participants: string[];
  courts: Court[];
  resting: string | null;
  restIndex: number;
  rotationCount: number;
  previousSinglesPlayers: string[];
  courtCount: number;
  pairGraph: Record<string, number>;
};

export type GameStatus = "setup" | "playing";
