import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  AuthSession, 
  GradeLevel, 
  PortionContent, 
  Ustadz, 
  getCurrentPortion,
  setCurrentPortion,
  getPortionForLevel,
  getMaxPortion,
  addPortionToHistory,
  storage, 
  STORAGE_KEYS
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
  
  // Portion-based state
  currentPortion: number;
  maxPortion: number;
  portionContent: PortionContent | null;
  markCompleteAndAdvance: () => void;
  goToPreviousPortion: () => void;
  jumpToPortion: (portion: number) => void;
  resetToPortionOne: () => void;
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
  
  const [currentPortion, setCurrentPortionState] = useState<number>(1);
  const [maxPortion, setMaxPortion] = useState<number>(1);
  const [portionContent, setPortionContent] = useState<PortionContent | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync portion state when level changes
  useEffect(() => {
    if (currentLevel) {
      const portionNum = getCurrentPortion(currentLevel);
      setCurrentPortionState(portionNum);
      const max = getMaxPortion(currentLevel, MOCK_WORDS);
      setMaxPortion(max);
    } else {
      setCurrentPortionState(1);
      setMaxPortion(1);
    }
  }, [currentLevel]);

  // Load words when grade level or current portion changes
  useEffect(() => {
    if (session && currentLevel) {
      setIsLoading(true);
      setError(null);
      try {
        const words = getPortionForLevel(currentLevel, MOCK_WORDS, currentPortion);
        const max = getMaxPortion(currentLevel, MOCK_WORDS);
        setPortionContent({
          level: currentLevel,
          portionNumber: currentPortion,
          words,
          maxPortion: max,
        });
      } catch (err: any) {
        setError(err.message || "Gagal memuat materi porsi.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setPortionContent(null);
    }
  }, [session, currentLevel, currentPortion]);

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
    setPortionContent(null);
    setView("login");
  };

  const setCurrentLevel = (level: GradeLevel) => {
    if (session && session.assignedLevels.includes(level)) {
      setCurrentLevelState(level);
    }
  };

  const markCompleteAndAdvance = () => {
    if (!currentLevel) return;
    addPortionToHistory(currentLevel, currentPortion);
    if (currentPortion < maxPortion) {
      const nextPortion = currentPortion + 1;
      setCurrentPortion(currentLevel, nextPortion);
      setCurrentPortionState(nextPortion);
    }
  };

  const goToPreviousPortion = () => {
    if (!currentLevel) return;
    if (currentPortion > 1) {
      const prevPortion = currentPortion - 1;
      setCurrentPortion(currentLevel, prevPortion);
      setCurrentPortionState(prevPortion);
    }
  };

  const jumpToPortion = (portion: number) => {
    if (!currentLevel) return;
    if (portion >= 1 && portion <= maxPortion) {
      setCurrentPortion(currentLevel, portion);
      setCurrentPortionState(portion);
    }
  };

  const resetToPortionOne = () => {
    if (!currentLevel) return;
    setCurrentPortion(currentLevel, 1);
    setCurrentPortionState(1);
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
        currentPortion,
        maxPortion,
        portionContent,
        markCompleteAndAdvance,
        goToPreviousPortion,
        jumpToPortion,
        resetToPortionOne
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
