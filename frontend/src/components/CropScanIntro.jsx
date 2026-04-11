import { Leaf, ScanSearch } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './CropScanIntro.css';

export default function CropScanIntro() {
  const { t } = useLanguage();

  return (
    <div className="crop-intro-overlay" role="status" aria-live="polite">
      <div className="crop-intro-shell">
        <div className="crop-intro-badge">
          <ScanSearch size={14} />
          <span>AgroVision</span>
        </div>

        <div className="crop-intro-frame">
          <div className="crop-intro-grid" />
          <Leaf size={66} className="crop-intro-leaf" />
          <span className="crop-intro-corner crop-intro-corner-tl" />
          <span className="crop-intro-corner crop-intro-corner-tr" />
          <span className="crop-intro-corner crop-intro-corner-bl" />
          <span className="crop-intro-corner crop-intro-corner-br" />
          <div className="crop-intro-scan-line" />
        </div>

        <div className="crop-intro-title">{t('startup_scan_title')}</div>
        <div className="crop-intro-subtitle">{t('startup_scan_subtitle')}</div>
      </div>
    </div>
  );
}
