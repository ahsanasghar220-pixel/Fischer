interface SectionPreviewProps {
  sectionKey: string
}

export default function SectionPreview({ sectionKey }: SectionPreviewProps) {
  const previews: Record<string, React.ReactNode> = {
    hero: (
      <div className="w-full h-full bg-gradient-to-b from-dark-700 to-dark-900 rounded flex flex-col items-center justify-center p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-transparent" />
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[6px] border-l-white/80 border-y-[4px] border-y-transparent ml-0.5" />
          </div>
          <div className="w-16 h-1.5 bg-white/60 rounded-full" />
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    ),
    brand_statement: (
      <div className="w-full h-full bg-white dark:bg-dark-700 rounded flex flex-col items-center justify-center gap-2 p-3">
        <div className="w-20 h-2 bg-dark-800 dark:bg-dark-200 rounded-full" />
        <div className="w-14 h-1.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
      </div>
    ),
    hero_products: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex items-center justify-center gap-1.5 p-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 max-w-[18%] flex flex-col gap-1">
            <div className="aspect-square bg-dark-200 dark:bg-dark-600 rounded" />
            <div className="w-full h-1 bg-dark-300 dark:bg-dark-500 rounded-full" />
            <div className="w-3/4 h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
          </div>
        ))}
      </div>
    ),
    stats: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex items-center justify-center gap-3 p-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{['35+', '500K', '10+', '98%'][i]}</div>
            <div className="w-full h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
          </div>
        ))}
      </div>
    ),
    categories: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex gap-2 p-3">
        <div className="w-1/2 bg-dark-200 dark:bg-dark-600 rounded flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border border-dark-300 dark:border-dark-500 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[4px] border-l-dark-400 border-y-[3px] border-y-transparent ml-0.5" />
          </div>
        </div>
        <div className="w-1/2 flex flex-col justify-center gap-1.5">
          <div className="w-full h-1.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
          <div className="w-3/4 h-1 bg-dark-200 dark:bg-dark-600 rounded-full" />
          <div className="w-1/2 h-1 bg-dark-200 dark:bg-dark-600 rounded-full" />
        </div>
      </div>
    ),
    features: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded grid grid-cols-2 gap-1.5 p-3">
        {['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400'].map((color, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-white dark:bg-dark-600 rounded p-1.5">
            <div className={`w-4 h-4 ${color} rounded-full flex-shrink-0 opacity-70`} />
            <div className="flex-1 space-y-0.5">
              <div className="w-full h-1 bg-dark-300 dark:bg-dark-500 rounded-full" />
              <div className="w-2/3 h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ),
    bestsellers: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex items-center p-3 relative overflow-hidden">
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-10 flex-shrink-0 flex flex-col gap-0.5">
              <div className="aspect-square bg-dark-200 dark:bg-dark-600 rounded" />
              <div className="w-full h-0.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
              <div className="w-2/3 h-0.5 bg-primary-400/50 rounded-full" />
            </div>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-dark-50 dark:from-dark-700" />
      </div>
    ),
    bundles: (
      <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800 rounded flex items-center justify-center gap-2 p-3">
        <div className="w-6 h-6 text-white/80">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
        </div>
        <div className="space-y-1">
          <div className="w-14 h-1.5 bg-white/70 rounded-full" />
          <div className="w-10 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    ),
    banner_carousel: (
      <div className="w-full h-full bg-dark-200 dark:bg-dark-600 rounded relative flex items-center justify-center p-3 overflow-hidden">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 dark:bg-dark-400 rounded-full flex items-center justify-center">
          <div className="w-0 h-0 border-r-[3px] border-r-dark-600 dark:border-r-dark-200 border-y-[2px] border-y-transparent mr-0.5" />
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 dark:bg-dark-400 rounded-full flex items-center justify-center">
          <div className="w-0 h-0 border-l-[3px] border-l-dark-600 dark:border-l-dark-200 border-y-[2px] border-y-transparent ml-0.5" />
        </div>
        <div className="space-y-1 text-center">
          <div className="w-16 h-1.5 bg-dark-400 dark:bg-dark-300 rounded-full mx-auto" />
          <div className="w-10 h-1 bg-dark-300 dark:bg-dark-500 rounded-full mx-auto" />
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-dark-300 dark:bg-dark-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-dark-300 dark:bg-dark-500" />
        </div>
      </div>
    ),
    dealer_cta: (
      <div className="w-full h-full bg-dark-800 dark:bg-dark-900 rounded flex flex-col items-center justify-center gap-1.5 p-3">
        <div className="w-16 h-1.5 bg-white/60 rounded-full" />
        <div className="w-12 h-1 bg-white/30 rounded-full" />
        <div className="w-10 h-3 bg-primary-500 rounded mt-1" />
      </div>
    ),
    testimonials: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex items-center justify-center gap-1.5 p-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 bg-white dark:bg-dark-600 rounded p-1.5 space-y-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-1.5 h-1.5 text-yellow-400 text-[6px] leading-none">&#9733;</div>
              ))}
            </div>
            <div className="w-full h-0.5 bg-dark-200 dark:bg-dark-500 rounded-full" />
            <div className="w-2/3 h-0.5 bg-dark-200 dark:bg-dark-500 rounded-full" />
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full bg-dark-200 dark:bg-dark-500" />
              <div className="w-6 h-0.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ),
    about: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex gap-2 p-3">
        <div className="w-1/2 bg-dark-200 dark:bg-dark-600 rounded" />
        <div className="w-1/2 flex flex-col justify-center gap-1.5">
          <div className="w-8 h-1 bg-primary-400 rounded-full" />
          <div className="w-full h-1.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
          <div className="w-full h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
          <div className="w-3/4 h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
          <div className="w-10 h-2.5 bg-primary-500 rounded mt-1" />
        </div>
      </div>
    ),
    notable_clients: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-700 rounded flex items-center justify-center gap-2 p-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-8 h-5 bg-dark-200 dark:bg-dark-600 rounded flex items-center justify-center">
            <div className="w-4 h-2.5 border border-dark-300 dark:border-dark-500 rounded-sm" />
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-dark-100 dark:border-dark-700">
      {previews[sectionKey] || (
        <div className="w-full h-full bg-dark-100 dark:bg-dark-700 rounded flex items-center justify-center text-dark-400 text-xs">
          Preview
        </div>
      )}
    </div>
  )
}
