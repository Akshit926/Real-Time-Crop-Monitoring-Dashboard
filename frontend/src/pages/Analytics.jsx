import { useLanguage } from '../context/LanguageContext';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Pie, Bar, Line } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      }
    }
  }
};

export default function Analytics() {
  const { t } = useLanguage();

  // Health Distribution (Doughnut)
  const healthData = {
    labels: ['Healthy', 'Diseased'],
    datasets: [{
      data: [78, 22],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderColor: ['#16a34a', '#dc2626'],
      borderWidth: 2,
      hoverOffset: 8,
    }]
  };

  // Disease distribution (Pie)
  const diseaseData = {
    labels: ['Late Blight', 'Early Blight', 'Powdery Mildew', 'Leaf Spot', 'Northern Leaf Blight', 'Blast'],
    datasets: [{
      data: [28, 18, 15, 14, 13, 12],
      backgroundColor: [
        '#ef4444', '#f97316', '#eab308', '#a855f7', '#3b82f6', '#06b6d4'
      ],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  // Detection History (Bar)
  const historyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Healthy',
        data: [12, 15, 8, 18, 14, 10, 16],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Diseased',
        data: [4, 3, 6, 2, 5, 3, 4],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const historyOptions = {
    ...chartDefaults,
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.06)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.06)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } },
        beginAtZero: true,
      }
    }
  };

  // Health Trend (Line)
  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [{
      label: 'Health Score',
      data: [72, 68, 75, 71, 78, 82, 80, 85],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  const trendOptions = {
    ...chartDefaults,
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.06)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.06)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } },
        min: 50,
        max: 100,
      }
    }
  };

  return (
    <div className="analytics-page">
      <div className="page-header animate-fade-in-up">
        <h1 className="heading-xl">{t('analytics_title')}</h1>
        <p className="text-secondary" style={{ marginTop: 4 }}>{t('analytics_subtitle')}</p>
      </div>

      <div className="charts-grid" style={{ marginTop: 28 }}>
        {/* Health Distribution */}
        <div className="chart-card glass-card-static animate-fade-in-up">
          <h3 className="heading-md chart-card-title">{t('chart_health_dist')}</h3>
          <div className="chart-wrapper chart-wrapper-sm">
            <Doughnut data={healthData} options={{
              ...chartDefaults,
              cutout: '65%',
              plugins: {
                ...chartDefaults.plugins,
                legend: { ...chartDefaults.plugins.legend, position: 'bottom' }
              }
            }} />
          </div>
          <div className="chart-summary">
            <div className="chart-summary-item">
              <span className="chart-dot" style={{ background: '#22c55e' }} />
              <span>78% Healthy</span>
            </div>
            <div className="chart-summary-item">
              <span className="chart-dot" style={{ background: '#ef4444' }} />
              <span>22% Diseased</span>
            </div>
          </div>
        </div>

        {/* Disease Distribution */}
        <div className="chart-card glass-card-static animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="heading-md chart-card-title">{t('chart_disease_dist')}</h3>
          <div className="chart-wrapper chart-wrapper-sm">
            <Pie data={diseaseData} options={{
              ...chartDefaults,
              plugins: {
                ...chartDefaults.plugins,
                legend: { ...chartDefaults.plugins.legend, position: 'bottom' }
              }
            }} />
          </div>
        </div>

        {/* Detection History */}
        <div className="chart-card glass-card-static animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="heading-md chart-card-title">{t('chart_history')}</h3>
          <div className="chart-wrapper chart-wrapper-lg">
            <Bar data={historyData} options={historyOptions} />
          </div>
        </div>

        {/* Health Trend */}
        <div className="chart-card glass-card-static animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="heading-md chart-card-title">{t('chart_trend')}</h3>
          <div className="chart-wrapper chart-wrapper-lg">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
