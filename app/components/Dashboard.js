'use client'

import { useState, useEffect } from 'react'
import { Calendar, Star, Filter, TrendingUp, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReviews, setSelectedReviews] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews/hostaway')
      const data = await response.json()
      setReviews(data.result)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setLoading(false)
    }
  }

  const toggleReviewSelection = (reviewId) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const getAverageRating = () => {
    const rated = reviews.filter(r => r.rating)
    if (rated.length === 0) return 0
    return (rated.reduce((sum, r) => sum + r.rating, 0) / rated.length).toFixed(1)
  }

  const handleDisplaySelected = () => {
    // Store selected reviews in localStorage
    const selectedReviewsData = reviews.filter(r => selectedReviews.includes(r.id))
    localStorage.setItem('selectedReviews', JSON.stringify(selectedReviewsData))
    // Navigate to property page (using first property as example)
    router.push('/property/sample-property')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Flex Living Style */}
      <div className="bg-teal-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Flex Living Reviews Dashboard</h1>
          <p className="text-teal-100 mt-2">Manage and showcase your property reviews</p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 -mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <Calendar className="text-teal-600 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{getAverageRating()}</p>
              </div>
              <Star className="text-yellow-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Selected</p>
                <p className="text-3xl font-bold text-gray-900">{selectedReviews.length}</p>
              </div>
              <Filter className="text-blue-600 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Properties</p>
                <p className="text-3xl font-bold text-gray-900">{new Set(reviews.map(r => r.listingName)).size}</p>
              </div>
              <Home className="text-green-600 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleReviewSelection(review.id)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {review.guestName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {review.listingName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {review.rating ? (
                          <>
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-gray-900 font-semibold">{review.rating}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(review.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {review.channel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        review.type === 'guest-to-host' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {review.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleDisplaySelected}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            disabled={selectedReviews.length === 0}
          >
            Display Selected Reviews ({selectedReviews.length})
          </button>
        </div>
      </div>
    </div>
  )
}