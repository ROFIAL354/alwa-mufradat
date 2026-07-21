import React, { useState } from "react";
import { PortionContent } from "@alwa/core";
import HistoryDetailCard from "./HistoryDetailCard.tsx";

interface HistoryListProps {
  history: PortionContent[];
}

/**
 * Accordion list component displaying historical completed portions.
 * Expands a single portion at a time to show specific words from that portion.
 */
export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  const [expandedPortion, setExpandedPortion] = useState<number | null>(null);

  const handleToggleExpand = (portionNumber: number) => {
    setExpandedPortion((prev) => (prev === portionNumber ? null : portionNumber));
  };

  if (!history || history.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-xl px-md text-center text-on-surface-variant space-y-sm">
        <span className="material-symbols-outlined text-4xl text-outline">
          history
        </span>
        <p className="text-sm font-bold">Belum ada riwayat porsi.</p>
        <p className="text-xs opacity-75">
          Kemajuan kelas yang Anda tandai selesai akan diarsipkan di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-md py-sm space-y-sm flex flex-col">
      {history.map((item) => {
        const isExpanded = expandedPortion === item.portionNumber;

        return (
          <div
            key={item.portionNumber}
            className="w-full bg-[#161d19]/80 border border-[#3c4a42]/30 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#10b981]/30"
          >
            {/* Header / Click Trigger */}
            <div
              className="px-md py-4 flex items-center justify-between cursor-pointer hover:bg-[#242c27]/40 transition-colors"
              onClick={() => handleToggleExpand(item.portionNumber)}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  Porsi Ke-{item.portionNumber}
                </span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                  {item.words.length} Kosakata • Kelas {item.level}
                </span>
              </div>

              <div className="flex items-center space-x-1 text-xs text-[#10b981] font-bold hover:text-[#f59e0b] transition-colors">
                <span>{isExpanded ? "Tutup" : "Detail"}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
              </div>
            </div>

            {/* Expandable Body */}
            {isExpanded && <HistoryDetailCard content={item} />}
          </div>
        );
      })}
    </div>
  );
};

export default HistoryList;
