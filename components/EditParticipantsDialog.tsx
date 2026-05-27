"use client";

import { useState } from "react";

type EditParticipantsDialogProps = {
  participants: string[];
  courtCount: number;
  onSave: (participants: string[], courtCount: number) => void;
  onCancel: () => void;
};

export function EditParticipantsDialog({
  participants,
  courtCount,
  onSave,
  onCancel,
}: EditParticipantsDialogProps) {
  const [names, setNames] = useState<string[]>(participants);
  const [localCourtCount, setLocalCourtCount] = useState(String(courtCount));

  const cleanNames = names
    .map((n) => n.trim())
    .filter((n) => n !== "")
    .sort();
  const parsedCourtCount = parseInt(localCourtCount, 10);
  const courtCountValid = parsedCourtCount >= 1 && parsedCourtCount <= 3;
  const hasChanges =
    cleanNames.length !== participants.length ||
    cleanNames.some((n, i) => n !== participants[i]) ||
    parsedCourtCount !== courtCount;

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleRemove = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setNames([...names, ""]);
  };

  const handleSave = () => {
    if (cleanNames.length >= 2 && courtCountValid) {
      onSave(cleanNames, parsedCourtCount);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-black p-6 max-w-sm w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[15px] font-bold mb-1">Edit Participants</h2>
        <p className="text-[#6b6b6b] text-sm mb-4">
          Edit courts, players, or both.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col flex-1 min-h-0">
          <div className="mb-4">
            <label className="text-[13px] font-bold uppercase tracking-[0.04em] block mb-2">
              Courts
            </label>
            <input
              type="number"
              required
              min={1}
              max={3}
              value={localCourtCount}
              onChange={(e) => setLocalCourtCount(e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm focus:outline-none font-mono"
            />
          </div>

          <label className="text-[13px] font-bold uppercase tracking-[0.04em] block mb-2">
            Players
          </label>
          <div className="space-y-2 overflow-y-auto flex-1 mb-4">
            {names.map((name, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-black text-sm focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="px-2 py-2 border border-black text-sm hover:bg-black hover:text-white transition-colors leading-none"
                  aria-label={`Remove player ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mb-4 px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors self-start"
          >
            Add player
          </button>

          <div className="flex gap-3 justify-end border-t border-black pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges}
              className="px-4 py-2 border border-black text-sm font-medium bg-black text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-white enabled:hover:text-black"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
