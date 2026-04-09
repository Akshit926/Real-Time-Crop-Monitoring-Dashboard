import './DetectionCard.css';

export default function DetectionCard({ crop, disease, confidence, status, timestamp, index = 0 }) {
  const statusClass = status === 'Healthy' ? 'badge-healthy' : 'badge-critical';

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
        <span className={`badge ${statusClass}`}>{status}</span>
      </div>

      {disease && disease !== 'None' && (
        <div className="detection-card-disease">
          <span className="detection-card-disease-label">Disease:</span>
          <span className="detection-card-disease-name">{disease}</span>
        </div>
      )}

      <div className="detection-card-confidence">
        <div className="detection-card-confidence-header">
          <span>Confidence</span>
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
