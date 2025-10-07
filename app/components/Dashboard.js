// app/components/Dashboard.jsx
'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { Calendar, Star, Filter, Home, AlertCircle, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ReviewCard from './ReviewCard'
import { generatePropertyId, getPropertyFromReviews } from '@/app/utils/propertyHelpers'
import Link from 'next/link'

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

  // state for property grouping
  const [groupByProperty, setGroupByProperty] = useState(false)

  // Search and expand states
  const [propertySearch, setPropertySearch] = useState('')
  const [showAllProperties, setShowAllProperties] = useState(false)
  const [showAllIssues, setShowAllIssues] = useState(false)

  // published reviews ids state
  const [publishedReviewIds, setPublishedReviewIds] = useState([])

  // Check if user is authorized
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'manager') {
      alert('Access denied. Please login as manager.')
      router.push('/properties')
    }
  }, [router])

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [reviews, propertyFilter, ratingFilter, channelFilter, dateFilter, sortBy])

  // Load previously selected reviews on mount
  useEffect(() => {
    const savedSelections = localStorage.getItem('permanentReviewSelections')
    if (savedSelections) {
      setSelectedReviews(JSON.parse(savedSelections))
    }
  }, [])

  // Save selections whenever they change
  useEffect(() => {
    if (selectedReviews.length > 0) {
      localStorage.setItem('permanentReviewSelections', JSON.stringify(selectedReviews))
    }
  }, [selectedReviews])

  // Load previously published reviews and mark them as selected
  useEffect(() => {
    const publishedReviews = localStorage.getItem('publishedReviews')
    if (publishedReviews && reviews.length > 0) {
      const reviewsByProperty = JSON.parse(publishedReviews)
      const allPublishedIds = []
      
      Object.values(reviewsByProperty).forEach(propertyReviews => {
        propertyReviews.forEach(review => {
          allPublishedIds.push(review.id)
        })
      })
      
      setSelectedReviews(allPublishedIds)
    }
  }, [reviews]) // Run when reviews are loaded

  // Load published reviews on mount
  useEffect(() => {
    const publishedReviews = localStorage.getItem('publishedReviews')
    if (publishedReviews) {
      const reviewsByProperty = JSON.parse(publishedReviews)
      const allPublishedIds = []
      
      Object.values(reviewsByProperty).forEach(propertyReviews => {
        propertyReviews.forEach(review => {
          allPublishedIds.push(review.id)
        })
      })
      
      setPublishedReviewIds(allPublishedIds)
    }
  }, [])

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
    const lowRated = reviews.filter(r => r.rating && r.rating < 5)
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
    try {
      const selectedReviewsData = reviews.filter(r => selectedReviews.includes(r.id))
      
      if (selectedReviewsData.length === 0) {
        alert('No reviews selected to publish.')
        return
      }
      
      // Group reviews by property
      const reviewsByProperty = {}
      selectedReviewsData.forEach(review => {
        const propId = generatePropertyId(review.listingName)
        if (!reviewsByProperty[propId]) {
          reviewsByProperty[propId] = []
        }
        reviewsByProperty[propId].push(review)
      })
      
      // Save published reviews to localStorage
      localStorage.setItem('publishedReviews', JSON.stringify(reviewsByProperty))

      // Update the published IDs state for immediate UI update
      const newPublishedIds = selectedReviewsData.map(r => r.id)
      setPublishedReviewIds(prev => {
        // Combine existing published IDs with newly published ones
        const combined = [...new Set([...prev, ...newPublishedIds])]
        return combined
      })
      
      // Get property names for the success message
      const propertyNames = [...new Set(selectedReviewsData.map(r => r.listingName))]
      
      // Show success message
      if (propertyNames.length === 1) {
        alert(`✅ Successfully published ${selectedReviewsData.length} review${selectedReviewsData.length > 1 ? 's' : ''} for "${propertyNames[0]}"`)
      } else {
        alert(`✅ Successfully published ${selectedReviewsData.length} reviews across ${propertyNames.length} properties:\n\n${propertyNames.join('\n')}`)
      }
    
      
    } catch (error) {
      // Show error message
      console.error('Error publishing reviews:', error)
      alert('❌ Failed to publish reviews. Please try again.')
    }
  }

  const handleClearAllSelections = () => {
    if (confirm('This will clear all selections AND unpublish ALL published reviews. Are you sure?')) {
      try {
        // Clear all selections
        setSelectedReviews([])

        // Clear published IDs state
        setPublishedReviewIds([])
        
        // Clear all published reviews from localStorage
        localStorage.removeItem('publishedReviews')
        localStorage.removeItem('permanentReviewSelections')
        
        // Show success message
        alert('✅ All selections cleared and all reviews unpublished.')
        
      } catch (error) {
        console.error('Error clearing selections:', error)
        alert('❌ Failed to clear selections. Please try again.')
      }
    }
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
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Reviews ({filteredReviews.length})</h2>
            <button
              onClick={() => setGroupByProperty(!groupByProperty)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              {groupByProperty ? '📋 List View' : '🏠 Group by Property'}
            </button>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Review</th>
                </tr>
              </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                {filteredReviews.length > 0 ? (
                  groupByProperty ? (
                    // Grouped view
                    Object.entries(
                      filteredReviews.reduce((acc, review) => {
                        if (!acc[review.listingName]) acc[review.listingName] = []
                        acc[review.listingName].push(review)
                        return acc
                      }, {})
                    ).map(([propertyName, propertyReviews]) => (
                      <React.Fragment key={propertyName}>
                        <tr className="bg-gray-50">
                          <td colSpan="8" className="px-6 py-3 text-sm font-semibold text-gray-900">
                            <div className="flex items-center">
                              <Home className="w-4 h-4 mr-2 text-teal-600" />
                              {propertyName}
                              <span className="ml-2 text-xs text-gray-500">({propertyReviews.length} reviews)</span>
                            </div>
                          </td>
                        </tr>
                        {propertyReviews.map(review => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            variant="table"
                            showCheckbox={true}
                            isSelected={selectedReviews.includes(review.id)}
                            isPublished={publishedReviewIds.includes(review.id)}
                            onSelect={toggleReviewSelection}
                          />
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    // Regular view
                    filteredReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        variant="table"
                        showCheckbox={true}
                        isSelected={selectedReviews.includes(review.id)}
                        onSelect={toggleReviewSelection}
                      />
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
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
              onClick={() => {
                handleClearAllSelections([])
                localStorage.removeItem('multiPropertySelection')
              }}
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
            Publish Selected Reviews ({selectedReviews.length})
          </button>
        </div>
      </div>
    </div>
  )
}
