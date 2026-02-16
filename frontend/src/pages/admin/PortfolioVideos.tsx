import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface PortfolioVideo {
  id: number
  title: string
  description: string | null
  video_url: string
  thumbnail: string | null
  category: string | null
  sort_order: number
  is_visible: boolean
}

export default function PortfolioVideos() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState<'video' | 'thumbnail' | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
    category: '',
    sort_order: 0,
    is_visible: true,
  })

  const { data: videos, isLoading } = useQuery<PortfolioVideo[]>({
    queryKey: ['admin-portfolio-videos'],
    queryFn: async () => {
      const response = await api.get('/api/admin/portfolio-videos')
      return response.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingId) {
        await api.put(`/api/admin/portfolio-videos/${editingId}`, data)
      } else {
        await api.post('/api/admin/portfolio-videos', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-videos'] })
      toast.success(editingId ? 'Video updated' : 'Video created')
      resetForm()
    },
    onError: () => {
      toast.error('Failed to save video')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/portfolio-videos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-videos'] })
      toast.success('Video deleted')
    },
    onError: () => {
      toast.error('Failed to delete video')
    },
  })

  const handleEdit = (video: PortfolioVideo) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail: video.thumbnail || '',
      category: video.category || '',
      sort_order: video.sort_order,
      is_visible: video.is_visible,
    })
    setEditingId(video.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', video_url: '', thumbnail: '', category: '', sort_order: 0, is_visible: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleFileUpload = async (type: 'video' | 'thumbnail', file: File) => {
    setUploading(type)
    const fd = new FormData()
    fd.append(type, file)

    try {
      const endpoint = type === 'video'
        ? '/api/admin/portfolio-videos/upload-video'
        : '/api/admin/portfolio-videos/upload-thumbnail'
      const response = await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
      const path = response.data.data.path
      if (type === 'video') {
        setFormData(prev => ({ ...prev, video_url: path }))
      } else {
        setFormData(prev => ({ ...prev, thumbnail: path }))
      }
      toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} uploaded`)
    } catch {
      toast.error(`Failed to upload ${type}`)
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Portfolio Videos</h1>
          <p className="text-dark-500 dark:text-dark-400">Manage video content on the portfolio page</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Video
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            {editingId ? 'Edit Video' : 'Add New Video'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Product Marketing, Brand Story"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Video URL + Upload */}
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Video URL *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="/videos/portfolio/video.mp4"
                  className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  uploading === 'video'
                    ? 'bg-dark-200 dark:bg-dark-600 text-dark-500'
                    : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                }`}>
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  {uploading === 'video' ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    disabled={uploading === 'video'}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('video', file)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Thumbnail URL + Upload */}
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Thumbnail URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="/images/portfolio/thumb.jpg"
                  className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  uploading === 'thumbnail'
                    ? 'bg-dark-200 dark:bg-dark-600 text-dark-500'
                    : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                }`}>
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  {uploading === 'thumbnail' ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading === 'thumbnail'}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('thumbnail', file)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-dark-700 dark:text-dark-300">Visible</span>
                </label>
              </div>
            </div>

            {/* Video Preview */}
            {formData.video_url && (
              <div className="border border-dark-200 dark:border-dark-600 rounded-lg p-3">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-2">Video Preview</p>
                <video
                  src={formData.video_url}
                  controls
                  className="w-full max-h-48 rounded"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn btn-primary"
              >
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-dark-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      {isLoading ? (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-12 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50">
                {/* Thumbnail / Play */}
                <div
                  className="w-32 h-20 flex-shrink-0 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden relative cursor-pointer group"
                  onClick={() => setPreviewUrl(previewUrl === video.video_url ? null : video.video_url)}
                >
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircleIcon className="w-8 h-8 text-dark-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircleIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-dark-900 dark:text-white truncate">{video.title}</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 truncate">{video.video_url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {video.category && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                        {video.category}
                      </span>
                    )}
                    <span className="text-xs text-dark-400">Order: {video.sort_order}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    video.is_visible
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {video.is_visible ? <EyeIcon className="w-4 h-4 inline" /> : <EyeSlashIcon className="w-4 h-4 inline" />}
                  </span>
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this video?')) {
                        deleteMutation.mutate(video.id)
                      }
                    }}
                    className="p-2 text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-12 text-center text-dark-500 dark:text-dark-400">
          No portfolio videos yet. Add your first video to get started.
        </div>
      )}

      {/* Video Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <video src={previewUrl} controls autoPlay className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
