import React, { useState, useMemo } from 'react';
import type { DevProject, ProjectStatus, TaskPriority } from '../interfaces';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { generateId } from '../utils/storage';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  Kanban, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  GitBranch 
} from 'lucide-react';

interface DevTrackPageProps {
  projects: DevProject[];
  onUpdateProjects: (projects: DevProject[]) => void;
}

const COLUMNS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Bekliyor / Fikir', color: '#f59e0b' },
  { id: 'in_progress', label: 'Devam Ediyor', color: '#6366f1' },
  { id: 'completed', label: 'Tamamlandı', color: '#10b981' },
];

export const DevTrackPage: React.FC<DevTrackPageProps> = ({
  projects,
  onUpdateProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DevProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<DevProject>>({
    title: '',
    description: '',
    status: 'in_progress',
    priority: 'medium',
    techStack: [],
    githubUrl: '',
    liveUrl: '',
    deadline: new Date().toISOString().split('T')[0],
    progress: 50,
  });
  const [techInput, setTechInput] = useState('');

  // Metrics
  const { totalCount, inProgressCount, completedCount, backlogCount } = useMemo(() => {
    return {
      totalCount: projects.length,
      inProgressCount: projects.filter((p) => p.status === 'in_progress').length,
      completedCount: projects.filter((p) => p.status === 'completed').length,
      backlogCount: projects.filter((p) => p.status === 'backlog').length,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.techStack.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [projects, searchTerm, priorityFilter]);

  // Handlers
  const handleOpenAdd = (status: ProjectStatus = 'in_progress') => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      status,
      priority: 'medium',
      techStack: ['React', 'TypeScript'],
      githubUrl: '',
      liveUrl: '',
      deadline: new Date().toISOString().split('T')[0],
      progress: 30,
    });
    setTechInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: DevProject) => {
    setEditingProject(project);
    setFormData({ ...project });
    setTechInput('');
    setIsModalOpen(true);
  };

  const handleAddTech = () => {
    if (techInput.trim()) {
      const current = formData.techStack || [];
      if (!current.includes(techInput.trim())) {
        setFormData({ ...formData, techStack: [...current, techInput.trim()] });
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (tag: string) => {
    const current = formData.techStack || [];
    setFormData({ ...formData, techStack: current.filter((t) => t !== tag) });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Lütfen proje başlığı giriniz.');
      return;
    }

    if (editingProject) {
      const updated = projects.map((p) =>
        p.id === editingProject.id ? { ...p, ...formData } as DevProject : p
      );
      onUpdateProjects(updated);
    } else {
      const newProj: DevProject = {
        id: generateId('dev'),
        title: formData.title,
        description: formData.description || '',
        status: formData.status || 'in_progress',
        priority: formData.priority || 'medium',
        techStack: formData.techStack || [],
        githubUrl: formData.githubUrl || '',
        liveUrl: formData.liveUrl || '',
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
        progress: formData.progress || 0,
      };
      onUpdateProjects([newProj, ...projects]);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    const updated = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            status: newStatus,
            progress: newStatus === 'completed' ? 100 : p.progress,
          }
        : p
    );
    onUpdateProjects(updated);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onUpdateProjects(projects.filter((p) => p.id !== deletingId));
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics */}
      <div className="grid-4">
        <StatCard
          title="Toplam Proje & Fikir"
          value={totalCount}
          subtext="Tüm kayıtlı projeler"
          icon={<FolderGit2 size={22} />}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="#6366f1"
          badge={{ text: 'Geliştirici', variant: 'accent' }}
        />
        <StatCard
          title="Devam Edenler"
          value={inProgressCount}
          subtext="Aktif kodlanan projeler"
          icon={<Clock size={22} />}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
          badge={{ text: 'İnşa Ediliyor', variant: 'info' }}
        />
        <StatCard
          title="Tamamlanan Projeler"
          value={completedCount}
          subtext="Yayına alınan ve bitenler"
          icon={<CheckCircle2 size={22} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
          badge={{ text: 'Teslim Edildi', variant: 'success' }}
        />
        <StatCard
          title="Fikir / Bekleyenler"
          value={backlogCount}
          subtext="Sırada bekleyen hedefler"
          icon={<AlertCircle size={22} />}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
          badge={{ text: 'Backlog', variant: 'warning' }}
        />
      </div>

      {/* Filter and View Toggle Bar */}
      <div className="card">
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-bar">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Proje adı, açıklama veya teknoloji ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
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

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 12px' }}
                onClick={() => setViewMode('kanban')}
              >
                <Kanban size={14} />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 12px' }}
                onClick={() => setViewMode('list')}
              >
                <List size={14} />
                <span>Liste</span>
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAdd()}
            >
              <Plus size={15} />
              <span>Proje Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="kanban-grid">
          {COLUMNS.map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="kanban-col">
                <div className="kanban-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: col.color,
                      }}
                    />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{col.label}</h4>
                    <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                      {colProjects.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-sm"
                    onClick={() => handleOpenAdd(col.id)}
                    title="Bu sütuna yeni ekle"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {colProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Bu aşamada proje yok
                    </div>
                  ) : (
                    colProjects.map((project) => {
                      const priorityColor = {
                        high: 'badge-danger',
                        medium: 'badge-warning',
                        low: 'badge-info',
                      }[project.priority];

                      return (
                        <div
                          key={project.id}
                          className="card"
                          style={{
                            padding: '16px',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{project.title}</h5>
                            <span className={`badge ${priorityColor}`}>
                              {project.priority === 'high' ? 'Yüksek' : project.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                          </div>

                          {project.description && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              {project.description}
                            </p>
                          )}

                          {/* Tech Stack Tags */}
                          {project.techStack.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {project.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--text-muted)',
                                    fontWeight: 600,
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Progress */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>İlerleme</span>
                              <span style={{ fontWeight: 700 }}>%{project.progress}</span>
                            </div>
                            <div className="progress-track" style={{ height: '6px' }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${project.progress}%`,
                                  background: col.id === 'completed' ? '#10b981' : '#6366f1',
                                }}
                              />
                            </div>
                          </div>

                          {/* Status Shift & Actions */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '8px',
                              borderTop: '1px solid var(--border-subtle)',
                              fontSize: '0.78rem',
                            }}
                          >
                            <select
                              className="form-select"
                              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                              value={project.status}
                              onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus)}
                            >
                              <option value="backlog">Bekliyor</option>
                              <option value="in_progress">Devam Ediyor</option>
                              <option value="completed">Tamamlandı</option>
                            </select>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-icon btn-sm"
                                  title="GitHub Reposu"
                                >
                                  <GitBranch size={13} />
                                </a>
                              )}
                              <button
                                type="button"
                                className="btn btn-icon btn-sm"
                                onClick={() => handleOpenEdit(project)}
                                title="Düzenle"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => setDeletingId(project.id)}
                                title="Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="card">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <FolderGit2 size={32} />
              <h4>Proje Bulunamadı</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.title}</h4>
                      <span className="badge badge-accent">{p.status}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {p.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.deadline}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      onClick={() => handleOpenEdit(p)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setDeletingId(p.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Projeyi Düzenle' : 'Yeni Proje / Fikir Ekle'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Proje Başlığı *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Örn: CheckSelf Proje Portalı"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama / Hedef</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Proje ne işe yarar, hangi problemi çözer?"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Aşama / Durum</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <option value="backlog">Bekliyor / Fikir</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Öncelik</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Son Teslim Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">İlerleme Yüzdesi (%{formData.progress || 0})</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                style={{ width: '100%', marginTop: '10px' }}
                value={formData.progress || 0}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Tech Stack Input */}
          <div className="form-group">
            <label className="form-label">Kullanılan Teknolojiler (Etiket)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Next.js, Tailwind, Docker"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddTech}>
                Ekle
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(formData.techStack || []).map((tech) => (
                <span
                  key={tech}
                  className="badge badge-accent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveTech(tech)}
                  title="Kaldırmak için tıkla"
                >
                  {tech} ✕
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">GitHub Repo Linki (Opsiyonel)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://github.com/..."
                value={formData.githubUrl || ''}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Canlı Demo Linki (Opsiyonel)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com"
                value={formData.liveUrl || ''}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
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
              {editingProject ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Projeyi Sil"
        message="Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  );
};
