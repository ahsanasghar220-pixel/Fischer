import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Column {
  name: string
  required: boolean
  example: string
  note: string
}

interface ImportResult {
  created: number
  updated: number
  errors: { row: number; message: string }[]
}

interface CsvImportPanelProps {
  /** POST endpoint for import, e.g. '/api/admin/products/import' */
  importUrl: string
  /** GET endpoint for export, e.g. '/api/admin/products/export' */
  exportUrl: string
  /** Column definitions shown in the format guide */
  columns: Column[]
  /** Label shown in the panel title */
  label: string
  /** Called after a successful import so the parent can refetch */
  onImportSuccess?: () => void
  onClose: () => void
}

function downloadTemplate(columns: Column[], filename: string) {
  const header = columns.map(c => c.name).join(',')
  const example = columns.map(c => `"${c.example}"`).join(',')
  const csv = header + '\n' + example + '\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function CsvImportPanel({
  importUrl,
  exportUrl,
  columns,
  label,
  onImportSuccess,
  onClose,
}: CsvImportPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showGuide, setShowGuide] = useState(true)

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post(importUrl, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data as ImportResult
    },
    onSuccess: (data) => {
      setResult(data)
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
      toast.success(`Import complete: ${data.created} created, ${data.updated} updated`)
      onImportSuccess?.()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Import failed'
      toast.error(msg)
    },
  })

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await api.get(exportUrl, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = response.headers['content-disposition'] as string | undefined
      const match = disposition?.match(/filename="?([^"]+)"?/)
      a.download = match?.[1] || 'export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200 dark:border-dark-700">
        <h3 className="font-semibold text-dark-900 dark:text-white">Import / Export {label}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-dark-700 dark:text-dark-200 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Format guide toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowGuide(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            <DocumentTextIcon className="w-4 h-4" />
            {showGuide ? 'Hide' : 'Show'} CSV format guide
          </button>

          {showGuide && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-dark-200 dark:border-dark-700">
              <table className="w-full text-xs">
                <thead className="bg-dark-50 dark:bg-dark-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-dark-700 dark:text-dark-200 whitespace-nowrap">Column</th>
                    <th className="text-left px-3 py-2 font-semibold text-dark-700 dark:text-dark-200">Required</th>
                    <th className="text-left px-3 py-2 font-semibold text-dark-700 dark:text-dark-200">Example</th>
                    <th className="text-left px-3 py-2 font-semibold text-dark-700 dark:text-dark-200">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                  {columns.map(col => (
                    <tr key={col.name} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                      <td className="px-3 py-2 font-mono text-primary-700 dark:text-primary-400 whitespace-nowrap">{col.name}</td>
                      <td className="px-3 py-2">
                        {col.required
                          ? <span className="text-red-600 dark:text-red-400 font-semibold">Required</span>
                          : <span className="text-dark-400">Optional</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-dark-600 dark:text-dark-400 whitespace-nowrap">{col.example}</td>
                      <td className="px-3 py-2 text-dark-500 dark:text-dark-400">{col.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Template download */}
        <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <ArrowDownTrayIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <span className="text-sm text-dark-700 dark:text-dark-300 flex-1">
            New to CSV imports? Download a pre-filled template with the correct columns.
          </span>
          <button
            type="button"
            onClick={() => downloadTemplate(columns, `${label.toLowerCase().replace(/\s+/g, '-')}-template.csv`)}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap"
          >
            Download template
          </button>
        </div>

        {/* File upload */}
        <div>
          <p className="text-sm font-medium text-dark-900 dark:text-white mb-2">Upload CSV file</p>
          <div
            className="relative border-2 border-dashed border-dark-200 dark:border-dark-600 rounded-xl p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <ArrowUpTrayIcon className="w-8 h-8 text-dark-400 mx-auto mb-2" />
            {selectedFile ? (
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-sm text-dark-600 dark:text-dark-400">Click to select a CSV file</p>
                <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Accepted: .csv — max 10 MB</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0] ?? null
                setSelectedFile(f)
                setResult(null)
              }}
            />
          </div>

          {selectedFile && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => importMutation.mutate(selectedFile)}
                disabled={importMutation.isPending}
                className="btn btn-primary disabled:opacity-50"
              >
                {importMutation.isPending ? 'Importing…' : 'Import Now'}
              </button>
              <button
                type="button"
                onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = '' }}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {result.created} created &nbsp;·&nbsp; {result.updated} updated
              </p>
            </div>

            {result.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationCircleIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{result.errors.length} row(s) had errors and were skipped:</p>
                </div>
                <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
                  <table className="w-full text-xs">
                    <thead className="bg-red-50 dark:bg-red-900/30">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-red-700 dark:text-red-400 w-16">Row</th>
                        <th className="text-left px-3 py-2 font-medium text-red-700 dark:text-red-400">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 dark:divide-red-900">
                      {result.errors.map((e, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 text-red-600 dark:text-red-400 font-mono">{e.row}</td>
                          <td className="px-3 py-1.5 text-red-700 dark:text-red-300">{e.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
