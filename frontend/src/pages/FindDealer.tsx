import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, PhoneIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const pakistanCities = [
  'All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad',
]

// Sample dealer data - in a real app, this would come from an API
const dealers = [
  {
    id: 1,
    name: 'Fischer Authorized Dealer - Lahore Main',
    address: '45-A, Main Boulevard, Gulberg III, Lahore',
    city: 'Lahore',
    phone: '+92 42 35756789',
    hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
    type: 'Authorized Dealer',
  },
  {
    id: 2,
    name: 'Fischer Premium Store - Karachi',
    address: 'Shop 12, Ocean Mall, Clifton, Karachi',
    city: 'Karachi',
    phone: '+92 21 35123456',
    hours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    type: 'Premium Store',
  },
  {
    id: 3,
    name: 'Fischer Service Center - Islamabad',
    address: 'F-7 Markaz, Jinnah Super Market, Islamabad',
    city: 'Islamabad',
    phone: '+92 51 2654321',
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    type: 'Service Center',
  },
  {
    id: 4,
    name: 'Fischer Dealer - Rawalpindi',
    address: 'Commercial Market, Satellite Town, Rawalpindi',
    city: 'Rawalpindi',
    phone: '+92 51 4567890',
    hours: 'Mon-Sat: 9:30 AM - 8:00 PM',
    type: 'Authorized Dealer',
  },
  {
    id: 5,
    name: 'Fischer Electronics - Faisalabad',
    address: 'D-Ground, Susan Road, Faisalabad',
    city: 'Faisalabad',
    phone: '+92 41 8765432',
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
    type: 'Authorized Dealer',
  },
  {
    id: 6,
    name: 'Fischer Appliances - Multan',
    address: 'Gulgasht Colony, Bosan Road, Multan',
    city: 'Multan',
    phone: '+92 61 6543210',
    hours: 'Mon-Sat: 9:00 AM - 7:30 PM',
    type: 'Authorized Dealer',
  },
  {
    id: 7,
    name: 'Fischer Store - Peshawar',
    address: 'University Road, Near PSO Pump, Peshawar',
    city: 'Peshawar',
    phone: '+92 91 5678901',
    hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
    type: 'Authorized Dealer',
  },
  {
    id: 8,
    name: 'Fischer Center - Hyderabad',
    address: 'Saddar, Near Tower Market, Hyderabad',
    city: 'Hyderabad',
    phone: '+92 22 2789012',
    hours: 'Mon-Sat: 9:30 AM - 7:30 PM',
    type: 'Authorized Dealer',
  },
]

export default function FindDealer() {
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDealers = dealers.filter((dealer) => {
    const matchesCity = selectedCity === 'All Cities' || dealer.city === selectedCity
    const matchesSearch = dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCity && matchesSearch
  })

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors">
      {/* Header */}
      <div className="bg-dark-900 dark:bg-dark-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Find a Dealer</h1>
          <p className="text-dark-300 dark:text-dark-400 max-w-2xl mx-auto">
            Locate an authorized Fischer dealer near you. Our network of 500+ dealers
            across Pakistan ensures quality products and service wherever you are.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or address..."
                className="w-full pl-10 pr-4 py-3 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {pakistanCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <p className="text-dark-500 dark:text-dark-400 mb-6">
          Showing {filteredDealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''}
          {selectedCity !== 'All Cities' && ` in ${selectedCity}`}
        </p>

        {/* Dealers Grid */}
        {filteredDealers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDealers.map((dealer) => (
              <div
                key={dealer.id}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">{dealer.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full">
                      {dealer.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <MapPinIcon className="w-5 h-5 text-dark-400 dark:text-dark-500 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-600 dark:text-dark-400">{dealer.address}</span>
                  </div>
                  <div className="flex gap-3">
                    <PhoneIcon className="w-5 h-5 text-dark-400 dark:text-dark-500 flex-shrink-0" />
                    <a
                      href={`tel:${dealer.phone.replace(/\s/g, '')}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {dealer.phone}
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <ClockIcon className="w-5 h-5 text-dark-400 dark:text-dark-500 flex-shrink-0" />
                    <span className="text-dark-600 dark:text-dark-400">{dealer.hours}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPinIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">No dealers found</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              Try adjusting your search or selecting a different city.
            </p>
          </div>
        )}

        {/* Become a Dealer CTA */}
        <div className="mt-12 bg-primary-500 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Want to Become a Dealer?</h2>
          <p className="text-dark-700 mb-6 max-w-2xl mx-auto">
            Join our network of 500+ authorized dealers and grow your business with Fischer's
            quality products and excellent support.
          </p>
          <Link to="/dealer/register" className="btn bg-dark-900 text-white hover:bg-dark-800 px-8">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  )
}
