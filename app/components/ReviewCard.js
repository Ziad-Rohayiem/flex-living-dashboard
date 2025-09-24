import { Star, Calendar, User } from 'lucide-react'

export default function ReviewCard({ review, variant = 'table', showCheckbox = false, isSelected = false, onSelect }) {
  // Table row variant for Dashboard
  if (variant === 'table') {
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        {showCheckbox && (
          <td className="px-6 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(review.id)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
          </td>
        )}
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
    )
  }

  // Card variant for Property Page
  if (variant === 'card') {
    return (
      <div className="border-b border-gray-200 pb-6 last:border-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h4 className="font-semibold text-gray-900">{review.guestName}</h4>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(review.submittedAt).toLocaleDateString()}
            </div>
          </div>
          {review.rating && (
            <div className="flex items-center bg-teal-50 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              <span className="font-semibold text-teal-900">{(review.rating).toFixed(1)}/5</span>            </div>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed">{review.publicReview}</p>

        {review.categories && review.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {review.categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
              >
                {cat.category.replace(/_/g, ' ')}: {cat.rating}/10
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default fallback
  return null
}