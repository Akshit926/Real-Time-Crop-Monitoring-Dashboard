import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookMarked, Search, X, ChevronDown, ChevronUp,
  AlertTriangle, Shield, Droplets, Wind, Thermometer,
  Leaf, FlaskConical, Eye, Bug, Zap
} from 'lucide-react';
import './DiseaseLibrary.css';

/* ─── Disease Database ──────────────────────────────────────────── */
const DISEASES = [
  {
    id: 1,
    name: 'Late Blight',
    pathogen: 'Phytophthora infestans',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Tomato', 'Potato'],
    emoji: '🍅',
    icon: Bug,
    description: 'A devastating water mold disease that can destroy an entire crop within days. Thrives in cool, wet conditions and spreads rapidly through rain splash.',
    symptoms: [
      'Dark brown water-soaked lesions on leaves',
      'White fuzzy mold on leaf undersides',
      'Rapid browning and death of foliage',
      'Brown rot of fruits and tubers',
    ],
    causes: ['High humidity (>90%)', 'Temperatures 10-25°C', 'Extended leaf wetness', 'Poor air circulation'],
    treatment: [
      'Apply copper-based or mancozeb fungicides immediately',
      'Remove and destroy infected plant material',
      'Improve air circulation and spacing',
      'Avoid overhead irrigation',
    ],
    prevention: ['Use resistant varieties', 'Crop rotation (3-4 years)', 'Avoid dense planting', 'Apply preventive fungicide sprays'],
    spreadRate: 'Very High',
    color: '#ef4444',
  },
  {
    id: 2,
    name: 'Early Blight',
    pathogen: 'Alternaria solani',
    type: 'Fungal',
    severity: 'warning',
    crops: ['Tomato', 'Potato'],
    emoji: '🥔',
    icon: Leaf,
    description: 'A common fungal disease causing distinctive target-like spots on leaves and stems. Primarily affects older leaves first before spreading upward.',
    symptoms: [
      'Circular dark spots with concentric rings (target pattern)',
      'Yellow halos surrounding the lesions',
      'Lower/older leaves affected first',
      'Premature leaf drop',
    ],
    causes: ['Warm temperatures 24-29°C', 'Alternating wet/dry cycles', 'Plant stress (drought, nutrient deficiency)', 'Dense canopy'],
    treatment: [
      'Apply chlorothalonil or azoxystrobin fungicide',
      'Remove infected lower leaves',
      'Maintain optimal plant nutrition',
      'Stake plants to improve airflow',
    ],
    prevention: ['Mulch soil to reduce splash', 'Balanced fertilization', 'Water at base of plant', 'Destroy crop debris'],
    spreadRate: 'Moderate',
    color: '#f97316',
  },
  {
    id: 3,
    name: 'Northern Leaf Blight',
    pathogen: 'Exserohilum turcicum',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Corn'],
    emoji: '🌽',
    icon: Wind,
    description: 'One of the most damaging foliar diseases of corn, capable of causing 50-70% yield loss in severe cases. Long, cigar-shaped lesions are its hallmark.',
    symptoms: [
      'Long tan/gray elliptical lesions on leaves',
      'Lesions 3-15 cm long with irregular edges',
      'Greenish-gray spore masses on lesions',
      'Premature death of leaves in epidemics',
    ],
    causes: ['Cool temperatures 18-25°C', 'High humidity', 'Prolonged leaf wetness', 'Susceptible hybrids'],
    treatment: [
      'Foliar fungicide (strobilurin + triazole) at VT stage',
      'Scout fields regularly post-silking',
      'Apply fungicide before disease reaches upper leaves',
    ],
    prevention: ['Plant resistant hybrids', 'Crop rotation', 'Till residue to accelerate decomposition', 'Optimize plant density'],
    spreadRate: 'High',
    color: '#ef4444',
  },
  {
    id: 4,
    name: 'Powdery Mildew',
    pathogen: 'Erysiphe cichoracearum',
    type: 'Fungal',
    severity: 'warning',
    crops: ['Wheat', 'Apple', 'Tomato'],
    emoji: '🌾',
    icon: FlaskConical,
    description: 'A widespread fungal disease creating a distinctive white powdery coating on plant surfaces. Unlike most fungi, it thrives in dry conditions with low humidity.',
    symptoms: [
      'White powdery coating on leaves and stems',
      'Yellowing of affected tissue',
      'Stunted growth and distorted shoots',
      'Premature leaf drop in severe cases',
    ],
    causes: ['Dry conditions with low humidity', 'Temperatures 20-25°C', 'Dense crop canopy', 'High nitrogen fertilization'],
    treatment: [
      'Apply sulfur-based fungicide or potassium bicarbonate',
      'Use systemic fungicides (triazoles) for severe infections',
      'Neem oil as organic alternative',
    ],
    prevention: ['Resistant varieties', 'Proper spacing for air circulation', 'Avoid excessive nitrogen', 'Remove plant debris'],
    spreadRate: 'High',
    color: '#eab308',
  },
  {
    id: 5,
    name: 'Rice Blast',
    pathogen: 'Magnaporthe oryzae',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Rice'],
    emoji: '🌾',
    icon: Zap,
    description: 'The most destructive rice disease worldwide, capable of wiping out an entire crop. Also known as neck blast when it infects the panicle neck.',
    symptoms: [
      'Diamond/spindle-shaped gray lesions on leaves',
      'Brown borders with gray centers on spots',
      'Neck rot causing panicle to fall over ("neck blast")',
      'White or empty grains',
    ],
    causes: ['Temperatures 25-28°C', 'High humidity', 'Excess nitrogen application', 'Susceptible varieties'],
    treatment: [
      'Apply tricyclazole or isoprothiolane fungicide',
      'Drain field and leave dry for 3-5 days',
      'Avoid applying nitrogen during epidemic',
    ],
    prevention: ['Resistant varieties (top priority)', 'Balanced fertilization', 'Optimal plant spacing', 'Raise water level to suppress spores'],
    spreadRate: 'Very High',
    color: '#ef4444',
  },
  {
    id: 6,
    name: 'Leaf Spot',
    pathogen: 'Cercospora spp.',
    type: 'Fungal',
    severity: 'observation',
    crops: ['Tomato', 'Rice', 'Corn'],
    emoji: '🍃',
    icon: Eye,
    description: 'A group of fungal diseases causing characteristic spots on leaves. Generally not immediately life-threatening but can reduce yield through defoliation.',
    symptoms: [
      'Small, circular to angular spots on leaves',
      'Tan/gray centers with dark brown borders',
      'Spots may merge to form large blighted areas',
      'Premature yellowing and leaf drop',
    ],
    causes: ['Warm humid conditions', 'Extended leaf wetness', 'Infected seed or crop debris', 'Overcrowded planting'],
    treatment: [
      'Remove and destroy infected leaves',
      'Apply appropriate fungicide (copper, mancozeb)',
      'Improve plant spacing and air circulation',
    ],
    prevention: ['Use certified disease-free seed', 'Crop rotation', 'Avoid wetting foliage when irrigating', 'Maintain field hygiene'],
    spreadRate: 'Moderate',
    color: '#3b82f6',
  },
  {
    id: 7,
    name: 'Apple Scab',
    pathogen: 'Venturia inaequalis',
    type: 'Fungal',
    severity: 'warning',
    crops: ['Apple'],
    emoji: '🍎',
    icon: Shield,
    description: 'The most economically important apple disease globally. Primary infection occurs in spring during wet periods. Infected fruit becomes unmarketable.',
    symptoms: [
      'Olive-green to brown velvety spots on leaves',
      'Scabby, dark lesions on fruit surface',
      'Premature leaf and fruit drop',
      'Infected fruit may crack and become misshapen',
    ],
    causes: ['Wet spring weather', 'Temperatures 13-24°C during bud break', 'Primary inoculum from infected leaves', 'Susceptible varieties'],
    treatment: [
      'Apply fungicide during critical infection periods',
      'Use protective + systemic fungicide program',
      'Thin fruit to reduce disease severity',
    ],
    prevention: ['Plant resistant varieties', 'Rake and destroy fallen leaves', 'Prune canopy for air circulation', 'Dormant copper sprays'],
    spreadRate: 'Moderate',
    color: '#eab308',
  },
  {
    id: 8,
    name: 'Aphid Infestation',
    pathogen: 'Aphididae family',
    type: 'Pest',
    severity: 'warning',
    crops: ['Tomato', 'Potato', 'Wheat', 'Apple'],
    emoji: '🐛',
    icon: Bug,
    description: 'Tiny soft-bodied insects that pierce plant stems and leaves to suck sap. They multiply rapidly and also transmit viral diseases between plants.',
    symptoms: [
      'Curled or yellowed leaves',
      'Sticky honeydew residue on leaves',
      'Black sooty mold growing on honeydew',
      'Stunted or distorted new growth',
    ],
    causes: ['Warm temperatures', 'High nitrogen fertilization', 'Monoculture farming', 'Absence of natural predators'],
    treatment: [
      'Spray with neem oil or insecticidal soap',
      'Apply pyrethrin-based insecticide',
      'Introduce natural predators (ladybugs, lacewings)',
      'Strong water jet to dislodge colonies',
    ],
    prevention: ['Attract beneficial insects', 'Reflective mulches to deter aphids', 'Monitor weekly for early detection', 'Avoid excessive nitrogen use'],
    spreadRate: 'Very High',
    color: '#eab308',
  },
  {
    id: 9,
    name: 'Septoria Leaf Spot',
    pathogen: 'Septoria lycopersici',
    type: 'Fungal',
    severity: 'observation',
    crops: ['Tomato'],
    emoji: '🍅',
    icon: Droplets,
    description: 'One of the most common tomato diseases. Appears after the first fruits set and can cause significant defoliation if not managed early.',
    symptoms: [
      'Small circular spots with dark borders and tan/gray centers',
      'Tiny black specks (pycnidia) visible in lesion centers',
      'Lower leaves affected first, moves upward',
      'Severe defoliation in humid conditions',
    ],
    causes: ['Warm temperatures 20-25°C', 'Long periods of leaf wetness', 'High humidity', 'Infected soil or plant debris'],
    treatment: [
      'Remove infected leaves immediately',
      'Apply copper-based or mancozeb fungicide',
      'Ensure good drainage and air circulation',
    ],
    prevention: ['Rotate crops (2-3 years)', 'Mulch to prevent soil splash', 'Water at base of plant', 'Stake and prune plants'],
    spreadRate: 'Moderate',
    color: '#3b82f6',
  },
  {
    id: 10,
    name: 'Root Rot',
    pathogen: 'Pythium / Rhizoctonia spp.',
    type: 'Fungal',
    severity: 'critical',
    crops: ['Tomato', 'Potato', 'Corn', 'Rice', 'Wheat'],
    emoji: '🌱',
    icon: Thermometer,
    description: 'A soilborne disease complex affecting root systems. Plants may appear healthy above ground until the root system is severely compromised.',
    symptoms: [
      'Yellowing and wilting of leaves despite adequate water',
      'Dark brown or black discoloration of roots',
      'Root tissue soft and mushy',
      'Stunted plant growth and collapse',
    ],
    causes: ['Overwatering or waterlogged soil', 'Poor drainage', 'Heavy clay soils', 'Contaminated transplants or soil'],
    treatment: [
      'Improve drainage immediately',
      'Apply biological control agents (Trichoderma)',
      'Use soil drenches with metalaxyl or fosetyl-Al',
      'Remove and destroy severely affected plants',
    ],
    prevention: ['Well-drained soil essential', 'Avoid overwatering', 'Use raised beds in wet climates', 'Soil solarization before planting'],
    spreadRate: 'Moderate',
    color: '#ef4444',
  },
];

