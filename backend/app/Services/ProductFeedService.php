<?php
namespace App\Services;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductFeedService {
    const CACHE_TTL = 3600; // 1 hour

    public function generateGoogleFeed(): string {
        return Cache::remember('feed_google', self::CACHE_TTL, fn() => $this->buildXmlFeed('google'));
    }

    public function generateMetaFeed(): string {
        return Cache::remember('feed_meta', self::CACHE_TTL, fn() => $this->buildXmlFeed('meta'));
    }

    public function generateTikTokFeed(): string {
        return Cache::remember('feed_tiktok', self::CACHE_TTL, fn() => $this->buildXmlFeed('tiktok'));
    }

    private function buildXmlFeed(string $platform): string {
        $products = Product::with(['images', 'category', 'brand'])
            ->where('is_active', true)
            ->where('stock_status', '!=', 'out_of_stock')
            ->get();

        $baseUrl = config('app.url');
        $xmlStr = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"></rss>';
        $xml = new \SimpleXMLElement($xmlStr);
        $channel = $xml->addChild('channel');
        $channel->addChild('title', 'Fischer Pakistan Products');
        $channel->addChild('link', $baseUrl);

        foreach ($products as $product) {
            $item = $channel->addChild('item');
            $item->addChild('g:id', (string)$product->id, 'http://base.google.com/ns/1.0');
            $item->addChild('g:title', htmlspecialchars($product->name), 'http://base.google.com/ns/1.0');
            $item->addChild('g:description', htmlspecialchars($product->short_description ?? $product->name), 'http://base.google.com/ns/1.0');
            $item->addChild('g:link', $baseUrl . '/product/' . $product->slug, 'http://base.google.com/ns/1.0');
            $item->addChild('g:image_link', $baseUrl . ($product->primary_image ?? ''), 'http://base.google.com/ns/1.0');
            $item->addChild('g:price', number_format($product->price, 2) . ' PKR', 'http://base.google.com/ns/1.0');
            $item->addChild('g:availability', $product->is_in_stock ? 'in stock' : 'out of stock', 'http://base.google.com/ns/1.0');
            $item->addChild('g:brand', $product->brand?->name ?? 'Fischer', 'http://base.google.com/ns/1.0');
            $item->addChild('g:condition', 'new', 'http://base.google.com/ns/1.0');
        }

        return $xml->asXML();
    }
}
