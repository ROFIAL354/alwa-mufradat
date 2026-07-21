import React from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import { LEVEL_LABELS } from "@alwa/core";

/**
 * Renders the active portion indicator, showing the active grade level,
 * the current portion number, and a progress bar showing completion.
 */
export const PortionBar: React.FC = () => {
  const { currentLevel, currentPortion, maxPortion } = useAppContext();

  if (!currentLevel) return null;

  const levelLabel = LEVEL_LABELS[currentLevel] || currentLevel;
  const progressPercent = Math.min(100, Math.max(0, (currentPortion / maxPortion) * 100));

  return (
    <div className="w-full bg-[#1a211d] border-b border-[#3c4a42]/30 py-3 px-md flex flex-col space-y-2 z-10 text-on-surface-variant">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
            Jenjang Aktif
          </span>
          <h3 className="text-xs font-extrabold text-[#10b981] mt-[2px]">
            {levelLabel}
          </h3>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#f59e0b]">
            Kemajuan Kurikulum
          </span>
          <h4 className="text-xs font-extrabold text-on-surface mt-[2px]">
            Porsi {currentPortion} / {maxPortion}
          </h4>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-[#09100c] rounded-full overflow-hidden border border-[#3c4a42]/20">
        <div
          className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

    </div>
  );
};

export default PortionBar;
