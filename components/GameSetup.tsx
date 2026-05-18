"use client";

import { useState } from "react";

type GameSetupProps = {
  onStart: (participants: string[]) => void;
};

export function GameSetup({ onStart }: GameSetupProps) {
  const [count, setCount] = useState("");
  const [names, setNames] = useState<string[]>([]);

  const handleCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(count, 10);
    if (num >= 2 && num <= 20) {
      setNames(Array(num).fill(""));
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
      onStart(filtered);
    }
  };

  if (names.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-xl font-bold">Start Game</h2>
        <form onSubmit={handleCountSubmit} className="flex flex-col gap-2">
          <label className="text-sm">Number of participants (2-20):</label>
          <input
            type="number"
            min={2}
            max={20}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Enter Participant Names</h2>
      <form onSubmit={handleStart} className="flex flex-col gap-2 w-full max-w-md">
        {names.map((name, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Participant ${index + 1}`}
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            className="border p-2 rounded"
            required
          />
        ))}
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded mt-2"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}
