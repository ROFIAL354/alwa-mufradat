import React from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import Header from "../layout/Header.tsx";
import LevelSelector from "./LevelSelector.tsx";
import PortionBar from "./PortionBar.tsx";
import VocabSection from "./VocabSection.tsx";
import PortionControls from "./PortionControls.tsx";

/**
 * DashboardPage is the central dashboard view for Ustadz. It coordinates
 * loading states, portion control inputs, lists words, and links to the history.
 */
export const DashboardPage: React.FC = () => {
  const { portionContent, setView, isLoading, error } = useAppContext();

  return (
    <div className="flex flex-col flex-1 pb-lg w-full animate-fade-in">

      {/* Top Bars */}
      <Header />
      <LevelSelector />
      <PortionBar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-2 w-full">
        {/* Error Handling Box */}
        {error && (
          <div className="mx-md mt-md p-md bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs text-center font-bold">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-xl space-y-3">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">
              progress_activity
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase animate-pulse">
              Memuat Kurikulum Porsi...
            </span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between w-full">
            {/* Vocab Section & Controls */}
            <div className="w-full flex flex-col">
              <VocabSection words={portionContent?.words || []} />

              <PortionControls />
            </div>

            {/* Navigate to History Page */}
            <div className="px-md pt-lg flex justify-center w-full">
              <button
                className="w-full max-w-md flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-b from-[#242c27] to-[#1a211d] hover:from-[#2f3632] hover:to-[#242c27] text-xs font-bold text-[#f59e0b] border border-[#f59e0b]/20 hover:border-[#f59e0b]/40 active:scale-95 transition-all duration-200 shadow-md uppercase tracking-wider"
                onClick={() => setView("history")}
                type="button"
              >
                <span className="material-symbols-outlined text-sm">history_edu</span>
                <span>Lihat Riwayat Porsi</span>
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default DashboardPage;
