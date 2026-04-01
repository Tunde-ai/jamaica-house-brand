export interface GoogleReview {
  id: string
  authorName: string
  rating: number
  text: string
  relativeTime: string
  profilePhotoUrl?: string
}

// Reviews for Jamaica House Brand sauce products.
// UPDATE THESE with real reviews from your Google Business Profile, Amazon, or Etsy listings.
// To find: Search "Jamaica House Brand" on Google → click Reviews in the business panel.
// Or copy reviews from your Amazon listing: amazon.com/dp/B0D915BFRN
export const googleReviews: GoogleReview[] = [
  {
    id: 'review-1',
    authorName: 'Verified Buyer',
    rating: 5,
    text: 'This jerk sauce is the real deal. I\'ve been to Jamaica multiple times and this tastes just like what you get at the roadside jerk stands. The heat is perfect — not too mild, not overwhelming. Already ordered my second bottle.',
    relativeTime: 'Recent',
  },
  {
    id: 'review-2',
    authorName: 'Sauce Lover',
    rating: 5,
    text: 'Zero calories and it actually tastes this good? I put it on everything — chicken, rice, eggs, even pizza. The Scotch bonnet flavor comes through without being overpowering. Best jerk sauce I\'ve found online.',
    relativeTime: 'Recent',
  },
  {
    id: 'review-3',
    authorName: 'Home Chef',
    rating: 5,
    text: 'Bought the 10oz bottle and it lasted our family about two weeks. We marinate chicken thighs overnight and grill them — tastes like it came from a restaurant. The fact that it\'s all natural with no preservatives is a huge plus.',
    relativeTime: 'Recent',
  },
  {
    id: 'review-4',
    authorName: 'Gift Buyer',
    rating: 5,
    text: 'Ordered the Gift Set for my dad who loves Caribbean food. He called me the next day to say it was the best gift I\'ve ever given him. The Escovitch Pikliz was his favorite — he finished it in a week!',
    relativeTime: 'Recent',
  },
  {
    id: 'review-5',
    authorName: 'Repeat Customer',
    rating: 4,
    text: 'Great jerk sauce with authentic flavor. The 5oz is perfect for trying it out, but trust me — you\'ll want the bigger bottle. Only wish they had even more sizes. Shipping was fast too.',
    relativeTime: 'Recent',
  },
  {
    id: 'review-6',
    authorName: 'Foodie',
    rating: 5,
    text: 'I tried this after seeing their YouTube Shorts and I\'m hooked. 30 years of restaurant heritage really shows in the flavor. The allspice and thyme combo is chef\'s kiss. Already recommended it to all my friends.',
    relativeTime: 'Recent',
  },
]

// Google Business Profile info for schema.org markup
export const googleBusinessInfo = {
  placeId: 'ChIJmca2LsTZCUgRHUn8HZt5nUw',
  averageRating: 4.9,
  totalReviews: 24,
  businessName: 'Jamaica House Brand',
  locations: [
    { name: 'Miami (The Original)', address: '19555 NW 2nd Ave, Miami, FL 33169' },
    { name: 'Fort Lauderdale', address: '3351 W Broward Blvd, Fort Lauderdale, FL 33312' },
  ],
}
