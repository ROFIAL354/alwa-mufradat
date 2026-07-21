import React from "react";
import { PortionContent } from "@alwa/core";
import VocabCard from "../dashboard/VocabCard.tsx";

interface HistoryDetailCardProps {
  content: PortionContent;
}

/**
 * Renders the expanded word detail cards for an archived portion content log.
 * Reuses the VocabCard component for consistent presentation.
 */
export const HistoryDetailCard: React.FC<HistoryDetailCardProps> = ({ content }) => {
  return (
    <div className="flex flex-col space-y-4 pt-sm pb-md px-sm bg-[#09100c]/60 border-t border-[#3c4a42]/20 rounded-b-xl w-full">
      <div className="flex items-center space-x-1.5 px-sm text-[9px] font-bold text-on-surface-variant tracking-wider uppercase">
        <span className="material-symbols-outlined text-[11px] text-[#f59e0b]">history</span>
        <span>Arsip Kosakata - Porsi Ke-{content.portionNumber}</span>
      </div>

      <div className="space-y-3 flex flex-col w-full">
        {content.words.map((word, index) => (
          <VocabCard key={word.id} word={word} index={index + 1} />
        ))}
      </div>
    </div>
  );
};

export default HistoryDetailCard;
