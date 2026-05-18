"use client";

import type { GameState } from "@/lib/types";

type GameBoardProps = {
  state: GameState;
  onRotate: () => void;
  onReset: () => void;
};

export function GameBoard({ state, onRotate, onReset }: GameBoardProps) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <CourtDisplay court={state.court1} label="Court 1" />
        <CourtDisplay court={state.court2} label="Court 2" />
      </div>

      {state.resting && (
        <div className="border p-4 rounded bg-yellow-50">
          <h3 className="font-bold mb-2">Resting</h3>
          <p>{state.resting}</p>
        </div>
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={onRotate}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Rotate
        </button>
        <button
          onClick={onReset}
          className="border border-red-500 text-red-500 px-6 py-2 rounded"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Rotation #{state.rotationCount + 1}
      </p>
    </div>
  );
}

function CourtDisplay({
  court,
  label,
}: {
  court: { players: string[]; type: string };
  label: string;
}) {
  if (court.players.length === 0) {
    return (
      <div className="border p-4 rounded flex-1 min-w-[200px]">
        <h3 className="font-bold mb-2">{label}</h3>
        <p className="text-gray-400">Empty</p>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded flex-1 min-w-[200px]">
      <h3 className="font-bold mb-2">
        {label} ({court.type})
      </h3>
      <ul className="list-disc list-inside">
        {court.players.map((player) => (
          <li key={player}>{player}</li>
        ))}
      </ul>
    </div>
  );
}
