import React from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import { formatIndonesianDate, getLocalTodayString } from "@alwa/core";

/**
 * Renders the daily sheet header, showing today's date formatted in Indonesian,
 * and a trigger button to manually force a vocabulary refresh.
 */
export const DateBar: React.FC = () => {
  const { dailyContent, refreshDailyWords, isLoading } = useAppContext();

  // Fallback to today's local string if content is not loaded yet
  const dateString = dailyContent ? dailyContent.date : getLocalTodayString();
  const indonesianFormattedDate = formatIndonesianDate(dateString);

  return (
    <div className="w-full bg-[#1a211d] border-b border-[#3c4a42]/30 py-sm px-md flex items-center justify-between z-10 text-on-surface-variant">

      {/* Date Information */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          Jadwal Harian
        </span>
        <h3 className="text-xs font-extrabold text-on-surface mt-[2px]">
          {indonesianFormattedDate}
        </h3>
      </div>

      {/* Manual Refresh Button */}
      <button
        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#242c27] hover:bg-[#2f3632] text-[11px] font-bold text-[#10b981] border border-[#10b981]/30 hover:border-[#10b981]/60 active:scale-95 transition-all duration-200 disabled:opacity-50"
        disabled={isLoading}
        onClick={refreshDailyWords}
        type="button"
      >
        <span className={`material-symbols-outlined text-[14px] ${isLoading ? "animate-spin" : ""}`}>
          sync
        </span>
        <span>Muat Materi</span>
      </button>

    </div>
  );
};

export default DateBar;
