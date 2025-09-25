// // sth to be edited (crucial): when the type of the review is "host-to-guest",
// // the rating should be "none" since it the property rating (ممكن نفكرفي الموضوع دا برضو و ناخد في الاعتبار يكون تقييم الشقة او الضيف)
// // but this file replace each "none" in the review with the average of the sub-rates
// // this is a problem because the property rating is out of 5 and the sub-rating is out of 10
// // so you (ziad) have to choose:
// // 1- keep it but divide the avg by 2 to make it compatible with the out of 5 criteria (double semantic based on the review type).
// // 2- remove it at all and let this type (host-to-guest) with "none" rating.


// import mockData from '@/app/data/mockReviews.json';
// import { generatePropertyId } from '@/app/utils/propertyHelpers';

// export async function GET(request) {
//   const normalizedReviews = mockData.result.map(review => ({
//     id: review.id,
//     type: review.type,
//     status: review.status,
//     rating: review.rating || calculateAverageRating(review.reviewCategory),
//     publicReview: review.publicReview,
//     categories: review.reviewCategory,
//     submittedAt: review.submittedAt,
//     guestName: review.guestName,
//     listingName: review.listingName,
//     propertyId: property ? property.id : generatePropertyId(review.listingName),
//     channel: review.channel || 'Unknown',
//     isSelected: false
//   }));
  
//   return Response.json({
//     status: 'success',
//     result: normalizedReviews
//   });
// }

// // function calculateAverageRating(categories) {
// //   if (!categories || categories.length === 0) return null;
// //   const sum = categories.reduce((acc, cat) => acc + cat.rating, 0);
// //   return Math.round(sum / categories.length);
// // }

// function calculateAverageRating(categories) {
//   if (!categories || categories.length === 0) return null;
//   const sum = categories.reduce((acc, cat) => acc + cat.rating, 0);
//   const average = sum / categories.length / 2; // divided over 2 because of the rating is out of 5 while sub-rating is out of 10
//   return parseFloat(average.toFixed(1));
// }

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