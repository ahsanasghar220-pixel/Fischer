import { useRef } from 'react'
import { PhotoIcon, TrashIcon, StarIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { Product, ProductImage } from '@/types'

interface FilePreview {
  file: File
  preview: string
}

interface MediaTabProps {
  isNew: boolean
  product?: Product
  pendingFiles: FilePreview[]
  uploadingImages: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePending: (index: number) => void
  onUploadNow: () => void
  onDeleteImage: (imageId: number) => void
  onSetPrimary: (imageId: number) => void
  getImageUrl: (img: ProductImage) => string
  setPrimaryPending: boolean
  deleteImagePending: boolean
}

export default function MediaTab({
  isNew,
  product,
  pendingFiles,
  uploadingImages,
  onFileSelect,
  onRemovePending,
  onUploadNow,
  onDeleteImage,
  onSetPrimary,
  getImageUrl,
  setPrimaryPending,
  deleteImagePending,
}: MediaTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Images</h2>
        {!isNew && pendingFiles.length > 0 && (
          <button
            type="button"
            disabled={uploadingImages}
            onClick={onUploadNow}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            {uploadingImages ? 'Uploading...' : `Upload ${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Existing Images */}
      {!isNew && product?.images && product.images.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">Current images ({product.images.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border-2 border-dark-200 dark:border-dark-600 hover:border-primary-400 transition-colors"
              >
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
                {/* Primary badge */}
                {image.is_primary && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full font-medium">
                    Primary
                  </span>
                )}
                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(image.id)}
                      disabled={setPrimaryPending}
                      className="p-2 bg-white rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors shadow-lg"
                      title="Set as primary"
                    >
                      <StarIcon className="w-5 h-5" />
                    </button>
                  )}
                  {image.is_primary && (
                    <div className="p-2 bg-yellow-500 rounded-lg text-white shadow-lg">
                      <StarIconSolid className="w-5 h-5" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this image?')) {
                        onDeleteImage(image.id)
                      }
                    }}
                    disabled={deleteImagePending}
                    className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors shadow-lg"
                    title="Delete image"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Uploads Preview */}
      {pendingFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">
            {isNew ? 'Images to upload (will be uploaded when product is created)' : 'Pending uploads'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pendingFiles.map((fp, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border-2 border-dashed border-primary-300 dark:border-primary-700"
              >
                <img
                  src={fp.preview}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemovePending(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                  {fp.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Input Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
      >
        <PhotoIcon className="w-10 h-10 mx-auto text-dark-400 dark:text-dark-500 mb-3" />
        <p className="text-dark-600 dark:text-dark-400 font-medium">Click to add images</p>
        <p className="text-dark-400 dark:text-dark-500 text-sm mt-1">JPG, PNG, or WebP (max 2MB each)</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
