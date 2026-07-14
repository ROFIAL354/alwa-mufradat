import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext.tsx";

export const LoginPage: React.FC = () => {
  const { login, error: contextError } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError("Nama pengguna dan kata sandi harus diisi.");
      return;
    }

    const success = login(username.trim(), password.trim());
    if (!success) {
      // Local context error will be updated, but in case we want to show it immediately
      setLocalError("Nama pengguna atau kata sandi salah.");
    }
  };

  const activeError = localError || contextError;

  return (
    <div className="bg-[#020617] text-on-background min-h-screen flex items-center justify-center geometric-pattern font-body-main relative overflow-hidden w-full px-4">
      {/* Decorative ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10b981]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f59e0b]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 rounded-xl p-lg shadow-2xl flex flex-col items-center">

          {/* Logo & Branding */}
          <div className="mb-xl flex flex-col items-center text-center">
            <div className="bg-white/5 backdrop-blur-md rounded-full p-4 animate-glow-pulse mb-sm relative">
              <img
                className="w-32 h-32 object-contain drop-shadow-md animate-spin-slow"
                alt="ALWA Mufradat Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIp_Oad_i9z3XXBByEoeJ-FHu0WvpiQm5GPv2yOtgsvMpsD69HFvVou3bPzO6sNDnzVeriVu8z9rBu7_z6lFQ5g8o-tplbAd6ofaMdtXr91q6UkSUQUriefgPRRinhmuOcfw1h4O6DJi5Xpeyxy79BuBmF20KSb7uivF1ik6RPP1lgM5nbFuXUytk-4R_6GECJM6UsJKmb5NmRAZArsZ1CmCtgzO1zUU_uiwN7-e0VLRSo3-iOK6UhlTEsKHVYIIGjDXlfnejcTv8"
              />
            </div>
            <h1 className="font-headline-display text-headline-display text-[#10b981] tracking-tight mt-sm drop-shadow-sm">
              ALWA MUFRADAT
            </h1>
            <div className="w-16 h-px bg-[#f59e0b] my-sm opacity-80"></div>
            <h2 className="font-body-sm text-body-sm text-on-surface-variant max-w-[250px]">
              Pondok Tahfidz Al Ihsan Wat Taqwa Kebumen
            </h2>
          </div>

          {/* Login Form */}
          <form className="w-full space-y-md flex flex-col" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <input
                className="w-full bg-surface-container-high border border-outline-variant rounded-lg py-sm pl-xl pr-sm text-on-surface placeholder-on-surface-variant focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors outline-none font-body-main text-body-main"
                id="username"
                placeholder="Nama Pengguna"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
              </div>
              <input
                className="w-full bg-surface-container-high border border-outline-variant rounded-lg py-sm pl-xl pr-xl text-on-surface placeholder-on-surface-variant focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors outline-none font-body-main text-body-main"
                id="password"
                placeholder="Kata Sandi"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 pr-sm flex items-center text-on-surface-variant hover:text-[#10b981] transition-colors"
                onClick={handleTogglePassword}
                type="button"
              >
                <span className="material-symbols-outlined" id="visibility-icon">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>

            {/* Error Message */}
            {activeError && (
              <div className="text-rose-400 text-xs px-1 text-center bg-rose-500/10 py-1.5 border border-rose-500/20 rounded-md">
                {activeError}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full bg-gradient-to-r from-[#10b981] via-teal-500 to-[#10b981] animate-gradient-shift text-white font-label-caps text-label-caps py-md rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all duration-200 mt-lg tracking-widest border border-white/10"
              type="submit"
            >
              M A S U K
            </button>
          </form>

          {/* Footer Verse / Quote */}
          <div className="mt-xl opacity-90 w-full">
            <div className="flex flex-col items-center text-center space-y-sm">
              <span className="font-arabic-word-lg text-arabic-word-lg text-[#f59e0b] animate-breathing">
                تَعَلَّمُوا العَرَبِيَّةَ فَإِنَّهَا مِنْ دِينِكُمْ
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic opacity-80 mt-2">
                "Pelajarilah bahasa Arab, karena sesungguhnya ia adalah bagian dari agamamu."
              </p>
              <p className="font-body-sm text-[10px] text-on-surface-variant opacity-60">
                - Umar bin Khattab
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
