/**
 * Dynamic brand color theming.
 *
 * How it works:
 *  1. Tailwind's `primary-*` utilities reference CSS custom properties
 *     (--color-primary-50 … --color-primary-950) defined in index.css.
 *  2. On app startup, initBrandColor() fetches the saved color from the API
 *     and calls applyBrandColor() to overwrite those variables in <html>.
 *  3. applyBrandColor() generates the full shade scale from the base hex
 *     so every Tailwind `bg-primary-*`, `text-primary-*`, etc. updates instantly.
 */

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function blendWithWhite(r: number, g: number, b: number, factor: number): [number, number, number] {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ]
}

function blendWithBlack(r: number, g: number, b: number, factor: number): [number, number, number] {
  return [
    Math.round(r * (1 - factor)),
    Math.round(g * (1 - factor)),
    Math.round(b * (1 - factor)),
  ]
}

/**
 * Generate an 11-shade scale (50–950) from a base hex color.
 * Returns each shade as an "R G B" string for use in CSS variables.
 */
export function generateColorScale(hex: string): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)

  const shades: Record<string, [number, number, number]> = {
    '50':  blendWithWhite(r, g, b, 0.95),
    '100': blendWithWhite(r, g, b, 0.85),
    '200': blendWithWhite(r, g, b, 0.70),
    '300': blendWithWhite(r, g, b, 0.50),
    '400': blendWithWhite(r, g, b, 0.25),
    '500': [r, g, b],
    '600': blendWithBlack(r, g, b, 0.15),
    '700': blendWithBlack(r, g, b, 0.28),
    '800': blendWithBlack(r, g, b, 0.43),
    '900': blendWithBlack(r, g, b, 0.57),
    '950': blendWithBlack(r, g, b, 0.72),
  }

  return Object.fromEntries(
    Object.entries(shades).map(([shade, [r, g, b]]) => [shade, `${r} ${g} ${b}`])
  )
}

/**
 * Apply a brand color to the document root as CSS custom properties.
 * All Tailwind `primary-*` classes update instantly with no page reload.
 */
export function applyBrandColor(hex: string): void {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return

  const scale = generateColorScale(hex)
  const root = document.documentElement

  Object.entries(scale).forEach(([shade, channels]) => {
    root.style.setProperty(`--color-primary-${shade}`, channels)
  })

  // Keep --color-accent in sync (used in non-Tailwind CSS rules)
  const [r, g, b] = hexToRgb(hex)
  root.style.setProperty('--color-accent', `${r} ${g} ${b}`)
}

/**
 * Fetch the brand color from the public API and apply it.
 * Called once at app startup; silently falls back to CSS defaults on error.
 */
export async function initBrandColor(): Promise<void> {
  try {
    const base = import.meta.env.VITE_API_URL ?? ''
    const res = await fetch(`${base}/api/settings/brand-color`)
    if (!res.ok) return
    const data = await res.json()
    if (data?.brand_color) {
      applyBrandColor(data.brand_color)
    }
  } catch {
    // Silently fall back to CSS variable defaults
  }
}
