import React from "react";
import { useAppContext } from "../../context/AppContext.tsx";

/**
 * Premium navigation header displaying Pondok branding and active Ustadz profile / logout.
 */
export const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  // Extract a shorter name display (e.g. Ustadz Ahmad)
  const displayName = currentUser
    ? currentUser.name.split(" ").slice(0, 2).join(" ")
    : "Ustadz";

  return (
    <header className="w-full bg-[#161d19]/90 border-b border-[#3c4a42]/30 px-md py-sm flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">

      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-[#10b981]/20 rounded-full blur-[4px] animate-pulse"></div>
          <img
            className="w-10 h-10 object-contain rounded-full bg-white/5 border border-[#10b981]/30 p-1 relative z-10"
            alt="ALWA Logo Small"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIp_Oad_i9z3XXBByEoeJ-FHu0WvpiQm5GPv2yOtgsvMpsD69HFvVou3bPzO6sNDnzVeriVu8z9rBu7_z6lFQ5g8o-tplbAd6ofaMdtXr91q6UkSUQUriefgPRRinhmuOcfw1h4O6DJi5Xpeyxy79BuBmF20KSb7uivF1ik6RPP1lgM5nbFuXUytk-4R_6GECJM6UsJKmb5NmRAZArsZ1CmCtgzO1zUU_uiwN7-e0VLRSo3-iOK6UhlTEsKHVYIIGjDXlfnejcTv8"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="font-headline-display text-sm font-bold text-[#10b981] tracking-wide leading-tight">
            ALWA MUFRADAT
          </h1>
          <p className="text-[10px] text-on-surface-variant leading-none font-medium">
            Al Ihsan Wat Taqwa
          </p>
        </div>
      </div>

      {/* User Session Info & Actions */}
      {currentUser && (
        <div className="flex items-center space-x-2 animate-fade-in">
          <div className="text-right flex flex-col justify-center">
            <span className="text-xs font-semibold text-on-surface leading-tight">
              {displayName}
            </span>
            <span className="text-[9px] text-[#f59e0b] font-medium leading-none">
              Pendidik
            </span>
          </div>
          <button
            className="w-8 h-8 rounded-lg bg-[#242c27] hover:bg-rose-500/10 border border-[#3c4a42]/30 flex items-center justify-center text-on-surface-variant hover:text-rose-400 transition-colors shadow-sm"
            onClick={logout}
            type="button"
            title="Keluar"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
