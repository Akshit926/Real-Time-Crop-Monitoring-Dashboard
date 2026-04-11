import sys

with open('frontend/src/pages/Summarizer.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

reps = {
    "<span>{healthyCount} Healthy</span>": "<span>{healthyCount} {t('summ_stat_healthy')}</span>",
    "<span>{diseasedScans.length} Diseased</span>": "<span>{diseasedScans.length} {t('summ_stat_diseased')}</span>",
    "<Info size={14} /> Why is this happening?": "<Info size={14} /> {t('summ_why')}",
    "<ShieldAlert size={14} /> About this condition": "<ShieldAlert size={14} /> {t('summ_about')}",
    "<div className=\"summ-rec-label\">Treatment</div>": "<div className=\"summ-rec-label\">{t('rec_treatment')}</div>",
    "<div className=\"summ-rec-label\">Environment</div>": "<div className=\"summ-rec-label\">{t('rec_environment')}</div>",
    "<div className=\"summ-rec-label\">Field Actions</div>": "<div className=\"summ-rec-label\">{t('rec_actions')}</div>",
    "How to Save This Crop": "{t('summ_how_save')}",
    "<li>🔍 Immediately isolate affected plants to prevent spread to healthy ones.</li>": "<li>{t('summ_save_d1')}</li>",
    "<li>✂️ Prune and dispose of heavily infected leaves, stems, or fruit — do not compost.</li>": "<li>{t('summ_save_d2')}</li>",
    "<li>💊 Follow the treatment plan above and apply at the recommended dosage.</li>": "<li>{t('summ_save_d3')}</li>",
    "<li>💧 Switch to drip irrigation to keep foliage dry and reduce fungal pressure.</li>": "<li>{t('summ_save_d4')}</li>",
    "<li>📋 Re-scan after 5–7 days to track recovery progress.</li>": "<li>{t('summ_save_d5')}</li>",
    "<li>🌱 Consider planting disease-resistant varieties in the next season.</li>": "<li>{t('summ_save_d6')}</li>",
    "<li>✅ Crops look healthy — continue current irrigation and fertilization schedule.</li>": "<li>{t('summ_save_h1')}</li>",
    "<li>🔎 Keep up weekly scouting to catch any early symptoms.</li>": "<li>{t('summ_save_h2')}</li>",
    "<li>🌿 Maintain good airflow by pruning crowded canopy areas.</li>": "<li>{t('summ_save_h3')}</li>",
    "<li>📊 Log field observations in the Field Journal to track trends over time.</li>": "<li>{t('summ_save_h4')}</li>",
    "<li>🧪 Schedule a soil health check every 4–6 weeks for optimal nutrition.</li>": "<li>{t('summ_save_h5')}</li>",
    "<BarChart3 size={14} /> Scan Timeline": "<BarChart3 size={14} /> {t('summ_timeline')}",
    
    "<h1 className=\"heading-xl\">Crop Scan Summarizer</h1>": "<h1 className=\"heading-xl\">{t('summ_page_title')}</h1>",
    "Comprehensive analysis of all your tested plants": "{t('summ_page_subtitle_empty')}",
    "No scans recorded yet": "{t('summ_empty_title')}",
    "Go to <strong>Analyze Crop</strong> and run at least one scan. Every result will appear here with a full summary, analytics, and treatment plan.": "{t('summ_empty_desc')}",
    
    "Full report for {uniqueCrops} crop type{uniqueCrops !== 1 ? 's' : ''} across {totalScans} scan{totalScans !== 1 ? 's' : ''}": "<span dangerouslySetInnerHTML={{ __html: t('summ_page_subtitle').replace('{crops}', uniqueCrops).replace('{scans}', totalScans) }} />",
    
    "{downloading ? 'Exporting…' : 'Export PDF'}": "{downloading ? t('summ_btn_exporting') : t('summ_btn_export')}",
    "<Trash2 size={16} /> Clear All": "<Trash2 size={16} /> {t('summ_btn_clear_all')}",
    "<RefreshCw size={16} /> Refresh": "<RefreshCw size={16} /> {t('summ_btn_refresh')}",
    "Clear all scan history?": "{t('summ_confirm_title')}",
    "This will permanently delete {totalScans} scan records. This action cannot be undone.": "{t('summ_confirm_desc').replace('{count}', totalScans)}",
    "Delete All": "{t('summ_btn_del_all')}",
    "Cancel": "{t('summ_cancel')}",
    
    "<div className=\"summ-stat-label\">Total Scans</div>": "<div className=\"summ-stat-label\">{t('summ_stat_total')}</div>",
    "<div className=\"summ-stat-label\">Healthy</div>": "<div className=\"summ-stat-label\">{t('summ_stat_healthy')}</div>",
    "<div className=\"summ-stat-label\">Diseased</div>": "<div className=\"summ-stat-label\">{t('summ_stat_diseased')}</div>",
    "<div className=\"summ-stat-label\">Crop Types</div>": "<div className=\"summ-stat-label\">{t('summ_stat_crops')}</div>",
    "<div className=\"summ-stat-label\">Avg Confidence</div>": "<div className=\"summ-stat-label\">{t('summ_stat_conf')}</div>",
    "<div className=\"summ-stat-label\">Diseases Found</div>": "<div className=\"summ-stat-label\">{t('summ_stat_found')}</div>",
    
    "Overall Farm Health Conclusion": "{t('summ_conc_title')}",
    
    "{scans.length} scan{scans.length !== 1 ? 's' : ''}": "{scans.length} {scans.length !== 1 ? t('summ_card_scans') : t('summ_card_scan')}",
    "Avg confidence: {avgConfidence}%": "{t('summ_card_avg_conf')} {avgConfidence}%",
    "<div className=\"summ-ring-label\">Healthy</div>": "<div className=\"summ-ring-label\">{t('summ_ring_healthy')}</div>",
    "<Leaf size={18} /> Per-Crop Analysis": "<Leaf size={18} /> {t('summ_sec_per_crop')}",
    "<BarChart3 size={16} /> Disease Frequency": "<BarChart3 size={16} /> {t('summ_sec_freq')}",
    "No diseases detected yet. All scans are healthy! 🎉": "{t('summ_no_disease')}",
    "<TrendingUp size={16} /> Health by Crop": "<TrendingUp size={16} /> {t('summ_sec_health_crop')}",
    "<Sprout size={16} /> General Soil &amp; Crop Care Tips": "<Sprout size={16} /> {t('summ_sec_tips')}",
    "<li>🧪 <strong>Soil pH:</strong> Most crops thrive at pH 6.0–7.0. Test monthly.</li>": "<li><span dangerouslySetInnerHTML={{__html:t('summ_tip_ph')}}/></li>",
    "<li>💧 <strong>Irrigation:</strong> Drip irrigation reduces foliar disease pressure by 40–60%.</li>": "<li><span dangerouslySetInnerHTML={{__html:t('summ_tip_irrigation')}}/></li>",
    "<li>🌱 <strong>Nitrogen:</strong> Excess N promotes lush growth but increases disease susceptibility.</li>": "<li><span dangerouslySetInnerHTML={{__html:t('summ_tip_n')}}/></li>",
    "<li>🔄 <strong>Crop Rotation:</strong> Rotate families every season to break soil-borne disease cycles.</li>": "<li><span dangerouslySetInnerHTML={{__html:t('summ_tip_rotate')}}/></li>",
    "<li>🌿 <strong>Organic Matter:</strong> Maintain &gt;3% organic carbon for healthy microbiome.</li>": "<li><span dangerouslySetInnerHTML={{__html:t('summ_tip_carbon')}}/></li>",
    "<li>☀️ <strong>Sunlight:</strong> Ensure good canopy airflow — dense canopy = higher humidity = more fungal risk.</li>": "<li><span dangerouslySetInnerHTML={{__html:t('summ_tip_sun')}}/></li>",
    "<Bug size={16} /> Diseases Detected": "<Bug size={16} /> {t('summ_sec_detected')}",
    "Visit the <strong>Disease Library</strong> for detailed symptom guides and treatment protocols for each disease above.": "<span dangerouslySetInnerHTML={{ __html: t('summ_visit_lib') }} />"
}

for k, v in reps.items():
    code = code.replace(k, v)

# Update conclusion logic block
old_block1 = """          <div className="summ-conclusion-left">
            <div className="summ-conclusion-title">Overall Farm Health Conclusion</div>
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
          </div>"""

new_block1 = """          <div className="summ-conclusion-left">
            <div className="summ-conclusion-title">{t('summ_conc_title')}</div>
            <div className="summ-conclusion-label" style={{ color: conclusionColor }}>
              {healthPct >= 75 ? t('summ_conc_good') : healthPct >= 40 ? t('summ_conc_warn') : t('summ_conc_alert')}
            </div>
            <p className="summ-conclusion-text">
              {healthPct >= 75
                ? t('summ_conc_text_good').replace('{pct}', healthPct)
                : healthPct >= 40
                ? t('summ_conc_text_warn').replace('{pct}', healthPct)
                : t('summ_conc_text_alert').replace('{pct}', healthPct)
              }
            </p>
          </div>"""

code = code.replace(old_block1, new_block1)

code = code.replace("""<span className="summ-badge" style={{ background: getStatusBg(overallStatus), color: getStatusColor(overallStatus) }}>
              {overallStatus}
            </span>""", """<span className="summ-badge" style={{ background: getStatusBg(overallStatus), color: getStatusColor(overallStatus) }}>
              {overallStatus === 'Healthy' ? t('summ_stat_healthy') : t('summ_stat_diseased')}
            </span>""")

with open('frontend/src/pages/Summarizer.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
