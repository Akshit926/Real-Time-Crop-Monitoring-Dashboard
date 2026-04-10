import { CloudSun, CloudRain, Droplets, Wind, MapPin, RefreshCw } from 'lucide-react';
import './WeatherPanel.css';

export default function WeatherPanel({ weather, loading, error, onRefresh, t }) {
  return (
    <section className="weather-panel glass-card-static animate-fade-in-up">
      <div className="weather-panel-header">
        <div>
          <div className="weather-panel-kicker">{t('weather_kicker')}</div>
          <h2 className="heading-lg">{t('weather_title')}</h2>
        </div>
        <button className="weather-refresh-btn" onClick={onRefresh} disabled={loading} type="button">
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          {t('weather_refresh')}
        </button>
      </div>

      {loading && (
        <div className="weather-loading">
          <div className="loading-spinner" />
          <p className="text-secondary">{t('weather_loading')}</p>
        </div>
      )}

      {!loading && weather && (
        <div className="weather-grid">
          <div className="weather-hero">
            <div className="weather-hero-top">
              <div className="weather-location">
                <MapPin size={16} />
                <span>{weather.location}</span>
              </div>
              <span className={`weather-source-badge weather-source-${weather.source}`}>
                {weather.source === 'open-meteo' ? t('weather_live') : t('weather_estimated')}
              </span>
            </div>

            <div className="weather-temp-row">
              {weather.precipitation_probability >= 50 ? <CloudRain size={28} /> : <CloudSun size={28} />}
              <div>
                <div className="weather-temp">{weather.temperature_c}°C</div>
                <div className="weather-condition">{weather.condition}</div>
              </div>
            </div>

            <p className="weather-advice">{weather.advice}</p>
          </div>

          <div className="weather-metrics">
            <div className="weather-metric-card">
              <Droplets size={18} />
              <span>{t('weather_humidity')}</span>
              <strong>{weather.humidity}%</strong>
            </div>
            <div className="weather-metric-card">
              <Wind size={18} />
              <span>{t('weather_wind')}</span>
              <strong>{weather.wind_kph} km/h</strong>
            </div>
            <div className="weather-metric-card">
              <CloudRain size={18} />
              <span>{t('weather_rain')}</span>
              <strong>{weather.precipitation_probability}%</strong>
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="weather-error">
          <p>{error}</p>
        </div>
      )}
    </section>
  );
}
