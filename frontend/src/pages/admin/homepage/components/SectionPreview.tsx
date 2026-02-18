interface SectionPreviewProps {
  sectionKey: string
}

export default function SectionPreview({ sectionKey }: SectionPreviewProps) {
  const previews: Record<string, React.ReactNode> = {
    hero: (
      <div className="w-full h-full bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950 rounded-md flex flex-col items-center justify-end p-4 pb-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(127,29,29,0.15),transparent_70%)]" />
        {/* Play button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-l-white/90 border-y-[5px] border-y-transparent ml-1" />
          </div>
        </div>
        {/* Bottom text overlay */}
        <div className="relative z-10 w-full space-y-1.5">
          <div className="w-3/4 h-2 bg-white/70 rounded-full mx-auto" />
          <div className="w-1/2 h-1.5 bg-white/30 rounded-full mx-auto" />
          <div className="flex justify-center gap-2 pt-1">
            <div className="w-14 h-4 bg-primary-500/80 rounded-sm" />
            <div className="w-14 h-4 border border-white/30 rounded-sm" />
          </div>
        </div>
      </div>
    ),

    brand_statement: (
      <div className="w-full h-full bg-gradient-to-b from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 rounded-md flex flex-col items-center justify-center gap-2.5 p-4">
        <div className="w-6 h-0.5 bg-primary-500 rounded-full" />
        <div className="w-3/4 h-2.5 bg-dark-800 dark:bg-white rounded-full" />
        <div className="w-1/2 h-1.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
      </div>
    ),

    hero_products: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-800 rounded-md flex items-center justify-center gap-2 px-3 py-4">
        {[0.85, 1, 0.85, 1, 0.85].map((scale, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 items-center" style={{ opacity: scale }}>
            <div className="w-full aspect-[3/4] bg-white dark:bg-dark-700 rounded-sm shadow-sm border border-dark-100 dark:border-dark-600 flex items-center justify-center">
              <div className="w-3/5 h-3/5 bg-dark-100 dark:bg-dark-600 rounded-sm" />
            </div>
            <div className="w-full h-0.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
            <div className="w-2/3 h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
          </div>
        ))}
      </div>
    ),

    stats: (
      <div className="w-full h-full bg-gradient-to-r from-dark-800 to-dark-900 rounded-md flex items-center justify-around px-4 py-3">
        {[
          { val: '35+', lbl: 'Years' },
          { val: '500K', lbl: 'Customers' },
          { val: '10+', lbl: 'Cities' },
          { val: '98%', lbl: 'Rating' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] font-bold text-primary-400 leading-none">{s.val}</span>
            <span className="text-[7px] text-dark-400 uppercase tracking-wider">{s.lbl}</span>
          </div>
        ))}
      </div>
    ),

    categories: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-800 rounded-md flex gap-2.5 p-3">
        {/* Video area */}
        <div className="w-[45%] bg-dark-800 dark:bg-dark-900 rounded-sm flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
          <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[5px] border-l-white/80 border-y-[3px] border-y-transparent ml-0.5" />
          </div>
        </div>
        {/* Category list */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {['Kitchen Hoods', 'Air Fryers', 'Ovens'].map((name, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-sm ${i === 0 ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-dark-700 border border-transparent'}`}>
              <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-dark-300 dark:bg-dark-500'}`} />
              <span className={`text-[7px] font-medium ${i === 0 ? 'text-primary-700 dark:text-primary-300' : 'text-dark-500 dark:text-dark-400'}`}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    features: (
      <div className="w-full h-full bg-white dark:bg-dark-800 rounded-md grid grid-cols-2 gap-2 p-3">
        {[
          { color: 'bg-blue-500', label: 'Free Delivery' },
          { color: 'bg-emerald-500', label: 'Warranty' },
          { color: 'bg-violet-500', label: 'Support 24/7' },
          { color: 'bg-amber-500', label: 'Easy Returns' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-dark-50 dark:bg-dark-700/50 rounded-sm px-2 py-1.5">
            <div className={`w-4 h-4 ${f.color} rounded-full flex-shrink-0 flex items-center justify-center`}>
              <div className="w-2 h-2 border-l border-b border-white rotate-[-45deg] mb-0.5" />
            </div>
            <span className="text-[7px] font-medium text-dark-600 dark:text-dark-300 truncate">{f.label}</span>
          </div>
        ))}
      </div>
    ),

    bestsellers: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-800 rounded-md flex items-center px-2 py-3 relative overflow-hidden">
        <div className="flex gap-2 pl-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-12 flex-shrink-0 flex flex-col gap-1">
              <div className="aspect-square bg-white dark:bg-dark-700 rounded-sm shadow-sm border border-dark-100 dark:border-dark-600 flex items-center justify-center">
                <div className="w-2/3 h-2/3 bg-dark-100 dark:bg-dark-600 rounded-sm" />
              </div>
              <div className="w-full h-0.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
              <div className="w-3/5 h-0.5 bg-primary-400/60 rounded-full" />
            </div>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-dark-50 dark:from-dark-800 to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-dark-50 dark:from-dark-800 to-transparent" />
      </div>
    ),

    bundles: (
      <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-md flex items-center justify-center gap-3 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3.5L20 7.5V16.5L12 20.5L4 16.5V7.5L12 3.5Z" />
              <path d="M12 12L20 7.5M12 12L4 7.5M12 12V20.5" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <div className="w-16 h-2 bg-white/70 rounded-full" />
            <div className="w-20 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    ),

    banner_carousel: (
      <div className="w-full h-full bg-dark-100 dark:bg-dark-700 rounded-md relative flex items-center justify-center overflow-hidden">
        {/* Banner image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-200/80 dark:from-dark-600/80 via-transparent to-dark-200/80 dark:to-dark-600/80" />
        {/* Left arrow */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/90 dark:bg-dark-500 rounded-full flex items-center justify-center shadow-sm">
          <div className="w-0 h-0 border-r-[4px] border-r-dark-600 dark:border-r-dark-200 border-y-[3px] border-y-transparent mr-0.5" />
        </div>
        {/* Right arrow */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/90 dark:bg-dark-500 rounded-full flex items-center justify-center shadow-sm">
          <div className="w-0 h-0 border-l-[4px] border-l-dark-600 dark:border-l-dark-200 border-y-[3px] border-y-transparent ml-0.5" />
        </div>
        {/* Center content */}
        <div className="relative space-y-1.5 text-center px-8">
          <div className="w-20 h-2 bg-dark-500 dark:bg-dark-300 rounded-full mx-auto" />
          <div className="w-14 h-1 bg-dark-300 dark:bg-dark-500 rounded-full mx-auto" />
          <div className="w-12 h-3.5 bg-primary-500 rounded-sm mx-auto mt-1.5" />
        </div>
        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-4 h-1 rounded-full bg-primary-500" />
          <div className="w-1 h-1 rounded-full bg-dark-400" />
          <div className="w-1 h-1 rounded-full bg-dark-400" />
        </div>
      </div>
    ),

    dealer_cta: (
      <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-950 rounded-md flex flex-col items-center justify-center gap-2 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(127,29,29,0.1),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="px-3 py-0.5 rounded-full border border-primary-500/30 bg-primary-500/10">
            <span className="text-[6px] text-primary-400 font-medium uppercase tracking-wider">Partnership</span>
          </div>
          <div className="w-24 h-2 bg-white/70 rounded-full" />
          <div className="w-16 h-1 bg-white/25 rounded-full" />
          <div className="flex gap-2 mt-1">
            <div className="w-12 h-4 bg-primary-500 rounded-sm" />
            <div className="w-12 h-4 border border-white/25 rounded-sm" />
          </div>
        </div>
      </div>
    ),

    testimonials: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-800 rounded-md flex items-stretch justify-center gap-2 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex-1 bg-white dark:bg-dark-700 rounded-sm p-2 flex flex-col shadow-sm border border-dark-100 dark:border-dark-600 ${i === 1 ? 'scale-[1.02]' : 'opacity-80'}`}>
            {/* Stars */}
            <div className="flex gap-px mb-1.5">
              {[...Array(5)].map((_, j) => (
                <span key={j} className="text-[8px] text-yellow-400 leading-none">&#9733;</span>
              ))}
            </div>
            {/* Text lines */}
            <div className="space-y-1 flex-1">
              <div className="w-full h-0.5 bg-dark-200 dark:bg-dark-500 rounded-full" />
              <div className="w-4/5 h-0.5 bg-dark-200 dark:bg-dark-500 rounded-full" />
            </div>
            {/* Avatar + name */}
            <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-dark-100 dark:border-dark-600">
              <div className="w-3.5 h-3.5 rounded-full bg-dark-200 dark:bg-dark-500" />
              <div className="w-8 h-0.5 bg-dark-300 dark:bg-dark-500 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ),

    about: (
      <div className="w-full h-full bg-white dark:bg-dark-800 rounded-md flex gap-3 p-3">
        {/* Image */}
        <div className="w-[40%] bg-dark-100 dark:bg-dark-700 rounded-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-200 dark:from-dark-600 to-transparent" />
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <div className="w-8 h-1 bg-primary-500/60 rounded-full" />
          </div>
        </div>
        {/* Text */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="px-2 py-0.5 w-fit rounded-full bg-primary-50 dark:bg-primary-900/30">
            <span className="text-[6px] text-primary-600 dark:text-primary-400 font-medium">About Us</span>
          </div>
          <div className="w-full h-2 bg-dark-800 dark:bg-white rounded-full" />
          <div className="space-y-1">
            <div className="w-full h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
            <div className="w-full h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
            <div className="w-3/4 h-0.5 bg-dark-200 dark:bg-dark-600 rounded-full" />
          </div>
          <div className="w-14 h-3.5 bg-primary-500 rounded-sm mt-0.5" />
        </div>
      </div>
    ),

    notable_clients: (
      <div className="w-full h-full bg-dark-50 dark:bg-dark-800 rounded-md flex flex-col items-center justify-center gap-2.5 p-3">
        <div className="text-[7px] text-dark-400 dark:text-dark-500 uppercase tracking-widest font-medium">Trusted By</div>
        <div className="flex items-center justify-center gap-3 w-full">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-10 h-6 bg-white dark:bg-dark-700 rounded-sm border border-dark-200 dark:border-dark-600 flex items-center justify-center shadow-sm" style={{ opacity: i === 0 || i === 4 ? 0.5 : 0.85 }}>
              <div className="w-5 h-3 border border-dark-200 dark:border-dark-500 rounded-[1px]" />
            </div>
          ))}
        </div>
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
