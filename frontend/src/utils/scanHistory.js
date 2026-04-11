const HISTORY_KEY = 'agrovision_scan_history_v1';
const MAX_ENTRIES = 100;

function readHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // storage full — drop oldest half
    try {
      const trimmed = entries.slice(Math.floor(entries.length / 2));
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch { /* no-op */ }
  }
}

export function getScanHistory() {
  return readHistory();
}

export function pushScanResult(result, imagePreviewUrl = null) {
  if (!result || !result.crop) return;

  const history = readHistory();
  const entry = {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    crop: result.crop,
    status: result.status,
    disease: result.disease,
    confidence: result.confidence,
    reason: result.reason || '',
    description: result.description || '',
    recommendations: result.recommendations || {},
    model_label: result.model_label || '',
    thumbnail: imagePreviewUrl || null,
  };

  history.push(entry);
  // Keep only the newest MAX_ENTRIES
  if (history.length > MAX_ENTRIES) {
    history.splice(0, history.length - MAX_ENTRIES);
  }
  writeHistory(history);
  return entry;
}

export function clearScanHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch { /* no-op */ }
}

export function deleteScanEntry(id) {
  const history = readHistory().filter(e => e.id !== id);
  writeHistory(history);
}
