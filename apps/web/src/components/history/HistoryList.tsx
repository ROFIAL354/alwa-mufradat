import React, { useState } from "react";
import { DailyContent, formatIndonesianDate } from "@alwa/core";
import HistoryDetailCard from "./HistoryDetailCard.tsx";

interface HistoryListProps {
  history: DailyContent[];
}

/**
 * Accordion list component displaying historical entries.
 * Expands a single date at a time to show specific words from that day.
 */
export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!history || history.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-xl px-md text-center text-on-surface-variant space-y-sm">
        <span className="material-symbols-outlined text-4xl text-outline">
          calendar_today
        </span>
        <p className="text-sm font-bold">Belum ada riwayat terdokumentasi.</p>
        <p className="text-xs opacity-75">
          Kosakata yang ditampilkan hari ini akan terarsip di sini setelah pergantian hari.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-md py-sm space-y-sm flex flex-col">
      {history.map((item) => {
        const isExpanded = expandedId === item.id;
        const indonesianDate = formatIndonesianDate(item.date);

        return (
          <div
            key={item.id}
            className="w-full bg-[#161d19]/80 border border-[#3c4a42]/30 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#10b981]/30"
          >
            {/* Header / Click Trigger */}
            <div
              className="px-md py-4 flex items-center justify-between cursor-pointer hover:bg-[#242c27]/40 transition-colors"
              onClick={() => handleToggleExpand(item.id)}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  {indonesianDate}
                </span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                  {item.arabicWords.length} Kosakata • Kelas {item.level}
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
