import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Bundle } from '@/api/bundles'
import type { BundleFormData } from './types'

interface MediaTabProps {
  formData: BundleFormData
  setFormData: React.Dispatch<React.SetStateAction<BundleFormData>>
  isEditing: boolean
  bundle: Bundle | undefined
  uploadImages: { isPending: boolean }
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDeleteImage: (imageId: number) => void
}

export default function MediaTab({
  formData,
  setFormData,
  isEditing,
  bundle,
  uploadImages,
  onImageUpload,
  onDeleteImage,
}: MediaTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Video URL
        </label>
        <input
          type="url"
          value={formData.video_url}
          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Bundle Images
          </label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {bundle?.images?.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image}
                  alt={image.alt_text || 'Bundle image'}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {image.is_primary && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
              uploadImages.isPending ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {uploadImages.isPending ? (
              <>
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="mt-2 text-sm text-dark-500">Uploading...</span>
              </>
            ) : (
              <>
                <PhotoIcon className="w-8 h-8 text-dark-400" />
                <span className="mt-2 text-sm text-dark-500">Click to upload images</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              disabled={uploadImages.isPending}
            />
          </label>
        </div>
      )}

      {!isEditing && (
        <p className="text-dark-500 dark:text-dark-400 text-center py-8">
          Save the bundle first to upload images
        </p>
      )}
    </div>
  )
}
