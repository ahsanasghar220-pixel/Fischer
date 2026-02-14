<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomepageCategory;
use App\Models\HomepageProduct;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HomepageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default homepage sections
        $sections = [
            [
                'key' => 'hero',
                'title' => 'Hero Banner',
                'subtitle' => null,
                'is_enabled' => true,
                'sort_order' => 1,
                'settings' => json_encode([
                    'auto_slide' => true,
                    'slide_interval' => 6000,
                    'show_navigation' => true,
                    'show_indicators' => true,
                    'video_url' => '/videos/hero-video.mp4?v=4',
                ]),
            ],
            [
                'key' => 'brand_statement',
                'title' => 'Premium Appliances',
                'subtitle' => 'Crafted for Pakistan Since 1990',
                'is_enabled' => true,
                'sort_order' => 2,
                'settings' => json_encode([]),
            ],
            [
                'key' => 'hero_products',
                'title' => 'Discover Fischer Essentials',
                'subtitle' => 'Designed Appliances for Modern Living',
                'is_enabled' => true,
                'sort_order' => 3,
                'settings' => json_encode([
                    'badge_text' => 'Our Bestsellers',
                    'products' => [
                        [
                            'name' => 'Built-in Hood',
                            'category' => 'Ventilation Solutions',
                            'images' => [
                                '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
                                '/images/products/kitchen-hoods/FKH-T90-04SC/1.webp',
                            ],
                            'href' => '/category/kitchen-hoods',
                            'description' => 'Powerful airflow up to 1500 m³/h',
                        ],
                        [
                            'name' => 'Built-in Hob',
                            'category' => 'Cooking Solutions',
                            'images' => [
                                '/images/products/kitchen-hobs/FBH-G78-3CB/1.webp',
                                '/images/products/kitchen-hobs/FBH-G90-5SBF/1.webp',
                                '/images/products/kitchen-hobs/FBH-SS76-3CB/1.webp',
                            ],
                            'href' => '/category/kitchen-hobs',
                            'description' => 'Premium brass burners with auto ignition',
                        ],
                        [
                            'name' => 'Oven Toaster',
                            'category' => 'Baking Excellence',
                            'images' => [
                                '/images/products/oven-toasters/FOT-2501C/1.webp',
                                '/images/products/oven-toasters/FOT-2501C/2.webp',
                                '/images/products/oven-toasters/FOT-1901D/1.webp',
                            ],
                            'href' => '/category/oven-toasters',
                            'description' => 'Convection technology, 35L-48L capacity',
                        ],
                        [
                            'name' => 'Air Fryer',
                            'category' => 'Healthy Living',
                            'images' => [
                                '/images/products/air-fryers/FAF-801WD/1.webp',
                                '/images/products/air-fryers/FAF-601WD/1.webp',
                                '/images/products/air-fryers/FAF-401WD/1.webp',
                            ],
                            'href' => '/category/air-fryers',
                            'description' => 'Oil-free frying with digital controls',
                        ],
                        [
                            'name' => 'Water Dispenser',
                            'category' => 'Water Solutions',
                            'images' => [
                                '/images/products/water-dispensers/1.webp',
                                '/images/products/water-dispensers/2.webp',
                                '/images/products/water-dispensers/3.webp',
                            ],
                            'href' => '/category/water-dispensers',
                            'description' => 'Hot & cold, food-grade stainless steel',
                        ],
                    ],
                ]),
            ],
            [
                'key' => 'stats',
                'title' => 'Statistics',
                'subtitle' => null,
                'is_enabled' => true,
                'sort_order' => 4,
                'settings' => json_encode([
                    'background' => 'white',
                    'style' => 'cards',
                ]),
            ],
            [
                'key' => 'features',
                'title' => 'Why Choose Fischer',
                'subtitle' => null,
                'is_enabled' => true,
                'sort_order' => 5,
                'settings' => json_encode([
                    'columns' => 4,
                    'style' => 'cards',
                ]),
            ],
            [
                'key' => 'categories',
                'title' => 'Explore Our Collections',
                'subtitle' => 'Each category carefully curated with premium quality and innovative designs',
                'is_enabled' => true,
                'sort_order' => 6,
                'settings' => json_encode([
                    'display_count' => 10,
                    'show_product_count' => true,
                    'columns' => 5,
                    'style' => 'grid',
                    'category_videos' => [
                        'kitchen-hoods' => '/videos/categories/built-in-hoods.mp4',
                        'kitchen-hobs' => '/videos/categories/built-in-hobs.mp4',
                        'oven-toasters' => '/videos/categories/oven-toasters.mp4',
                        'air-fryers' => '/videos/categories/air-fryers.mp4',
                    ],
                ]),
            ],
            [
                'key' => 'featured_products',
                'title' => 'Featured Products',
                'subtitle' => 'Our most popular appliances loved by customers across Pakistan',
                'is_enabled' => true,
                'sort_order' => 7,
                'settings' => json_encode([
                    'display_count' => 10,
                    'source' => 'manual',
                    'columns' => 5,
                ]),
            ],
            [
                'key' => 'bestsellers',
                'title' => 'Best Sellers',
                'subtitle' => 'Top-rated appliances trusted by thousands of Pakistani homes',
                'is_enabled' => true,
                'sort_order' => 8,
                'settings' => json_encode([
                    'display_count' => 10,
                    'source' => 'auto',
                ]),
            ],
            [
                'key' => 'dealer_cta',
                'title' => 'Become a Fischer Authorized Dealer',
                'subtitle' => 'Join our nationwide network of 500+ dealers and grow your business with Pakistan\'s most trusted appliance brand.',
                'is_enabled' => true,
                'sort_order' => 9,
                'settings' => json_encode([
                    'badge_text' => 'Partnership Opportunity',
                    'button_text' => 'Apply Now',
                    'button_link' => '/become-dealer',
                    'secondary_button_text' => 'Contact Sales',
                    'secondary_button_link' => '/contact',
                    'benefits' => [
                        ['title' => 'Exclusive Margins', 'description' => 'Competitive dealer margins & incentives', 'icon' => "\u{1F4B0}"],
                        ['title' => 'Marketing Support', 'description' => 'Co-branded marketing materials', 'icon' => "\u{1F4E2}"],
                        ['title' => 'Training Programs', 'description' => 'Product & sales training', 'icon' => "\u{1F393}"],
                        ['title' => 'Priority Support', 'description' => 'Dedicated dealer support line', 'icon' => "\u{1F3AF}"],
                    ],
                ]),
            ],
            [
                'key' => 'new_arrivals',
                'title' => 'New Arrivals',
                'subtitle' => 'Check out our latest additions to the catalog',
                'is_enabled' => true,
                'sort_order' => 10,
                'settings' => json_encode([
                    'display_count' => 8,
                    'days_threshold' => 30,
                    'source' => 'manual',
                    'columns' => 4,
                ]),
            ],
            [
                'key' => 'testimonials',
                'title' => 'What Our Customers Say',
                'subtitle' => 'Trusted by thousands of Pakistani households and businesses',
                'is_enabled' => true,
                'sort_order' => 11,
                'settings' => json_encode([
                    'display_count' => 5,
                    'auto_slide' => true,
                    'slide_interval' => 5000,
                ]),
            ],
            [
                'key' => 'about',
                'title' => 'Pakistan\'s Most Trusted Appliance Brand',
                'subtitle' => null,
                'is_enabled' => true,
                'sort_order' => 12,
                'settings' => json_encode([
                    'badge_text' => 'About Fischer',
                    'content' => 'Established in 1990, Fischer (Fatima Engineering Works) has been at the forefront of manufacturing high-quality home and commercial appliances. With over three decades of excellence, we\'ve become a household name trusted by millions across Pakistan.',
                    'image' => '/images/about-factory.webp',
                    'fallback_image' => '/images/about-fischer.webp',
                    'button_text' => 'Learn More About Us',
                    'button_link' => '/about',
                    'show_badges' => true,
                    'features' => [
                        'ISO 9001:2015 & PSQCA Certified',
                        'Made in Pakistan with premium materials',
                        'Nationwide service & support network',
                        'Dedicated R&D for continuous innovation',
                    ],
                ]),
            ],
            [
                'key' => 'newsletter',
                'title' => 'Get Exclusive Offers',
                'subtitle' => 'Subscribe to get exclusive offers, new product announcements, and tips for your home appliances.',
                'is_enabled' => true,
                'sort_order' => 13,
                'settings' => json_encode([
                    'placeholder' => 'Enter your email address',
                    'button_text' => 'Subscribe',
                    'disclaimer' => 'No spam, unsubscribe anytime.',
                ]),
            ],
        ];

        foreach ($sections as $section) {
            DB::table('homepage_sections')->updateOrInsert(
                ['key' => $section['key']],
                array_merge($section, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // Default stats
        $stats = [
            ['label' => 'Years Experience', 'value' => '35+', 'icon' => 'star', 'sort_order' => 1],
            ['label' => 'Happy Customers', 'value' => '500K+', 'icon' => 'users', 'sort_order' => 2],
            ['label' => 'Dealers Nationwide', 'value' => '500+', 'icon' => 'cube', 'sort_order' => 3],
            ['label' => 'Products Sold', 'value' => '1M+', 'icon' => 'fire', 'sort_order' => 4],
        ];

        foreach ($stats as $stat) {
            DB::table('homepage_stats')->updateOrInsert(
                ['label' => $stat['label']],
                array_merge($stat, [
                    'is_visible' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // Default features
        $features = [
            [
                'title' => 'Free Nationwide Delivery',
                'description' => 'Free shipping on orders above PKR 10,000 across Pakistan',
                'icon' => 'truck',
                'color' => 'blue',
                'sort_order' => 1,
            ],
            [
                'title' => '1 Year Warranty',
                'description' => 'Official warranty on all products with dedicated support',
                'icon' => 'shield',
                'color' => 'green',
                'sort_order' => 2,
            ],
            [
                'title' => 'Flexible Payment',
                'description' => 'Multiple payment options including COD & Easy Installments',
                'icon' => 'credit-card',
                'color' => 'purple',
                'sort_order' => 3,
            ],
            [
                'title' => '24/7 Support',
                'description' => 'Round-the-clock customer service and technical support',
                'icon' => 'phone',
                'color' => 'orange',
                'sort_order' => 4,
            ],
        ];

        foreach ($features as $feature) {
            DB::table('homepage_features')->updateOrInsert(
                ['title' => $feature['title']],
                array_merge($feature, [
                    'is_visible' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // Default testimonials
        $testimonials = [
            [
                'customer_name' => 'Ahmed Khan',
                'customer_designation' => 'Homeowner',
                'customer_company' => 'Lahore',
                'content' => 'Fischer water cooler has been serving our office for 3 years without any issues. Excellent build quality and after-sales service.',
                'rating' => 5,
                'customer_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                'sort_order' => 1,
            ],
            [
                'customer_name' => 'Sara Malik',
                'customer_designation' => 'Restaurant Owner',
                'customer_company' => null,
                'content' => 'We installed Fischer cooking ranges in our restaurant. The performance is outstanding and very fuel efficient.',
                'rating' => 5,
                'customer_image' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                'sort_order' => 2,
            ],
            [
                'customer_name' => 'Usman Ali',
                'customer_designation' => 'Dealer',
                'customer_company' => 'Karachi',
                'content' => 'Being a Fischer dealer for 10 years, I can vouch for their product quality and excellent dealer support program.',
                'rating' => 5,
                'customer_image' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                'sort_order' => 3,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            DB::table('testimonials')->updateOrInsert(
                ['customer_name' => $testimonial['customer_name']],
                array_merge($testimonial, [
                    'is_featured' => true,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // Default trust badges
        $badges = [
            ['title' => 'ISO 9001:2015', 'sort_order' => 1],
            ['title' => 'PSQCA Certified', 'sort_order' => 2],
            ['title' => 'Made in Pakistan', 'sort_order' => 3],
            ['title' => 'CE Approved', 'sort_order' => 4],
            ['title' => 'Eco Friendly', 'sort_order' => 5],
        ];

        foreach ($badges as $badge) {
            DB::table('homepage_trust_badges')->updateOrInsert(
                ['title' => $badge['title']],
                array_merge($badge, [
                    'is_visible' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // Seed homepage categories - all 10 featured parent categories
        $this->seedHomepageCategories();

        // Seed homepage products - featured and new arrivals
        $this->seedHomepageProducts();
    }

    /**
     * Seed homepage categories with all featured parent categories
     */
    private function seedHomepageCategories(): void
    {
        // Clear existing
        HomepageCategory::query()->delete();

        $categorySlugs = [
            'built-in-hoods',
            'built-in-hobs',
            'oven-toasters',
            'air-fryers',
            'water-coolers',
            'blenders-processors',
            'water-dispensers',
            'geysers-heaters',
            'cooking-ranges',
            'room-coolers',
        ];

        foreach ($categorySlugs as $index => $slug) {
            $category = Category::where('slug', $slug)->first();
            if ($category) {
                HomepageCategory::create([
                    'category_id' => $category->id,
                    'sort_order' => $index,
                    'is_visible' => true,
                ]);
            }
        }
    }

    /**
     * Seed homepage products for featured and new_arrivals sections
     */
    private function seedHomepageProducts(): void
    {
        // Clear existing
        HomepageProduct::query()->delete();

        // Featured products - hand-picked bestsellers from each category
        $featuredSkus = [
            'FKH-L90-01IN',    // Kitchen Hood flagship
            'FBH-G90-5SBF',    // 5-burner hob
            'FBH-SS86-3CB',    // Premium hob
            'FHG-25G',         // Hybrid geyser
            'FE-100-SS',       // Water cooler 100L
            'FCR-3BB-DF',      // Cooking range with deep fryer
            'FAF-601WD',       // Air fryer 6L
            'FOT-1901D',       // Oven toaster digital
            'FWD-FOUNTAIN',    // Water dispenser
            'FEW-ECOWATT',     // Eco watt heater
        ];

        foreach ($featuredSkus as $index => $sku) {
            $product = Product::where('sku', $sku)->first();
            if ($product) {
                HomepageProduct::create([
                    'product_id' => $product->id,
                    'section' => 'featured',
                    'sort_order' => $index,
                    'is_visible' => true,
                ]);
            }
        }

        // New arrivals - products marked as is_new
        $newArrivalSkus = [
            'FKH-T90-05S',     // Kitchen Hood new
            'FKH-H90-06S',     // Kitchen Hood new
            'FBH-G78-3CB',     // Hob new
            'FBH-G78-3CB-MATTE', // Hob matte new
            'FAF-401WD',       // Air fryer 4L new
            'FAF-601WD',       // Air fryer 6L new
            'FAF-801WD',       // Air fryer 8L new
            'FOT-2501C',       // Oven toaster new
        ];

        foreach ($newArrivalSkus as $index => $sku) {
            $product = Product::where('sku', $sku)->first();
            if ($product) {
                HomepageProduct::create([
                    'product_id' => $product->id,
                    'section' => 'new_arrivals',
                    'sort_order' => $index,
                    'is_visible' => true,
                ]);
            }
        }
    }
}
