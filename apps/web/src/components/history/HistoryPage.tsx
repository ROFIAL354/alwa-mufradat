import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import { PortionContent, getPortionHistory, getPortionForLevel, getMaxPortion, LEVEL_LABELS } from "@alwa/core";
import { MOCK_WORDS } from "@alwa/data";
import Header from "../layout/Header.tsx";
import HistoryList from "./HistoryList.tsx";

/**
 * HistoryPage renders the archive section of the application where Ustadz
 * can retrieve completed vocabulary portions for Murajaah (memorization review).
 */
export const HistoryPage: React.FC = () => {
  const { currentLevel, setView } = useAppContext();
  const [historyItems, setHistoryItems] = useState<PortionContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentLevel) {
      setIsLoading(true);
      try {
        const completedPortions = getPortionHistory(currentLevel);
        const items: PortionContent[] = completedPortions.map((num) => {
          const words = getPortionForLevel(currentLevel, MOCK_WORDS, num);
          const max = getMaxPortion(currentLevel, MOCK_WORDS);
          return {
            level: currentLevel,
            portionNumber: num,
            words,
            maxPortion: max
          };
        });
        setHistoryItems(items);
      } catch (e) {
        console.error("Gagal memuat riwayat:", e);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentLevel]);

  return (
    <div className="flex flex-col flex-1 pb-lg w-full animate-fade-in">

      {/* Top Header */}
      <Header />

      {/* Navigation Sub-header */}
      <div className="px-md py-sm bg-[#1a211d] border-b border-[#3c4a42]/30 flex items-center justify-between text-on-surface-variant z-10 w-full">

        {/* Back Button */}
        <button
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#242c27] hover:bg-[#2f3632] text-xs font-bold text-[#10b981] border border-[#10b981]/30 hover:border-[#10b981]/60 active:scale-95 transition-all duration-200"
          onClick={() => setView("dashboard")}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Kembali</span>
        </button>

        {/* Title indicating selected grade level */}
        <div className="text-right flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant leading-none">
            Riwayat Porsi
          </span>
          <h2 className="text-xs font-extrabold text-on-surface mt-1 leading-none">
            {currentLevel ? LEVEL_LABELS[currentLevel] : "Tanpa Kelas"}
          </h2>
        </div>

      </div>

      {/* Main Body */}
      <main className="flex-1 flex flex-col pt-2 w-full">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-xl space-y-3">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">
              progress_activity
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase animate-pulse">
              Memuat Arsip...
            </span>
          </div>
        ) : (
          <HistoryList history={historyItems} />
        )}
      </main>

    </div>
  );
};

export default HistoryPage;