const CROPS = ['All', 'Tomato', 'Potato', 'Corn', 'Rice', 'Wheat', 'Apple'];
const TYPES = ['All', 'Fungal', 'Pest'];
const SEVERITIES = ['All', 'critical', 'warning', 'observation'];
const SEVERITY_META = {
  critical:    { label: 'Critical',     color: 'var(--status-critical)', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)',  dot: '#ef4444' },
  warning:     { label: 'Warning',      color: 'var(--status-warning)',  bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.28)', dot: '#eab308' },
  observation: { label: 'Low Risk',     color: 'var(--status-info)',     bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.28)','dot': '#3b82f6' },
};
const SPREAD_COLOR = { 'Very High': '#ef4444', High: '#f97316', Moderate: '#eab308', Low: '#22c55e' };

/* ─── Component ─────────────────────────────────────────────────── */
export default function DiseaseLibrary() {
  const { t } = useLanguage();
  const [search, setSearch]         = useState('');
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSev, setFilterSev]   = useState('All');
  const [expanded, setExpanded]     = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DISEASES.filter(d => {
      const matchSearch = !q
        || d.name.toLowerCase().includes(q)
        || d.pathogen.toLowerCase().includes(q)
        || d.crops.some(c => c.toLowerCase().includes(q))
        || d.symptoms.some(s => s.toLowerCase().includes(q));
      const matchCrop = filterCrop === 'All' || d.crops.includes(filterCrop);
      const matchType = filterType === 'All' || d.type === filterType;
      const matchSev  = filterSev  === 'All' || d.severity === filterSev;
      return matchSearch && matchCrop && matchType && matchSev;
    });
  }, [search, filterCrop, filterType, filterSev]);

  const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className="library-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="library-header-icon">
            <BookMarked size={24} />
          </div>
          <div>
            <h1 className="heading-xl">{t('lib_title')}</h1>
            <p className="text-secondary" style={{ marginTop: 4 }}>{t('lib_subtitle')}</p>
          </div>
        </div>
        <div className="library-count-badge">
          {filtered.length} / {DISEASES.length} {t('lib_entries')}
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="library-search-wrap animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <Search size={18} className="library-search-icon" />
        <input
          id="library-search"
          className="library-search"
          type="text"
          placeholder={t('lib_search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="library-search-clear" onClick={() => setSearch('')}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="library-filters animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        {/* Crop filter */}
        <div className="library-filter-group">
          <span className="library-filter-label"><Leaf size={13} /> {t('lib_filter_crop')}</span>
          <div className="library-filter-pills">
            {CROPS.map(c => (
              <button
                key={c}
                className={`library-pill ${filterCrop === c ? 'active' : ''}`}
                onClick={() => setFilterCrop(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Severity filter */}
        <div className="library-filter-group">
          <span className="library-filter-label"><AlertTriangle size={13} /> {t('lib_filter_severity')}</span>
          <div className="library-filter-pills">
            {SEVERITIES.map(s => {
              const meta = s !== 'All' ? SEVERITY_META[s] : null;
              return (
                <button
                  key={s}
                  className={`library-pill ${filterSev === s ? 'active' : ''}`}
                  style={meta && filterSev === s ? { color: meta.color, borderColor: meta.border, background: meta.bg } : {}}
                  onClick={() => setFilterSev(s)}
                >
                  {meta && <span className="lib-dot" style={{ background: meta.dot }} />}
                  {s === 'All' ? 'All Levels' : meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type filter */}
        <div className="library-filter-group">
          <span className="library-filter-label"><Bug size={13} /> {t('lib_filter_type')}</span>
          <div className="library-filter-pills">
            {TYPES.map(tp => (
              <button
                key={tp}
                className={`library-pill ${filterType === tp ? 'active' : ''}`}
                onClick={() => setFilterType(tp)}
              >{tp === 'All' ? 'All Types' : tp}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="library-empty animate-fade-in">
          <BookMarked size={52} strokeWidth={1.2} />
          <h3>{t('lib_no_results')}</h3>
          <p>{t('lib_no_results_desc')}</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterCrop('All'); setFilterType('All'); setFilterSev('All'); }}>
            <X size={15} /> {t('lib_clear_filters')}
          </button>
        </div>
      ) : (
        <div className="library-grid stagger-children">
          {filtered.map((disease, idx) => {
            const meta = SEVERITY_META[disease.severity];
            const isOpen = expanded === disease.id;
            const Icon = disease.icon;
            return (
              <div
                key={disease.id}
                className={`library-card glass-card animate-fade-in-up ${isOpen ? 'library-card-open' : ''}`}
                style={{ animationDelay: `${idx * 50}ms`, borderLeftColor: disease.color }}
                id={`disease-card-${disease.id}`}
              >
                {/* Card Header */}
                <div className="library-card-header" onClick={() => toggle(disease.id)}>
                  <div className="library-card-icon" style={{ background: disease.color + '22', color: disease.color }}>
                    <Icon size={22} />
                  </div>
                  <div className="library-card-title-wrap">
                    <div className="library-card-name-row">
                      <span className="library-card-name">{disease.name}</span>
                      <span
                        className="library-sev-badge"
                        style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <span className="library-card-pathogen">{disease.pathogen} · {disease.type}</span>
                    <div className="library-card-crops">
                      {disease.crops.map(c => (
                        <span key={c} className="library-crop-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="library-card-meta">
                    <span className="library-spread" style={{ color: SPREAD_COLOR[disease.spreadRate] }}>
                      ⚡ {disease.spreadRate} spread
                    </span>
                    <button className="library-expand-btn">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                  </div>
                </div>

                {/* Description (always visible) */}
                <p className="library-card-desc">{disease.description}</p>

                {/* Expanded details */}
                {isOpen && (
                  <div className="library-card-details animate-fade-in">
                    <div className="library-detail-grid">
                      {/* Symptoms */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading">
                          <Eye size={14} /> Symptoms
                        </h4>
                        <ul className="library-detail-list">
                          {disease.symptoms.map((s, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: disease.color }} />{s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Causes */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading">
                          <Thermometer size={14} /> Causes & Conditions
                        </h4>
                        <ul className="library-detail-list">
                          {disease.causes.map((c, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: '#94a3b8' }} />{c}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Treatment */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading" style={{ color: '#10b981' }}>
                          <FlaskConical size={14} /> Treatment
                        </h4>
                        <ul className="library-detail-list">
                          {disease.treatment.map((t, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: '#10b981' }} />{t}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Prevention */}
                      <div className="library-detail-section">
                        <h4 className="library-detail-heading" style={{ color: '#3b82f6' }}>
                          <Shield size={14} /> Prevention
                        </h4>
                        <ul className="library-detail-list">
                          {disease.prevention.map((p, i) => (
                            <li key={i}><span className="lib-bullet" style={{ background: '#3b82f6' }} />{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="library-toggle-btn"
                  onClick={() => toggle(disease.id)}
                  id={`disease-toggle-${disease.id}`}
                >
                  {isOpen ? (
                    <><ChevronUp size={14} /> {t('lib_collapse')}</>
                  ) : (
                    <><ChevronDown size={14} /> {t('lib_expand')}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
