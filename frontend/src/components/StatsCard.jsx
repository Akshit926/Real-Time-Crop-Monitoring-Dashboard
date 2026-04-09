import { useEffect, useState, useRef } from 'react';
import './StatsCard.css';

export default function StatsCard({ icon: Icon, label, value, suffix = '', trend, color = 'accent', delay = 0 }) {
  const [displayVal, setDisplayVal] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      setDisplayVal(value);
      return;
    }
    const duration = 1200;
    const steps = 40;
    const increment = numVal / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= numVal) {
        setDisplayVal(numVal);
        clearInterval(interval);
      } else {
        setDisplayVal(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value, visible]);

  const colorMap = {
    accent: 'var(--accent-primary)',
    green: 'var(--status-healthy)',
    yellow: 'var(--status-warning)',
    red: 'var(--status-critical)',
    blue: 'var(--status-info)',
  };

  return (
    <div
      ref={ref}
      className={`stats-card glass-card ${visible ? 'stats-card-visible' : ''}`}
      style={{ '--card-color': colorMap[color] || colorMap.accent }}
    >
      <div className="stats-card-icon">
        <Icon size={22} />
      </div>
      <div className="stats-card-content">
        <span className="stats-card-value">
          {typeof displayVal === 'number' ? displayVal : value}
          {suffix}
        </span>
        <span className="stats-card-label">{label}</span>
      </div>
      {trend && (
        <div className={`stats-card-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
