import React from "react";

/**
 * Premium shell layout component that simulates a mobile view frame on desktops
 * and takes full screen on mobile devices. Integrates background patterns and blur lights.
 */
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#020617] geometric-pattern flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Mobile viewport simulator wrapper */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[850px] sm:max-h-[900px] sm:rounded-[36px] sm:border-[6px] sm:border-slate-800 bg-[#0e1511]/90 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Decorative background radial glows */}
        <div className="absolute -top-1/4 -left-1/4 w-[250px] h-[250px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[250px] h-[250px] bg-[#f59e0b]/10 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Child container */}
        <div className="flex-1 flex flex-col overflow-y-auto relative z-10 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
