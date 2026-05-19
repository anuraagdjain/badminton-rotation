"use client";

import type { GameState } from "@/lib/types";

type GameBoardProps = {
  state: GameState;
  onRotate: () => void;
  onReset: () => void;
};

export function GameBoard({ state, onRotate, onReset }: GameBoardProps) {
  const labelClass = "text-[13px] font-bold uppercase tracking-[0.04em] leading-[24px] sm:text-right sm:pr-[28px] sm:pt-9 pt-6 pb-2 sm:pb-0 border-t border-black sm:border-t-0";
  const contentClass = "border-l-0 sm:border-l border-dashed border-black pl-0 sm:pl-[28px] pt-0 sm:pt-9";

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] mb-6">
        <div className={labelClass}>
          Courts
        </div>
        <div className={contentClass}>
          <p className="text-[#6b6b6b] mb-4 text-sm">
            Round {state.rotationCount + 1} ·{" "}
            {state.resting ? `${state.resting} resting` : "Everyone playing"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {state.courts.map((court, index) => (
              <CourtCard
                key={index}
                court={court}
                label={`Court ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRotate}
              className="px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              Rotate
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {state.resting && (
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
          <div className={labelClass}>
            Resting
          </div>
          <div className={contentClass}>
            <p className="text-[15px]">{state.resting}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CourtCard({
  court,
  label,
}: {
  court: { players: string[]; type: string };
  label: string;
}) {
  if (court.players.length === 0) {
    return (
      <div className="border border-black p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.04em]">{label}</h3>
          <span className="text-[13px] text-[#6b6b6b]">empty</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.04em]">{label}</h3>
        <span className="text-[13px] text-[#6b6b6b]">{court.type}</span>
      </div>
      <ul className="space-y-1">
        {court.players.map((player) => (
          <li key={player} className="text-[15px]">
            {player}
          </li>
        ))}
      </ul>
    </div>
  );
}
