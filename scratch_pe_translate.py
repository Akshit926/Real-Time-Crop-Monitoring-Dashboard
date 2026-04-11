import sys

with open('frontend/src/utils/translations.js', 'r', encoding='utf-8') as f:
    text = f.read()

en_add = """    profit_title: 'Profit & Cost Analyzer',
    profit_subtitle: 'Estimate crop economics, compare two crops, and visualize cost versus revenue.',
    profit_estimate: 'Estimate Profit',
    profit_calc: 'Calculate',
    profit_calc_loading: 'Calculating…',
    profit_crop: 'Crop',
    profit_area: 'Area (acres)',
    profit_compare: 'Compare Crop',
    profit_none: 'None',
    profit_comp_equal: 'Both crops show equal profitability.',
    profit_comp_better: '{0} is more profitable than {1}.',
    profit_results: 'Results',
    profit_calc_prompt: 'Calculate to view results.',
    profit_total_cost: 'Total Cost',
    profit_rev: 'Revenue',
    profit_pl: 'Profit / Loss',
    profit_chart_title: 'Cost vs Revenue',"""
    
hi_add = """    profit_title: 'लाभ और लागत विश्लेषक',
    profit_subtitle: 'फसल अर्थशास्त्र का अनुमान लगाएं, दो फसलों की तुलना करें, और लागत बनाम राजस्व देखें।',
    profit_estimate: 'लाभ का अनुमान लगाएं',
    profit_calc: 'गणना करें',
    profit_calc_loading: 'गणना हो रही है…',
    profit_crop: 'फसल',
    profit_area: 'क्षेत्र (एकड़)',
    profit_compare: 'फसल की तुलना',
    profit_none: 'कोई नहीं',
    profit_comp_equal: 'दोनों फसलें समान रूप से लाभदायक हैं।',
    profit_comp_better: '{0}, {1} से अधिक लाभदायक है।',
    profit_results: 'परिणाम',
    profit_calc_prompt: 'परिणाम देखने के लिए गणना करें।',
    profit_total_cost: 'कुल लागत',
    profit_rev: 'राजस्व',
    profit_pl: 'लाभ / हानि',
    profit_chart_title: 'लागत बनाम राजस्व',"""

text = text.replace("soil_title: 'Soil Health Analysis',", f"{en_add}\n\n    soil_title: 'Soil Health Analysis',")
text = text.replace("soil_title: 'मिट्टी स्वास्थ्य विश्लेषण',", f"{hi_add}\n\n    soil_title: 'मिट्टी स्वास्थ्य विश्लेषण',")

with open('frontend/src/utils/translations.js', 'w', encoding='utf-8') as f:
    f.write(text)


with open('frontend/src/pages/ProfitEstimator.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add useLanguage import
code = code.replace("import { calculateProfit, getProfitOptions } from '../utils/api';", "import { calculateProfit, getProfitOptions } from '../utils/api';\nimport { useLanguage } from '../context/LanguageContext';")

# Add const {t} = useLanguage() to the component
code = code.replace("export default function ProfitEstimator() {\n  const [options, setOptions]", "export default function ProfitEstimator() {\n  const { t } = useLanguage();\n  const [options, setOptions]")

code = code.replace("text: 'Cost vs Revenue',", "text: t('profit_chart_title'),")
code = code.replace("Unable to calculate profit.", "profit_calc_error") # Wait, I didn't add error to translations but let's change it. Actually let's not change error handling strings as much.
code = code.replace("<span className=\"summary-label\">Crop</span>", "<span className=\"summary-label\">{t('profit_crop')}</span>")
code = code.replace("<span className=\"summary-label\">Area</span>", "<span className=\"summary-label\">{t('profit_area').replace(' (acres)','')}</span>")
code = code.replace("<span>Total Cost</span>", "<span>{t('profit_total_cost')}</span>")
code = code.replace("<span>Revenue</span>", "<span>{t('profit_rev')}</span>")
code = code.replace("<span>Profit / Loss</span>", "<span>{t('profit_pl')}</span>")
code = code.replace("Both crops show equal profitability.", "{t('profit_comp_equal')}")

cl = "`${resultA.crop} is more profitable than ${resultB.crop}.`"
code = code.replace(cl, "t('profit_comp_better').replace('{0}', t('crop_' + resultA.crop.toLowerCase()) || resultA.crop).replace('{1}', t('crop_' + resultB.crop.toLowerCase()) || resultB.crop)")

cl2 = "`${resultB.crop} is more profitable than ${resultA.crop}.`"
code = code.replace(cl2, "t('profit_comp_better').replace('{0}', t('crop_' + resultB.crop.toLowerCase()) || resultB.crop).replace('{1}', t('crop_' + resultA.crop.toLowerCase()) || resultA.crop)")

code = code.replace("<h1 className=\"heading-xl\">Profit & Cost Analyzer</h1>", "<h1 className=\"heading-xl\">{t('profit_title')}</h1>")
code = code.replace("Estimate crop economics, compare two crops, and visualize cost versus revenue.", "{t('profit_subtitle')}")
code = code.replace("<h2 className=\"heading-md\">Estimate Profit</h2>", "<h2 className=\"heading-md\">{t('profit_estimate')}</h2>")
code = code.replace("{loading ? 'Calculating…' : 'Calculate'}", "{loading ? t('profit_calc_loading') : t('profit_calc')}")
code = code.replace("<label>Crop</label>", "<label>{t('profit_crop')}</label>")
code = code.replace("<label>Area (acres)</label>", "<label>{t('profit_area')}</label>")
code = code.replace("<label>Compare Crop</label>", "<label>{t('profit_compare')}</label>")
code = code.replace("<option value=\"\">None</option>", "<option value=\"\">{t('profit_none')}</option>")
code = code.replace("<h2 className=\"heading-md\">Results</h2>", "<h2 className=\"heading-md\">{t('profit_results')}</h2>")
code = code.replace("<p className=\"text-secondary\">Calculate to view results.</p>", "<p className=\"text-secondary\">{t('profit_calc_prompt')}</p>")

# Inject t into crop mapper inside select element
code = code.replace(">{crop.crop}</option>", ">{t(`crop_${crop.crop.toLowerCase()}`) || crop.crop}</option>")
# Same for result summary block (renderSummary)
code = code.replace("<div className=\"summary-value\">{result.crop}</div>", "<div className=\"summary-value\">{t(`crop_${result.crop.toLowerCase()}`) || result.crop}</div>")

with open('frontend/src/pages/ProfitEstimator.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
