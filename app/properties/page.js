'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Users, Home, Star, Filter as FilterIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import mockProperties from '@/app/data/mockProperties.json'
import { generatePropertyId } from '@/app/utils/propertyHelpers'

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState('all')
  const [guestCount, setGuestCount] = useState('all')
  const [propertyType, setPropertyType] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    // Load properties
    setProperties(mockProperties)
    setFilteredProperties(mockProperties)
    setLoading(false)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, priceRange, guestCount, propertyType, sortBy, properties])

  const applyFilters = () => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max
        } else {
          return p.price >= min
        }
      })
    }

    // Guest count filter
    if (guestCount !== 'all') {
      const count = Number(guestCount)
      filtered = filtered.filter(p => p.guests >= count)
    }

    // Property type filter
    if (propertyType !== 'all') {
      filtered = filtered.filter(p => p.type === propertyType)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'featured':
        default:
          return 0
      }
    })

    setFilteredProperties(filtered)
  }

  const propertyTypes = [...new Set(properties.map(p => p.type))]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading properties...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-teal-100">Discover premium properties in prime locations</p>
          
          {/* Search Bar */}
          <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by property name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg text-white-900 placeholder-gray-450 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 shadow-sm"            >
              <option value="all">Any Price</option>
              <option value="0-150">Under £150</option>
              <option value="150-250">£150 - £250</option>
              <option value="250-350">£250 - £350</option>
              <option value="350-9999">£350+</option>
            </select>

            <select
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 shadow-sm"            >
              <option value="all">Any Guests</option>
              <option value="1">1+ Guest</option>
              <option value="2">2+ Guests</option>
              <option value="4">4+ Guests</option>
              <option value="6">6+ Guests</option>
            </select>

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 shadow-sm"            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 shadow-sm ml-auto"            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProperties.length} of {properties.length} properties
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`} // يا عالم هيحصل ايه - generateid(name)
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Property Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <Image
                    src={property.heroImage || '/placeholder.svg'}
                    alt={property.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-sm font-semibold text-gray-900">£{property.price}/night</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {property.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{property.tagline}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {property.location.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {property.guests} guests
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-700">{(property.rating / 2).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full font-medium">
                      {property.type}
                    </span>
                    {property.amenities.slice(0, 2).map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties match your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setPriceRange('all')
                setGuestCount('all')
                setPropertyType('all')
              }}
              className="mt-4 text-teal-600 hover:text-teal-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-teal-900 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-teal-100 mb-6">
            Contact our team for personalized recommendations and exclusive properties.
          </p>
          <button className="bg-white text-teal-900 px-6 py-3 rounded-lg font-medium hover:bg-teal-50 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}