import React, { useState, useMemo } from 'react';
import type { Habit } from '../interfaces';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { generateId } from '../utils/storage';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Sparkles, 
  Award, 
  Activity, 
  BookOpen, 
  Droplet, 
  Code, 
  Languages 
} from 'lucide-react';

interface HabitlyPageProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
}

const CATEGORIES = ['Sağlık', 'Spor', 'Kişisel Gelişim', 'Yazılım', 'Dil', 'Zihin & Ruh'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];

// Helper to calculate current active streak
const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sorted = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If not completed today or yesterday, streak is broken
  if (!sorted.includes(today) && !sorted.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = sorted.includes(today) ? new Date() : yesterday;

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Get last 7 days array
const getLast7Days = () => {
  const days = [];
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
};

export const HabitlyPage: React.FC<HabitlyPageProps> = ({
  habits,
  onUpdateHabits,
}) => {
  const last7Days = useMemo(() => getLast7Days(), []);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Habit>>({
    name: '',
    category: 'Sağlık',
    targetCount: 1,
    unit: 'kez',
    color: '#6366f1',
    icon: 'activity',
  });

  // Calculate high-level stats
  const { totalCompletedToday, bestStreak, weeklySuccessRate } = useMemo(() => {
    let completedToday = 0;
    let maxStreak = 0;
    let totalExpectedIn7Days = habits.length * 7;
    let totalCompletedIn7Days = 0;

    habits.forEach((h) => {
      const streak = calculateStreak(h.completedDates);
      if (streak > maxStreak) maxStreak = streak;

      if (h.completedDates.includes(todayStr)) {
        completedToday++;
      }

      last7Days.forEach((d) => {
        if (h.completedDates.includes(d.dateStr)) {
          totalCompletedIn7Days++;
        }
      });
    });

    const weeklyRate = totalExpectedIn7Days > 0 
      ? Math.round((totalCompletedIn7Days / totalExpectedIn7Days) * 100) 
      : 0;

    return {
      totalCompletedToday: completedToday,
      bestStreak: maxStreak,
      weeklySuccessRate: weeklyRate,
    };
  }, [habits, todayStr, last7Days]);

  // Handlers
  const handleToggleDay = (habit: Habit, dateStr: string) => {
    const isCompleted = habit.completedDates.includes(dateStr);
    let newCompletedDates: string[];

    if (isCompleted) {
      newCompletedDates = habit.completedDates.filter((d) => d !== dateStr);
    } else {
      newCompletedDates = [...habit.completedDates, dateStr];
      if (dateStr === todayStr) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
        });
      }
    }

    const updated = habits.map((h) =>
      h.id === habit.id ? { ...h, completedDates: newCompletedDates } : h
    );
    onUpdateHabits(updated);
  };

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setFormData({
      name: '',
      category: 'Sağlık',
      targetCount: 1,
      unit: 'kez',
      color: '#6366f1',
      icon: 'activity',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({ ...habit });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Lütfen alışkanlık adı giriniz.');
      return;
    }

    if (editingHabit) {
      const updated = habits.map((h) =>
        h.id === editingHabit.id ? { ...h, ...formData } as Habit : h
      );
      onUpdateHabits(updated);
    } else {
      const newHabit: Habit = {
        id: generateId('habit'),
        name: formData.name,
        category: formData.category || 'Sağlık',
        targetCount: formData.targetCount || 1,
        unit: formData.unit || 'kez',
        color: formData.color || '#6366f1',
        icon: formData.icon || 'activity',
        completedDates: [],
        createdAt: todayStr,
      };
      onUpdateHabits([newHabit, ...habits]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onUpdateHabits(habits.filter((h) => h.id !== deletingId));
      setDeletingId(null);
    }
  };

  // Quick Preset Add
  const handleAddPreset = (name: string, category: string, color: string, unit: string) => {
    const newHabit: Habit = {
      id: generateId('habit'),
      name,
      category,
      targetCount: 1,
      unit,
      color,
      icon: 'activity',
      completedDates: [todayStr],
      createdAt: todayStr,
    };
    onUpdateHabits([newHabit, ...habits]);
    confetti({ particleCount: 50, spread: 50 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stat Cards */}
      <div className="grid-4">
        <StatCard
          title="Bugün Tamamlanan"
          value={`${totalCompletedToday} / ${habits.length}`}
          subtext="Bugünkü alışkanlık hedefleri"
          icon={<Check size={22} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
          badge={{ 
            text: habits.length > 0 && totalCompletedToday === habits.length ? 'Tümü Bitti!' : 'Devam Ediyor', 
            variant: totalCompletedToday === habits.length ? 'success' : 'warning' 
          }}
        />
        <StatCard
          title="En Uzun Seri (Streak)"
          value={`${bestStreak} Gün 🔥`}
          subtext="Kesintisiz devam eden zincir"
          icon={<Flame size={22} />}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
          badge={{ text: 'Süper Seri', variant: 'warning' }}
        />
        <StatCard
          title="Haftalık Başarı Oranı"
          value={`%${weeklySuccessRate}`}
          subtext="Son 7 günün genel performansı"
          icon={<Award size={22} />}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
          badge={{ text: `%${weeklySuccessRate}`, variant: 'accent' }}
        />
        <StatCard
          title="Aktif Alışkanlıklar"
          value={habits.length}
          subtext="Kişisel gelişim rutinleri"
          icon={<Activity size={22} />}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="#6366f1"
          badge={{ text: 'Aktif', variant: 'info' }}
        />
      </div>

      {/* Quick Add Presets Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--brand-primary)" />
              Hızlı Alışkanlık Önerileri
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tek tıkla popüler alışkanlıklardan birini listenize ekleyin
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddPreset('Günde 2L Su İç', 'Sağlık', '#0284c7', 'litre')}
            >
              <Droplet size={14} color="#0284c7" /> Su İçme
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddPreset('30 Dk Kitap Oku', 'Kişisel Gelişim', '#8b5cf6', 'dakika')}
            >
              <BookOpen size={14} color="#8b5cf6" /> Kitap Okuma
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddPreset('15 Dk İngilizce Çalış', 'Dil', '#f59e0b', 'dakika')}
            >
              <Languages size={14} color="#f59e0b" /> Dil Pratiği
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddPreset('GitHub Commit At', 'Yazılım', '#ec4899', 'commit')}
            >
              <Code size={14} color="#ec4899" /> Kod Yazma
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAdd}
            >
              <Plus size={14} /> Yeni Alışkanlık
            </button>
          </div>
        </div>
      </div>

      {/* Habits List & 7-Day Tracker */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Flame size={20} color="#f59e0b" />
              <span>Haftalık Alışkanlık Zinciri</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Günün kutucuğuna tıklayarak tamamlandı olarak işaretleyin veya kaldırın
            </p>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Flame size={28} />
            </div>
            <h4>Henüz Alışkanlık Eklenmedi</h4>
            <p>Yukarıdaki önerilerden birini seçin veya kendinize özel bir alışkanlık oluşturun.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {habits.map((habit) => {
              const streak = calculateStreak(habit.completedDates);
              const isTodayDone = habit.completedDates.includes(todayStr);

              return (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left: Info & Streak */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: 1 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: `${habit.color}20`,
                        color: habit.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Activity size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{habit.name}</h4>
                        <span className="badge" style={{ background: `${habit.color}15`, color: habit.color }}>
                          {habit.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
                          <Flame size={14} /> {streak} Gün Seri
                        </span>
                        <span>•</span>
                        <span>Hedef: {habit.targetCount} {habit.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 7-Day Bubbles */}
                  <div className="habit-days-row">
                    {last7Days.map((d) => {
                      const isDone = habit.completedDates.includes(d.dateStr);
                      return (
                        <div
                          key={d.dateStr}
                          className={`habit-day-bubble ${isDone ? 'done' : ''}`}
                          style={{
                            backgroundColor: isDone ? habit.color : undefined,
                            boxShadow: isDone ? `0 2px 10px ${habit.color}50` : undefined,
                            border: d.isToday ? '2px solid var(--brand-primary)' : undefined,
                          }}
                          onClick={() => handleToggleDay(habit, d.dateStr)}
                          title={`${d.dateStr}: ${isDone ? 'Tamamlandı' : 'Tamamlanmadı'}`}
                        >
                          <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>{d.dayName}</span>
                          <span>{d.dayNumber}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className={`btn ${isTodayDone ? 'btn-success' : 'btn-primary'} btn-sm`}
                      onClick={() => handleToggleDay(habit, todayStr)}
                    >
                      <Check size={14} />
                      <span>{isTodayDone ? 'Bugün Tamam!' : 'Tamamla'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      onClick={() => setHistoryHabit(habit)}
                      title="Geçmiş Kayıtları Gör"
                    >
                      <Calendar size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      onClick={() => handleOpenEdit(habit)}
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setDeletingId(habit.id)}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Alışkanlığı Düzenle' : 'Yeni Alışkanlık Oluştur'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Alışkanlık Adı *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Örn: Günde 20 Sayfa Kitap Oku"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Renk Teması</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '42px' }}>
                {COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: col,
                      border: formData.color === col ? '3px solid #fff' : 'none',
                      cursor: 'pointer',
                      outline: formData.color === col ? `2px solid ${col}` : 'none',
                    }}
                    onClick={() => setFormData({ ...formData, color: col })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Günlük Hedef Miktar</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.targetCount || 1}
                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Birim</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: sayfa, litre, dk, bardak"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary">
              {editingHabit ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      {historyHabit && (
        <Modal
          isOpen={!!historyHabit}
          onClose={() => setHistoryHabit(null)}
          title={`${historyHabit.name} — Tamamlanma Geçmişi`}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem' }}>
              <span>Toplam Tamamlanan Gün: <strong>{historyHabit.completedDates.length} Gün</strong></span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                🔥 {calculateStreak(historyHabit.completedDates)} Gün Güncel Seri
              </span>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {historyHabit.completedDates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Henüz geçmiş kayıt bulunmuyor.</p>
              ) : (
                [...historyHabit.completedDates].sort().reverse().map((dateStr) => (
                  <div
                    key={dateStr}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--brand-primary)" />
                      {dateStr}
                    </span>
                    <span className="badge badge-success">Başarılı</span>
                  </div>
                ))
              )}
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setHistoryHabit(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Alışkanlığı Sil"
        message="Bu alışkanlığı ve tüm geçmiş kayıtlarını silmek istediğinize emin misiniz?"
      />
    </div>
  );
};
