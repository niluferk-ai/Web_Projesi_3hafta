import React, { useRef } from 'react';
import type { TabType, AppDataState } from '../interfaces';
import { 
  Menu, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  RotateCcw
} from 'lucide-react';
import { exportDataAsJSON, resetStoredData } from '../utils/storage';

interface NavbarProps {
  activeTab: TabType;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenMobileSidebar: () => void;
  appData: AppDataState;
  setAppData: React.Dispatch<React.SetStateAction<AppDataState>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  theme,
  toggleTheme,
  onOpenMobileSidebar,
  appData,
  setAppData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: '🌸 Genel Bakış & Kontrol Merkezi',
          desc: 'Tüm 5 modülün günlük sevimli özet göstergeleri ve hızlı aksiyonları ✨',
        };
      case 'finance':
        return {
          title: '👛 Kişisel Finans ve Harcama Analiz Paneli',
          desc: 'Gelir, gider kayıtları, sevimli kategori grafikleri ve aylık bütçe hedefi 🌸',
        };
      case 'study':
        return {
          title: '📚 StudyFlow — Ders & Çalışma Planlayıcısı',
          desc: 'Ders görevleri, teslim tarihleri, ilerleme takibi ve Pomodoro sayacı ⏱️',
        };
      case 'habitly':
        return {
          title: '🌱 Habitly — Alışkanlık Takipçisi',
          desc: 'Günlük sevimli check-in, kesintisiz streak serileri ve haftalık başarı oranı ⭐',
        };
      case 'devtrack':
        return {
          title: '💻 DevTrack — Kişisel Proje ve Hedef Takipçisi',
          desc: 'Kanban aşamaları, teknoloji yığınları, öncelik ve teslim tarihleri 🚀',
        };
      case 'about':
        return {
          title: '🎀 Proje Raporu & Netlify Dağıtım Rehberi',
          desc: 'Kurulum adımları, GitHub ve Netlify yayına alma bilgileri ✨',
        };
      default:
        return { title: 'CheckSelf 🌸', desc: 'Kişisel Üretkenlik Paneli' };
    }
  };

  const { title, desc } = getPageInfo();

  const handleExport = () => {
    exportDataAsJSON(appData);
  };

  const handleReset = () => {
    if (window.confirm('Tüm veriler varsayılan örnek verilere sıfırlansın mı? 🌸')) {
      const reset = resetStoredData();
      setAppData(reset);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.finance && imported.studyTasks && imported.habits) {
          setAppData(imported);
          alert('Veriler başarıyla içe aktarıldı! 🌸');
        } else {
          alert('Geçersiz dosya formatı!');
        }
      } catch (err) {
        alert('JSON dosyası ayrıştırılamadı!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="header-navbar">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobileSidebar}
          aria-label="Menüyü aç"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-box">
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
      </div>

      <div className="header-actions">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileChange}
        />

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleExport}
          title="Verileri JSON olarak indir"
        >
          <Download size={15} />
          <span className="hide-mobile">Yedekle 🌸</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleImportClick}
          title="JSON dosyasından geri yükle"
        >
          <Upload size={15} />
          <span className="hide-mobile">Yükle ✨</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleReset}
          title="Örnek verileri sıfırla"
        >
          <RotateCcw size={15} />
          <span className="hide-mobile">Sıfırla 🧸</span>
        </button>

        <button
          type="button"
          className="btn btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
