"use client";

import { makePairKey } from "@/lib/game";

type PairCoverageDialogProps = {
  pairGraph: Record<string, number>;
  participants: string[];
  onClose: () => void;
};

export function PairCoverageDialog({ pairGraph, participants, onClose }: PairCoverageDialogProps) {
  const sorted = [...participants].sort();
  const n = sorted.length;
  const totalPairs = (n * (n - 1)) / 2;
  const covered = Object.keys(pairGraph).length;
  const percent = totalPairs > 0 ? Math.round((covered / totalPairs) * 100) : 0;

  const getWeight = (a: string, b: string): number => pairGraph[makePairKey(a, b)] ?? 0;

  const maxWeight = Math.max(0, ...Object.values(pairGraph));
  const minWeight = Math.min(...Object.values(pairGraph));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50" onClick={onClose}>
      <div
        className="bg-white border border-black p-6 w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-bold">Pair Coverage</h2>
            <p className="text-[#6b6b6b] text-sm">
              {covered} of {totalPairs} pairs covered ({percent}%)
            </p>
          </div>
          <span className="text-[13px] text-[#6b6b6b]">
            max–min: {maxWeight}–{minWeight}
          </span>
        </div>

        <div className="w-full h-2 bg-gray-100 border border-black mb-5">
          <div
            className="h-full bg-black transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-[13px] font-mono border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white z-10 p-1.5 border-r border-b border-black min-w-[28px]" />
                {sorted.map((p) => (
                  <th
                    key={p}
                    className="sticky top-0 bg-white z-10 p-1.5 text-center font-bold text-[11px] uppercase tracking-wider text-[#6b6b6b] border-b border-black"
                  >
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((rowPlayer, i) => (
                <tr key={rowPlayer}>
                  <td className="p-1.5 font-bold text-[11px] uppercase tracking-wider text-[#6b6b6b] border-r border-black whitespace-nowrap">
                    {rowPlayer}
                  </td>
                  {sorted.map((colPlayer, j) => {
                    if (i === j) {
                      return (
                        <td
                          key={colPlayer}
                          className="p-1.5 text-center text-[#d4d4d4] border-b border-[#eee]"
                        >
                          –
                        </td>
                      );
                    }
                    const w = getWeight(rowPlayer, colPlayer);
                    const highlight = w === 0;
                    return (
                      <td
                        key={colPlayer}
                        className={`p-1.5 text-center border-b border-[#eee] transition-colors ${
                          highlight
                            ? "bg-red-50 text-red-400 font-medium"
                            : "text-black"
                        }`}
                      >
                        {w}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-[#6b6b6b] mt-3">
          <span className="inline-block w-3 h-3 bg-red-50 border border-red-200 align-text-bottom mr-1" />
          {" "}pair has not played a doubles game together yet
        </p>

        <button
          onClick={onClose}
          className="mt-4 self-end px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
