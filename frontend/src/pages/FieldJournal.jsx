import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen, Plus, Trash2, X, Filter, Leaf, AlertTriangle,
  CheckCircle2, Clock, ChevronDown, Camera, FileText,
  Search, CloudRain, Sun, Wind, Thermometer, Tag
} from 'lucide-react';
import { getJournalEntries, addJournalEntry, deleteJournalEntry } from '../utils/api';
import './FieldJournal.css';

const CROP_OPTIONS = ['Tomato', 'Potato', 'Corn', 'Rice', 'Wheat', 'Apple', 'Other'];
const STATUS_OPTIONS = ['healthy', 'warning', 'critical', 'observation'];
const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Humid', 'Dry'];

const CROP_KEY_MAP = {
  Tomato: 'crop_tomato',
  Potato: 'crop_potato',
  Corn: 'crop_corn',
  Rice: 'crop_rice',
  Wheat: 'crop_wheat',
  Apple: 'crop_apple',
  Other: 'crop_other',
};

const WEATHER_KEY_MAP = {
  Sunny: 'weather_sunny',
  Cloudy: 'weather_cloudy',
  Rainy: 'weather_rainy',
  Windy: 'weather_windy',
  Humid: 'weather_humid',
  Dry: 'weather_dry',
};

const STATUS_META = {
  healthy:     { labelKey: 'journal_stat_healthy', icon: CheckCircle2,   color: 'var(--status-healthy)',   bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)'   },
  warning:     { labelKey: 'journal_stat_warning', icon: AlertTriangle,  color: 'var(--status-warning)',   bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.3)'  },
  critical:    { labelKey: 'journal_stat_critical', icon: AlertTriangle,  color: 'var(--status-critical)',  bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)'  },
  observation: { labelKey: 'journal_stat_observation', icon: FileText,        color: 'var(--status-info)',      bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
};

const WEATHER_ICONS = {
  Sunny: Sun, Cloudy: CloudRain, Rainy: CloudRain,
  Windy: Wind, Humid: Thermometer, Dry: Sun,
};

function formatDate(isoStr, lang) {
  const d = new Date(isoStr);
  const locale = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
  return d.toLocaleString(locale, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function FieldJournal() {
  const { t, lang } = useLanguage();
  const cropLabel = (value) => t(CROP_KEY_MAP[value] || value);
  const weatherLabel = (value) => t(WEATHER_KEY_MAP[value] || value);

  // Entries state
  const [entries, setEntries]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [deleteId, setDeleteId]       = useState(null);

  // Filter / search
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCrop, setFilterCrop]     = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [showFilters, setShowFilters]   = useState(false);

  // Form state
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({
    crop: 'Tomato',
    status: 'observation',
    note: '',
    weather: 'Sunny',
    zone: '',
    tags: '',
  });
  const noteRef = useRef(null);

  // ── Load entries ──────────────────────────────────────────────────
  const loadEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJournalEntries();
      setEntries(data.entries || []);
    } catch {
      setError(t('journal_load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, []);

  // ── Submit new entry ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.note.trim()) {
      noteRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const data = await addJournalEntry({
        ...form,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      });
      setEntries(prev => [data, ...prev]);
      setForm({ crop: 'Tomato', status: 'observation', note: '', weather: 'Sunny', zone: '', tags: '' });
      setShowForm(false);
    } catch {
      setError(t('journal_save_error'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete entry ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteJournalEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      setError(t('journal_delete_error'));
    } finally {
      setDeleteId(null);
    }
  };

  // ── Filter entries ────────────────────────────────────────────────
  const filtered = entries.filter(entry => {
    const matchStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchCrop   = filterCrop   === 'all' || entry.crop === filterCrop;
    const matchSearch = !searchQuery
      || entry.note.toLowerCase().includes(searchQuery.toLowerCase())
      || entry.crop.toLowerCase().includes(searchQuery.toLowerCase())
      || (entry.zone && entry.zone.toLowerCase().includes(searchQuery.toLowerCase()))
      || (entry.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchCrop && matchSearch;
  });

  // ── Derived stats ─────────────────────────────────────────────────
  const stats = {
    total:       entries.length,
    healthy:     entries.filter(e => e.status === 'healthy').length,
    warning:     entries.filter(e => e.status === 'warning').length,
    critical:    entries.filter(e => e.status === 'critical').length,
    observation: entries.filter(e => e.status === 'observation').length,
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="journal-page">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="journal-header animate-fade-in-up">
        <div className="journal-header-left">
          <div className="journal-header-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="heading-xl">{t('journal_title')}</h1>
            <p className="text-secondary" style={{ marginTop: 4 }}>{t('journal_subtitle')}</p>
          </div>
        </div>
        <button
          className="btn btn-primary journal-add-btn"
          onClick={() => setShowForm(v => !v)}
          id="journal-add-entry-btn"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? t('journal_cancel') : t('journal_add_entry')}
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      <div className="journal-stats animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        {[
          { key: 'total',       label: t('journal_stat_total'),       color: 'var(--accent-primary)' },
          { key: 'healthy',     label: t('journal_stat_healthy'),     color: 'var(--status-healthy)' },
          { key: 'warning',     label: t('journal_stat_warning'),     color: 'var(--status-warning)' },
          { key: 'critical',    label: t('journal_stat_critical'),    color: 'var(--status-critical)' },
          { key: 'observation', label: t('journal_stat_observation'), color: 'var(--status-info)' },
        ].map(s => (
          <div
            key={s.key}
            className={`journal-stat-chip ${filterStatus === s.key ? 'active' : ''}`}
            style={{ '--chip-color': s.color }}
            onClick={() => setFilterStatus(prev => prev === s.key ? 'all' : s.key)}
          >
            <span className="journal-stat-num">{stats[s.key]}</span>
            <span className="journal-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Entry Form ────────────────────────────────────────────── */}
      {showForm && (
        <div className="journal-form-card glass-card-static animate-fade-in-up">
          <h2 className="heading-md" style={{ marginBottom: 20 }}>{t('journal_new_entry')}</h2>
          <form onSubmit={handleSubmit} className="journal-form">
            <div className="journal-form-row">
              {/* Crop */}
              <div className="journal-field">
                <label className="journal-label">
                  <Leaf size={14} /> {t('journal_field_crop')}
                </label>
                <div className="journal-select-wrap">
                  <select
                    className="journal-select"
                    value={form.crop}
                    onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                  >
                    {CROP_OPTIONS.map(c => <option key={c} value={c}>{cropLabel(c)}</option>)}
                  </select>
                  <ChevronDown size={16} className="journal-select-arrow" />
                </div>
              </div>

              {/* Status */}
              <div className="journal-field">
                <label className="journal-label">
                  <CheckCircle2 size={14} /> {t('journal_field_status')}
                </label>
                <div className="journal-status-pills">
                  {STATUS_OPTIONS.map(s => {
                    const meta = STATUS_META[s];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`journal-status-pill ${form.status === s ? 'selected' : ''}`}
                        style={{ '--pill-color': meta.color, '--pill-bg': meta.bg, '--pill-border': meta.border }}
                        onClick={() => setForm(f => ({ ...f, status: s }))}
                      >
                        <Icon size={12} />
                        {t(meta.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="journal-form-row">
              {/* Weather */}
              <div className="journal-field">
                <label className="journal-label">
                  <Sun size={14} /> {t('journal_field_weather')}
                </label>
                <div className="journal-select-wrap">
                  <select
                    className="journal-select"
                    value={form.weather}
                    onChange={e => setForm(f => ({ ...f, weather: e.target.value }))}
                  >
                    {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{weatherLabel(w)}</option>)}
                  </select>
                  <ChevronDown size={16} className="journal-select-arrow" />
                </div>
              </div>

              {/* Zone */}
              <div className="journal-field">
                <label className="journal-label">
                  <Camera size={14} /> {t('journal_field_zone')}
                </label>
                <input
                  className="journal-input"
                  type="text"
                  placeholder={t('journal_zone_placeholder')}
                  value={form.zone}
                  onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                />
              </div>
            </div>

            {/* Note */}
            <div className="journal-field">
              <label className="journal-label">
                <FileText size={14} /> {t('journal_field_note')} *
              </label>
              <textarea
                ref={noteRef}
                className="journal-textarea"
                rows={4}
                placeholder={t('journal_note_placeholder')}
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                required
              />
            </div>

            {/* Tags */}
            <div className="journal-field">
              <label className="journal-label">
                <Tag size={14} /> {t('journal_field_tags')}
              </label>
              <input
                className="journal-input"
                type="text"
                placeholder={t('journal_tags_placeholder')}
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>

            <div className="journal-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                {t('journal_cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting} id="journal-submit-btn">
                {submitting ? (
                  <span className="journal-spinner" />
                ) : (
                  <Plus size={16} />
                )}
                {submitting ? t('journal_saving') : t('journal_save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filters / Search ──────────────────────────────────────── */}
      <div className="journal-toolbar animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <div className="journal-search-wrap">
          <Search size={16} className="journal-search-icon" />
          <input
            className="journal-search"
            type="text"
            placeholder={t('journal_search_placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="journal-search-input"
          />
          {searchQuery && (
            <button className="journal-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className={`btn btn-secondary journal-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(v => !v)}
        >
          <Filter size={16} />
          {t('journal_filter')}
          {(filterCrop !== 'all') && <span className="journal-filter-badge">1</span>}
        </button>
      </div>

      {showFilters && (
        <div className="journal-filters glass-card-static animate-fade-in">
          <div className="journal-filter-group">
            <label className="journal-label">{t('journal_filter_crop')}</label>
            <div className="journal-filter-pills">
              <button
                className={`journal-filter-pill ${filterCrop === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCrop('all')}
              >{t('journal_all_crops')}</button>
              {CROP_OPTIONS.map(c => (
                <button
                  key={c}
                  className={`journal-filter-pill ${filterCrop === c ? 'active' : ''}`}
                  onClick={() => setFilterCrop(c)}
                >
                  {cropLabel(c)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ──────────────────────────────────────────── */}
      {error && (
        <div className="journal-error animate-fade-in">
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="journal-timeline" style={{ marginTop: 24 }}>
        {loading ? (
          <div className="journal-loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="journal-skeleton" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '60%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="journal-empty">
            <BookOpen size={48} strokeWidth={1.2} />
            <h3>{entries.length === 0 ? t('journal_empty_title') : t('journal_no_results')}</h3>
            <p>{entries.length === 0 ? t('journal_empty_desc') : t('journal_no_results_desc')}</p>
            {entries.length === 0 && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> {t('journal_add_entry')}
              </button>
            )}
          </div>
        ) : (
          <div className="journal-entries stagger-children">
            {filtered.map((entry, idx) => {
              const meta = STATUS_META[entry.status] || STATUS_META.observation;
              const StatusIcon = meta.icon;
              const WeatherIcon = WEATHER_ICONS[entry.weather] || Sun;
              return (
                <div
                  key={entry.id}
                  className="journal-entry glass-card animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  id={`journal-entry-${entry.id}`}
                >
                  {/* Left timeline dot */}
                  <div className="journal-entry-dot" style={{ background: meta.color }} />

                  {/* Card body */}
                  <div className="journal-entry-body">
                    {/* Top row */}
                    <div className="journal-entry-header">
                      <div className="journal-entry-meta">
                        <span
                          className="journal-entry-status-badge"
                          style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                        >
                          <StatusIcon size={12} />
                          {t(meta.labelKey)}
                        </span>
                        <span className="journal-entry-crop">
                          <Leaf size={13} />
                          {cropLabel(entry.crop)}
                        </span>
                        {entry.zone && (
                          <span className="journal-entry-zone">
                            📍 {entry.zone}
                          </span>
                        )}
                      </div>
                      <div className="journal-entry-right">
                        <span className="journal-entry-weather">
                          <WeatherIcon size={14} />
                          {weatherLabel(entry.weather)}
                        </span>
                        <span className="journal-entry-time">
                          <Clock size={12} />
                          {formatDate(entry.timestamp, lang)}
                        </span>
                        <button
                          className="journal-delete-btn"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleteId === entry.id}
                          title={t('journal_delete_title')}
                          id={`journal-delete-${entry.id}`}
                        >
                          {deleteId === entry.id ? <span className="journal-spinner" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Note */}
                    <p className="journal-entry-note">{entry.note}</p>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="journal-entry-tags">
                        {entry.tags.map(tag => (
                          <span key={tag} className="journal-tag">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="journal-count text-secondary animate-fade-in">
          {t('journal_showing')} {filtered.length} {t('common_of')} {entries.length} {entries.length === 1 ? t('journal_entry_single') : t('journal_entry_plural')}
        </p>
      )}
    </div>
  );
}
