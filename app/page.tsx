"use client";

import { useState, useEffect } from "react";
import { GameSetup } from "@/components/GameSetup";
import { GameBoard } from "@/components/GameBoard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { startGame, rotateGame, resetGame } from "@/lib/game";
import { saveGame, loadGame } from "@/lib/storage";
import type { GameState } from "@/lib/types";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setGameState(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveGame(gameState);
    }
  }, [gameState, isLoaded]);

  const handleStart = (participants: string[], courtCount: number) => {
    setGameState(startGame(participants, courtCount));
  };

  const handleRotate = () => {
    if (gameState) {
      setGameState(rotateGame(gameState));
    }
  };

  const handleReset = () => {
    setGameState(resetGame());
    setShowResetConfirm(false);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center py-4">Badminton App</h1>

      {gameState ? (
        <GameBoard
          state={gameState}
          onRotate={handleRotate}
          onReset={() => setShowResetConfirm(true)}
        />
      ) : (
        <GameSetup onStart={handleStart} />
      )}

      {showResetConfirm && (
        <ConfirmDialog
          message="Are you sure you want to reset? All participants and game data will be lost."
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </main>
  );
}
