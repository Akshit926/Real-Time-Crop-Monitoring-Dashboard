import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ClipboardList, Plus, Trash2, CheckCircle2, Circle,
  Clock, AlertTriangle, ChevronDown, X, Filter,
  Flame, Minus, ArrowDown, Tag, Leaf, Calendar,
  RotateCcw
} from 'lucide-react';
import { getTasks, addTask, updateTaskStatus, deleteTask } from '../utils/api';
import './TaskManager.css';

const PRIORITY_META = {
  high:   { label: 'High',   icon: Flame,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  medium: { label: 'Medium', icon: Minus,     color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)' },
  low:    { label: 'Low',    icon: ArrowDown, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
};

const STATUS_META = {
  pending:     { label: 'Pending',     color: 'var(--text-tertiary)' },
  in_progress: { label: 'In Progress', color: '#eab308' },
  done:        { label: 'Done',        color: '#22c55e' },
};

const CATEGORIES = ['Irrigation', 'Fertilization', 'Spraying', 'Harvesting', 'Scouting', 'Planting', 'Other'];
const CROPS = ['All Zones', 'Zone A — Tomato', 'Zone B — Potato', 'Zone C — Corn', 'Zone D — Rice', 'Zone E — Wheat', 'Zone F — Apple'];

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && true;
}

function formatDue(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `Due in ${diff}d`;
}

export default function TaskManager() {
  const { t } = useLanguage();

  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Irrigation',
    zone: 'All Zones',
    due_date: '',
  });

  // Load tasks
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch {
      setError(t('task_load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const data = await addTask(form);
      setTasks(prev => [data, ...prev]);
      setForm({ title: '', description: '', priority: 'medium', category: 'Irrigation', zone: 'All Zones', due_date: '' });
      setShowForm(false);
    } catch {
      setError(t('task_save_error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Cycle status: pending → in_progress → done → pending
  const cycleStatus = async (task) => {
    const next = task.status === 'pending' ? 'in_progress'
               : task.status === 'in_progress' ? 'done'
               : 'pending';
    try {
      const updated = await updateTaskStatus(task.id, next);
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    } catch {
      setError(t('task_update_error'));
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      setError(t('task_delete_error'));
    }
  };

  // Filter
  const filtered = tasks.filter(t => {
    const ms = filterStatus   === 'all' || t.status   === filterStatus;
    const mp = filterPriority === 'all' || t.priority === filterPriority;
    const mc = filterCategory === 'all' || t.category === filterCategory;
    return ms && mp && mc;
  });

  // Stats
  const stats = {
    total:       tasks.length,
    pending:     tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
    overdue:     tasks.filter(t => t.status !== 'done' && isOverdue(t.due_date)).length,
  };

  return (
    <div className="tasks-page">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="tasks-header animate-fade-in-up">
        <div className="tasks-header-left">
          <div className="tasks-header-icon">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="heading-xl">{t('task_title')}</h1>
            <p className="text-secondary" style={{ marginTop: 4 }}>{t('task_subtitle')}</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(v => !v)}
          id="task-add-btn"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? t('task_cancel') : t('task_add')}
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="tasks-stats animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { key: 'total',       label: t('task_stat_total'),       color: 'var(--accent-primary)' },
          { key: 'pending',     label: t('task_stat_pending'),     color: 'var(--text-tertiary)' },
          { key: 'in_progress', label: t('task_stat_progress'),    color: '#eab308' },
          { key: 'done',        label: t('task_stat_done'),        color: '#22c55e' },
          { key: 'overdue',     label: t('task_stat_overdue'),     color: '#ef4444' },
        ].map(s => (
          <div
            key={s.key}
            className={`tasks-stat-chip ${filterStatus === s.key ? 'active' : ''}`}
            style={{ '--chip-color': s.color }}
            onClick={() => setFilterStatus(prev => prev === s.key ? 'all' : s.key)}
          >
            <span className="task-stat-num">{stats[s.key]}</span>
            <span className="task-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Add Task Form ─────────────────────────────────────── */}
      {showForm && (
        <div className="tasks-form-card glass-card-static animate-fade-in-up">
          <h2 className="heading-md" style={{ marginBottom: 20 }}>{t('task_new')}</h2>
          <form onSubmit={handleSubmit} className="tasks-form">
            {/* Title */}
            <div className="task-field">
              <label className="task-label">{t('task_field_title')} *</label>
              <input
                className="task-input"
                type="text"
                placeholder={t('task_title_placeholder')}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                id="task-title-input"
              />
            </div>

            <div className="tasks-form-row">
              {/* Priority */}
              <div className="task-field">
                <label className="task-label"><Flame size={13} /> {t('task_field_priority')}</label>
                <div className="task-priority-pills">
                  {Object.entries(PRIORITY_META).map(([key, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`task-priority-pill ${form.priority === key ? 'selected' : ''}`}
                        style={{ '--pill-color': meta.color, '--pill-bg': meta.bg, '--pill-border': meta.border }}
                        onClick={() => setForm(f => ({ ...f, priority: key }))}
                      >
                        <Icon size={12} /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="task-field">
                <label className="task-label"><Tag size={13} /> {t('task_field_category')}</label>
                <div className="task-select-wrap">
                  <select
                    className="task-select"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={15} className="task-select-arrow" />
                </div>
              </div>
            </div>

            <div className="tasks-form-row">
              {/* Zone */}
              <div className="task-field">
                <label className="task-label"><Leaf size={13} /> {t('task_field_zone')}</label>
                <div className="task-select-wrap">
                  <select
                    className="task-select"
                    value={form.zone}
                    onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                  >
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={15} className="task-select-arrow" />
                </div>
              </div>

              {/* Due Date */}
              <div className="task-field">
                <label className="task-label"><Calendar size={13} /> {t('task_field_due')}</label>
                <input
                  className="task-input"
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Description */}
            <div className="task-field">
              <label className="task-label">{t('task_field_desc')}</label>
              <textarea
                className="task-textarea"
                rows={3}
                placeholder={t('task_desc_placeholder')}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="tasks-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                {t('task_cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting} id="task-submit-btn">
                {submitting ? <span className="task-spinner" /> : <Plus size={16} />}
                {submitting ? t('task_saving') : t('task_save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="tasks-filter-bar animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="tasks-filter-group">
          <span className="tasks-filter-label"><Filter size={13} /> {t('task_filter_priority')}</span>
          <div className="tasks-filter-pills">
            <button className={`tasks-fp ${filterPriority === 'all' ? 'active' : ''}`} onClick={() => setFilterPriority('all')}>All</button>
            {Object.entries(PRIORITY_META).map(([key, meta]) => (
              <button
                key={key}
                className={`tasks-fp ${filterPriority === key ? 'active' : ''}`}
                style={filterPriority === key ? { color: meta.color, borderColor: meta.border, background: meta.bg } : {}}
                onClick={() => setFilterPriority(prev => prev === key ? 'all' : key)}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
                {meta.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tasks-filter-group">
          <span className="tasks-filter-label"><Tag size={13} /> {t('task_filter_category')}</span>
          <div className="tasks-filter-pills">
            <button className={`tasks-fp ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>All</button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`tasks-fp ${filterCategory === c ? 'active' : ''}`}
                onClick={() => setFilterCategory(prev => prev === c ? 'all' : c)}
              >{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div className="tasks-error animate-fade-in">
          <AlertTriangle size={15} /> {error}
          <button onClick={() => setError('')}><X size={13} /></button>
        </div>
      )}

      {/* ── Task List ────────────────────────────────────────── */}
      <div className="tasks-list">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="task-skeleton">
              <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 13, width: '30%' }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="tasks-empty">
            <ClipboardList size={52} strokeWidth={1.2} />
            <h3>{tasks.length === 0 ? t('task_empty_title') : t('task_no_results')}</h3>
            <p>{tasks.length === 0 ? t('task_empty_desc') : t('task_no_results_desc')}</p>
            {tasks.length === 0 && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> {t('task_add')}
              </button>
            )}
          </div>
        ) : (
          <div className="stagger-children">
            {filtered.map((task, idx) => {
              const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
              const sMeta = STATUS_META[task.status] || STATUS_META.pending;
              const PIcon = pMeta.icon;
              const overdue = task.status !== 'done' && isOverdue(task.due_date);
              const dueLabel = formatDue(task.due_date);

              return (
                <div
                  key={task.id}
                  className={`task-card glass-card animate-fade-in-up ${task.status === 'done' ? 'task-done' : ''}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  id={`task-card-${task.id}`}
                >
                  {/* Status toggle */}
                  <button
                    className="task-status-btn"
                    onClick={() => cycleStatus(task)}
                    title={`Status: ${sMeta.label} — click to advance`}
                    id={`task-status-${task.id}`}
                    style={{ color: sMeta.color }}
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 size={24} />
                    ) : task.status === 'in_progress' ? (
                      <RotateCcw size={22} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="task-content">
                    <div className="task-title-row">
                      <span className="task-title">{task.title}</span>
                      <div className="task-badges">
                        <span
                          className="task-priority-badge"
                          style={{ color: pMeta.color, background: pMeta.bg, border: `1px solid ${pMeta.border}` }}
                        >
                          <PIcon size={10} /> {pMeta.label}
                        </span>
                        <span className="task-category-badge">{task.category}</span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}

                    <div className="task-meta-row">
                      {task.zone && task.zone !== 'All Zones' && (
                        <span className="task-meta-chip">
                          <Leaf size={11} /> {task.zone}
                        </span>
                      )}
                      {dueLabel && (
                        <span className={`task-meta-chip ${overdue ? 'overdue' : ''}`}>
                          <Clock size={11} /> {dueLabel}
                        </span>
                      )}
                      <span className="task-status-label" style={{ color: sMeta.color }}>
                        ● {sMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    className="task-delete-btn"
                    onClick={() => handleDelete(task.id)}
                    id={`task-delete-${task.id}`}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="tasks-count text-secondary">
          {filtered.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </p>
      )}
    </div>
  );
}
