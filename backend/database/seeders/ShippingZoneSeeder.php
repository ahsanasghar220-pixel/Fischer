<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Punjab - Major Cities',
                'cities' => [
                    'Lahore',
                    'Islamabad',
                    'Rawalpindi',
                    'Faisalabad',
                    'Multan',
                    'Gujranwala',
                    'Sialkot',
                    'Sargodha',
                    'Bahawalpur',
                    'Jhang',
                    'Sheikhupura',
                    'Gujrat',
                    'Kasur',
                    'Rahim Yar Khan',
                    'Sahiwal',
                    'Okara',
                    'Wah Cantt',
                    'Dera Ghazi Khan',
                    'Mandi Bahauddin',
                    'Jhelum',
                    'Chakwal',
                    'Attock',
                    'Khanewal',
                    'Muzaffargarh',
                    'Chiniot',
                    'Hafizabad',
                    'Narowal',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Sindh - Major Cities',
                'cities' => [
                    'Karachi',
                    'Hyderabad',
                    'Sukkur',
                    'Larkana',
                    'Nawabshah',
                    'Mirpur Khas',
                    'Jacobabad',
                    'Shikarpur',
                    'Khairpur',
                    'Dadu',
                    'Sanghar',
                    'Badin',
                    'Thatta',
                    'Tando Adam',
                    'Tando Muhammad Khan',
                    'Umerkot',
                    'Ghotki',
                    'Kashmore',
                    'Jamshoro',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Khyber Pakhtunkhwa - Major Cities',
                'cities' => [
                    'Peshawar',
                    'Mardan',
                    'Abbottabad',
                    'Mansehra',
                    'Swat',
                    'Mingora',
                    'Kohat',
                    'Dera Ismail Khan',
                    'Bannu',
                    'Charsadda',
                    'Nowshera',
                    'Swabi',
                    'Haripur',
                    'Chitral',
                    'Karak',
                    'Lakki Marwat',
                    'Tank',
                    'Hangu',
                    'Dir',
                    'Buner',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Balochistan - Major Cities',
                'cities' => [
                    'Quetta',
                    'Turbat',
                    'Khuzdar',
                    'Gwadar',
                    'Chaman',
                    'Sibi',
                    'Zhob',
                    'Loralai',
                    'Pishin',
                    'Dera Murad Jamali',
                    'Mastung',
                    'Kalat',
                    'Jaffarabad',
                    'Nasirabad',
                    'Lasbela',
                    'Kech',
                ],
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Azad Kashmir & Gilgit-Baltistan',
                'cities' => [
                    'Muzaffarabad',
                    'Mirpur',
                    'Rawalakot',
                    'Kotli',
                    'Bhimber',
                    'Bagh',
                    'Gilgit',
                    'Skardu',
                    'Hunza',
                    'Ghizer',
                    'Diamer',
                    'Astore',
                    'Ghanche',
                ],
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($zones as $zone) {
            ShippingZone::firstOrCreate(
                ['name' => $zone['name']],
                $zone
            );
        }
    }
}
