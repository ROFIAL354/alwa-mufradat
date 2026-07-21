import React from "react";
import { VocabWord } from "@alwa/core";
import VocabCard from "./VocabCard.tsx";

interface VocabSectionProps {
  words: VocabWord[];
}

/**
 * VocabSection wraps the collection of VocabCard items and presents
 * them in a structured listing with section titles and state handling.
 */
export const VocabSection: React.FC<VocabSectionProps> = ({ words }) => {
  if (!words || words.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-xl px-md text-center text-on-surface-variant space-y-sm">
        <span className="material-symbols-outlined text-4xl text-outline">
          folder_open
        </span>
        <p className="text-sm font-semibold">Tidak ada materi porsi aktif.</p>
        <p className="text-xs opacity-75">Porsi yang Anda pilih tidak memiliki kosakata yang terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-md py-4 space-y-md flex flex-col">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-1.5 border-b border-[#3c4a42]/30">
        <span className="material-symbols-outlined text-sm text-[#10b981]">
          menu_book
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Kosakata Porsi Ini
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-4 flex flex-col w-full">
        {words.map((word, index) => (
          <VocabCard key={word.id} word={word} index={index + 1} />
        ))}
      </div>
    </div>
  );
};

export default VocabSection;
