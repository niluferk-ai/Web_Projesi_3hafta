import React, { useMemo } from 'react';
import type { AppDataState, TabType } from '../interfaces';
import { 
  Wallet, 
  GraduationCap, 
  Flame, 
  FolderGit2, 
  ArrowRight, 
  Sparkles, 
  Check,
  Calendar
} from 'lucide-react';

interface OverviewPageProps {
  appData: AppDataState;
  setActiveTab: (tab: TabType) => void;
  onUpdateHabits: (habits: any[]) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  appData,
  setActiveTab,
  onUpdateHabits,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Quick statistics
  const financeBalance = useMemo(() => {
    let inc = 0, exp = 0;
    appData.finance.transactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return inc - exp;
  }, [appData.finance]);

  const todayStudyTasks = useMemo(() => {
    return appData.studyTasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'archived' && t.dueDate <= todayStr
    );
  }, [appData.studyTasks, todayStr]);

  const pendingStudyTasks = useMemo(() => {
    return appData.studyTasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'archived'
    );
  }, [appData.studyTasks]);

  const completedHabitsToday = useMemo(() => {
    return appData.habits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [appData.habits, todayStr]);

  const activeProjects = useMemo(() => {
    return appData.devProjects.filter((p) => p.status === 'in_progress');
  }, [appData.devProjects]);

  const handleQuickHabitToggle = (habitId: string) => {
    const updated = appData.habits.map((h) => {
      if (h.id === habitId) {
        const isDone = h.completedDates.includes(todayStr);
        return {
          ...h,
          completedDates: isDone
            ? h.completedDates.filter((d: string) => d !== todayStr)
            : [...h.completedDates, todayStr],
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-accent" style={{ marginBottom: '10px' }}>
            <Sparkles size={13} /> CheckSelf Kişisel Yönetim Merkezi
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Hoş Geldiniz! Günlük Yaşam ve Proje Kontrol Paneli
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Finansal hedefleriniz, ders planlarınız, alışkanlık zincirleriniz ve yazılım projeleriniz tek bir güçlü platformda senkronize.
          </p>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* 1. Finans */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('finance')}>
          <div className="stat-header">
            <span className="stat-title">Net Bakiye (Finans)</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: financeBalance >= 0 ? '#10b981' : '#ef4444' }}>
            ₺{financeBalance.toLocaleString('tr-TR')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-subtext">{appData.finance.transactions.length} işlem kaydı</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              Panele Git <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* 2. StudyFlow */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('study')}>
          <div className="stat-header">
            <span className="stat-title">Bekleyen Ders Görevleri</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="stat-value">
            {pendingStudyTasks.length} Görev
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-subtext">{todayStudyTasks.length} görev bugün teslim</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              Panele Git <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* 3. Habitly */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('habitly')}>
          <div className="stat-header">
            <span className="stat-title">Bugünkü Alışkanlıklar</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Flame size={20} />
            </div>
          </div>
          <div className="stat-value">
            {completedHabitsToday} / {appData.habits.length}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-subtext">Haftalık zincir takibi</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              Panele Git <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* 4. DevTrack */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('devtrack')}>
          <div className="stat-header">
            <span className="stat-title">Devam Eden Projeler</span>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <FolderGit2 size={20} />
            </div>
          </div>
          <div className="stat-value">
            {activeProjects.length} Proje
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-subtext">Toplam {appData.devProjects.length} kayıtlı proje</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              Panele Git <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Quick Dashboards */}
      <div className="grid-2">
        {/* Quick Habit Check-In */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Flame size={18} color="#f59e0b" />
              <span>Bugünkü Alışkanlık Check-In</span>
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('habitly')}
            >
              Tümünü Gör
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {appData.habits.slice(0, 4).map((h) => {
              const isDone = h.completedDates.includes(todayStr);
              return (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: h.color,
                      }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{h.name}</span>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-sm ${isDone ? 'btn-success' : 'btn-outline'}`}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleQuickHabitToggle(h.id)}
                  >
                    <Check size={13} />
                    <span>{isDone ? 'Tamamlandı' : 'İşaretle'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* StudyFlow Upcoming Tasks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">
                <GraduationCap size={18} color="#6366f1" />
                <span>Yaklaşan Ders Görevleri</span>
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('study')}
              >
                StudyFlow'a Git
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingStudyTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        {task.course}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{task.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      <span>Teslim: {task.dueDate}</span>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-neutral'
                    }`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                </div>
              ))}
              {pendingStudyTasks.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                  🎉 Harika! Bekleyen ders göreviniz bulunmuyor.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
