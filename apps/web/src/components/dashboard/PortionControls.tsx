import React from "react";
import { useAppContext } from "../../context/AppContext.tsx";

/**
 * Renders workflow controls for Ustadz:
 * - Primary CTA: Mark completed & advance to next portion.
 * - Navigation row: Go to previous portion, jump directly to any portion, or reset progress.
 */
export const PortionControls: React.FC = () => {
  const {
    currentPortion,
    maxPortion,
    markCompleteAndAdvance,
    goToPreviousPortion,
    jumpToPortion,
    resetToPortionOne,
    isLoading
  } = useAppContext();

  const isFirstPortion = currentPortion <= 1;
  const isLastPortion = currentPortion >= maxPortion;

  const handleReset = () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menyetel ulang kemajuan ke Porsi 1?"
    );
    if (confirmed) {
      resetToPortionOne();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      jumpToPortion(val);
    }
  };

  // Generate list of portion options for dropdown
  const selectOptions = Array.from({ length: maxPortion }, (_, i) => i + 1);

  return (
    <div className="w-full flex flex-col space-y-4 px-md py-4 bg-[#0e1511]">
      
      {/* Primary CTA: Mark Complete & Advance */}
      <button
        className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-b from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#059669] disabled:from-[#1b2520] disabled:to-[#141b17] text-xs font-extrabold text-white disabled:text-on-surface-variant/40 border border-[#10b981]/20 disabled:border-transparent active:scale-95 disabled:active:scale-100 transition-all duration-200 shadow-md uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
        disabled={isLastPortion || isLoading}
        onClick={markCompleteAndAdvance}
        type="button"
      >
        <span className="material-symbols-outlined text-sm">check_circle</span>
        <span>
          {isLastPortion
            ? "Porsi Terakhir Telah Dicapai"
            : `Tandai Selesai & Lanjut Porsi ${currentPortion + 1}`}
        </span>
      </button>

      {/* Secondary Controls Grid */}
      <div className="grid grid-cols-12 gap-2">
        {/* Previous Button */}
        <button
          className="col-span-4 flex items-center justify-center space-x-1 py-2.5 rounded-lg bg-[#242c27] hover:bg-[#2f3632] disabled:opacity-40 disabled:hover:bg-[#242c27] text-[11px] font-bold text-on-surface-variant hover:text-on-surface border border-[#3c4a42]/40 active:scale-95 disabled:active:scale-100 transition-all duration-200"
          disabled={isFirstPortion || isLoading}
          onClick={goToPreviousPortion}
          type="button"
        >
          <span className="material-symbols-outlined text-[13px]">arrow_back</span>
          <span>Sebelumnya</span>
        </button>

        {/* Dropdown Portions */}
        <div className="col-span-5 relative flex items-center">
          <select
            className="w-full appearance-none bg-[#242c27] hover:bg-[#2f3632] text-on-surface border border-[#3c4a42]/40 rounded-lg py-2.5 pl-3 pr-8 text-[11px] font-bold cursor-pointer transition-all duration-200 outline-none"
            value={currentPortion}
            onChange={handleSelectChange}
            disabled={isLoading}
          >
            {selectOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#161d19]">
                Pilih Porsi {opt}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant pointer-events-none absolute right-2.5">
            unfold_more
          </span>
        </div>

        {/* Reset Button */}
        <button
          className="col-span-3 flex items-center justify-center space-x-1 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-bold text-rose-400 border border-rose-500/20 hover:border-rose-500/40 active:scale-95 transition-all duration-200"
          onClick={handleReset}
          disabled={isLoading}
          type="button"
          title="Reset progress ke Porsi 1"
        >
          <span className="material-symbols-outlined text-[13px]">restart_alt</span>
          <span>Reset</span>
        </button>
      </div>

    </div>
  );
};

export default PortionControls;
