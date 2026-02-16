import { useState } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface VideoUploadProps {
  currentUrl: string
  onUrlChange: (url: string) => void
  uploadType: 'hero' | 'category' | 'general'
  label?: string
  placeholder?: string
}

export default function VideoUpload({ currentUrl, onUrlChange, uploadType, label = 'Video URL', placeholder = '/videos/video.mp4' }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)

    const fd = new FormData()
    fd.append('video', file)
    fd.append('type', uploadType)

    try {
      const response = await api.post('/api/admin/homepage/upload-video', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      })
      onUrlChange(response.data.data.path)
      toast.success('Video uploaded successfully')
    } catch {
      toast.error('Failed to upload video')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
          uploading
            ? 'bg-dark-200 dark:bg-dark-600 text-dark-500 cursor-not-allowed'
            : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
        }`}>
          <ArrowUpTrayIcon className="w-5 h-5" />
          {uploading ? `${progress}%` : 'Upload'}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {currentUrl && (
        <div className="mt-2 border border-dark-200 dark:border-dark-600 rounded-lg p-2">
          <video src={currentUrl} controls className="w-full max-h-32 rounded" />
        </div>
      )}
    </div>
  )
}
