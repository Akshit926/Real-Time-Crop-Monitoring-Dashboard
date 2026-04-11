import { CloudSun, CloudRain, Droplets, Wind, MapPin, RefreshCw, ShieldAlert, Sprout, ThermometerSun } from 'lucide-react';
import './WeatherPanel.css';

export default function WeatherPanel({ weather, loading, error, onRefresh, t }) {
  const riskScore = Math.max(0, Math.min(100, weather?.disease_risk?.score || 0));
  const riskLevelCode = weather?.disease_risk?.level_code || 'low';
  const riskGaugeStyle = { '--risk-angle': `${riskScore * 3.6}deg` };

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
        <div className="weather-content">
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
                {weather.precipitation_probability >= 50 ? <CloudRain size={30} /> : <CloudSun size={30} />}
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
              <div className="weather-metric-card">
                <ThermometerSun size={18} />
                <span>{t('weather_rain_24h')}</span>
                <strong>{weather.rain_mm_next_24h} {t('weather_mm_unit')}</strong>
              </div>
            </div>
          </div>

          <div className="weather-insights-grid">
            <article className="weather-insight-card weather-risk-card">
              <div className="weather-insight-header">
                <div className="weather-insight-title-wrap">
                  <ShieldAlert size={18} />
                  <div>
                    <h3>{t('weather_disease_risk')}</h3>
                    <p>{t('weather_disease_window')}</p>
                  </div>
                </div>
                <span className={`weather-level-pill weather-risk-${riskLevelCode}`}>
                  {weather.disease_risk.level}
                </span>
              </div>

              <div className="weather-risk-layout">
                <div className="risk-gauge" style={riskGaugeStyle}>
                  <div className="risk-gauge-inner">
                    <span>{riskScore}</span>
                    <small>/100</small>
                  </div>
                </div>

                <div className="weather-risk-details">
                  <div className="weather-subtitle">{t('weather_likely_diseases')}</div>
                  <div className="weather-disease-chips">
                    {(weather.disease_risk.likely_diseases || []).map((disease, index) => (
                      <span key={`${disease}-${index}`} className="weather-disease-chip">
                        {disease}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="weather-insight-text">{weather.disease_risk.reason}</p>
            </article>

            <article className="weather-insight-card weather-water-card">
              <div className="weather-insight-header">
                <div className="weather-insight-title-wrap">
                  <Sprout size={18} />
                  <div>
                    <h3>{t('weather_irrigation_title')}</h3>
                    <p>{t('weather_irrigation_need')}</p>
                  </div>
                </div>
                <span className={`weather-level-pill weather-water-${weather.irrigation.level_code || 'low'}`}>
                  {weather.irrigation.level}
                </span>
              </div>

              <div className="weather-water-main">
                <div className="weather-water-amount">
                  {weather.irrigation.recommended_liters_m2}
                  <span>{t('weather_lpm2_unit')}</span>
                </div>
                <div className="weather-water-label">{t('weather_recommended_water')}</div>
                <div className={`weather-water-flag ${weather.irrigation.should_water ? 'water-yes' : 'water-no'}`}>
                  {weather.irrigation.should_water ? t('weather_water_now') : t('weather_hold_water')}
                </div>
              </div>

              <p className="weather-insight-text">{weather.irrigation.recommendation}</p>
            </article>
          </div>

          {Array.isArray(weather.forecast_next_hours) && weather.forecast_next_hours.length > 0 && (
            <div className="weather-forecast-block">
              <div className="weather-subtitle">{t('weather_forecast_title')}</div>
              <div className="weather-forecast-row">
                {weather.forecast_next_hours.map((hour, idx) => (
                  <div className="weather-forecast-card" key={`${hour.time}-${idx}`}>
                    <span className="weather-forecast-time">{hour.label}</span>
                    <strong>{hour.temperature_c}°</strong>
                    <span className="weather-forecast-rain">{hour.precipitation_probability}%</span>
                    <span className="weather-forecast-mm">{hour.rain_mm} {t('weather_mm_unit')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
