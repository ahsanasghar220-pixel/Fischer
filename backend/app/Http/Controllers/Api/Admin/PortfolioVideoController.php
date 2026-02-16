<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PortfolioVideoController extends Controller
{
    public function index()
    {
        return $this->success(PortfolioVideo::ordered()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'video_url' => 'required|string|max:500',
            'thumbnail' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        $video = PortfolioVideo::create($validated);

        $this->clearCache();

        return $this->success($video, 'Portfolio video created successfully');
    }

    public function update(Request $request, $id)
    {
        $video = PortfolioVideo::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string|max:1000',
            'video_url' => 'string|max:500',
            'thumbnail' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        $video->update($validated);

        $this->clearCache();

        return $this->success($video, 'Portfolio video updated successfully');
    }

    public function destroy($id)
    {
        $video = PortfolioVideo::findOrFail($id);
        $video->delete();

        $this->clearCache();

        return $this->success(null, 'Portfolio video deleted successfully');
    }

    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimes:mp4,webm,mov|max:102400',
        ]);

        $path = $request->file('video')->store('videos/portfolio', 'public');

        return $this->success([
            'path' => '/storage/' . $path,
            'url' => asset('storage/' . $path),
        ], 'Video uploaded successfully');
    }

    public function uploadThumbnail(Request $request)
    {
        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $path = $request->file('thumbnail')->store('videos/portfolio/thumbnails', 'public');

        return $this->success([
            'path' => '/storage/' . $path,
            'url' => asset('storage/' . $path),
        ], 'Thumbnail uploaded successfully');
    }

    protected function clearCache()
    {
        Cache::forget('portfolio_videos');
    }
}
