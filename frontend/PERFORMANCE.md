# Performance Optimization Guide

## Goal: Sub-500ms Load Time with Premium Animations

This document outlines the performance optimizations implemented to achieve fast loading times while maintaining high-quality animations.

## Key Optimizations

### 1. Code Splitting & Lazy Loading

**Vite Configuration** (`vite.config.ts`):
- Split bundles by priority:
  - `vendor-core`: React essentials (highest priority)
  - `animations`: Framer Motion (lazy loaded)
  - `ui-components`: Headless UI
  - `icons-outline` & `icons-solid`: Split icon sets
  - Separate chunks for data-query, toast, state management

**Benefits:**
- Smaller initial bundle size
- Parallel loading of non-critical resources
- Better caching (separate hashes per chunk)

### 2. Critical Path Optimization

**index.html**:
- Resource hints: `preconnect`, `dns-prefetch`
- Inline critical CSS for instant theme rendering
- Async font loading with fallback
- Initial skeleton to prevent layout shift

**main.tsx**:
- Preload hero image and logo before React hydration
- Performance tracking in production

### 3. Animation Performance

**CSS Animations** (`index.css`):
- GPU-accelerated properties only (transform, opacity)
- `@media (prefers-reduced-motion)` for accessibility
- Deferred animations loaded after page interactive
- `will-change` auto-cleanup to free resources

**Animation Config** (`lib/animationConfig.ts`):
- Detect low-end devices and disable heavy animations
- Consistent easing functions for smooth motion
- Will-change manager for better performance
- Intersection Observer for scroll-based animations

### 4. Image Optimization

**OptimizedImage Component**:
- Lazy loading with Intersection Observer
- Blur-up placeholder effect
- Priority loading for above-the-fold images
- GPU-accelerated fade-in transitions

### 5. Performance Monitoring

**Performance Utils** (`lib/performance.ts`):
- Track page load time
- FPS monitor for animation smoothness
- DOM batching to prevent layout thrashing
- Automatic detection of performance bottlenecks

### 6. Progressive Enhancement

**usePerformance Hook**:
- Defer non-critical animations until after initial load
- Use `requestIdleCallback` to avoid blocking
- Fallback for browsers without idle callback

## Performance Checklist

### Build Time
- [ ] Enable production build: `npm run build`
- [ ] Check bundle sizes: all chunks < 200KB
- [ ] Verify code splitting in `dist/assets`
- [ ] Test gzip compression

### Runtime
- [ ] Initial load < 500ms (test with throttled network)
- [ ] Time to Interactive < 1s
- [ ] FPS stays above 30fps during animations
- [ ] No layout shifts (CLS < 0.1)
- [ ] Largest Contentful Paint < 2.5s

### Accessibility
- [ ] Respects `prefers-reduced-motion`
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast ratios meet WCAG AA

## Best Practices

### DO
✅ Use CSS animations for simple transitions
✅ Use `transform` and `opacity` for animations
✅ Lazy load below-the-fold content
✅ Preload critical resources
✅ Split code by route and priority
✅ Monitor performance in production

### DON'T
❌ Animate width, height, or layout properties
❌ Use JavaScript when CSS animations suffice
❌ Load all animations upfront
❌ Keep `will-change` indefinitely
❌ Ignore user preferences
❌ Block the main thread

## Testing Performance

### Chrome DevTools
1. Open DevTools → Performance tab
2. Click Record → Reload page
3. Check:
   - FCP (First Contentful Paint) < 500ms
   - TTI (Time to Interactive) < 1s
   - No long tasks > 50ms

### Lighthouse
```bash
npm run build
npx http-server dist
# Open Chrome → DevTools → Lighthouse
# Run audit for Performance
# Target: 90+ score
```

### Network Throttling
1. DevTools → Network tab
2. Set to "Fast 3G" or "Slow 3G"
3. Reload and verify:
   - Skeleton shows immediately
   - Critical content loads first
   - Animations deferred until interactive

## Optimization Opportunities

### Future Improvements
1. **CDN Integration**: Use image CDN for automatic optimization
2. **Service Worker**: Cache static assets for instant repeat visits
3. **HTTP/2 Server Push**: Push critical CSS/JS
4. **WebP/AVIF Images**: Modern formats for smaller sizes
5. **Bundle Analysis**: Use `vite-bundle-visualizer` to find bloat

### Advanced Techniques
- Virtual scrolling for long lists
- Skeleton screens for perceived performance
- Predictive prefetching for route transitions
- Progressive image loading (LQIP)

## Monitoring in Production

Track these metrics via analytics:

```javascript
// Send to analytics service
{
  pageLoadTime: number,    // Total load time
  ttfb: number,             // Time to First Byte
  fcp: number,              // First Contentful Paint
  lcp: number,              // Largest Contentful Paint
  fid: number,              // First Input Delay
  cls: number,              // Cumulative Layout Shift
}
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Framer Motion Optimization](https://www.framer.com/motion/guide-performance/)
