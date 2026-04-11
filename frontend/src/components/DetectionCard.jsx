import { useLanguage } from '../context/LanguageContext';
import './DetectionCard.css';

export default function DetectionCard({ crop, disease, confidence, status, statusCode, timestamp, index = 0 }) {
  const { t } = useLanguage();
  const normalizedStatus = (statusCode || status || '').toString().toLowerCase();
  const isHealthy = normalizedStatus === 'healthy';
  const statusClass = isHealthy ? 'badge-healthy' : 'badge-critical';

  return (
    <div
      className="detection-card glass-card"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="detection-card-header">
        <div className="detection-card-crop">
          <span className="detection-card-emoji">
            {crop === 'Tomato' ? '🍅' : crop === 'Potato' ? '🥔' : crop === 'Corn' ? '🌽' :
             crop === 'Rice' ? '🌾' : crop === 'Wheat' ? '🌾' : crop === 'Apple' ? '🍎' : '🌿'}
          </span>
          <div>
            <div className="detection-card-crop-name">{crop}</div>
            <div className="detection-card-time">{timestamp}</div>
          </div>
        </div>
        <span className={`badge ${statusClass}`}>{isHealthy ? t('healthy') : t('diseased')}</span>
      </div>

      {disease && disease !== t('none') && disease !== 'None' && (
        <div className="detection-card-disease">
          <span className="detection-card-disease-label">{t('detection_disease_label')}</span>
          <span className="detection-card-disease-name">{disease}</span>
        </div>
      )}

      <div className="detection-card-confidence">
        <div className="detection-card-confidence-header">
          <span>{t('confidence')}</span>
          <span className="detection-card-confidence-value">{confidence}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${
              confidence >= 85 ? '' : confidence >= 60 ? 'progress-fill-warning' : 'progress-fill-critical'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
