import type { GameState, Court } from "./types";

const STORAGE_KEY = "badminton-game";

export function saveGame(state: GameState | null): void {
  if (typeof window === "undefined") return;
  if (state === null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as GameState;
  } catch {
    return null;
  }
}
