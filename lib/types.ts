export type Court = {
  players: string[];
  type: "doubles" | "singles";
};

export type GameState = {
  participants: string[];
  court1: Court;
  court2: Court;
  resting: string | null;
  restIndex: number;
  rotationCount: number;
  previousSinglesPlayers: string[];
};

export type GameStatus = "setup" | "playing";
