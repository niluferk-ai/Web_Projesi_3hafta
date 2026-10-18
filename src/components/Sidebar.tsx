import React from 'react';
import type { TabType, AppDataState } from '../interfaces';
import { 
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  appData: AppDataState;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  appData,
  isOpen,
  onClose,
}) => {
  const navItems: { id: TabType; label: string; emoji: string; count?: number }[] = [
    {
      id: 'overview',
      label: 'Genel Bakış',
      emoji: '🌸',
    },
    {
      id: 'finance',
      label: 'Kişisel Finans',
      emoji: '👛',
      count: appData.finance.transactions.length,
    },
    {
      id: 'study',
      label: 'StudyFlow',
      emoji: '📚',
      count: appData.studyTasks.filter(t => t.status !== 'completed' && t.status !== 'archived').length,
    },
    {
      id: 'habitly',
      label: 'Habitly',
      emoji: '🌱',
      count: appData.habits.length,
    },
    {
      id: 'devtrack',
      label: 'DevTrack',
      emoji: '💻',
      count: appData.devProjects.length,
    },
    {
      id: 'about',
      label: 'Proje Raporu',
      emoji: '🎀',
    },
  ];

  const handleSelect = (tab: TabType) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <span>🌸</span>
          </div>
          <div className="brand-text">
            <h1>CheckSelf ✨</h1>
            <p>🧸 Sevimli Yaşam & Proje Süiti</p>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-sm mobile-menu-btn"
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav">
          <span className="nav-section-title">✨ Modüller & Menü</span>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="nav-badge">{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #fce7f3, #f3e8ff)',
              border: 'var(--border-comic-width) solid #fbcfe8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#9333ea' }}>
                🌸 React & TypeScript
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#701a75', fontWeight: 600 }}>
              LocalStorage senkronizasyonu aktif ve her modülde tam CRUD desteği hazır! ✨
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
