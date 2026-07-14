import React from "react";
import { VocabWord } from "@alwa/core";
import ArabicText from "../common/ArabicText.tsx";

interface VocabCardProps {
  word: VocabWord;
  index?: number;
}

/**
 * VocabCard renders an individual vocabulary record detailing the main Arabic word,
 * its latin transliteration, Indonesian translation, and a contextual example sentence.
 */
export const VocabCard: React.FC<VocabCardProps> = ({ word, index }) => {
  const sentence = word.sentences && word.sentences.length > 0 ? word.sentences[0] : null;

  return (
    <div className="w-full bg-[#161d19]/80 border border-[#3c4a42]/30 rounded-xl p-md shadow-md flex flex-col space-y-3 relative overflow-hidden transition-all duration-300 hover:border-[#10b981]/50 hover:shadow-lg hover:shadow-[#10b981]/5">

      {/* Index indicator */}
      {index !== undefined && (
        <div className="absolute top-2 left-3 bg-[#242c27] border border-[#3c4a42]/40 rounded-md px-2 py-0.5 text-[9px] font-bold text-on-surface-variant tracking-widest uppercase">
          Kata {index}
        </div>
      )}

      {/* Category Tag pills */}
      <div className="absolute top-2 right-3 flex items-center space-x-1">
        {word.tags && word.tags.slice(0, 2).map((tag, i) => (
          <span key={i} className="bg-[#242c27] text-on-surface-variant border border-[#3c4a42]/30 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      {/* Main Word Sizing & Alignment */}
      <div className="flex flex-col pt-4 pb-2.5 text-center border-b border-[#3c4a42]/20">
        <ArabicText
          text={word.word}
          className={`${word.type === "fiil" ? "text-2xl sm:text-3xl" : "text-3xl"} text-primary font-bold my-1 text-center`}
        />
        <span className="text-xs font-semibold text-[#f59e0b] italic mt-1">
          {word.latin}
        </span>
        <h4 className="text-sm font-bold text-on-surface mt-1 uppercase tracking-wide">
          {word.meaning}
        </h4>
      </div>

      {/* Context Sentence Block */}
      {sentence && (
        <div className="flex flex-col space-y-2 bg-[#09100c]/60 border border-[#3c4a42]/20 rounded-lg p-sm">
          <div className="flex items-center space-x-1 text-[9px] font-bold text-on-surface-variant tracking-widest uppercase">
            <span className="material-symbols-outlined text-[10px]">edit_note</span>
            <span>Contoh Kalimat</span>
          </div>

          <div className="py-1">
            <ArabicText text={sentence.sentence} isSentence={true} className="text-xl text-[#bbeabf] text-right font-medium" />
          </div>

          <div className="flex flex-col pt-1.5 border-t border-[#3c4a42]/20 space-y-1">
            <span className="text-xs font-medium text-[#f59e0b] italic">
              "{sentence.latin}"
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Artinya: {sentence.meaning}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default VocabCard;
