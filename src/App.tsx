import React, { useState, useEffect } from 'react';
import type { TabType, AppDataState } from './interfaces';
import { loadStoredData, saveStoredData, setStoredTheme } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { FinancePage } from './pages/FinancePage';
import { StudyFlowPage } from './pages/StudyFlowPage';
import { HabitlyPage } from './pages/HabitlyPage';
import { DevTrackPage } from './pages/DevTrackPage';

import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as TabType;
      const validTabs: TabType[] = ['overview', 'finance', 'study', 'habitly', 'devtrack', 'about'];
      if (validTabs.includes(tab)) return tab;
      const hash = window.location.hash.replace('#', '') as TabType;
      if (validTabs.includes(hash)) return hash;
    } catch {
      // ignore
    }
    return 'overview';
  });
  const [appData, setAppData] = useState<AppDataState>(loadStoredData);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  }, [activeTab]);

  // Sync data to LocalStorage on state change
  useEffect(() => {
    saveStoredData(appData);
  }, [appData]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appData={appData}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          activeTab={activeTab}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          appData={appData}
          setAppData={setAppData}
        />

        <main className="page-wrapper">
          {activeTab === 'overview' && (
            <OverviewPage
              appData={appData}
              setActiveTab={setActiveTab}
              onUpdateHabits={(habits) => setAppData({ ...appData, habits })}
            />
          )}

          {activeTab === 'finance' && (
            <FinancePage
              transactions={appData.finance.transactions}
              budget={appData.finance.budget}
              onUpdateTransactions={(transactions) =>
                setAppData({
                  ...appData,
                  finance: { ...appData.finance, transactions },
                })
              }
              onUpdateBudget={(budget) =>
                setAppData({
                  ...appData,
                  finance: { ...appData.finance, budget },
                })
              }
            />
          )}

          {activeTab === 'study' && (
            <StudyFlowPage
              tasks={appData.studyTasks}
              onUpdateTasks={(studyTasks) => setAppData({ ...appData, studyTasks })}
            />
          )}

          {activeTab === 'habitly' && (
            <HabitlyPage
              habits={appData.habits}
              onUpdateHabits={(habits) => setAppData({ ...appData, habits })}
            />
          )}

          {activeTab === 'devtrack' && (
            <DevTrackPage
              projects={appData.devProjects}
              onUpdateProjects={(devProjects) => setAppData({ ...appData, devProjects })}
            />
          )}


          {activeTab === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
