import React, { useState, useMemo } from 'react';
import type { FinanceTransaction, FinanceBudget } from '../interfaces';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { generateId } from '../utils/storage';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  AlertCircle,
  PieChart as PieIcon,
  Tag,
  Settings
} from 'lucide-react';

interface FinancePageProps {
  transactions: FinanceTransaction[];
  budget: FinanceBudget;
  onUpdateTransactions: (transactions: FinanceTransaction[]) => void;
  onUpdateBudget: (budget: FinanceBudget) => void;
}

const CATEGORIES = {
  income: ['Maaş', 'Freelance', 'Yatırım & Temettü', 'Burs / Destek', 'Satış Geliri', 'Diğer Gelir'],
  expense: ['Kira & Konut', 'Market & Gıda', 'Faturalar', 'Ulaşım', 'Eğlence & Sosyal', 'Eğitim', 'Sağlık', 'Giyim', 'Teknoloji', 'Diğer Gider'],
};

const CATEGORY_COLORS: Record<string, string> = {
  'Kira & Konut': '#6366f1',
  'Market & Gıda': '#10b981',
  'Faturalar': '#f59e0b',
  'Ulaşım': '#06b6d4',
  'Eğlence & Sosyal': '#ec4899',
  'Eğitim': '#8b5cf6',
  'Sağlık': '#ef4444',
  'Giyim': '#14b8a6',
  'Teknoloji': '#3b82f6',
  'Diğer Gider': '#64748b',
};

