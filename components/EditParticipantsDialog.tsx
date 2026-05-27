"use client";

import { useState } from "react";

type EditParticipantsDialogProps = {
  participants: string[];
  onSave: (participants: string[]) => void;
  onCancel: () => void;
};

export function EditParticipantsDialog({
  participants,
  onSave,
  onCancel,
}: EditParticipantsDialogProps) {
  const [names, setNames] = useState<string[]>(participants);

  const cleanNames = names
    .map((n) => n.trim())
    .filter((n) => n !== "")
    .sort();
  const hasChanges =
    cleanNames.length !== participants.length ||
    cleanNames.some((n, i) => n !== participants[i]);

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
    if (hasChanges && cleanNames.length >= 2) {
      onSave(cleanNames);
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
          Add, remove, or rename players.
        </p>

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
            onClick={onCancel}
            className="px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 border border-black text-sm font-medium bg-black text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-white enabled:hover:text-black"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
