import { describe, it, expect } from "vitest";
import { startGame, rotateGame, makePairKey, updatePairGraph } from "../lib/game";
import type { Court } from "../lib/types";

describe("startGame", () => {
  it("should sort participants alphabetically", () => {
    const state = startGame(["Charlie", "Alice", "Bob"], 2);
    expect(state.participants).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should assign rest to first person alphabetically when odd", () => {
    const state = startGame(["Charlie", "Alice", "Bob", "Diana", "Eve"], 2);
    expect(state.resting).toBe("Alice");
    expect(state.restIndex).toBe(0);
  });

  it("should have no rest when even and within capacity", () => {
    const state = startGame(["Alice", "Bob", "Charlie", "Diana"], 2);
    expect(state.resting).toBeNull();
  });

  it("should rest 1 person when 7 players", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    expect(state.resting).toBe("A");
    expect(state.courts[0].players).toHaveLength(4);
    expect(state.courts[1].players).toHaveLength(2);
  });

  it("should rest 1 person when 9 players", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G", "H", "I"], 2);
    expect(state.resting).toBe("A");
    expect(state.courts[0].players).toHaveLength(4);
    expect(state.courts[1].players).toHaveLength(4);
  });

  it("should rest 2 people when 10 players", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], 2);
    expect(state.resting).toBe("A, B");
    expect(state.courts[0].players).toHaveLength(4);
    expect(state.courts[1].players).toHaveLength(4);
  });

  it("should create correct number of courts", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    expect(state.courts).toHaveLength(2);
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
    expect(allAssigned.sort()).toEqual(["B", "C", "D", "E", "F", "G"]);
  });

  it("should set court type based on player count", () => {
    const state = startGame(["A", "B"], 2);
    expect(state.courts[0].type).toBe("singles");
  });

  it("should set doubles type for 4 players", () => {
    const state = startGame(["A", "B", "C", "D"], 2);
    expect(state.courts[0].type).toBe("doubles");
  });

  it("should never have courts with 1 or 3 players", () => {
    for (let i = 2; i <= 10; i++) {
      const players = Array.from({ length: i }, (_, j) => String.fromCharCode(65 + j));
      const state = startGame(players, 2);
      state.courts.forEach((court) => {
        expect([0, 2, 4]).toContain(court.players.length);
      });
    }
  });

  it("should handle 3 players with 2 courts", () => {
    const state = startGame(["A", "B", "C"], 2);
    expect(state.resting).toBe("A");
    expect(state.courts[0].players).toHaveLength(2);
    expect(state.courts[1].players).toHaveLength(0);
  });
});

describe("rotateGame", () => {
  it("should rotate rest to next alphabetical person", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    expect(state.resting).toBe("A");

    const rotated = rotateGame(state);
    expect(rotated.resting).toBe("B");
    expect(rotated.restIndex).toBe(1);
  });

  it("should not rest same person twice in a row", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const rotated = rotateGame(state);
    expect(rotated.resting).not.toBe(state.resting);
  });

  it("should put previous resting person back to play", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const rotated = rotateGame(state);
    const allPlaying = rotated.courts.flatMap((c) => c.players);
    expect(allPlaying).toContain("A");
  });

  it("should cycle through all participants for rest", () => {
    const participants = ["A", "B", "C", "D", "E"];
    let state = startGame(participants, 2);
    const restOrder: string[] = [state.resting!];

    for (let i = 0; i < 4; i++) {
      state = rotateGame(state);
      restOrder.push(state.resting!);
    }

    expect(restOrder).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("should handle no rest rotation when even participants", () => {
    const state = startGame(["A", "B", "C", "D"], 2);
    expect(state.resting).toBeNull();

    const rotated = rotateGame(state);
    expect(rotated.resting).toBeNull();
  });

  it("should assign all non-resting players to courts after rotation", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const rotated = rotateGame(state);
    const allAssigned = rotated.courts.flatMap((c) => c.players);
    const expected = ["A", "C", "D", "E"];
    expect(allAssigned.sort()).toEqual(expected);
  });

  it("should not put previous singles players back in singles court", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
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
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
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

  it("should change court assignments on rotation", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    const firstCourt0 = new Set(state.courts[0].players);

    const rotated = rotateGame(state);
    const court0Changed = rotated.courts[0].players.some(p => !firstCourt0.has(p));
    expect(court0Changed).toBe(true);
  });

  it("should never have courts with 1 or 3 players after rotation", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);

    for (let i = 0; i < 10; i++) {
      const rotated = rotateGame(state);
      rotated.courts.forEach((court) => {
        expect([0, 2, 4]).toContain(court.players.length);
      });
    }
  });

  it("should rotate rest correctly when 10 players (2 resting)", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], 2);
    expect(state.resting).toBe("A, B");

    const rotated = rotateGame(state);
    expect(rotated.resting).toBe("C, D");
  });

  it("should never rest same person twice in a row with multiple resting", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], 2);

    for (let i = 0; i < 5; i++) {
      const prevResting = state.resting!.split(", ").map(s => s.trim());
      state = rotateGame(state);
      const newResting = state.resting!.split(", ").map(s => s.trim());
      const overlap = prevResting.filter(p => newResting.includes(p));
      expect(overlap).toHaveLength(0);
    }
  });
});

