import { useState } from 'react'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import VideoUpload from '@/components/admin/VideoUpload'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface HeroEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string; settings?: Record<string, any> }) => void
  isPending: boolean
}

export default function HeroEditor({ section, open, onClose, onSave, isPending }: HeroEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [videoUrl, setVideoUrl] = useState(section.settings?.video_url || '')
  const [mobileVideoEnabled, setMobileVideoEnabled] = useState<boolean>(
    section.settings?.mobile_video_enabled ?? false
  )

  const handleSave = () => {
    onSave(section.key, { title, subtitle, settings: { ...section.settings, video_url: videoUrl, mobile_video_enabled: mobileVideoEnabled } })
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.hero.label}
      description={SECTION_META.hero.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField
          label="Section Title"
          tooltip="The title appears as an overlay on the hero video. Leave empty to hide."
          helpText="Keep it short and impactful, e.g., 'Premium Home Appliances'"
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Premium Home Appliances"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        <FormField
          label="Section Subtitle"
          tooltip="Smaller text below the title on the hero video overlay."
          helpText="A short tagline, e.g., 'Crafted for Pakistan Since 1990'"
        >
          <textarea
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            rows={2}
            placeholder="Crafted for Pakistan Since 1990"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        <FormField
          label="Background Video"
          tooltip="Upload an MP4 file. Recommended: 1920x1080, under 15MB. Plays muted on loop."
          helpText="The video plays automatically in the background. Visitors see it as soon as they load the homepage."
        >
          <VideoUpload
            currentUrl={videoUrl}
            onUrlChange={setVideoUrl}
            uploadType="hero"
            label=""
            placeholder="/videos/hero-video.mp4"
          />
        </FormField>

        <FormField
          label="Play Video on Mobile"
          tooltip="By default, mobile devices show a static image for faster page load (better LCP score). Enable this to play the video on mobile too."
          helpText="Warning: enabling video on mobile will increase page load time on slower mobile networks."
        >
          <label className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setMobileVideoEnabled(v => !v)}>
            <div className={`relative w-10 h-6 rounded-full transition-colors ${mobileVideoEnabled ? 'bg-primary-600' : 'bg-dark-300 dark:bg-dark-600'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${mobileVideoEnabled ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-dark-700 dark:text-dark-300">
              {mobileVideoEnabled ? 'Video plays on mobile' : 'Static image on mobile (recommended)'}
            </span>
          </label>
        </FormField>
      </div>
    </EditorPanel>
  )
}
