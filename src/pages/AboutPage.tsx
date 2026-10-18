import React from 'react';
import { 
  CheckCircle2, 
  Globe, 
  Sparkles,
  GitBranch
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="badge badge-accent">
            <Sparkles size={14} /> Proje Teslim & Dağıtım Dokümantasyonu
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
          CheckSelf — 4-in-1 Modern Frontend Web Portalı
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px', lineHeight: '1.6' }}>
          Bu proje, hedeflenen 4 farklı uygulamanın tüm gereksinimlerini (Kişisel Finans, StudyFlow, Habitly ve DevTrack) tek bir çatı altında toplayarak, her bir modülde eksiksiz <strong>CRUD (Ekle, Listele, Güncelle, Sil)</strong> işlemlerini ve <strong>LocalStorage</strong> veri kalıcılığını sunar.
        </p>
      </div>

      {/* Checklist Grid */}
      <div className="grid-2">
        {/* Requirements Checklist */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={18} color="#10b981" />
              <span>Proje Gereksinimleri Karşılanma Durumu</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: 'Modern Javascript Çerçevesi (React + TypeScript + Vite)',
                desc: 'Hızlı, modüler ve tip güvenli React mimarisi kuruldu.',
              },
              {
                title: 'LocalStorage Entegrasyonu',
                desc: 'Tüm 4 modülün verileri tarayıcıda kalıcı olarak saklanır, yedeklenebilir ve sıfırlanabilir.',
              },
              {
                title: 'Dosya Ağaç Yapısı (Components, Pages, Interfaces)',
                desc: 'src/components, src/pages, src/interfaces, src/data klasörleme standardı uygulandı.',
              },
              {
                title: 'Tüm Modüllerde Eksiksiz CRUD Desteği',
                desc: '4 uygulamanın her birinde Ekle, Listeleme, Güncelleme ve Silme işlemleri modal ve formlarla hazır.',
              },
              {
                title: 'Kişisel Finans: Bütçe & Kategori Grafikleri',
                desc: 'Aylık bütçe aşım uyarısı, tasarruf hedefi ve harcama dağılım analizi.',
              },
              {
                title: 'StudyFlow: İlerleme & Pomodoro Sayacı',
                desc: 'Çalışma görevleri, son tarihler, başarı yüzdesi ve dahili odaklanma zamanlayıcısı.',
              },
              {
                title: 'Habitly: 7 Günlük Streak & Zincir',
                desc: 'Alışkanlık check-in, kesintisiz gün serisi hesaplama ve motivasyon konfetisi.',
              },
              {
                title: 'DevTrack: Kanban & Liste Görünümü',
                desc: 'Bekliyor, Devam Ediyor, Tamamlandı aşamaları, teknoloji etiketleri ve GitHub linkleri.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment & Git Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Netlify Deployment */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Globe size={18} color="#06b6d4" />
                <span>Netlify ile Yayına Alma Adımları</span>
              </h3>
            </div>

            <ol style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              <li>
                <strong>Yöntem 1 (Otomatik GitHub Bağlantısı - Tavsiye Edilen):</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Projeyi GitHub'a push ettikten sonra netlify.com'da <em>"Add new site" &gt; "Import an existing project"</em> seçeneğinden reponuzu seçin.
                </p>
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    margin: '6px 0',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#a5b4fc',
                  }}
                >
                  Build Command: npm run build<br />
                  Publish Directory: dist
                </div>
              </li>
              <li>
                <strong>Yöntem 2 (Netlify Drop / Sürükle Bırak):</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Terminalde <code>npm run build</code> komutunu çalıştırın. Oluşan <code>dist</code> klasörünü doğrudan <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)' }}>app.netlify.com/drop</a> sayfasına sürükleyip bırakın!
                </p>
              </li>
            </ol>
          </div>

          {/* GitHub Upload Steps */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <GitBranch size={18} color="#fff" />
                <span>GitHub'a Proje Yükleme Komutları</span>
              </h3>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Terminal veya PowerShell üzerinden aşağıdaki komutları sırasıyla uygulayabilirsiniz:
            </p>

            <div
              style={{
                background: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#38bdf8',
                lineHeight: '1.6',
                overflowX: 'auto',
              }}
            >
              git init<br />
              git add .<br />
              git commit -m "feat: CheckSelf 4-in-1 complete frontend project with CRUD and LocalStorage"<br />
              git branch -M main<br />
              git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git<br />
              git push -u origin main
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
