import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import DetectionCard from '../components/DetectionCard';
import WeatherPanel from '../components/WeatherPanel';
import { getWeather } from '../utils/api';
import { ScanLine, Heart, AlertTriangle, MapPin, ArrowRight, BarChart3 } from 'lucide-react';
import './Dashboard.css';

const recentDetections = [
  { cropKey: 'crop_tomato', diseaseKey: 'disease_late_blight', confidence: 91.2, statusCode: 'diseased', timestampKey: 'time_today_1030' },
  { cropKey: 'crop_potato', diseaseKey: 'none', confidence: 95.8, statusCode: 'healthy', timestampKey: 'time_today_0915' },
  { cropKey: 'crop_corn', diseaseKey: 'disease_northern_leaf_blight', confidence: 84.5, statusCode: 'diseased', timestampKey: 'time_today_0800' },
  { cropKey: 'crop_rice', diseaseKey: 'none', confidence: 92.1, statusCode: 'healthy', timestampKey: 'time_yesterday_0445' },
  { cropKey: 'crop_wheat', diseaseKey: 'disease_powdery_mildew', confidence: 78.3, statusCode: 'diseased', timestampKey: 'time_yesterday_0230' },
];

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');

  const loadWeather = () => {
    setWeatherLoading(true);
    setWeatherError('');

    const fetchWeather = (params = {}) => {
      getWeather({ lang, location: t('weather_farm_label'), ...params })
        .then(setWeather)
        .catch(() => setWeatherError(t('weather_error')))
        .finally(() => setWeatherLoading(false));
    };

    if (!navigator.geolocation) {
      fetchWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          location: t('weather_farm_label'),
        });
      },
      () => fetchWeather(),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    loadWeather();
  }, [lang]);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="heading-xl">{t('dash_welcome')}</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>{t('dash_subtitle')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginTop: 28 }}>
        <StatsCard
          icon={ScanLine}
          label={t('stat_total_scans')}
          value={247}
          color="accent"
          trend={12}
          delay={0}
        />
        <StatsCard
          icon={Heart}
          label={t('stat_healthy_rate')}
          value={78}
          suffix="%"
          color="green"
          trend={5}
          delay={100}
        />
        <StatsCard
          icon={AlertTriangle}
          label={t('stat_active_alerts')}
          value={3}
          color="yellow"
          trend={-2}
          delay={200}
        />
        <StatsCard
          icon={MapPin}
          label={t('stat_zones_monitored')}
          value={6}
          color="blue"
          delay={300}
        />
      </div>

      <WeatherPanel
        weather={weather}
        loading={weatherLoading}
        error={weatherError}
        onRefresh={loadWeather}
        t={t}
      />

      {/* Quick Actions */}
      <div className="dashboard-actions" style={{ marginTop: 28 }}>
        <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
          <ScanLine size={18} />
          {t('scan_new')}
          <ArrowRight size={16} />
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/analytics')}>
          <BarChart3 size={18} />
          {t('view_analytics')}
        </button>
      </div>

      {/* Recent Detections */}
      <div className="dashboard-section" style={{ marginTop: 36 }}>
        <div className="dashboard-section-header">
          <h2 className="heading-lg">{t('recent_detections')}</h2>
        </div>
        <div className="cards-grid" style={{ marginTop: 16 }}>
          {recentDetections.map((item, i) => (
            <DetectionCard
              key={i}
              crop={t(item.cropKey)}
              disease={item.diseaseKey === 'none' ? t('none') : t(item.diseaseKey)}
              confidence={item.confidence}
              statusCode={item.statusCode}
              status={item.statusCode === 'healthy' ? t('healthy') : t('diseased')}
              timestamp={t(item.timestampKey)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
