import React from "react";
import { useAppContext } from "../../context/AppContext.tsx";
import { LEVEL_LABELS } from "@alwa/core";

/**
 * Tab-based selector for grade levels. Limits the visible tabs strictly
 * to the levels assigned to the currently logged-in Ustadz.
 */
export const LevelSelector: React.FC = () => {
  const { session, currentLevel, setCurrentLevel } = useAppContext();

  if (!session || !currentLevel) return null;

  const assigned = session.assignedLevels;

  return (
    <div className="w-full bg-[#161d19]/60 border-b border-[#3c4a42]/30 py-3 px-md overflow-x-auto flex items-center justify-start scrollbar-none">
      <div className="flex space-x-2 min-w-max">
        {assigned.map((level) => {
          const isActive = currentLevel === level;

          return (
            <button
              key={level}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 border uppercase tracking-wider ${isActive
                ? "bg-[#10b981] text-white border-[#10b981] shadow-md shadow-[#10b981]/20 scale-105"
                : "bg-[#242c27] text-on-surface-variant border-[#3c4a42]/40 hover:bg-[#2f3632] hover:text-on-surface"
                }`}
              onClick={() => setCurrentLevel(level)}
              type="button"
            >
              {LEVEL_LABELS[level] || level}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelector;
