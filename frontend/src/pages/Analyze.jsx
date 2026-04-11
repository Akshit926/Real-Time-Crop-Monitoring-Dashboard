import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { predictDisease } from '../utils/api';
import {
  Upload, Camera, X, Loader, CheckCircle2, AlertTriangle,
  Droplets, Bug, FlaskConical, RefreshCw, Download
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { setFeatureContext } from '../utils/featureContext';
import './Analyze.css';

export default function Analyze() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const resultPanelRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictDisease(image);
      setResult(data);
      setFeatureContext('analyze', {
        crop: data.crop,
        status: data.status,
        disease: data.disease,
        confidence: data.confidence,
        reason: data.reason,
        recommendations: data.recommendations,
      });
    } catch (err) {
      setError(err.message || t('analyze_error_failed'));
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setError(t('analyze_error_camera_denied'));
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      handleFile(file);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const reset = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    stopCamera();
  };

  const handleDownloadPdf = async () => {
    if (!resultPanelRef.current || !result) {
      return;
    }

    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(resultPanelRef.current, {
        scale: 2,
        backgroundColor: '#0a0f1a',
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 24;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let remainingHeight = imageHeight;
      let yOffset = margin;

      pdf.addImage(imageData, 'PNG', margin, yOffset, imageWidth, imageHeight, undefined, 'FAST');
      remainingHeight -= pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();
        yOffset = margin - (imageHeight - remainingHeight);
        pdf.addImage(imageData, 'PNG', margin, yOffset, imageWidth, imageHeight, undefined, 'FAST');
        remainingHeight -= pageHeight - margin * 2;
      }

      const dateStamp = new Date().toISOString().slice(0, 10);
      pdf.save(`agrovision-analysis-${dateStamp}.pdf`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="analyze">
      <div className="page-header animate-fade-in-up">
        <h1 className="heading-xl">{t('analyze_title')}</h1>
        <p className="text-secondary" style={{ marginTop: 4 }}>{t('analyze_subtitle')}</p>
      </div>

      <div className="analyze-grid">
        {/* Left: Upload / Camera */}
        <div className="analyze-input-section">
          {!imagePreview && !cameraActive && (
            <div className="analyze-upload-options">
              {/* Upload Zone */}
              <div
                className={`upload-zone glass-card ${dragOver ? 'upload-zone-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-zone-icon">
                  <Upload size={32} />
                </div>
                <h3 className="heading-md">{t('upload_title')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{t('upload_desc')}</p>
                <span className="upload-zone-formats">{t('upload_formats')}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>

              {/* Camera Zone */}
              <div className="upload-zone glass-card" onClick={startCamera}>
                <div className="upload-zone-icon upload-zone-icon-camera">
                  <Camera size={32} />
                </div>
                <h3 className="heading-md">{t('webcam_title')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{t('webcam_desc')}</p>
                <span className="upload-zone-formats">{t('webcam_btn')}</span>
              </div>
            </div>
          )}

          {/* Camera view */}
          {cameraActive && (
            <div className="camera-view glass-card-static">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
              <div className="camera-controls">
                <button className="btn btn-primary" onClick={capturePhoto}>
                  <Camera size={18} />
                  {t('capture_btn')}
                </button>
                <button className="btn btn-secondary" onClick={stopCamera}>
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {imagePreview && !cameraActive && (
            <div className="image-preview glass-card-static">
              <img src={imagePreview} alt={t('analyze_preview_alt')} className="preview-img" />
              <div className="preview-actions">
                <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
                  {loading ? <><Loader size={18} className="spin-icon" /> {t('analyzing')}</> : <><FlaskConical size={18} /> {t('analyze_action')}</>}
                </button>
                <button className="btn btn-ghost" onClick={reset}>
                  <RefreshCw size={18} /> {t('common_reset')}
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Right: Results */}
        <div className="analyze-results-section">
          {loading && (
            <div className="analyze-loading glass-card-static">
              <div className="loading-spinner" />
              <p className="heading-md">{t('analyzing')}</p>
              <p className="text-secondary">{t('analyze_loading_detail')}</p>
              <p className="text-secondary" style={{ fontSize: '0.78rem', marginTop: 6, opacity: 0.7 }}>
                {t('analyze_loading_hint')}
              </p>
              <div className="loading-bars">
                <div className="loading-bar" style={{ animationDelay: '0s' }} />
                <div className="loading-bar" style={{ animationDelay: '0.2s' }} />
                <div className="loading-bar" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="analyze-error glass-card-static">
              <AlertTriangle size={32} color="var(--status-critical)" />
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={() => setError(null)}>{t('analyze_try_again')}</button>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel animate-fade-in-up" ref={resultPanelRef}>
              <div className="result-panel-header-row">
                <h2 className="heading-lg">{t('results_title')}</h2>
                <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={downloadingPdf} type="button">
                  <Download size={16} />
                  {downloadingPdf ? t('analyze_downloading_pdf') : t('analyze_download_pdf')}
                </button>
              </div>

              {/* Status Card */}
              <div className={`result-status-card glass-card ${result.status === 'Healthy' ? 'result-healthy' : 'result-diseased'}`}>
                <div className="result-status-icon">
                  {result.status === 'Healthy' ? <CheckCircle2 size={36} /> : <AlertTriangle size={36} />}
                </div>
                <div className="result-status-info">
                  <div className="result-status-text">{result.status === 'Healthy' ? t('healthy') : t('diseased')}</div>
                  <div className="result-crop-name">{result.crop}</div>
                </div>
              </div>

              {/* Disease & Confidence */}
              <div className="result-details glass-card-static" style={{ marginTop: 16, padding: 20, borderRadius: 'var(--radius-lg)' }}>
                <div className="result-detail-row">
                  <span className="text-secondary">{t('disease_detected')}</span>
                  <span className="result-detail-value" style={{ color: result.disease !== 'None' ? 'var(--status-critical)' : 'var(--status-healthy)' }}>
                    {result.disease === 'None' ? t('none') : result.disease}
                  </span>
                </div>
                <div className="result-detail-row" style={{ marginTop: 16 }}>
                  <span className="text-secondary">{t('confidence')}</span>
                  <span className="result-detail-value">{result.confidence}%</span>
                </div>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                  <div
                    className={`progress-fill ${result.confidence < 60 ? 'progress-fill-critical' : result.confidence < 80 ? 'progress-fill-warning' : ''}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                {result.reason && (
                  <div style={{ marginTop: 16 }}>
                    <div className="text-secondary" style={{ marginBottom: 8 }}>{t('reason')}</div>
                    <p className="result-description" style={{ marginBottom: 0 }}>{result.reason}</p>
                  </div>
                )}
                {result.description && (
                  <p className="result-description">{result.description}</p>
                )}
              </div>

              {/* Recommendations */}
              {result.recommendations && (
                <div style={{ marginTop: 20 }}>
                  <h3 className="heading-md" style={{ marginBottom: 12 }}>{t('recommendations')}</h3>
                  <div className="rec-cards">
                    <div className="rec-card glass-card">
                      <div className="rec-card-icon rec-treatment"><FlaskConical size={20} /></div>
                      <div className="rec-card-label">{t('rec_treatment')}</div>
                      <p className="rec-card-text">{result.recommendations.treatment}</p>
                    </div>
                    <div className="rec-card glass-card">
                      <div className="rec-card-icon rec-environment"><Droplets size={20} /></div>
                      <div className="rec-card-label">{t('rec_environment')}</div>
                      <p className="rec-card-text">{result.recommendations.environment}</p>
                    </div>
                    <div className="rec-card glass-card">
                      <div className="rec-card-icon rec-actions"><Bug size={20} /></div>
                      <div className="rec-card-label">{t('rec_actions')}</div>
                      <p className="rec-card-text">{result.recommendations.field_actions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="analyze-placeholder glass-card-static">
              <FlaskConical size={48} strokeWidth={1.2} color="var(--text-tertiary)" />
              <p className="heading-md" style={{ color: 'var(--text-tertiary)', marginTop: 12 }}>
                {t('analyze_placeholder_title')}
              </p>
              <p className="text-secondary" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                {t('analyze_placeholder_subtitle')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
