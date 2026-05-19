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
    <div className="max-w-[980px] mx-auto px-5 sm:px-[32px] py-8 sm:py-12">
      <header className="border-b-[3px] border-double border-black pb-4 mb-8">
        <h1 className="text-[18px] font-bold uppercase tracking-[0.03em]">
          Badminton Rotation
        </h1>
      </header>

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
          message="Reset the game? All participants and court assignments will be cleared."
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
