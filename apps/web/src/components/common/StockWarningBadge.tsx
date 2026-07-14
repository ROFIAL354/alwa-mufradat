import React from "react";

interface StockWarningBadgeProps {
  stockCount: number;
}

/**
 * Renders warning notifications to Ustadz based on the remaining count of available words
 * in the active grade level pool.
 */
export const StockWarningBadge: React.FC<StockWarningBadgeProps> = ({ stockCount }) => {
  // Safe limit, no warning needed
  if (stockCount > 10) return null;

  let badgeClasses = "bg-amber-500/10 text-[#f59e0b] border-amber-500/30";
  let alertTitle = "Stok Kosakata Menipis";
  let alertDesc = `Tersisa ${stockCount} kata dalam tabungan level ini.`;

  if (stockCount <= 4) {
    badgeClasses = "bg-rose-500/10 text-[#fc7c78] border-rose-500/30 animate-pulse";
    alertTitle = "Stok Kosakata Kritis";
    alertDesc = `Tersisa ${stockCount} kata. Muat ulang berikutnya akan memicu partial auto-reset.`;
  }

  return (
    <div className={`flex flex-col items-center justify-center p-3 border rounded-xl text-center space-y-1 w-full max-w-md mx-auto ${badgeClasses} transition-all duration-300`}>
      <div className="flex items-center space-x-1.5">
        <span className="material-symbols-outlined text-sm">warning</span>
        <span className="font-label-caps text-label-caps tracking-widest font-bold uppercase">{alertTitle}</span>
      </div>
      <p className="text-xs opacity-90">{alertDesc}</p>
    </div>
  );
};

export default StockWarningBadge;
