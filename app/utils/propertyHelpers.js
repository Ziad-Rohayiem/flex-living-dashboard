export function generatePropertyId(propertyName) {
    // Create a consistent ID from property name
    let hash = 0;
    for (let i = 0; i < propertyName.length; i++) {
      const char = propertyName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  export function getPropertyFromReviews(reviews) {
    // Group reviews by property
    const propertyMap = {};
    
    reviews.forEach(review => {
      const propertyId = review.propertyId || generatePropertyId(review.listingName);
      if (!propertyMap[propertyId]) {
        propertyMap[propertyId] = {
          id: propertyId,
          name: review.listingName,
          reviews: []
        };
      }
      propertyMap[propertyId].reviews.push(review);
    });
    
    return propertyMap;
  }