describe("edit participants (restart flow)", () => {
  it("should restart rotation from scratch with edited participants", () => {
    const initial = startGame(["A", "B", "C", "D", "E"], 2);
    const afterRotations = rotateGame(rotateGame(initial));
    const edited = startGame(["A", "C", "D", "E", "F"], afterRotations.courtCount);
    expect(edited.rotationCount).toBe(0);
    expect(edited.restIndex).toBe(0);
    expect(edited.participants).toEqual(["A", "C", "D", "E", "F"]);
  });

  it("should handle adding players via restart", () => {
    const state = startGame(["A", "B"], 1);
    const edited = startGame(["A", "B", "C"], state.courtCount);
    expect(edited.participants).toHaveLength(3);
    expect(edited.rotationCount).toBe(0);
    expect(edited.restIndex).toBe(0);
  });

  it("should handle removing players via restart", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const edited = startGame(["A", "B", "C"], state.courtCount);
    expect(edited.participants).toHaveLength(3);
    expect(edited.rotationCount).toBe(0);
    expect(edited.restIndex).toBe(0);
  });

  it("should handle renaming players via restart", () => {
    const state = startGame(["Alice", "Bob", "Charlie"], 2);
    const edited = startGame(["Alice", "Robert", "Charlie"], state.courtCount);
    expect(edited.participants).toEqual(["Alice", "Charlie", "Robert"]);
    expect(edited.rotationCount).toBe(0);
  });

  it("should handle changing court count via restart (2→1)", () => {
    const state = startGame(["A", "B", "C", "D"], 2);
    const edited = startGame(state.participants, 1);
    expect(edited.courtCount).toBe(1);
    expect(edited.courts).toHaveLength(1);
    expect(edited.participants).toEqual(["A", "B", "C", "D"]);
  });

  it("should handle changing court count via restart (1→3)", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F"], 1);
    const edited = startGame(state.participants, 3);
    expect(edited.courtCount).toBe(3);
    expect(edited.courts).toHaveLength(3);
  });

  it("should produce valid court sizes after changing court count", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G", "H"], 1);
    const edited = startGame(state.participants, 2);
    edited.courts.forEach((court) => {
      expect([0, 2, 4]).toContain(court.players.length);
    });
  });

  it("should reset rotation when changing court count", () => {
    const state = startGame(["A", "B", "C", "D", "E"], 2);
    const rotated = rotateGame(rotateGame(state));
    expect(rotated.rotationCount).not.toBe(0);
    const edited = startGame(rotated.participants, 1);
    expect(edited.rotationCount).toBe(0);
    expect(edited.restIndex).toBe(0);
    expect(edited.courtCount).toBe(1);
  });
});

