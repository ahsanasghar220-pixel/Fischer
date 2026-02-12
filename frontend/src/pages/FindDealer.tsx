import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPinIcon, PhoneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Dealer {
  business_name: string
  city: string
  phone: string
  address: string
}

export default function FindDealer() {
  const [selectedCity, setSelectedCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: citiesData } = useQuery({
    queryKey: ['dealer-cities'],
    queryFn: async () => {
      const res = await api.get('/dealers/cities')
      return res.data.data as string[]
    },
  })

  const { data: dealersData, isLoading } = useQuery({
    queryKey: ['dealers', selectedCity],
    queryFn: async () => {
      const params = selectedCity ? { city: selectedCity } : {}
      const res = await api.get('/dealers/find', { params })
      return res.data.data as Dealer[]
    },
  })

  const cities = citiesData || []
  const dealers = dealersData || []

  const filteredDealers = dealers.filter((dealer) => {
    if (!searchQuery) return true
    return dealer.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.address.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors">
      {/* Header */}
      <div className="bg-dark-900 dark:bg-dark-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Find a Dealer</h1>
          <p className="text-dark-300 dark:text-dark-400 max-w-2xl mx-auto">
            Locate an authorized Fischer dealer near you. Our network of dealers
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
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              Showing {filteredDealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''}
              {selectedCity && ` in ${selectedCity}`}
            </p>

            {/* Dealers Grid */}
            {filteredDealers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDealers.map((dealer, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold text-dark-900 dark:text-white">{dealer.business_name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs rounded-full">
                        Authorized Dealer
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex gap-3">
                        <MapPinIcon className="w-5 h-5 text-dark-400 dark:text-dark-500 flex-shrink-0 mt-0.5" />
                        <span className="text-dark-600 dark:text-dark-400">{dealer.address}, {dealer.city}</span>
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
                    </div>

                    <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address + ', ' + dealer.city)}`}
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
          </>
        )}

        {/* Become a Dealer CTA */}
        <div className="mt-12 bg-primary-500 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Want to Become a Dealer?</h2>
          <p className="text-dark-700 mb-6 max-w-2xl mx-auto">
            Join our network of authorized dealers and grow your business with Fischer's
            quality products and excellent support.
          </p>
          <Link to="/become-dealer" className="btn bg-dark-900 text-white hover:bg-dark-800 px-8">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  )
}
