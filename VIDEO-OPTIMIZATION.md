# Video Optimization Guide

## Problem
The hero video (`hero-video.mp4`) is **~10MB**, causing slow page loads.

## Solutions Applied

### ✅ 1. Code Optimizations (Already Done)
- Changed `preload="auto"` → `preload="metadata"` (loads only ~500KB initially)
- Added `poster="/images/hero-poster.jpg"` (shows image while video loads)
- Video now loads progressively instead of downloading 10MB upfront

### 🎯 2. Compress the Video (Do This Next)

#### Option A: Automated (Recommended)
```bash
# 1. Install FFmpeg (if not installed)
winget install ffmpeg
# Or download from: https://ffmpeg.org/download.html

# 2. Rename your current video
mv frontend/public/videos/hero-video.mp4 frontend/public/videos/hero-video-original.mp4

# 3. Run compression script
compress-video.bat
```

#### Option B: Manual FFmpeg Commands
```bash
# Compress to ~2-3MB (good quality)
ffmpeg -i frontend/public/videos/hero-video-original.mp4 \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:v libx264 \
  -crf 28 \
  -preset medium \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  frontend/public/videos/hero-video.mp4

# Extract poster image (first frame at 2 seconds)
ffmpeg -i frontend/public/videos/hero-video.mp4 \
  -ss 00:00:02 \
  -vframes 1 \
  frontend/public/images/hero-poster.jpg
```

#### Option C: Online Tools (No Installation)
1. Go to https://www.freeconvert.com/video-compressor
2. Upload your video
3. Target size: **2-3MB**
4. Download compressed video
5. Replace `frontend/public/videos/hero-video.mp4`

### 📊 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Video Size | ~10MB | ~2-3MB |
| Initial Load | 10MB download | ~500KB metadata |
| User Experience | Slow/blank screen | Instant poster image |
| Page Load Time | 5-10s | <1s |

### 🎨 3. Create Poster Image

Extract a nice frame from your video:

```bash
# Extract at 2 seconds (adjust timing as needed)
ffmpeg -i frontend/public/videos/hero-video.mp4 \
  -ss 00:00:02 \
  -vframes 1 \
  -q:v 2 \
  frontend/public/images/hero-poster.jpg
```

Or manually:
1. Open video in VLC/QuickTime
2. Pause at a good frame
3. Take screenshot
4. Save as `frontend/public/images/hero-poster.jpg`

### 🚀 Alternative: Use WebM Format

For even better compression, add WebM version:

```bash
# Create WebM version (~1-2MB, better compression)
ffmpeg -i frontend/public/videos/hero-video-original.mp4 \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -c:a libopus \
  frontend/public/videos/hero-video.webm
```

Then update `Home.tsx`:
```tsx
<video ...>
  <source src={heroVideoUrl.replace('.mp4', '.webm')} type="video/webm" />
  <source src={heroVideoUrl} type="video/mp4" />
</video>
```

### ✨ Best Practices

1. **Resolution**: Max 1920x1080 (1080p is enough for hero videos)
2. **Duration**: Keep under 10 seconds if looping
3. **Frame Rate**: 24-30 fps (not 60fps)
4. **Format**: MP4 (H.264) or WebM (VP9)
5. **Bitrate**: 2-3 Mbps for 1080p
6. **Audio**: 128kbps or remove if not needed

### 📝 Current Implementation

File: `frontend/src/pages/Home.tsx`
```tsx
<video
  preload="metadata"  // ✅ Only loads ~500KB
  poster="/images/hero-poster.jpg"  // ✅ Shows instant image
  autoPlay loop muted playsInline
>
  <source src={heroVideoUrl} type="video/mp4" />
</video>
```

### 🔍 Verify Results

After compression:
1. Check file size: Should be 2-3MB
2. Test page load: Should be instant with poster
3. Check video quality: Should still look good
4. Lighthouse score: Should improve to 90+

### 📦 Files to Update

- `frontend/public/videos/hero-video.mp4` (compress this)
- `frontend/public/images/hero-poster.jpg` (create this)
- `Home.tsx` (already updated ✅)

### ⚠️ Troubleshooting

**Video not loading?**
- Clear browser cache (Ctrl+Shift+R)
- Check file path in browser console
- Verify file exists in `public/videos/`

**Still slow?**
- Check actual file size (should be 2-3MB)
- Try WebM format for better compression
- Consider using a CDN for video hosting

**Poster not showing?**
- Create the image at `public/images/hero-poster.jpg`
- Use 1920x1080 resolution
- Optimize image size (<200KB)
