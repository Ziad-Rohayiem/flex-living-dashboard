import mockData from '@/app/data/mockReviews.json';
import mockProperties from '@/app/data/mockProperties.json';
import { generatePropertyId } from '@/app/utils/propertyHelpers';

export async function GET(request) {
  const normalizedReviews = mockData.result.map(review => {
    // Find the matching property
    const property = mockProperties.find(p => p.name === review.listingName);
    
    return {
      id: review.id,
      type: review.type,
      status: review.status,
      rating: review.rating || calculateAverageRating(review.reviewCategory),
      publicReview: review.publicReview,
      categories: review.reviewCategory,
      submittedAt: review.submittedAt,
      guestName: review.guestName,
      listingName: review.listingName,
      propertyId: property ? property.id : generatePropertyId(review.listingName),
      channel: review.channel || 'Unknown',
      isSelected: false
    };
  });

  return Response.json({
    status: 'success',
    result: normalizedReviews
  });
}

function calculateAverageRating(categories) {
  if (!categories || categories.length === 0) return null;
  const sum = categories.reduce((acc, cat) => acc + cat.rating, 0);
  // Keep as 10-scale here, convert to 5-scale only in display
  return Math.round(sum / categories.length);
}