describe("pairGraph", () => {
  it("should makePairKey return consistent sorted keys", () => {
    expect(makePairKey("Alice", "Bob")).toBe("Alice,Bob");
    expect(makePairKey("Bob", "Alice")).toBe("Alice,Bob");
    expect(makePairKey("a", "b")).toBe("a,b");
  });

  it("should record all 6 pair edges from a doubles court on startGame", () => {
    const state = startGame(["A", "B", "C", "D"], 1);
    expect(state.pairGraph["A,B"]).toBe(1);
    expect(state.pairGraph["A,C"]).toBe(1);
    expect(state.pairGraph["A,D"]).toBe(1);
    expect(state.pairGraph["B,C"]).toBe(1);
    expect(state.pairGraph["B,D"]).toBe(1);
    expect(state.pairGraph["C,D"]).toBe(1);
    expect(Object.keys(state.pairGraph)).toHaveLength(6);
  });

  it("should not record pair edges from singles court", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    const singlesCourt = state.courts.find(c => c.type === "singles");
    const singlesPlayers = singlesCourt?.players || [];
    // No pair key between singles players should exist in the graph
    if (singlesPlayers.length === 2) {
      expect(state.pairGraph[makePairKey(singlesPlayers[0], singlesPlayers[1])]).toBeUndefined();
    }
  });

  it("should increment edge weights on subsequent rotations", () => {
    let state = startGame(["A", "B", "C", "D"], 1);
    expect(state.pairGraph["A,B"]).toBe(1);

    state = rotateGame(state);
    expect(state.pairGraph["A,B"]).toBe(2);
  });

  it("should accumulate new edges when new pairs form on rotation", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G", "H"], 2);
    // First game: 12 edges (6 per doubles court)
    const firstCount = Object.keys(state.pairGraph).length;
    expect(firstCount).toBe(12);

    // After rotation, new cross-court pairs should add more edges
    state = rotateGame(state);
    const secondCount = Object.keys(state.pairGraph).length;
    expect(secondCount).toBeGreaterThan(firstCount);
  });

  it("should updatePairGraph correctly from courts", () => {
    const courts: Court[] = [
      { players: ["A", "B", "C", "D"], type: "doubles" },
      { players: ["E", "F"], type: "singles" },
    ];
    const graph = updatePairGraph(courts, {});
    expect(graph["A,B"]).toBe(1);
    expect(graph["A,C"]).toBe(1);
    expect(graph["A,D"]).toBe(1);
    expect(graph["B,C"]).toBe(1);
    expect(graph["B,D"]).toBe(1);
    expect(graph["C,D"]).toBe(1);
    expect(Object.keys(graph)).toHaveLength(6);
    expect(graph["E,F"]).toBeUndefined();
  });

  it("should converge to cover all possible pairs over multiple rotations", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G", "H"], 2);
    const totalPairs = 28; // C(8,2)

    let rotations = 0;
    while (Object.keys(state.pairGraph).length < totalPairs && rotations < 20) {
      state = rotateGame(state);
      rotations++;
    }

    expect(Object.keys(state.pairGraph).length).toBe(totalPairs);
    expect(rotations).toBeLessThan(20);
  });

  it("should reset pairGraph on startGame (edit participants)", () => {
    const state = startGame(["A", "B", "C", "D"], 1);
    expect(Object.keys(state.pairGraph)).toHaveLength(6);

    const fresh = startGame(["A", "B", "C", "D"], 1);
    expect(Object.keys(fresh.pairGraph)).toHaveLength(6);
    // Should be a fresh graph, all edges weight 1 (first time)
    expect(fresh.pairGraph["A,B"]).toBe(1);
  });

  it("should prefer mixing players from different previous courts on rotation", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G", "H"], 2);
    // First game courts: [A,B,C,D] and [E,F,G,H] (sorted alphabetically, all ties)
    const court0Players = new Set(state.courts[0].players);
    const court1Players = new Set(state.courts[1].players);

    state = rotateGame(state);

    // Each court should now have a mix of players from both original courts
    for (const court of state.courts) {
      if (court.type === "doubles") {
        const fromFirst = court.players.filter(p => court0Players.has(p)).length;
        const fromSecond = court.players.filter(p => court1Players.has(p)).length;
        expect(fromFirst).toBeGreaterThan(0);
        expect(fromSecond).toBeGreaterThan(0);
      }
    }
  });

  it("should not break singles avoidance rule", () => {
    const state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);
    const previousSingles = state.courts
      .filter(c => c.type === "singles")
      .flatMap(c => c.players);

    const rotated = rotateGame(state);
    const newSingles = rotated.courts
      .filter(c => c.type === "singles")
      .flatMap(c => c.players);

    const overlap = previousSingles.filter(p => newSingles.includes(p));
    expect(overlap).toHaveLength(0);
  });

  it("should not break rest cycling", () => {
    const participants = ["A", "B", "C", "D", "E"];
    let state = startGame(participants, 2);
    const restOrder: string[] = [state.resting!];

    for (let i = 0; i < 4; i++) {
      state = rotateGame(state);
      restOrder.push(state.resting!);
    }

    expect(restOrder).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("should not break court size invariants across rotations", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);

    for (let i = 0; i < 10; i++) {
      state = rotateGame(state);
      state.courts.forEach(court => {
        expect([0, 2, 4]).toContain(court.players.length);
      });
    }
  });

  it("should keep pair weights balanced for 7 players across rotations", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);

    for (let i = 0; i < 15; i++) {
      state = rotateGame(state);
      const weights = Object.values(state.pairGraph) as number[];
      const max = Math.max(...weights);
      const min = Math.min(...weights);
      expect(max - min).toBeLessThanOrEqual(4);
    }
  });

  it("should cover all 21 pairs for 7 players within reasonable rotations", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);

    let rotations = 0;
    while (Object.keys(state.pairGraph).length < 21 && rotations < 20) {
      state = rotateGame(state);
      rotations++;
    }

    expect(Object.keys(state.pairGraph).length).toBe(21);
    expect(rotations).toBeLessThan(10);
  });

  it("should always produce valid singles selection (singles avoidance respected)", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);

    for (let i = 0; i < 15; i++) {
      const prevSingles = state.courts
        .filter(c => c.type === "singles")
        .flatMap(c => c.players);

      state = rotateGame(state);

      const newSingles = state.courts
        .filter(c => c.type === "singles")
        .flatMap(c => c.players);

      // Previous singles players must not appear in new singles
      const overlap = prevSingles.filter(p => newSingles.includes(p));
      expect(overlap).toHaveLength(0);
    }
  });

  it("should not let any single pair dominate the weight distribution", () => {
    let state = startGame(["A", "B", "C", "D", "E", "F", "G"], 2);

    for (let i = 0; i < 20; i++) {
      state = rotateGame(state);
      const weights = Object.values(state.pairGraph) as number[];
      const max = Math.max(...weights);
      const avg = weights.reduce((s: number, w: number) => s + w, 0) / weights.length;

      if (weights.length === 21) {
        expect(max - avg).toBeLessThanOrEqual(4);
      }
    }
  });
});
