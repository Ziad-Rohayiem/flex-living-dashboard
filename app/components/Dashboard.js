// app/components/Dashboard.jsx
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Star, Filter, TrendingUp, Home, AlertCircle, ChevronDown, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReviews, setSelectedReviews] = useState([])
  const router = useRouter()

  // Filter states
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  // Search and expand states
  const [propertySearch, setPropertySearch] = useState('')
  const [showAllProperties, setShowAllProperties] = useState(false)
  const [showAllIssues, setShowAllIssues] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [reviews, propertyFilter, ratingFilter, channelFilter, dateFilter, sortBy])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews/hostaway')
      const data = await response.json()
      setReviews(data.result)
      setFilteredReviews(data.result)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...reviews]

    // Property filter
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(r => r.listingName === propertyFilter)
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const [min, max] = ratingFilter.split('-').map(Number)
      // Convert rating to 5-scale for comparison
      filtered = filtered.filter(r => {
        const rating5Scale = r.rating / 2
        return rating5Scale >= min && rating5Scale <= max
      })
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(r => r.channel === channelFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const days = parseInt(dateFilter)
      const cutoffDate = new Date(now.setDate(now.getDate() - days))
      filtered = filtered.filter(r => new Date(r.submittedAt) >= cutoffDate)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.submittedAt) - new Date(a.submittedAt)
        case 'date-asc':
          return new Date(a.submittedAt) - new Date(b.submittedAt)
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'rating-asc':
          return (a.rating || 0) - (b.rating || 0)
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }

  const toggleReviewSelection = (reviewId) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  // const getAverageRating = (reviewsList = filteredReviews) => {
  //   const rated = reviewsList.filter(r => r.rating)
  //   if (rated.length === 0) return 0
  //   return (rated.reduce((sum, r) => sum + r.rating, 0) / rated.length).toFixed(1)
  // }

  const getAverageRating = (reviewsList = filteredReviews) => {
    const rated = reviewsList.filter(r => r.rating)
    if (rated.length === 0) return 0
    // Convert from 10-scale to 5-scale
    return ((rated.reduce((sum, r) => sum + r.rating, 0) / rated.length) / 2).toFixed(1)
  }

  const getPropertyStats = () => {
    const stats = {}
    reviews.forEach(review => {
      if (!stats[review.listingName]) {
        stats[review.listingName] = { total: 0, rated: 0, sum: 0 }
      }
      stats[review.listingName].total++
      if (review.rating) {
        stats[review.listingName].rated++
        stats[review.listingName].sum += review.rating
      }
    })
    
    return Object.entries(stats).map(([property, data]) => ({
      property,
      total: data.total,
      avgRating: data.rated > 0 ? (data.sum / data.rated).toFixed(1) : 'N/A'
    }))
  }

  const getRecurringIssues = () => {
    // Analyze low-rated reviews for common keywords
    const lowRated = reviews.filter(r => r.rating && r.rating < 7)
    const keywords = {}
    
    lowRated.forEach(review => {
      const text = review.publicReview.toLowerCase()
      const commonIssues = ['wifi', 'clean', 'noise', 'location', 'communication', 'check-in']
      
      commonIssues.forEach(issue => {
        if (text.includes(issue)) {
          keywords[issue] = (keywords[issue] || 0) + 1
        }
      })
    })

    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([issue, count]) => ({ issue, count }))
  }

  const handleDisplaySelected = () => {
    const selectedReviewsData = reviews.filter(r => selectedReviews.includes(r.id))
    localStorage.setItem('selectedReviews', JSON.stringify(selectedReviewsData))
    router.push('/property/1')
  }

  const properties = [...new Set(reviews.map(r => r.listingName))]
  const channels = [...new Set(reviews.map(r => r.channel))]

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Flex Living Style */}
      <div className="bg-teal-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Flex Living Reviews Dashboard</h1>
          <p className="text-teal-100 mt-2">Manage and analyze your property reviews</p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 -mt-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
            <Filter className="mr-2 w-5 h-5 text-teal-600" />
            Filters & Sorting
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-900"              >
                <option value="all">All Properties</option>
                {properties.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-900"              >
                <option value="all">All Ratings</option>
                <option value="4.5-5">Excellent (4.5-5)</option>
                <option value="3.5-4.4">Good (3.5-4.4)</option>
                <option value="2.5-3.4">Average (2.5-3.4)</option>
                <option value="0-2.4">Poor (0-2.4)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-900"              >
                <option value="all">All Channels</option>
                {channels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-900"              >
                <option value="all">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-900"              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{filteredReviews.length}</p>
                <p className="text-xs text-gray-500 mt-1">of {reviews.length} total</p>
              </div>
              <Calendar className="text-teal-600 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{getAverageRating()}</p>
                <p className="text-xs text-gray-500 mt-1">out of 5</p>
              </div>
              <Star className="text-yellow-500 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Selected</p>
                <p className="text-3xl font-bold text-gray-900">{selectedReviews.length}</p>
                <p className="text-xs text-gray-500 mt-1">for display</p>
              </div>
              <Filter className="text-blue-600 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Properties</p>
                <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                <p className="text-xs text-gray-500 mt-1">unique</p>
              </div>
              <Home className="text-green-600 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Trends and Property Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Property Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Home className="mr-2 w-5 h-5 text-teal-600" />
              Property Performance
            </h3>
            
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900"/>
              </div>
            </div>
            
            <div className="space-y-3">
              {getPropertyStats()
                .sort((a, b) => {
                  // Sort by rating first, then by total reviews
                  if (a.avgRating === 'N/A') return 1;
                  if (b.avgRating === 'N/A') return -1;
                  const ratingDiff = parseFloat(b.avgRating) - parseFloat(a.avgRating);
                  if (ratingDiff !== 0) return ratingDiff;
                  return b.total - a.total;
                })
                .filter(stat => 
                  stat.property.toLowerCase().includes(propertySearch.toLowerCase())
                )
                .slice(0, showAllProperties ? undefined : 3)
                .map(({ property, total, avgRating }) => (
                  <div key={property} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{property}</p>
                      <p className="text-xs text-gray-500">{total} reviews</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900">{avgRating}</p>
                      <p className="text-xs text-gray-500">avg rating</p>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Show All Button */}
            {getPropertyStats().length > 3 && (
              <button
                onClick={() => setShowAllProperties(!showAllProperties)}
                className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center"
              >
                {showAllProperties ? (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1 transform rotate-180" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show all remaining properties
                  </>
                )}
              </button>
            )}
          </div>

          {/* Recurring Issues */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <AlertCircle className="mr-2 w-5 h-5 text-red-600" />
              Recurring Issues
            </h3>
            {getRecurringIssues().length > 0 ? (
              <>
                <div className="space-y-3">
                  {getRecurringIssues()
                    .slice(0, showAllIssues ? undefined : 3)
                    .map(({ issue, count }) => (
                      <div key={issue} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-sm capitalize text-gray-900">{issue}</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                          {count} mentions
                        </span>
                      </div>
                    ))}
                </div>
                
                {/* Show More Button */}
                {getRecurringIssues().length > 3 && (
                  <button
                    onClick={() => setShowAllIssues(!showAllIssues)}
                    className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                  >
                    {showAllIssues ? (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1 transform rotate-180" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show all {getRecurringIssues().length} issues
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">No recurring issues detected in low-rated reviews.</p>
            )}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Reviews ({filteredReviews.length})</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
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
                        <div className="max-w-xs truncate" title={review.listingName}>
                          {review.listingName}
                        </div>
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
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="max-w-xs truncate" title={review.publicReview}>
                          {review.publicReview}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No reviews match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedReviews.length > 0 && (
              <button
                onClick={() => setSelectedReviews([])}
                className="text-teal-600 hover:text-teal-700 underline"
              >
                Clear selection
              </button>
            )}
          </div>
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