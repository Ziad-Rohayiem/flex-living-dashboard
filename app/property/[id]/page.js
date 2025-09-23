'use client'

import { useState, useEffect } from 'react'
import { Star, Calendar, User } from 'lucide-react'
import Link from 'next/link'

export default function PropertyPage() {
  const [selectedReviews, setSelectedReviews] = useState([])

  useEffect(() => {
    // Get selected reviews from localStorage
    const stored = localStorage.getItem('selectedReviews')
    if (stored) {
      setSelectedReviews(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching Flex Living style */}
      <div className="bg-teal-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-teal-200 hover:text-white mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Property Reviews</h1>
          <p className="text-teal-100 mt-2">Curated reviews for this property</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Reviews</h2>
          
          {selectedReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews selected. Please go back to the dashboard and select reviews to display.
            </p>
          ) : (
            <div className="space-y-6">
              {selectedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="font-semibold text-gray-900">{review.guestName}</h3>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(review.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {review.rating && (
                      <div className="flex items-center bg-teal-50 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-semibold text-teal-900">{review.rating}/10</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{review.publicReview}</p>
                  
                  {review.categories && review.categories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {review.categories.map((cat, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {cat.category.replace(/_/g, ' ')}: {cat.rating}/10
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Property Style Section - Matching Flex Living */}
        <div className="mt-8 bg-teal-900 text-white rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4">About This Property</h3>
          <p className="text-teal-100">
            This property is managed by Flex Living, offering premium accommodations 
            with guaranteed quality and service. All reviews have been verified and 
            selected by property management.
          </p>
        </div>
      </div>
    </div>
  )
}