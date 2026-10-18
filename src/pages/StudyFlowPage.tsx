import React, { useState, useMemo, useEffect } from 'react';
import type { StudyTask, TaskPriority, TaskStatus } from '../interfaces';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { generateId } from '../utils/storage';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Archive, 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  Calendar, 
  Check, 
  Award 
} from 'lucide-react';

interface StudyFlowPageProps {
  tasks: StudyTask[];
  onUpdateTasks: (tasks: StudyTask[]) => void;
}

const COURSES = [
  'Web Geliştirme',
  'Veri Yapıları & Algoritmalar',
  'İngilizce',
  'Sistem Tasarımı',
  'Yapay Zeka',
  'Matematik',
  'Mobil Geliştirme',
  'Genel Çalışma',
];

export const StudyFlowPage: React.FC<StudyFlowPageProps> = ({
  tasks,
  onUpdateTasks,
}) => {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<StudyTask>>({
    course: 'Web Geliştirme',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
    estimatedMinutes: 45,
    notes: '',
  });

  // Pomodoro Focus Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<string>('Genel Odaklanma');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((sec) => sec - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
      confetti({ particleCount: 70, spread: 60 });
      alert('Tebrikler! Pomodoro çalışma süresi tamamlandı. 5 dakika mola verin!');
      setPomodoroSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  // Calculated Metrics
  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'archived'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'completed'), [tasks]);
  const progressPercent = activeTasks.length > 0 
    ? Math.round((completedTasks.length / activeTasks.length) * 100) 
    : 0;

  // Upcoming deadlines (within today or overdue)
  const urgentTasksCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activeTasks.filter((t) => t.status !== 'completed' && t.dueDate <= today).length;
  }, [activeTasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCourse = courseFilter === 'all' || t.course === courseFilter;
      const matchesStatus = statusFilter === 'all' ? t.status !== 'archived' : t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesSearch && matchesCourse && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, courseFilter, statusFilter, priorityFilter]);

  // CRUD Handlers
  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      course: 'Web Geliştirme',
      title: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'todo',
      estimatedMinutes: 45,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: StudyTask) => {
    setEditingTask(task);
    setFormData({ ...task });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Lütfen görev başlığı girin.');
      return;
    }

    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id ? { ...t, ...formData } as StudyTask : t
      );
      onUpdateTasks(updated);
    } else {
      const newTask: StudyTask = {
        id: generateId('study'),
        course: formData.course || 'Genel Çalışma',
        title: formData.title,
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        priority: formData.priority || 'medium',
        status: formData.status || 'todo',
        estimatedMinutes: formData.estimatedMinutes || 45,
        notes: formData.notes || '',
      };
      onUpdateTasks([newTask, ...tasks]);
    }
    setIsModalOpen(false);
  };

  const handleToggleComplete = (task: StudyTask) => {
    const isNowCompleted = task.status !== 'completed';
    if (isNowCompleted) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }
    const updated = tasks.map((t) =>
      t.id === task.id
        ? {
            ...t,
            status: (isNowCompleted ? 'completed' : 'todo') as TaskStatus,
            completedAt: isNowCompleted ? new Date().toISOString().split('T')[0] : undefined,
          }
        : t
    );
    onUpdateTasks(updated);
  };

  const handleArchive = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: 'archived' as TaskStatus } : t
    );
    onUpdateTasks(updated);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onUpdateTasks(tasks.filter((t) => t.id !== deletingId));
      setDeletingId(null);
    }
  };

  // Timer helper
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards */}
      <div className="grid-4">
        <StatCard
          title="Toplam Çalışma Görevi"
          value={activeTasks.length}
          subtext="Aktif takip edilen görevler"
          icon={<GraduationCap size={22} />}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="#6366f1"
          badge={{ text: `${tasks.filter(t => t.status === 'archived').length} Arşiv`, variant: 'info' }}
        />
        <StatCard
          title="Tamamlanan Görevler"
          value={completedTasks.length}
          subtext={`%${progressPercent} başarı oranı`}
          icon={<CheckCircle2 size={22} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
          badge={{ text: 'Tamamlandı', variant: 'success' }}
        />
        <StatCard
          title="Acil / Yaklaşan Tarihler"
          value={urgentTasksCount}
          subtext="Bugün veya geciken görevler"
          icon={<AlertCircle size={22} />}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#ef4444"
          badge={{ text: urgentTasksCount > 0 ? 'Dikkat' : 'Sorunsuz', variant: urgentTasksCount > 0 ? 'danger' : 'success' }}
        />
        <StatCard
          title="Genel İlerleme"
          value={`%${progressPercent}`}
          subtext="Çalışma tamamlama hedefi"
          icon={<Award size={22} />}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
          badge={{ text: `${activeTasks.length - completedTasks.length} Kalan`, variant: 'accent' }}
        />
      </div>

      {/* Progress & Focus Pomodoro Bar */}
      <div className="grid-2">
        {/* Progress Bar Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Günlük Çalışma Başarı Oranı</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {completedTasks.length} tamamlandı / {activeTasks.length} toplam aktif görev
              </p>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              %{progressPercent}
            </span>
          </div>
          <div className="progress-track" style={{ height: '12px' }}>
            <div
              className="progress-fill"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #6366f1, #10b981)',
              }}
            />
          </div>
        </div>

        {/* Embedded Pomodoro Focus Timer */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.8))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: '6px' }}>
                ⏱️ Pomodoro Odak Sayacı
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeTimerTask}</h4>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#a78bfa' }}>
              {formatTime(pomodoroSeconds)}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${isTimerRunning ? 'btn-danger' : 'btn-success'} btn-sm`}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                <span>{isTimerRunning ? 'Durdur' : 'Başlat'}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(25 * 60);
                }}
                title="Sıfırla"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List & Filter Section */}
      <div className="card">
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Ders veya görev ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">Tüm Dersler</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tüm Durumlar (Aktif)</option>
              <option value="todo">Yapılacak</option>
              <option value="in_progress">Devam Eden</option>
              <option value="completed">Tamamlanan</option>
              <option value="archived">Arşivlenen</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="high">Yüksek Öncelik</option>
              <option value="medium">Orta Öncelik</option>
              <option value="low">Düşük Öncelik</option>
            </select>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAdd}
            >
              <Plus size={15} />
              <span>Görev Ekle</span>
            </button>
          </div>
        </div>

        {/* Task Cards */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={28} />
            </div>
            <h4>Görev Bulunamadı</h4>
            <p>Seçili filtrelere uygun ders görevi bulunmuyor. Yeni bir görev ekleyin!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isArchived = task.status === 'archived';
              const isDueToday = task.dueDate === new Date().toISOString().split('T')[0];
              const isOverdue = task.dueDate < new Date().toISOString().split('T')[0] && !isCompleted;

              const priorityBadge = {
                high: { text: 'Yüksek', variant: 'danger' as const },
                medium: { text: 'Orta', variant: 'warning' as const },
                low: { text: 'Düşük', variant: 'info' as const },
              }[task.priority];

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                    border: '1px solid',
                    borderColor: isCompleted 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : isOverdue 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : 'var(--border-subtle)',
                    gap: '16px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <button
                      type="button"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isCompleted ? 'none' : '2px solid var(--border-hover)',
                        background: isCompleted ? 'var(--success)' : 'transparent',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onClick={() => handleToggleComplete(task)}
                      title={isCompleted ? 'Yapılmadı olarak işaretle' : 'Tamamla'}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}
                        >
                          {task.title}
                        </span>
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                          {task.course}
                        </span>
                        <span className={`badge badge-${priorityBadge.variant}`} style={{ fontSize: '0.7rem' }}>
                          {priorityBadge.text}
                        </span>
                        {isOverdue && (
                          <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                            Gecikti
                          </span>
                        )}
                        {isDueToday && (
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                            Bugün Teslim
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>{task.dueDate}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span>{task.estimatedMinutes} dk</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setActiveTimerTask(task.title);
                        setPomodoroSeconds(task.estimatedMinutes * 60 || 25 * 60);
                        setIsTimerRunning(true);
                      }}
                      title="Bu göreve odaklan"
                    >
                      <Play size={13} />
                      <span className="hide-mobile">Odaklan</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      onClick={() => handleOpenEdit(task)}
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>

                    {!isArchived && isCompleted && (
                      <button
                        type="button"
                        className="btn btn-icon btn-sm"
                        onClick={() => handleArchive(task.id)}
                        title="Arşivle"
                      >
                        <Archive size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setDeletingId(task.id)}
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

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Görevi Düzenle' : 'Yeni Çalışma Görevi Ekle'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Ders / Konu *</label>
            <select
              className="form-select"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Görev Başlığı *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Örn: React Context ve Custom Hooks Çalışması"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Son Teslim Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tahmini Süre (Dakika)</label>
              <input
                type="number"
                min="5"
                step="5"
                className="form-control"
                value={formData.estimatedMinutes || 45}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Öncelik Seviyesi</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                <option value="low">Düşük Öncelik</option>
                <option value="medium">Orta Öncelik</option>
                <option value="high">Yüksek Öncelik</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Durum</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              >
                <option value="todo">Yapılacak</option>
                <option value="in_progress">Devam Eden</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Çalışma Notları (Opsiyonel)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="İncelenecek kaynaklar, soru sayısı, kaynak linki..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
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
              {editingTask ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Görevi Sil"
        message="Bu çalışma görevini silmek istediğinize emin misiniz?"
      />
    </div>
  );
};
