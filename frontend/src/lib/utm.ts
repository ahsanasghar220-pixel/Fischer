/**
 * UTM Attribution Tracking
 * Captures UTM params from URL and stores in localStorage
 * Reads back on checkout to attach to order
 */

export interface UtmData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
}

const UTM_KEY = 'fischer_utm'

export function captureUtm(): void {
  const params = new URLSearchParams(window.location.search)
  const utm: UtmData = {}

  const utmFields: (keyof UtmData)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  let hasUtm = false

  utmFields.forEach(field => {
    const val = params.get(field)
    if (val) { utm[field] = val; hasUtm = true }
  })

  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    utm.referrer = document.referrer
    hasUtm = true
  }

  // Only overwrite if new UTM params are present
  if (hasUtm) {
    localStorage.setItem(UTM_KEY, JSON.stringify(utm))
  }
}

export function getUtmData(): UtmData {
  try {
    const stored = localStorage.getItem(UTM_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function clearUtm(): void {
  localStorage.removeItem(UTM_KEY)
}
