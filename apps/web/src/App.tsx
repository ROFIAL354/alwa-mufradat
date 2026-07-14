import React from "react";
import { useAppContext } from "./context/AppContext.tsx";
import AppLayout from "./components/layout/AppLayout.tsx";
import LoginPage from "./components/auth/LoginPage.tsx";
import DashboardPage from "./components/dashboard/DashboardPage.tsx";
import HistoryPage from "./components/history/HistoryPage.tsx";

export const App: React.FC = () => {
  const { view } = useAppContext();

  // Route based on AppContext view state
  switch (view) {
    case "login":
      return <LoginPage />;
    case "dashboard":
      return (
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      );
    case "history":
      return (
        <AppLayout>
          <HistoryPage />
        </AppLayout>
      );
    default:
      return <LoginPage />;
  }
};

export default App;
