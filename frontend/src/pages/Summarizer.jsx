import { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  getScanHistory, clearScanHistory, deleteScanEntry,
} from '../utils/scanHistory';
import {
  ClipboardList, Leaf, AlertTriangle, CheckCircle2,
  FlaskConical, Droplets, Bug, Trash2, Download,
  BarChart3, TrendingUp, ShieldAlert, Sprout,
  RefreshCw, Info, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Summarizer.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getStatusColor(status) {
  if (status === 'Healthy') return 'var(--status-healthy)';
  if (status === 'Diseased') return 'var(--status-critical)';
  return 'var(--text-secondary)';
}

function getStatusBg(status) {
  if (status === 'Healthy') return 'rgba(34,197,94,0.10)';
  if (status === 'Diseased') return 'rgba(239,68,68,0.10)';
  return 'rgba(255,255,255,0.05)';
}

// ── CropGroupCard ─────────────────────────────────────────────────────────────

function CropGroupCard({ crop, scans, onDelete }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const latestScan = scans[scans.length - 1];
  const diseasedScans = scans.filter(s => s.status === 'Diseased');
  const healthyCount = scans.length - diseasedScans.length;
  const diseaseNames = [...new Set(diseasedScans.map(s => s.disease))];
  const avgConfidence = Math.round(scans.reduce((a, s) => a + s.confidence, 0) / scans.length);
  const overallStatus = diseasedScans.length > scans.length / 2 ? 'Diseased' : 'Healthy';

  return (
    <div className={`summ-crop-card glass-card ${overallStatus === 'Diseased' ? 'summ-card-diseased' : 'summ-card-healthy'}`}>
      {/* Card Header */}
      <div className="summ-crop-header" onClick={() => setExpanded(e => !e)}>
        <div className="summ-crop-icon-wrap" style={{ background: getStatusBg(overallStatus) }}>
          <Leaf size={22} color={getStatusColor(overallStatus)} />
        </div>
        <div className="summ-crop-title-area">
          <h3 className="summ-crop-name">{crop}</h3>
          <div className="summ-crop-meta">
            <span className="summ-badge" style={{ background: getStatusBg(overallStatus), color: getStatusColor(overallStatus) }}>
              {overallStatus === 'Healthy' ? t('summ_stat_healthy') : t('summ_stat_diseased')}
            </span>
            <span className="summ-meta-pill">{scans.length} {scans.length !== 1 ? t('summ_card_scans') : t('summ_card_scan')}</span>
            <span className="summ-meta-pill">{t('summ_card_avg_conf')} {avgConfidence}%</span>
          </div>
        </div>
        <button className="summ-expand-btn" aria-label="Toggle details">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Quick Summary always visible */}
      <div className="summ-quick-row">
        <div className="summ-quick-stat">
          <CheckCircle2 size={16} color="var(--status-healthy)" />
          <span>{healthyCount} {t('summ_stat_healthy')}</span>
        </div>
        <div className="summ-divider-v" />
        <div className="summ-quick-stat">
          <AlertTriangle size={16} color="var(--status-critical)" />
          <span>{diseasedScans.length} {t('summ_stat_diseased')}</span>
        </div>
        {diseaseNames.length > 0 && (
          <>
            <div className="summ-divider-v" />
            <div className="summ-quick-stat">
              <Bug size={16} color="var(--accent-primary)" />
              <span>{diseaseNames.join(', ')}</span>
            </div>
          </>
        )}
      </div>

      {/* Expandable detail section */}
      {expanded && (
        <div className="summ-detail-section animate-fade-in-up">

          {/* Disease Reason */}
          {latestScan.reason && (
            <div className="summ-detail-block">
              <div className="summ-detail-label">
                <Info size={14} /> {t('summ_why')}
              </div>
              <p className="summ-detail-text">{latestScan.reason}</p>
            </div>
          )}

          {/* Description */}
          {latestScan.description && (
            <div className="summ-detail-block">
              <div className="summ-detail-label">
                <ShieldAlert size={14} /> {t('summ_about')}
              </div>
              <p className="summ-detail-text">{latestScan.description}</p>
            </div>
          )}

          {/* Recommendations */}
          {latestScan.recommendations && Object.keys(latestScan.recommendations).length > 0 && (
            <div className="summ-rec-grid">
              {latestScan.recommendations.treatment && (
                <div className="summ-rec-card">
                  <div className="summ-rec-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                    <FlaskConical size={16} />
                  </div>
                  <div className="summ-rec-label">{t('rec_treatment')}</div>
                  <p className="summ-rec-text">{latestScan.recommendations.treatment}</p>
                </div>
              )}
              {latestScan.recommendations.environment && (
                <div className="summ-rec-card">
                  <div className="summ-rec-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                    <Droplets size={16} />
                  </div>
                  <div className="summ-rec-label">{t('rec_environment')}</div>
                  <p className="summ-rec-text">{latestScan.recommendations.environment}</p>
                </div>
              )}
              {latestScan.recommendations.field_actions && (
                <div className="summ-rec-card">
                  <div className="summ-rec-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                    <Bug size={16} />
                  </div>
                  <div className="summ-rec-label">{t('rec_actions')}</div>
                  <p className="summ-rec-text">{latestScan.recommendations.field_actions}</p>
                </div>
              )}
            </div>
          )}

          {/* How to Save the Crop */}
          <div className="summ-save-crop-block">
            <div className="summ-detail-label">
              <Sprout size={14} />
              {t('summ_how_save')}
            </div>
            <ul className="summ-save-list">
              {overallStatus === 'Diseased' ? (
                <>
                  <li>{t('summ_save_d1')}</li>
                  <li>{t('summ_save_d2')}</li>
                  <li>{t('summ_save_d3')}</li>
                  <li>{t('summ_save_d4')}</li>
                  <li>{t('summ_save_d5')}</li>
                  <li>{t('summ_save_d6')}</li>
                </>
              ) : (
                <>
                  <li>{t('summ_save_h1')}</li>
                  <li>{t('summ_save_h2')}</li>
                  <li>{t('summ_save_h3')}</li>
                  <li>{t('summ_save_h4')}</li>
                  <li>{t('summ_save_h5')}</li>
                </>
              )}
            </ul>
          </div>

          {/* Individual Scan Timeline */}
          <div className="summ-timeline">
            <div className="summ-detail-label"><BarChart3 size={14} /> {t('summ_timeline')}</div>
            <div className="summ-timeline-list">
              {[...scans].reverse().map(scan => (
                <div key={scan.id} className="summ-timeline-row">
                  <div
                    className="summ-timeline-dot"
                    style={{ background: getStatusColor(scan.status) }}
                  />
                  <div className="summ-timeline-info">
                    <span className="summ-timeline-date">{fmtDate(scan.timestamp)}</span>
                    <span
                      className="summ-timeline-status"
                      style={{ color: getStatusColor(scan.status) }}
                    >
                      {scan.status}
                    </span>
                    {scan.disease !== 'None' && (
                      <span className="summ-timeline-disease">{scan.disease}</span>
                    )}
                    <span className="summ-timeline-conf">{scan.confidence}%</span>
                  </div>
                  <button
                    className="summ-del-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(scan.id); }}
                    aria-label="Delete scan"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Analytics Mini-Chart (CSS bar chart) ─────────────────────────────────────

function AnalyticsBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="summ-bar-row">
      <span className="summ-bar-label">{label}</span>
      <div className="summ-bar-track">
        <div
          className="summ-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="summ-bar-num">{value} <span style={{ opacity: 0.5 }}>({pct}%)</span></span>
    </div>
  );
}

// ── Main Summarizer Page ──────────────────────────────────────────────────────

export default function Summarizer() {
  const { t } = useLanguage();
  const [history, setHistory] = useState(() => getScanHistory());
  const [confirmClear, setConfirmClear] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  // Refresh from localStorage
  const refresh = () => setHistory(getScanHistory());

  // Group scans by crop
  const groupedByCrop = useMemo(() => {
    const map = {};
    history.forEach(scan => {
      if (!map[scan.crop]) map[scan.crop] = [];
      map[scan.crop].push(scan);
    });
    return map;
  }, [history]);

  // Stats
  const totalScans = history.length;
  const healthyCount = history.filter(s => s.status === 'Healthy').length;
  const diseasedCount = history.filter(s => s.status === 'Diseased').length;
  const uniqueCrops = Object.keys(groupedByCrop).length;
  const uniqueDiseases = [...new Set(history.filter(s => s.disease !== 'None').map(s => s.disease))];
  const avgConfidence = totalScans > 0
    ? Math.round(history.reduce((a, s) => a + s.confidence, 0) / totalScans)
    : 0;

  // Crop disease frequency for bar chart
  const diseaseFreq = useMemo(() => {
    const freq = {};
    history.filter(s => s.disease !== 'None').forEach(s => {
      freq[s.disease] = (freq[s.disease] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [history]);

  // Overall conclusion
  const healthPct = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;
  const conclusionColor =
    healthPct >= 75 ? 'var(--status-healthy)' :
    healthPct >= 40 ? 'var(--status-warning)' :
    'var(--status-critical)';
  const conclusionLabel =
    healthPct >= 75 ? 'Good — Farm is mostly healthy' :
    healthPct >= 40 ? 'Caution — Mixed health signals detected' :
    'Alert — High disease pressure across crops';

  const handleDelete = (id) => {
    deleteScanEntry(id);
    refresh();
  };

  const handleClear = () => {
    clearScanHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0a0f1a',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const margin = 24;
      const imgW = pw - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;
      let remaining = imgH;
      const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
      pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH, undefined, 'FAST');
      remaining -= pageH;
      while (remaining > 0) {
        pdf.addPage();
        const y = margin - (imgH - remaining);
        pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH, undefined, 'FAST');
        remaining -= pageH;
      }
      pdf.save(`agrovision-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  if (totalScans === 0) {
    return (
      <div className="summ-page">
        <div className="page-header animate-fade-in-up">
          <h1 className="heading-xl">{t('summ_page_title')}</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>
            {t('summ_page_subtitle_empty')}
          </p>
        </div>
        <div className="summ-empty glass-card-static animate-fade-in-up">
          <ClipboardList size={52} strokeWidth={1.2} color="var(--text-tertiary)" />
          <h2 className="heading-md" style={{ color: 'var(--text-tertiary)', marginTop: 16 }}>
            {t('summ_empty_title')}
          </h2>
          <p className="text-secondary" style={{ textAlign: 'center', maxWidth: 400, marginTop: 8 }}>
            Go to <strong>Analyze Crop</strong> and run at least one scan.
            Every result will appear here with a full summary, analytics, and treatment plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="summ-page">
      {/* ── Header ── */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="heading-xl">{t('summ_page_title')}</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>
            <span dangerouslySetInnerHTML={{ __html: t('summ_page_subtitle').replace('{crops}', uniqueCrops).replace('{scans}', totalScans) }} />
          </p>
        </div>
        <div className="summ-header-actions">
          <button className="btn btn-secondary" onClick={refresh}>
            <RefreshCw size={16} /> {t('summ_btn_refresh')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportPDF}
            disabled={downloading}
          >
            <Download size={16} />
            {downloading ? t('summ_btn_exporting') : t('summ_btn_export')}
          </button>
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--status-critical)' }}
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 size={16} /> {t('summ_btn_clear_all')}
          </button>
        </div>
      </div>

      {/* ── Confirm Clear Dialog ── */}
      {confirmClear && (
        <div className="summ-confirm-overlay">
          <div className="summ-confirm-box glass-card">
            <AlertTriangle size={28} color="var(--status-critical)" />
            <h3 className="heading-md" style={{ marginTop: 12 }}>{t('summ_confirm_title')}</h3>
            <p className="text-secondary" style={{ textAlign: 'center', marginTop: 6 }}>
              {t('summ_confirm_desc').replace('{count}', totalScans)}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ background: 'var(--status-critical)' }} onClick={handleClear}>
                {t('summ_btn_del_all')}
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirmClear(false)}>
                {t('summ_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={reportRef}>

        {/* ── Overview Stats ── */}
        <div className="summ-stats-grid animate-fade-in-up">
          <div className="summ-stat-card glass-card">
            <div className="summ-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <BarChart3 size={22} />
            </div>
            <div className="summ-stat-value">{totalScans}</div>
            <div className="summ-stat-label">{t('summ_stat_total')}</div>
          </div>
          <div className="summ-stat-card glass-card">
            <div className="summ-stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
              <CheckCircle2 size={22} />
            </div>
            <div className="summ-stat-value" style={{ color: '#4ade80' }}>{healthyCount}</div>
            <div className="summ-stat-label">{t('summ_stat_healthy')}</div>
          </div>
          <div className="summ-stat-card glass-card">
            <div className="summ-stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="summ-stat-value" style={{ color: '#f87171' }}>{diseasedCount}</div>
            <div className="summ-stat-label">{t('summ_stat_diseased')}</div>
          </div>
          <div className="summ-stat-card glass-card">
            <div className="summ-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
              <Leaf size={22} />
            </div>
            <div className="summ-stat-value" style={{ color: '#fbbf24' }}>{uniqueCrops}</div>
            <div className="summ-stat-label">{t('summ_stat_crops')}</div>
          </div>
          <div className="summ-stat-card glass-card">
            <div className="summ-stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
              <TrendingUp size={22} />
            </div>
            <div className="summ-stat-value" style={{ color: '#60a5fa' }}>{avgConfidence}%</div>
            <div className="summ-stat-label">{t('summ_stat_conf')}</div>
          </div>
          <div className="summ-stat-card glass-card">
            <div className="summ-stat-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
              <ShieldAlert size={22} />
            </div>
            <div className="summ-stat-value" style={{ color: '#c084fc' }}>{uniqueDiseases.length}</div>
            <div className="summ-stat-label">{t('summ_stat_found')}</div>
          </div>
        </div>

        {/* ── Overall Conclusion Banner ── */}
        <div className="summ-conclusion-banner glass-card animate-fade-in-up" style={{ borderColor: conclusionColor }}>
          <div className="summ-conclusion-left">
            <div className="summ-conclusion-title">{t('summ_conc_title')}</div>
            <div className="summ-conclusion-label" style={{ color: conclusionColor }}>
              {conclusionLabel}
            </div>
            <p className="summ-conclusion-text">
              {healthPct >= 75
                ? `Your farm is in good condition with ${healthPct}% healthy scans. Maintain your current practices and stay vigilant with weekly scouting.`
                : healthPct >= 40
                ? `${healthPct}% of scans are healthy. Disease pressure is moderate. Focus on the diseased crops listed below and act quickly on the treatment recommendations.`
                : `Only ${healthPct}% of scans are healthy. Immediate action is required. Apply treatment to affected plants, isolate diseased zones, and re-scan within a week.`
              }
            </p>
          </div>
          <div className="summ-health-ring-wrap">
            <svg className="summ-health-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="33"
                fill="none"
                stroke={conclusionColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 33}`}
                strokeDashoffset={`${2 * Math.PI * 33 * (1 - healthPct / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">
                {healthPct}%
              </text>
            </svg>
            <div className="summ-ring-label">{t('summ_ring_healthy')}</div>
          </div>
        </div>

        {/* ── Two Column Layout: Crop Cards + Analytics ── */}
        <div className="summ-body-grid">

          {/* LEFT: Per-Crop Summary Cards */}
          <div className="summ-crop-list">
            <h2 className="summ-section-title">
              <Leaf size={18} /> {t('summ_sec_per_crop')}
            </h2>
            {Object.entries(groupedByCrop).map(([crop, scans]) => (
              <CropGroupCard
                key={crop}
                crop={crop}
                scans={scans}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* RIGHT: Analytics + Soil Tips */}
          <div className="summ-right-panel">

            {/* Disease Frequency */}
            <div className="summ-panel-card glass-card">
              <h3 className="summ-panel-title">
                <BarChart3 size={16} /> {t('summ_sec_freq')}
              </h3>
              {diseaseFreq.length === 0 ? (
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{t('summ_no_disease')}</p>
              ) : (
                <div className="summ-bars">
                  {diseaseFreq.map(([disease, count]) => (
                    <AnalyticsBar
                      key={disease}
                      label={disease}
                      value={count}
                      total={diseasedCount}
                      color="var(--status-critical)"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Crop Health Breakdown */}
            <div className="summ-panel-card glass-card">
              <h3 className="summ-panel-title">
                <TrendingUp size={16} /> {t('summ_sec_health_crop')}
              </h3>
              <div className="summ-bars">
                {Object.entries(groupedByCrop).map(([crop, scans]) => {
                  const healthy = scans.filter(s => s.status === 'Healthy').length;
                  return (
                    <AnalyticsBar
                      key={crop}
                      label={crop}
                      value={healthy}
                      total={scans.length}
                      color="var(--status-healthy)"
                    />
                  );
                })}
              </div>
            </div>

            {/* Soil Health Tips */}
            <div className="summ-panel-card glass-card">
              <h3 className="summ-panel-title">
                <Sprout size={16} /> {t('summ_sec_tips')}
              </h3>
              <ul className="summ-tips-list">
                <li><span dangerouslySetInnerHTML={{__html:t('summ_tip_ph')}}/></li>
                <li><span dangerouslySetInnerHTML={{__html:t('summ_tip_irrigation')}}/></li>
                <li><span dangerouslySetInnerHTML={{__html:t('summ_tip_n')}}/></li>
                <li><span dangerouslySetInnerHTML={{__html:t('summ_tip_rotate')}}/></li>
                <li><span dangerouslySetInnerHTML={{__html:t('summ_tip_carbon')}}/></li>
                <li><span dangerouslySetInnerHTML={{__html:t('summ_tip_sun')}}/></li>
              </ul>
            </div>

            {/* Unique Diseases Found */}
            {uniqueDiseases.length > 0 && (
              <div className="summ-panel-card glass-card">
                <h3 className="summ-panel-title">
                  <Bug size={16} /> {t('summ_sec_detected')}
                </h3>
                <div className="summ-disease-tags">
                  {uniqueDiseases.map(d => (
                    <span key={d} className="summ-disease-tag">{d}</span>
                  ))}
                </div>
                <p className="text-secondary" style={{ fontSize: '0.83rem', marginTop: 12 }}>
                  <span dangerouslySetInnerHTML={{ __html: t('summ_visit_lib') }} />
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
