"use client";

import { useState } from "react";

type GameSetupProps = {
  onStart: (participants: string[], courtCount: number) => void;
};

export function GameSetup({ onStart }: GameSetupProps) {
  const [step, setStep] = useState<"count" | "courts" | "names">("count");
  const [participantCount, setParticipantCount] = useState("");
  const [courtCount, setCourtCount] = useState("");
  const [names, setNames] = useState<string[]>([]);

  const handleParticipantCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(participantCount, 10);
    if (num >= 2 && num <= 20) {
      setStep("courts");
    }
  };

  const handleCourtCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(courtCount, 10);
    if (num >= 1 && num <= 3) {
      setNames(Array(parseInt(participantCount, 10)).fill(""));
      setStep("names");
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = names.filter((n) => n.trim() !== "");
    if (filtered.length >= 2) {
      onStart(filtered, parseInt(courtCount, 10));
    }
  };

  const labelClass = "text-[13px] font-bold uppercase tracking-[0.04em] leading-[24px] sm:text-right sm:pr-[28px] sm:pt-9 pt-6 pb-2 sm:pb-0 border-t border-black sm:border-t-0";
  const contentClass = "border-l-0 sm:border-l border-dashed border-black pl-0 sm:pl-[28px] pt-0 sm:pt-9";

  if (step === "count") {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] mb-6">
          <div className={labelClass}>
            Step 01
          </div>
          <div className={contentClass}>
            <h2 className="text-[15px] font-bold mb-4">Participants</h2>
            <p className="text-[#6b6b6b] mb-4">
              How many people are playing today?
            </p>
            <form onSubmit={handleParticipantCountSubmit} className="max-w-xs">
              <input
                type="number"
                min={2}
                max={20}
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value)}
                placeholder="2–20"
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none font-mono"
                required
                autoFocus
              />
              <button
                type="submit"
                className="mt-4 px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === "courts") {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] mb-6">
          <div className={labelClass}>
            Step 02
          </div>
          <div className={contentClass}>
            <h2 className="text-[15px] font-bold mb-4">Courts</h2>
            <p className="text-[#6b6b6b] mb-4">
              How many courts do you have available?
            </p>
            <form onSubmit={handleCourtCountSubmit} className="max-w-xs">
              <input
                type="number"
                min={1}
                max={3}
                value={courtCount}
                onChange={(e) => setCourtCount(e.target.value)}
                placeholder="1–3"
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none font-mono"
                required
                autoFocus
              />
              <button
                type="submit"
                className="mt-4 px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] mb-6">
        <div className={labelClass}>
          Step 03
        </div>
        <div className={contentClass}>
          <h2 className="text-[15px] font-bold mb-4">Names</h2>
          <p className="text-[#6b6b6b] mb-4">
            Enter names — sorted alphabetically for fair rotation.
          </p>
          <form onSubmit={handleStart} className="space-y-2">
            {names.map((name, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Player ${index + 1}`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none font-mono"
                required
              />
            ))}
            <button
              type="submit"
              className="mt-4 px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              Start game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
