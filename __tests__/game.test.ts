import { describe, it, expect } from "vitest";
import { startGame, rotateGame } from "../lib/game";

describe("startGame", () => {
  it("should sort participants alphabetically", () => {
    const state = startGame(["Charlie", "Alice", "Bob"]);
    expect(state.participants).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should assign rest to first person alphabetically when odd", () => {
    const state = startGame(["Charlie", "Alice", "Bob", "Diana", "Eve"]);
    expect(state.resting).toBe("Alice");
    expect(state.restIndex).toBe(0);
  });

  it("should have no rest when even participants", () => {
    const state = startGame(["Alice", "Bob", "Charlie", "Diana"]);
    expect(state.resting).toBeNull();
  });

  it("should assign 4 players to court1 for 7 participants", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    expect(state.court1.players).toHaveLength(4);
    expect(state.court1.type).toBe("doubles");
  });

  it("should assign 2 players to court2 for 7 participants", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    expect(state.court2.players).toHaveLength(2);
    expect(state.court2.type).toBe("singles");
  });

  it("should assign 4 players to each court for 9 participants", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
    expect(state.court1.players).toHaveLength(4);
    expect(state.court2.players).toHaveLength(4);
    expect(state.court1.type).toBe("doubles");
    expect(state.court2.type).toBe("doubles");
  });

  it("should assign 4 players to court1 for 4 participants (even)", () => {
    const state = startGame(["A", "B", "C", "D"]);
    expect(state.court1.players).toHaveLength(4);
    expect(state.court1.type).toBe("doubles");
    expect(state.court2.players).toHaveLength(0);
  });

  it("should assign 2 players to court1 for 3 participants", () => {
    const state = startGame(["A", "B", "C"]);
    expect(state.court1.players).toHaveLength(2);
    expect(state.court1.type).toBe("singles");
    expect(state.court2.players).toHaveLength(0);
    expect(state.resting).toBe("A");
  });

  it("should assign 4+2 for 6 participants (even)", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F"]);
    expect(state.court1.players).toHaveLength(4);
    expect(state.court2.players).toHaveLength(2);
    expect(state.resting).toBeNull();
  });

  it("should assign all non-resting players to courts", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    const allAssigned = [...state.court1.players, ...state.court2.players];
    const expected = ["B", "C", "D", "E", "F", "G"];
    expect(allAssigned.sort()).toEqual(expected);
  });
});

describe("rotateGame", () => {
  it("should rotate rest to next alphabetical person", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    expect(state.resting).toBe("A");

    const rotated = rotateGame(state);
    expect(rotated.resting).toBe("B");
    expect(rotated.restIndex).toBe(1);
  });

  it("should not rest same person twice in a row", () => {
    const state = startGame(["A", "B", "C", "D", "E"]);
    const rotated = rotateGame(state);
    expect(rotated.resting).not.toBe(state.resting);
  });

  it("should put previous resting person back to play", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    const rotated = rotateGame(state);
    const allPlaying = [...rotated.court1.players, ...rotated.court2.players];
    expect(allPlaying).toContain("A");
  });

  it("should cycle through all participants for rest", () => {
    const participants = ["A", "B", "C", "D", "E", "F", "G"];
    let state = startGame(participants);
    const restOrder: string[] = [state.resting!];

    for (let i = 0; i < 6; i++) {
      state = rotateGame(state);
      restOrder.push(state.resting!);
    }

    expect(restOrder).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("should handle even participants rotation (no rest)", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F"]);
    expect(state.resting).toBeNull();

    const rotated = rotateGame(state);
    expect(rotated.resting).toBeNull();
  });

  it("should assign all non-resting players to courts after rotation", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    const rotated = rotateGame(state);
    const allAssigned = [...rotated.court1.players, ...rotated.court2.players];
    const expected = ["A", "C", "D", "E", "F", "G"];
    expect(allAssigned.sort()).toEqual(expected);
  });

  it("should randomize court assignments across rotations", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    const court1Players = new Set(state.court1.players);

    let hasDifferentAssignment = false;
    for (let i = 0; i < 10; i++) {
      const rotated = rotateGame(state);
      const newCourt1 = new Set(rotated.court1.players);
      if (![...newCourt1].every((p) => court1Players.has(p))) {
        hasDifferentAssignment = true;
        break;
      }
    }

    expect(hasDifferentAssignment).toBe(true);
  });

  it("should not put previous singles players back in singles court", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    const previousSingles = state.court2.players;

    const rotated = rotateGame(state);
    const newSingles = rotated.court2.players;

    const overlap = previousSingles.filter((p) => newSingles.includes(p));
    expect(overlap).toHaveLength(0);
  });

  it("should move previous singles players to doubles court or rest", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"]);
    const previousSingles = state.court2.players;

    const rotated = rotateGame(state);
    const allPlaying = [...rotated.court1.players, ...rotated.court2.players];

    previousSingles.forEach((p) => {
      if (p === rotated.resting) {
        return;
      }
      expect(allPlaying).toContain(p);
      expect(rotated.court1.players).toContain(p);
    });
  });
});
