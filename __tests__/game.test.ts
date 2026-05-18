import { describe, it, expect } from "vitest";
import { startGame, rotateGame } from "../lib/game";

describe("startGame", () => {
  it("should sort participants alphabetically", () => {
    const state = startGame(["Charlie", "Alice", "Bob"], 2);
    expect(state.participants).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should assign rest to first person alphabetically when over capacity", () => {
    const state = startGame(["Charlie", "Alice", "Bob", "Diana", "Eve"], 1);
    expect(state.resting).toBe("Alice");
    expect(state.restIndex).toBe(0);
  });

  it("should have no rest when within capacity", () => {
    const state = startGame(["Alice", "Bob", "Charlie", "Diana"], 1);
    expect(state.resting).toBeNull();
  });

  it("should create correct number of courts", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 3);
    expect(state.courts).toHaveLength(3);
  });

  it("should assign up to 4 players per court", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    state.courts.forEach((court) => {
      expect(court.players.length).toBeLessThanOrEqual(4);
    });
  });

  it("should assign all non-resting players to courts", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    const allAssigned = state.courts.flatMap((c) => c.players);
    expect(allAssigned.sort()).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("should set court type based on player count", () => {
    const state = startGame(["A", "B"], 1);
    expect(state.courts[0].type).toBe("singles");
  });

  it("should set doubles type for 4 players", () => {
    const state = startGame(["A", "B", "C", "D"], 1);
    expect(state.courts[0].type).toBe("doubles");
  });
});

describe("rotateGame", () => {
  it("should rotate rest to next alphabetical person", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 1);
    expect(state.resting).toBe("A");

    const rotated = rotateGame(state);
    expect(rotated.resting).toBe("B");
    expect(rotated.restIndex).toBe(1);
  });

  it("should not rest same person twice in a row", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 1);
    const rotated = rotateGame(state);
    expect(rotated.resting).not.toBe(state.resting);
  });

  it("should put previous resting person back to play", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 1);
    const rotated = rotateGame(state);
    const allPlaying = rotated.courts.flatMap((c) => c.players);
    expect(allPlaying).toContain("A");
  });

  it("should cycle through all participants for rest", () => {
    const participants = ["A", "B", "C", "D", "E"];
    let state = startGame(participants, 1);
    const restOrder: string[] = [state.resting!];

    for (let i = 0; i < 4; i++) {
      state = rotateGame(state);
      restOrder.push(state.resting!);
    }

    expect(restOrder).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("should handle no rest rotation when within capacity", () => {
    const state = startGame(["A", "B", "C", "D"], 2);
    expect(state.resting).toBeNull();

    const rotated = rotateGame(state);
    expect(rotated.resting).toBeNull();
  });

  it("should assign all non-resting players to courts after rotation", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 1);
    const rotated = rotateGame(state);
    const allAssigned = rotated.courts.flatMap((c) => c.players);
    const expected = ["A", "C", "D", "E"];
    expect(allAssigned.sort()).toEqual(expected);
  });

  it("should not put previous singles players back in singles court", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const previousSingles = state.courts
      .filter((c) => c.type === "singles")
      .flatMap((c) => c.players);

    const rotated = rotateGame(state);
    const newSingles = rotated.courts
      .filter((c) => c.type === "singles")
      .flatMap((c) => c.players);

    const overlap = previousSingles.filter((p) => newSingles.includes(p));
    expect(overlap).toHaveLength(0);
  });

  it("should move previous singles players to doubles court or rest", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const previousSingles = state.courts
      .filter((c) => c.type === "singles")
      .flatMap((c) => c.players);

    const rotated = rotateGame(state);
    const allPlaying = rotated.courts.flatMap((c) => c.players);

    previousSingles.forEach((p) => {
      if (p === rotated.resting) return;
      expect(allPlaying).toContain(p);
      const inSingles = rotated.courts
        .filter((c) => c.type === "singles")
        .some((c) => c.players.includes(p));
      expect(inSingles).toBe(false);
    });
  });
});
