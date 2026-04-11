import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import './AlertTicker.css';

const alertKeys = [
  'alert_disease_zone_b',
  'alert_healthy_zone_a',
  'alert_warning_zone_e',
  'alert_critical_zone_c',
  'alert_scan_reminder',
  'alert_healthy_zone_f',
];

export default function AlertTicker() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % alertKeys.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="alert-ticker">
      <div className="alert-ticker-label">{t('alert_live')}</div>
      <div className="alert-ticker-content">
        <div
          className="alert-ticker-track"
          style={{ transform: `translateY(-${activeIndex * 100}%)` }}
        >
          {alertKeys.map((key, i) => (
            <div key={i} className="alert-ticker-item">
              {t(key)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
