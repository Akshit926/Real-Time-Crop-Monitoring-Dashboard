import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { calculateProfit, getProfitOptions } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import './ProfitEstimator.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fallbackOptions = [
  { crop: 'Wheat', cost_per_acre: 15000, yield_per_acre: 20, price: 2000 },
  { crop: 'Rice', cost_per_acre: 18000, yield_per_acre: 25, price: 1800 },
  { crop: 'Maize', cost_per_acre: 12000, yield_per_acre: 30, price: 1500 },
];

export default function ProfitEstimator() {
  const { t } = useLanguage();
  const [options, setOptions] = useState(fallbackOptions);
  const [cropA, setCropA] = useState('Wheat');
  const [areaA, setAreaA] = useState(2);
  const [cropB, setCropB] = useState('Rice');
  const [areaB, setAreaB] = useState(0);
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfitOptions()
      .then((data) => setOptions(data.crops || data))
      .catch(() => setOptions(fallbackOptions));
  }, []);

  const canCompare = cropB && cropB !== cropA && areaB > 0;

  const chartData = useMemo(() => {
    const labels = [cropA];
    const costData = [resultA?.total_cost || 0];
    const revenueData = [resultA?.revenue || 0];

    if (canCompare) {
      labels.push(cropB);
      costData.push(resultB?.total_cost || 0);
      revenueData.push(resultB?.revenue || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total Cost',
          data: costData,
          backgroundColor: '#f97316',
          borderRadius: 8,
        },
        {
          label: 'Revenue',
          data: revenueData,
          backgroundColor: '#22c55e',
          borderRadius: 8,
        },
      ],
    };
  }, [cropA, cropB, canCompare, resultA, resultB]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12 } },
      },
      title: {
        display: true,
        text: t('profit_chart_title'),
        color: '#f8fafc',
        font: { family: 'Inter', size: 16, weight: 600 },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' }, beginAtZero: true },
    },
  };

  const handleCalculate = async () => {
    setError('');
    setLoading(true);

    try {
      const payloadA = { crop: cropA, area: Number(areaA) };
      const responseA = await calculateProfit(payloadA);
      setResultA(responseA);

      if (canCompare) {
        const payloadB = { crop: cropB, area: Number(areaB) };
        const responseB = await calculateProfit(payloadB);
        setResultB(responseB);
      } else {
        setResultB(null);
      }
    } catch (err) {
      setError(err.message || 'profit_calc_error');
      setResultA(null);
      setResultB(null);
    } finally {
      setLoading(false);
    }
  };

  const renderSummary = (result) => {
    if (!result) return null;
    const isProfit = result.profit >= 0;
    return (
      <div className="profit-summary-card glass-card-static">
        <div className="summary-row">
          <div>
            <span className="summary-label">{t('profit_crop')}</span>
            <div className="summary-value">{t(`crop_${result.crop.toLowerCase()}`) || result.crop}</div>
          </div>
          <div>
            <span className="summary-label">{t('profit_area').replace(' (acres)','')}</span>
            <div className="summary-value">{result.area} acres</div>
          </div>
        </div>
        <div className="result-grid">
          <div className="result-item">
            <span>{t('profit_total_cost')}</span>
            <strong>₹{result.total_cost.toLocaleString()}</strong>
          </div>
          <div className="result-item">
            <span>{t('profit_rev')}</span>
            <strong>₹{result.revenue.toLocaleString()}</strong>
          </div>
          <div className="result-item">
            <span>{t('profit_pl')}</span>
            <strong className={isProfit ? 'profit-positive' : 'profit-negative'}>
              ₹{result.profit.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  const comparisonText = useMemo(() => {
    if (!resultA || !resultB) return null;
    if (resultA.profit === resultB.profit) return t('profit_comp_equal');
    return resultA.profit > resultB.profit
      ? t('profit_comp_better').replace('{0}', t('crop_' + resultA.crop.toLowerCase()) || resultA.crop).replace('{1}', t('crop_' + resultB.crop.toLowerCase()) || resultB.crop)
      : t('profit_comp_better').replace('{0}', t('crop_' + resultB.crop.toLowerCase()) || resultB.crop).replace('{1}', t('crop_' + resultA.crop.toLowerCase()) || resultA.crop);
  }, [resultA, resultB, t]);

  return (
    <div className="profit-page">
      <div className="page-header animate-fade-in-up">
        <h1 className="heading-xl">{t('profit_title')}</h1>
        <p className="text-secondary" style={{ marginTop: 6 }}>
          {t('profit_subtitle')}
        </p>
      </div>

      <div className="profit-page-grid">
        <div className="profit-panel glass-card animate-fade-in-up">
          <div className="panel-heading">
            <h2 className="heading-md">{t('profit_estimate')}</h2>
            <button className="primary-button" onClick={handleCalculate} disabled={loading}>
              {loading ? t('profit_calc_loading') : t('profit_calc')}
            </button>
          </div>

          <div className="input-grid">
            <div className="input-group">
              <label>{t('profit_crop')}</label>
              <select value={cropA} onChange={(e) => setCropA(e.target.value)}>
                {options.map((crop) => (
                  <option key={crop.crop} value={crop.crop}>{t(`crop_${crop.crop.toLowerCase()}`) || crop.crop}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>{t('profit_area')}</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={areaA}
                onChange={(e) => setAreaA(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>{t('profit_compare')}</label>
              <select value={cropB} onChange={(e) => setCropB(e.target.value)}>
                <option value="">{t('profit_none')}</option>
                {options.map((crop) => (
                  <option key={crop.crop} value={crop.crop}>{t(`crop_${crop.crop.toLowerCase()}`) || crop.crop}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>{t('profit_area')}</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={areaB}
                onChange={(e) => setAreaB(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          {comparisonText && (
            <div className="comparison-banner glass-card-static">
              <span>{comparisonText}</span>
            </div>
          )}
        </div>

        <div className="profit-results glass-card animate-fade-in-up">
          <div className="result-block">
            <h2 className="heading-md">{t('profit_results')}</h2>
            {renderSummary(resultA) || <p className="text-secondary">{t('profit_calc_prompt')}</p>}
          </div>

          {canCompare && renderSummary(resultB)}
        </div>
      </div>

      <div className="chart-card glass-card-static animate-fade-in-up">
        <div className="chart-wrapper">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
