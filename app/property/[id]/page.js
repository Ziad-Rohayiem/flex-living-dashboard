// app/property/[id]/page.js
'use client'

import { useState, useEffect } from 'react'
import { Star, Calendar, User, MapPin, Check, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import ReviewCard from '@/app/components/ReviewCard'
import { generatePropertyId } from '@/app/utils/propertyHelpers'

// Mock property data (replace with real API if needed)
import mockProperties from '@/app/data/mockProperties.json'

export default function PropertyPage() {
  // Get the dynamic ID from the URL (e.g., /property/1)
  const params = useParams()
  const propertyId = params?.id

  // State for the selected property and the reviews
  const [property, setProperty] = useState(null)
  const [selectedReviews, setSelectedReviews] = useState([])

  // state for multi-property navigation
  const [otherPropertyIds, setOtherPropertyIds] = useState([])

  // Load property data based on the ID
  useEffect(() => {
    if (propertyId) {
      // Always try to load from mockProperties first
      const found = mockProperties.find(p => p.id === Number(propertyId))
      if (found) {
        setProperty(found)
      } else {
        // If not found, still show a basic property page
        setProperty({
          id: parseInt(propertyId),
          name: "Property Details",
          tagline: "Premium Flex Living Property",
          price: 200,
          guests: 4,
          rating: 0,
          type: "Property",
          location: "London, United Kingdom",
          description: "Property information is being updated.",
          amenities: ["Contact us for details"],
          heroImage: "/placeholder.svg?height=800&width=1200"
        })
      }
    }
  }, [propertyId])

  // Load the reviews that were selected in the dashboard
  useEffect(() => {
    // Always try to load published reviews, but don't fail if none exist
    const publishedReviews = localStorage.getItem('publishedReviews')
    
    if (publishedReviews && propertyId) {
      const reviewsByProperty = JSON.parse(publishedReviews)
      
      // Try multiple ID formats to find reviews
      let propertyReviews = reviewsByProperty[propertyId] || []
      
      // If no reviews found by ID, try by property name
      if (propertyReviews.length === 0 && property?.name) {
        const generatedId = generatePropertyId(property.name)
        propertyReviews = reviewsByProperty[generatedId] || []
      }
      
      // Filter for guest-to-host reviews only
      const guestReviews = propertyReviews.filter(review => 
        review.type === 'guest-to-host'
      )
      
      setSelectedReviews(guestReviews)
    } else {
      // No published reviews yet - that's OK
      setSelectedReviews([])
    }
  }, [propertyId, property?.name])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      // Only clear if navigating away from property pages
      if (!window.location.pathname.includes('/property/')) {
        localStorage.removeItem('multiPropertySelection')
      }
    }
  }, [])

  // Helper to render star rating (0-5)
  const renderStars = (rating) => {
    const stars = Math.round(rating / 2) // Convert 0-10 to 0-5 scale
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  // Loading state
  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-800">
        Loading property details...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (same as dashboard) */}
      <div className="bg-teal-900 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <Link href="/properties" className="text-teal-200 hover:text-white mb-4 inline-block">
            ← Back to Properties
          </Link>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-teal-100 mt-2">{property.tagline}</p>
        </div>
      </div>

      {/* Main content container */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Image */}
        <div className="relative h-80 w-full overflow-hidden rounded-lg mb-8 shadow-lg">
          <Image
            src={property.heroImage || '/placeholder.svg'}
            alt={property.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold">{property.name}</h2>
              <div className="flex items-center mt-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Price per night</h3>
              <p className="text-xl font-bold text-gray-900">${property.price}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
              <p className="text-xl font-bold text-gray-900">{property.guests} guests</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Rating</h3>
              <div className="flex items-center gap-2">
                {renderStars(property.rating)}
                <span className="text-xl font-bold text-gray-900">
                  {property.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="text-xl font-bold text-gray-900">{property.type}</p>
            </div>
          </div>
        </div>

        {/* Description + Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
            <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">Map would load here</span>
            </div>
          </div>
        </div>

        {/* Guest Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Guest Reviews</h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Showing {selectedReviews.length} guest review{selectedReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {selectedReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews selected. Please go back to the dashboard and select reviews to display.</p>
            </div>
          ) : (
            // <div className="space-y-6">
            //   {selectedReviews.map((review) => (
            //     <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            //       <div className="flex items-start justify-between mb-4">
            //         <div>
            //           <div className="flex items-center mb-2">
            //             <User className="w-5 h-5 text-gray-400 mr-2" />
            //             <h4 className="font-semibold text-gray-900">{review.guestName}</h4>
            //           </div>
            //           <div className="flex items-center text-sm text-gray-500">
            //             <Calendar className="w-4 h-4 mr-1" />
            //             {new Date(review.submittedAt).toLocaleDateString()}
            //           </div>
            //         </div>
            //         {review.rating && (
            //           <div className="flex items-center bg-teal-50 px-3 py-1 rounded-full">
            //             <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            //             <span className="font-semibold text-teal-900">{review.rating}/10</span>
            //           </div>
            //         )}
            //       </div>

            //       <p className="text-gray-700 leading-relaxed">{review.publicReview}</p>

            //       {review.categories && review.categories.length > 0 && (
            //         <div className="mt-4 flex flex-wrap gap-2">
            //           {review.categories.map((cat, idx) => (
            //             <span
            //               key={idx}
            //               className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
            //             >
            //               {cat.category.replace(/_/g, ' ')}: {cat.rating}/10
            //             </span>
            //           ))}
            //         </div>
            //       )}
            //     </div>
            //   ))}
            // </div>
            <div className="space-y-6">
              {selectedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  variant="card"
                />
              ))}
            </div>
          )}
        </div>

        {/* Multi-property Navigation */}
        {otherPropertyIds.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  You have selected reviews from {otherPropertyIds.length + 1} properties.
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Currently viewing: <span className="font-semibold">{property?.name}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otherPropertyIds.map((propId, index) => (
                    <Link
                      key={propId}
                      href={`/property/${propId}`}
                      className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium transition-colors"
                    >
                      View Next Property
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flex Living Call to Action */}
        <div className="mt-8 bg-teal-900 text-white rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Book with Flex Living</h3>
          <p className="text-teal-100 mb-6">
            Experience premium accommodations with guaranteed quality and service.
          </p>
          <button className="bg-white text-teal-900 px-6 py-3 rounded-lg font-medium hover:bg-teal-100 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}