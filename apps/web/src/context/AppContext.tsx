import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  AuthSession, 
  GradeLevel, 
  DailyContent, 
  Ustadz, 
  getAvailableWords, 
  loadDailyContent, 
  forceRefreshDailyContent, 
  storage, 
  STORAGE_KEYS,
  WordUsageRecord
} from "@alwa/core";
import { MOCK_USTADZ, MOCK_WORDS } from "@alwa/data";

export type ViewType = "login" | "dashboard" | "history";

interface AppContextType {
  // Auth state
  session: AuthSession | null;
  currentUser: Ustadz | null;
  login: (username: string, passwordHash: string) => boolean;
  logout: () => void;
  
  // Navigation / UI state
  view: ViewType;
  setView: (view: ViewType) => void;
  currentLevel: GradeLevel | null;
  setCurrentLevel: (level: GradeLevel) => void;
  isLoading: boolean;
  error: string | null;
  
  // Daily content
  dailyContent: DailyContent | null;
  stockCount: number;
  refreshDailyWords: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    return storage.get<AuthSession>(STORAGE_KEYS.AUTH);
  });
  
  const [currentUser, setCurrentUser] = useState<Ustadz | null>(() => {
    const savedSession = storage.get<AuthSession>(STORAGE_KEYS.AUTH);
    if (savedSession) {
      return MOCK_USTADZ.find(u => u.id === savedSession.ustadzId) || null;
    }
    return null;
  });
  
  const [view, setViewState] = useState<ViewType>(() => {
    return storage.get<AuthSession>(STORAGE_KEYS.AUTH) ? "dashboard" : "login";
  });
  
  const [currentLevel, setCurrentLevelState] = useState<GradeLevel | null>(() => {
    const savedSession = storage.get<AuthSession>(STORAGE_KEYS.AUTH);
    if (savedSession && savedSession.assignedLevels.length > 0) {
      return savedSession.assignedLevels[0];
    }
    return null;
  });
  
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [stockCount, setStockCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with UI level change and auth session
  useEffect(() => {
    if (session && currentLevel) {
      setIsLoading(true);
      setError(null);
      try {
        const content = loadDailyContent(currentLevel, session.ustadzId, MOCK_WORDS);
        setDailyContent(content);
        
        // Recalculate stock
        const usageRecords = storage.get<WordUsageRecord[]>(STORAGE_KEYS.USAGE) ?? [];
        const pool = getAvailableWords(MOCK_WORDS, usageRecords, currentLevel, "arabic");
        setStockCount(pool.length);
      } catch (err: any) {
        setError(err.message || "Gagal memuat materi harian.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setDailyContent(null);
      setStockCount(0);
    }
  }, [session, currentLevel]);

  const setView = (newView: ViewType) => {
    setViewState(newView);
  };

  const login = (username: string, passwordHash: string): boolean => {
    setError(null);
    const ustadz = MOCK_USTADZ.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === passwordHash
    );

    if (!ustadz) {
      setError("Nama pengguna atau kata sandi salah.");
      return false;
    }

    const newSession: AuthSession = {
      ustadzId: ustadz.id,
      username: ustadz.username,
      assignedLevels: ustadz.assignedLevels,
      loginAt: new Date().toISOString()
    };

    storage.set(STORAGE_KEYS.AUTH, newSession);
    setSession(newSession);
    setCurrentUser(ustadz);
    if (ustadz.assignedLevels.length > 0) {
      setCurrentLevelState(ustadz.assignedLevels[0]);
    }
    setView("dashboard");
    return true;
  };

  const logout = () => {
    storage.remove(STORAGE_KEYS.AUTH);
    setSession(null);
    setCurrentUser(null);
    setCurrentLevelState(null);
    setDailyContent(null);
    setStockCount(0);
    setView("login");
  };

  const setCurrentLevel = (level: GradeLevel) => {
    if (session && session.assignedLevels.includes(level)) {
      setCurrentLevelState(level);
    }
  };

  const refreshDailyWords = () => {
    if (!session || !currentLevel) return;
    setIsLoading(true);
    setError(null);
    try {
      const refreshedContent = forceRefreshDailyContent(currentLevel, session.ustadzId, MOCK_WORDS);
      setDailyContent(refreshedContent);
      
      // Recalculate stock after refresh/partial reset
      const usageRecords = storage.get<WordUsageRecord[]>(STORAGE_KEYS.USAGE) ?? [];
      const pool = getAvailableWords(MOCK_WORDS, usageRecords, currentLevel, "arabic");
      setStockCount(pool.length);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui materi harian.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        session,
        currentUser,
        login,
        logout,
        view,
        setView,
        currentLevel,
        setCurrentLevel,
        isLoading,
        error,
        dailyContent,
        stockCount,
        refreshDailyWords
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
