import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getFarmZones } from '../utils/api';
import './FarmMap.css';

const fallbackZones = [
  { id: 'A', name: 'Zone A — North Field', crop: 'Tomato', status: 'healthy', health_percent: 94, last_scan: '2026-04-09 10:30 AM', area_acres: 2.5, color: '#22c55e' },
  { id: 'B', name: 'Zone B — East Field', crop: 'Potato', status: 'warning', health_percent: 71, last_scan: '2026-04-09 09:15 AM', area_acres: 3.0, color: '#eab308' },
  { id: 'C', name: 'Zone C — South Field', crop: 'Corn', status: 'critical', health_percent: 42, last_scan: '2026-04-09 08:00 AM', area_acres: 4.0, color: '#ef4444' },
  { id: 'D', name: 'Zone D — West Field', crop: 'Rice', status: 'healthy', health_percent: 88, last_scan: '2026-04-08 04:45 PM', area_acres: 5.0, color: '#22c55e' },
  { id: 'E', name: 'Zone E — Central Plot', crop: 'Wheat', status: 'warning', health_percent: 65, last_scan: '2026-04-08 02:30 PM', area_acres: 1.5, color: '#eab308' },
  { id: 'F', name: 'Zone F — Orchard', crop: 'Apple', status: 'healthy', health_percent: 91, last_scan: '2026-04-09 11:00 AM', area_acres: 2.0, color: '#22c55e' },
];

const CROP_KEY_BY_NAME = {
  Tomato: 'crop_tomato',
  Potato: 'crop_potato',
  Corn: 'crop_corn',
  Rice: 'crop_rice',
  Wheat: 'crop_wheat',
  Apple: 'crop_apple',
};

const ZONE_NAME_KEY_BY_ID = {
  A: 'zone_name_a',
  B: 'zone_name_b',
  C: 'zone_name_c',
  D: 'zone_name_d',
  E: 'zone_name_e',
  F: 'zone_name_f',
};

const CROP_EMOJI = {
  Tomato: '🍅',
  Potato: '🥔',
  Corn: '🌽',
  Rice: '🌾',
  Wheat: '🌾',
  Apple: '🍎',
};