export const FinancePage: React.FC<FinancePageProps> = ({
  transactions,
  budget,
  onUpdateTransactions,
  onUpdateBudget,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FinanceTransaction>>({
    title: '',
    amount: 0,
    type: 'expense',
    category: 'Market & Gıda',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [budgetFormData, setBudgetFormData] = useState<FinanceBudget>(budget);

  // Calculated Totals
  const { totalIncome, totalExpense, balance, savingsRate } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    const bal = inc - exp;
    const rate = inc > 0 ? Math.max(0, Math.round(((inc - exp) / inc) * 100)) : 0;
    return { totalIncome: inc, totalExpense: exp, balance: bal, savingsRate: rate };
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  // Category Distribution for Expenses
  const categoryStats = useMemo(() => {
    const expenseMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      });

    return Object.entries(expenseMap)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: CATEGORY_COLORS[cat] || '#8b5cf6',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totalExpense]);

  // Handlers: Add / Update
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      amount: 0,
      type: 'expense',
      category: 'Market & Gıda',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: FinanceTransaction) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || formData.amount <= 0) {
      alert('Lütfen geçerli bir başlık ve tutar giriniz.');
      return;
    }

    if (editingItem) {
      // Update
      const updated = transactions.map((t) =>
        t.id === editingItem.id ? { ...t, ...formData } as FinanceTransaction : t
      );
      onUpdateTransactions(updated);
    } else {
      // Create
      const newTransaction: FinanceTransaction = {
        id: generateId('fin'),
        title: formData.title!,
        amount: Number(formData.amount),
        type: formData.type || 'expense',
        category: formData.category || 'Diğer Gider',
        date: formData.date || new Date().toISOString().split('T')[0],
        description: formData.description || '',
      };
      onUpdateTransactions([newTransaction, ...transactions]);
    }
    setIsAddModalOpen(false);
  };

  // Handler: Delete
  const handleConfirmDelete = () => {
    if (deletingId) {
      onUpdateTransactions(transactions.filter((t) => t.id !== deletingId));
      setDeletingId(null);
    }
  };

  // Budget Handler
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudget(budgetFormData);
    setIsBudgetModalOpen(false);
  };

  const budgetUsagePercent = budget.monthlyExpenseBudget > 0 
    ? Math.min(100, Math.round((totalExpense / budget.monthlyExpenseBudget) * 100))
    : 0;

  const isOverBudget = totalExpense > budget.monthlyExpenseBudget;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Metric Cards */}
      <div className="grid-4">
        <StatCard
          title="Toplam Gelir"
          value={`₺${totalIncome.toLocaleString('tr-TR')}`}
          subtext="Ay içerisindeki tüm girişler"
          icon={<TrendingUp size={22} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
          badge={{ text: 'Aktif Gelir', variant: 'success' }}
        />
        <StatCard
          title="Toplam Gider"
          value={`₺${totalExpense.toLocaleString('tr-TR')}`}
          subtext={`Bütçe: ₺${budget.monthlyExpenseBudget.toLocaleString('tr-TR')}`}
          icon={<TrendingDown size={22} />}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#ef4444"
          badge={{ 
            text: isOverBudget ? 'Bütçe Aşıldı!' : `%${budgetUsagePercent} Kullanıldı`, 
            variant: isOverBudget ? 'danger' : 'warning' 
          }}
        />
        <StatCard
          title="Net Bakiye"
          value={`₺${balance.toLocaleString('tr-TR')}`}
          subtext={balance >= 0 ? 'Pozitif nakit akışı' : 'Dikkat: Negatif bakiye'}
          icon={<DollarSign size={22} />}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="#6366f1"
          badge={{ 
            text: balance >= 0 ? 'Güvende' : 'Açık Var', 
            variant: balance >= 0 ? 'info' : 'danger' 
          }}
        />
        <StatCard
          title="Tasarruf Oranı"
          value={`%${savingsRate}`}
          subtext={`Hedef: ₺${budget.savingsTarget.toLocaleString('tr-TR')}`}
          icon={<PiggyBank size={22} />}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
          badge={{ text: `₺${Math.max(0, balance).toLocaleString('tr-TR')} Kaldı`, variant: 'accent' }}
        />
      </div>

      {/* Budget Progress & Warning Bar */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Aylık Bütçe Kullanım Durumu</span>
              {isOverBudget && (
                <span className="badge badge-danger">
                  <AlertCircle size={12} /> Bütçe Aşımı (₺{(totalExpense - budget.monthlyExpenseBudget).toLocaleString('tr-TR')})
                </span>
              )}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ₺{totalExpense.toLocaleString('tr-TR')} harcandı / ₺{budget.monthlyExpenseBudget.toLocaleString('tr-TR')} limit belirlendi
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setBudgetFormData(budget);
              setIsBudgetModalOpen(true);
            }}
          >
            <Settings size={14} />
            <span>Bütçe Hedefini Düzenle</span>
          </button>
        </div>

        <div className="progress-track" style={{ height: '10px' }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, (totalExpense / budget.monthlyExpenseBudget) * 100)}%`,
              background: isOverBudget
                ? 'linear-gradient(90deg, #ef4444, #b91c1c)'
                : budgetUsagePercent > 80
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #10b981, #059669)',
            }}
          />
        </div>
      </div>

      {/* Analytics & Distribution Section */}
      <div className="grid-2">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieIcon size={18} color="var(--brand-primary)" />
              <span>Gider Kategori Dağılımı</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {categoryStats.length} Kategori
            </span>
          </div>

          {categoryStats.length === 0 ? (
            <div className="empty-state">
              <p>Henüz gider kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryStats.map((item) => (
                <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.color,
                        }}
                      />
                      {item.category}
                    </span>
                    <span>
                      ₺{item.amount.toLocaleString('tr-TR')}{' '}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                        (%{item.percentage})
                      </span>
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: '6px' }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action & Financial Health Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">
                <Tag size={18} color="#8b5cf6" />
                <span>Finansal Sağlık & Tasarruf Hedefi</span>
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Aylık Tasarruf Hedefi</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    ₺{Math.max(0, balance).toLocaleString('tr-TR')} / ₺{budget.savingsTarget.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, Math.round((Math.max(0, balance) / budget.savingsTarget) * 100))}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                  💡 Akıllı Tasarruf İpucu
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  En yüksek harcama kaleminiz olan <strong>{categoryStats[0]?.category || 'Kira & Konut'}</strong> kategorisinde %10 tasarruf yaparak aylık hedefinize 15 gün daha erken ulaşabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleOpenAdd}
            >
              <Plus size={16} />
              <span>Yeni İşlem Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List & Filter Bar */}
      <div className="card">
        <div className="filter-bar">
          <div className="search-bar">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="İşlem veya açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            {/* Type Filter */}
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">Tüm Tipler</option>
              <option value="income">Sadece Gelirler</option>
              <option value="expense">Sadece Giderler</option>
            </select>

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              <optgroup label="Giderler">
                {CATEGORIES.expense.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Gelirler">
                {CATEGORIES.income.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>

            {/* Sort Filter */}
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date-desc">En Yeni Tarih</option>
              <option value="date-asc">En Eski Tarih</option>
              <option value="amount-desc">En Yüksek Tutar</option>
              <option value="amount-asc">En Düşük Tutar</option>
            </select>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAdd}
            >
              <Plus size={15} />
              <span>İşlem Ekle</span>
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={28} />
            </div>
            <h4>Eşleşen İşlem Bulunamadı</h4>
            <p>Arama kriterlerinizi değiştirebilir veya yeni bir gelir/gider ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>İşlem</th>
                  <th style={{ padding: '12px 14px' }}>Kategori</th>
                  <th style={{ padding: '12px 14px' }}>Tarih</th>
                  <th style={{ padding: '12px 14px' }}>Tutar</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item) => {
                  const isIncome = item.type === 'income';
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-sm)',
                              background: isIncome ? 'var(--success-bg)' : 'var(--danger-bg)',
                              color: isIncome ? 'var(--success)' : 'var(--danger)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                            {item.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <span className="badge badge-accent">
                          {item.category}
                        </span>
                      </td>

                      <td style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          {item.date}
                        </div>
                      </td>

                      <td style={{ padding: '14px', fontWeight: 700, fontSize: '0.95rem' }}>
                        <span style={{ color: isIncome ? 'var(--success)' : 'var(--danger)' }}>
                          {isIncome ? '+' : '-'}₺{item.amount.toLocaleString('tr-TR')}
                        </span>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-icon btn-sm"
                            onClick={() => handleOpenEdit(item)}
                            title="Düzenle"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon btn-sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => setDeletingId(item.id)}
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingItem ? 'İşlemi Düzenle' : 'Yeni Gelir / Gider Ekle'}
      >
        <form onSubmit={handleSaveTransaction}>
          <div className="form-group">
            <label className="form-label">İşlem Türü</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${formData.type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    type: 'expense',
                    category: CATEGORIES.expense[0],
                  });
                }}
              >
                <TrendingDown size={16} /> Gider
              </button>
              <button
                type="button"
                className={`btn ${formData.type === 'income' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => {
                  setFormData({
                    ...formData,
                    type: 'income',
                    category: CATEGORIES.income[0],
                  });
                }}
              >
                <TrendingUp size={16} /> Gelir
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">İşlem Başlığı *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Örn: Market Alışverişi veya Maaş"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Tutar (₺) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {(formData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">İşlem Tarihi</label>
            <input
              type="date"
              className="form-control"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama / Not (Opsiyonel)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Ekstra detay veya açıklama..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Budget Settings Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Aylık Bütçe ve Tasarruf Hedefleri"
      >
        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Aylık Harcama Limiti Bütçesi (₺)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={budgetFormData.monthlyExpenseBudget}
              onChange={(e) =>
                setBudgetFormData({
                  ...budgetFormData,
                  monthlyExpenseBudget: parseFloat(e.target.value) || 0,
                })
              }
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Bu limiti aştığınızda sistem sizi otomatik olarak uyarır.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Aylık Gelir Hedefi (₺)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={budgetFormData.monthlyIncomeTarget}
              onChange={(e) =>
                setBudgetFormData({
                  ...budgetFormData,
                  monthlyIncomeTarget: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Aylık Tasarruf Hedefi (₺)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={budgetFormData.savingsTarget}
              onChange={(e) =>
                setBudgetFormData({
                  ...budgetFormData,
                  savingsTarget: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsBudgetModalOpen(false)}
            >
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary">
              Bütçeyi Kaydet
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="İşlemi Sil"
        message="Bu finans işlemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  );
};
