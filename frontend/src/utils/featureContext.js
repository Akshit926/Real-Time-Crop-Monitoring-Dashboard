const STORAGE_KEY = 'agrovision_feature_context_v1';

function readContext() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeContext(context) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // no-op
  }
}

export function getFeatureContext() {
  return readContext();
}

export function setFeatureContext(featureKey, payload) {
  if (!featureKey || !payload || typeof payload !== 'object') {
    return;
  }

  const current = readContext();
  current[featureKey] = {
    ...payload,
    updated_at: new Date().toISOString(),
  };
  writeContext(current);
}
