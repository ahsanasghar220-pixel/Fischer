import HelpTooltip from './HelpTooltip'

interface FormFieldProps {
  label: string
  tooltip?: string
  helpText?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export default function FormField({ label, tooltip, helpText, error, required, children }: FormFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {tooltip && <HelpTooltip text={tooltip} />}
      </div>
      {children}
      {helpText && !error && (
        <p className="mt-1 text-xs text-dark-400 dark:text-dark-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