export default function FarmMap() {
  const { t } = useLanguage();
  const [zones, setZones] = useState(fallbackZones);
  const [selected, setSelected] = useState(null);

  const zoneAt = (index) => zones[index] || fallbackZones[index];
  const cropLabel = (crop) => t(CROP_KEY_BY_NAME[crop] || crop);
  const zoneNameLabel = (zone) => t(ZONE_NAME_KEY_BY_ID[zone?.id] || zone?.name || '');
  const cropEmoji = (crop) => CROP_EMOJI[crop] || '🌿';

  useEffect(() => {
    getFarmZones()
      .then(data => setZones(data.zones || fallbackZones))
      .catch(() => setZones(fallbackZones));
  }, []);

  const statusLabel = (s) => {
    if (s === 'healthy') return t('zone_status_healthy');
    if (s === 'warning') return t('zone_status_warning');
    return t('zone_status_critical');
  };

  const statusBadge = (s) => {
    if (s === 'healthy') return 'badge-healthy';
    if (s === 'warning') return 'badge-warning';
    return 'badge-critical';
  };

  return (
    <div className="farm-map-page">
      <div className="page-header animate-fade-in-up">
        <h1 className="heading-xl">{t('map_title')}</h1>
        <p className="text-secondary" style={{ marginTop: 4 }}>{t('map_subtitle')}</p>
      </div>

      <div className="farm-map-layout">
        {/* SVG Map */}
        <div className="farm-map-container glass-card-static animate-fade-in-up">
          <svg viewBox="0 0 600 400" className="farm-map-svg">
            {/* Background */}
            <rect x="0" y="0" width="600" height="400" fill="var(--bg-tertiary)" rx="12" />

            {/* Grid lines */}
            {[100, 200, 300, 400, 500].map(x => (
              <line key={`vl-${x}`} x1={x} y1="0" x2={x} y2="400" stroke="var(--border-subtle)" strokeDasharray="4 4" />
            ))}
            {[100, 200, 300].map(y => (
              <line key={`hl-${y}`} x1="0" y1={y} x2="600" y2={y} stroke="var(--border-subtle)" strokeDasharray="4 4" />
            ))}

            {/* Zone A — top-left */}
            <g onClick={() => setSelected(zoneAt(0))} className="farm-zone-group" style={{ cursor: 'pointer' }}>
              {(() => {
                const zone = zoneAt(0);
                return (
                  <>
              <rect x="20" y="20" width="180" height="160" rx="10"
                fill={zone?.color + '22'} stroke={zone?.color} strokeWidth="2"
                className={selected?.id === 'A' ? 'zone-selected' : ''}
              />
              <text x="110" y="90" textAnchor="middle" fill={zone?.color} fontSize="24" fontWeight="700">A</text>
              <text x="110" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">{`${cropEmoji(zone?.crop)} ${cropLabel(zone?.crop)}`}</text>
              <text x="110" y="135" textAnchor="middle" fill={zone?.color} fontSize="12" fontWeight="600">{zone?.health_percent}%</text>
                  </>
                );
              })()}
            </g>

            {/* Zone B — top-center */}
            <g onClick={() => setSelected(zoneAt(1))} className="farm-zone-group" style={{ cursor: 'pointer' }}>
              {(() => {
                const zone = zoneAt(1);
                return (
                  <>
              <rect x="210" y="20" width="180" height="160" rx="10"
                fill={zone?.color + '22'} stroke={zone?.color} strokeWidth="2"
                className={selected?.id === 'B' ? 'zone-selected' : ''}
              />
              <text x="300" y="90" textAnchor="middle" fill={zone?.color} fontSize="24" fontWeight="700">B</text>
              <text x="300" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">{`${cropEmoji(zone?.crop)} ${cropLabel(zone?.crop)}`}</text>
              <text x="300" y="135" textAnchor="middle" fill={zone?.color} fontSize="12" fontWeight="600">{zone?.health_percent}%</text>
                  </>
                );
              })()}
            </g>

            {/* Zone C — top-right */}
            <g onClick={() => setSelected(zoneAt(2))} className="farm-zone-group" style={{ cursor: 'pointer' }}>
              {(() => {
                const zone = zoneAt(2);
                return (
                  <>
              <rect x="400" y="20" width="180" height="160" rx="10"
                fill={zone?.color + '22'} stroke={zone?.color} strokeWidth="2"
                className={selected?.id === 'C' ? 'zone-selected' : ''}
              />
              <text x="490" y="90" textAnchor="middle" fill={zone?.color} fontSize="24" fontWeight="700">C</text>
              <text x="490" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">{`${cropEmoji(zone?.crop)} ${cropLabel(zone?.crop)}`}</text>
              <text x="490" y="135" textAnchor="middle" fill={zone?.color} fontSize="12" fontWeight="600">{zone?.health_percent}%</text>
                  </>
                );
              })()}
            </g>

            {/* Zone D — bottom-left */}
            <g onClick={() => setSelected(zoneAt(3))} className="farm-zone-group" style={{ cursor: 'pointer' }}>
              {(() => {
                const zone = zoneAt(3);
                return (
                  <>
              <rect x="20" y="200" width="180" height="180" rx="10"
                fill={zone?.color + '22'} stroke={zone?.color} strokeWidth="2"
                className={selected?.id === 'D' ? 'zone-selected' : ''}
              />
              <text x="110" y="280" textAnchor="middle" fill={zone?.color} fontSize="24" fontWeight="700">D</text>
              <text x="110" y="305" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">{`${cropEmoji(zone?.crop)} ${cropLabel(zone?.crop)}`}</text>
              <text x="110" y="325" textAnchor="middle" fill={zone?.color} fontSize="12" fontWeight="600">{zone?.health_percent}%</text>
                  </>
                );
              })()}
            </g>

            {/* Zone E — bottom-center */}
            <g onClick={() => setSelected(zoneAt(4))} className="farm-zone-group" style={{ cursor: 'pointer' }}>
              {(() => {
                const zone = zoneAt(4);
                return (
                  <>
              <rect x="210" y="200" width="180" height="180" rx="10"
                fill={zone?.color + '22'} stroke={zone?.color} strokeWidth="2"
                className={selected?.id === 'E' ? 'zone-selected' : ''}
              />
              <text x="300" y="280" textAnchor="middle" fill={zone?.color} fontSize="24" fontWeight="700">E</text>
              <text x="300" y="305" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">{`${cropEmoji(zone?.crop)} ${cropLabel(zone?.crop)}`}</text>
              <text x="300" y="325" textAnchor="middle" fill={zone?.color} fontSize="12" fontWeight="600">{zone?.health_percent}%</text>
                  </>
                );
              })()}
            </g>

            {/* Zone F — bottom-right */}
            <g onClick={() => setSelected(zoneAt(5))} className="farm-zone-group" style={{ cursor: 'pointer' }}>
              {(() => {
                const zone = zoneAt(5);
                return (
                  <>
              <rect x="400" y="200" width="180" height="180" rx="10"
                fill={zone?.color + '22'} stroke={zone?.color} strokeWidth="2"
                className={selected?.id === 'F' ? 'zone-selected' : ''}
              />
              <text x="490" y="280" textAnchor="middle" fill={zone?.color} fontSize="24" fontWeight="700">F</text>
              <text x="490" y="305" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">{`${cropEmoji(zone?.crop)} ${cropLabel(zone?.crop)}`}</text>
              <text x="490" y="325" textAnchor="middle" fill={zone?.color} fontSize="12" fontWeight="600">{zone?.health_percent}%</text>
                  </>
                );
              })()}
            </g>
          </svg>

          {/* Legend */}
          <div className="farm-map-legend">
            <span className="heading-md" style={{ marginRight: 16 }}>{t('legend')}:</span>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} />{t('zone_status_healthy')}</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }} />{t('zone_status_warning')}</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />{t('zone_status_critical')}</div>
          </div>
        </div>

        {/* Zone Details Panel */}
        <div className="farm-zone-details">
          {selected ? (
            <div className="zone-detail-card glass-card animate-fade-in-up">
              <div className="zone-detail-header">
                <h3 className="heading-lg">{zoneNameLabel(selected)}</h3>
                <span className={`badge ${statusBadge(selected.status)}`}>{statusLabel(selected.status)}</span>
              </div>
              <div className="zone-detail-grid">
                <div className="zone-detail-item">
                  <span className="zone-detail-label">{t('zone_crop')}</span>
                  <span className="zone-detail-value">{cropLabel(selected.crop)}</span>
                </div>
                <div className="zone-detail-item">
                  <span className="zone-detail-label">{t('zone_health')}</span>
                  <span className="zone-detail-value">{selected.health_percent}%</span>
                </div>
                <div className="zone-detail-item">
                  <span className="zone-detail-label">{t('zone_area')}</span>
                  <span className="zone-detail-value">{selected.area_acres} {t('acres')}</span>
                </div>
                <div className="zone-detail-item">
                  <span className="zone-detail-label">{t('zone_last_scan')}</span>
                  <span className="zone-detail-value">{selected.last_scan}</span>
                </div>
              </div>
              <div className="zone-health-bar" style={{ marginTop: 16 }}>
                <div className="progress-bar" style={{ height: 10 }}>
                  <div
                    className={`progress-fill ${selected.health_percent < 50 ? 'progress-fill-critical' : selected.health_percent < 75 ? 'progress-fill-warning' : ''}`}
                    style={{ width: `${selected.health_percent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="zone-detail-placeholder glass-card-static">
              <p className="text-secondary">{t('map_click_zone_prompt')}</p>
            </div>
          )}

          {/* All Zones List */}
          <div className="zone-list" style={{ marginTop: 16 }}>
            {zones.map(z => (
              <div
                key={z.id}
                className={`zone-list-item glass-card ${selected?.id === z.id ? 'zone-list-active' : ''}`}
                onClick={() => setSelected(z)}
              >
                <div className="zone-list-color" style={{ background: z.color }} />
                <div className="zone-list-info">
                  <span className="zone-list-name">{zoneNameLabel(z)}</span>
                  <span className="zone-list-crop">{cropLabel(z.crop)} · {z.health_percent}%</span>
                </div>
                <span className={`badge ${statusBadge(z.status)}`}>{statusLabel(z.status)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
