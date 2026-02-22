import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { applyBrandColor, generateColorScale } from '@/lib/colorTheme'
import type { AppearanceSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  appearanceSettings: AppearanceSettings
  setAppearanceSettings: React.Dispatch<React.SetStateAction<AppearanceSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

const PRESET_COLORS = [
  { label: 'Fischer Red', color: '#951212' },
  { label: 'Royal Blue', color: '#1d4ed8' },
  { label: 'Emerald', color: '#059669' },
  { label: 'Violet', color: '#7c3aed' },
  { label: 'Amber', color: '#d97706' },
  { label: 'Rose', color: '#e11d48' },
  { label: 'Slate', color: '#475569' },
  { label: 'Indigo', color: '#4338ca' },
]

export default function AppearanceSettingsTab({ appearanceSettings, setAppearanceSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ appearance: appearanceSettings })
        applyBrandColor(appearanceSettings.brand_color)
      }}
      className="space-y-8 max-w-xl"
    >
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">Brand Color</h3>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
          Choose your brand's primary color. All buttons, links, highlights, and accents across the entire store will update instantly.
        </p>

        {/* Color picker + hex input row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <input
              type="color"
              value={appearanceSettings.brand_color}
              onChange={(e) => {
                setAppearanceSettings({ ...appearanceSettings, brand_color: e.target.value })
                applyBrandColor(e.target.value)
              }}
              className="w-16 h-16 rounded-xl border-2 border-dark-200 dark:border-dark-600 cursor-pointer p-1 bg-white dark:bg-dark-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Hex Color</label>
            <input
              type="text"
              value={appearanceSettings.brand_color}
              onChange={(e) => {
                const val = e.target.value
                setAppearanceSettings({ ...appearanceSettings, brand_color: val })
                if (/^#[0-9a-fA-F]{6}$/.test(val)) applyBrandColor(val)
              }}
              placeholder="#951212"
              maxLength={7}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Shade preview */}
        <div>
          <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2 uppercase tracking-wide">Generated shade scale</p>
          <div className="flex rounded-lg overflow-hidden h-10 border border-dark-200 dark:border-dark-700">
            {Object.entries(generateColorScale(appearanceSettings.brand_color)).map(([shade, channels]) => {
              const [r, g, b] = channels.split(' ').map(Number)
              return (
                <div
                  key={shade}
                  className="flex-1 group relative"
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  title={shade}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 text-white mix-blend-difference transition-opacity">
                    {shade}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-dark-400">50</span>
            <span className="text-[10px] text-dark-400">950</span>
          </div>
        </div>

        {/* Preset colors */}
        <div className="mt-6">
          <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-3 uppercase tracking-wide">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ label, color }) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setAppearanceSettings({ ...appearanceSettings, brand_color: color })
                  applyBrandColor(color)
                }}
                title={label}
                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  appearanceSettings.brand_color === color
                    ? 'border-dark-900 dark:border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
        <p className="text-xs text-dark-500 dark:text-dark-400 mb-4">
          Changes apply live in your browser. Click "Save" to persist the color for all visitors.
        </p>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {saveMutation.isPending && <LoadingSpinner size="sm" />}
          Save Brand Color
        </button>
      </div>
    </form>
  )
}
